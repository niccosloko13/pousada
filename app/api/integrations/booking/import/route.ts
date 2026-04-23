import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { importSingleBookingReservation } from "@/lib/integrations/booking";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const bodySchema = z.object({
  externalId: z.string().min(1),
  roomId: z.string().min(1),
  checkinAt: z.string().datetime(),
  checkoutAt: z.string().datetime(),
  guest: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    phone: z.string().min(8),
  }),
  adults: z.number().int().min(1),
  childrenFree: z.number().int().min(0).default(0),
  childrenHalf: z.number().int().min(0).default(0),
  amountTotal: z.number().nonnegative(),
  notes: z.string().optional(),
});

function readProvidedSecret(request: Request) {
  const headerSecret = request.headers.get("x-booking-sync-secret");
  if (headerSecret) return headerSecret.trim();
  const auth = request.headers.get("authorization");
  if (auth?.toLowerCase().startsWith("bearer ")) return auth.slice(7).trim();
  return "";
}

function equalSecrets(a: string, b: string) {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}

function isAuthorized(request: Request) {
  const configuredSecret = process.env.BOOKING_SYNC_SECRET;
  if (!configuredSecret || configuredSecret.length < 24) return false;
  const provided = readProvidedSecret(request);
  if (!provided) return false;
  return equalSecrets(configuredSecret, provided);
}

export async function POST(request: Request) {
  try {
    if (!isAuthorized(request)) {
      return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
    }

    const payload = bodySchema.parse(await request.json());

    const existing = await prisma.reservation.findFirst({
      where: {
        channel: "BOOKING_COM",
        externalId: payload.externalId,
      },
      select: { id: true, code: true },
    });
    if (existing) {
      return NextResponse.json({ ok: true, duplicate: true, reservationId: existing.id, reservationCode: existing.code });
    }

    const reservation = await importSingleBookingReservation({
      externalId: payload.externalId,
      roomId: payload.roomId,
      checkinAt: new Date(payload.checkinAt),
      checkoutAt: new Date(payload.checkoutAt),
      guest: payload.guest,
      adults: payload.adults,
      childrenFree: payload.childrenFree ?? 0,
      childrenHalf: payload.childrenHalf ?? 0,
      amountTotal: payload.amountTotal,
      notes: payload.notes,
    });

    return NextResponse.json({
      ok: true,
      reservationId: reservation.id,
      reservationCode: reservation.code,
      origin: reservation.channel === "BOOKING_COM" ? "BOOKING" : "SITE",
      externalId: reservation.externalId,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ ok: false, error: "INVALID_BODY", issues: error.issues }, { status: 400 });
    }
    const message = error instanceof Error ? error.message : "UNKNOWN_ERROR";
    if (message === "ROOM_NOT_AVAILABLE") {
      return NextResponse.json({ ok: false, error: "ROOM_NOT_AVAILABLE" }, { status: 409 });
    }
    if (message === "INVALID_DATE_RANGE") {
      return NextResponse.json({ ok: false, error: "INVALID_DATE_RANGE" }, { status: 400 });
    }
    return NextResponse.json({ ok: false, error: "IMPORT_FAILED", message }, { status: 500 });
  }
}
