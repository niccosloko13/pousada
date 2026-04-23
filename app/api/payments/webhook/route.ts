import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { fetchMercadoPagoPayment } from "@/lib/mercadopago/preference";
import { validateMercadoPagoWebhookSignature } from "@/lib/mercadopago/webhookSecurity";
import { prisma } from "@/lib/prisma";
import { confirmReservationFromPayment, releaseExpiredReservations } from "@/lib/reservations/engine";
import { logAppError, logPaymentEvent, logSecurityEvent } from "@/lib/security/logger";
import { getClientIp } from "@/lib/security/request";

export const runtime = "nodejs";

type MercadoPagoWebhookBody = {
  type?: string;
  topic?: string;
  action?: string;
  data?: { id?: string };
};

function pickPaymentIdFromUrl(url: URL) {
  const topic = url.searchParams.get("topic") ?? url.searchParams.get("type");
  const id = url.searchParams.get("id") ?? url.searchParams.get("data.id");
  if (topic === "payment" && id) return id;
  return null;
}

async function pickPaymentIdFromRequest(request: Request) {
  const url = new URL(request.url);
  const fromQuery = pickPaymentIdFromUrl(url);
  if (fromQuery) return fromQuery;

  const contentType = request.headers.get("content-type") ?? "";
  const raw = await request.text();
  if (!raw) return null;

  if (contentType.includes("application/x-www-form-urlencoded") || (raw.includes("=") && raw.includes("&"))) {
    const params = new URLSearchParams(raw);
    const topic = params.get("topic") ?? params.get("type");
    const id = params.get("id") ?? params.get("data.id");
    if (topic === "payment" && id) return String(id);
  }

  if (contentType.includes("application/json") || raw.trim().startsWith("{")) {
    try {
      const body = JSON.parse(raw) as MercadoPagoWebhookBody;
      const topic = body.topic ?? body.type;
      const id = body.data?.id;
      if (topic === "payment" && id) return String(id);
    } catch {
      // ignore
    }
  }

  return null;
}

function hasMercadoPagoFingerprint(request: Request) {
  const ua = (request.headers.get("user-agent") ?? "").toLowerCase();
  const signature = request.headers.get("x-signature");
  if (!signature) return false;
  if (!ua) return true;
  return ua.includes("mercadopago") || ua.includes("mercado pago") || ua.includes("mp-notifications");
}

function isValidWebhookRequest(request: Request, paymentId: string) {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  const signatureHeader = request.headers.get("x-signature");
  const requestIdHeader = request.headers.get("x-request-id");
  if (!secret || secret.length < 16) return false;
  if (!hasMercadoPagoFingerprint(request)) return false;

  return validateMercadoPagoWebhookSignature({
    signatureHeader,
    requestIdHeader,
    paymentId,
    webhookSecret: secret,
  });
}

async function processPaymentNotification(paymentId: string) {
  const mpPayment = await fetchMercadoPagoPayment(paymentId);
  const code = mpPayment.external_reference;

  if (!code) {
    return { ok: true as const, ignored: true as const };
  }

  const reservation = await prisma.reservation.findUnique({ where: { code } });
  if (!reservation) {
    return { ok: true as const, ignored: true as const };
  }

  const payment = await prisma.payment.findFirst({
    where: { reservationId: reservation.id },
    orderBy: { createdAt: "desc" },
  });

  if (!payment) {
    return { ok: true as const, ignored: true as const };
  }

  if (mpPayment.status === "approved") {
    await confirmReservationFromPayment(reservation.id, String(mpPayment.id));
  } else if (mpPayment.status === "rejected" || mpPayment.status === "cancelled") {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: "REJECTED", mpPaymentId: String(mpPayment.id) },
    });
    await prisma.reservation.update({
      where: { id: reservation.id },
      data: { status: "CANCELLED" },
    });
  } else {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: "PROCESSING", mpPaymentId: String(mpPayment.id) },
    });
  }

  await prisma.paymentEvent.create({
    data: {
      paymentId: payment.id,
      type: "webhook.payment",
      payload: mpPayment as unknown as Prisma.InputJsonValue,
      reservationId: reservation.id,
    },
  });

  return { ok: true as const };
}

export async function GET(request: Request) {
  try {
    await releaseExpiredReservations();
    const url = new URL(request.url);
    const id = pickPaymentIdFromUrl(url);
    if (!id) return NextResponse.json({ ok: true, ignored: true });
    if (!isValidWebhookRequest(request, id)) {
      logSecurityEvent("payments.webhook.invalid_signature", { method: "GET", ip: getClientIp(request), id });
      return NextResponse.json({ ok: false, error: "UNAUTHORIZED_WEBHOOK" }, { status: 401 });
    }
    const result = await processPaymentNotification(id);
    logPaymentEvent("payments.webhook.processed", { method: "GET", id, ok: result.ok, ignored: "ignored" in result ? result.ignored : false });
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNKNOWN_ERROR";
    logAppError("payments.webhook.get.error", error, { ip: getClientIp(request) });
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await releaseExpiredReservations();

    const id = await pickPaymentIdFromRequest(request);
    if (!id) {
      return NextResponse.json({ ok: true, ignored: true });
    }
    if (!isValidWebhookRequest(request, id)) {
      logSecurityEvent("payments.webhook.invalid_signature", { method: "POST", ip: getClientIp(request), id });
      return NextResponse.json({ ok: false, error: "UNAUTHORIZED_WEBHOOK" }, { status: 401 });
    }

    const result = await processPaymentNotification(id);
    logPaymentEvent("payments.webhook.processed", { method: "POST", id, ok: result.ok, ignored: "ignored" in result ? result.ignored : false });
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNKNOWN_ERROR";
    logAppError("payments.webhook.post.error", error, { ip: getClientIp(request) });
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
