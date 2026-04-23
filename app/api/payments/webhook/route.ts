import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { fetchMercadoPagoPayment } from "@/lib/mercadopago/preference";
import { prisma } from "@/lib/prisma";
import { confirmReservationFromPayment, releaseExpiredReservations } from "@/lib/reservations/engine";

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
    const result = await processPaymentNotification(id);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNKNOWN_ERROR";
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

    const result = await processPaymentNotification(id);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNKNOWN_ERROR";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
