import { NextResponse } from "next/server";
import { z } from "zod";
import { createMercadoPagoPreference } from "@/lib/mercadopago/preference";
import { prisma } from "@/lib/prisma";
import { ensureRoomsSeeded } from "@/lib/reservations/ensureRoomsSeeded";
import { createFreeTestReservation, createPendingReservation } from "@/lib/reservations/engine";

export const runtime = "nodejs";

const bodySchema = z.object({
  roomSlug: z.string().min(1),
  checkin: z.string().min(1),
  checkout: z.string().min(1),
  adults: z.coerce.number().int().min(1),
  childrenFree: z.coerce.number().int().min(0),
  childrenHalf: z.coerce.number().int().min(0),
  guest: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    phone: z.string().min(8),
    cpf: z.string().optional(),
  }),
  arrivalTime: z.string().optional(),
  notes: z.string().optional(),
  voucherCode: z.string().optional(),
});

function normalizeVoucher(input?: string) {
  if (!input) return "";
  return input
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toUpperCase()
    .trim();
}

function canUseFreeTestVoucher() {
  return process.env.NODE_ENV !== "production" || process.env.ALLOW_TEST_FREE_VOUCHER === "true";
}

export async function POST(request: Request) {
  try {
    await ensureRoomsSeeded();
    const json = await request.json();
    const data = bodySchema.parse(json);
    const voucher = normalizeVoucher(data.voucherCode);
    const isFreeTestVoucher = voucher === "GRATIS" && canUseFreeTestVoucher();

    if (isFreeTestVoucher) {
      const { reservation } = await createFreeTestReservation({
        roomSlug: data.roomSlug,
        checkin: data.checkin,
        checkout: data.checkout,
        adults: data.adults,
        childrenFree: data.childrenFree,
        childrenHalf: data.childrenHalf,
        guest: data.guest,
        arrivalTime: data.arrivalTime,
        notes: data.notes,
      });

      return NextResponse.json({
        ok: true,
        mode: "test_free",
        reservationCode: reservation.code,
        reservationId: reservation.id,
        completionUrl: `/reserva/sucesso?code=${encodeURIComponent(reservation.code)}&status=test_free`,
      });
    }

    const { reservation, payment, room } = await createPendingReservation({
      roomSlug: data.roomSlug,
      checkin: data.checkin,
      checkout: data.checkout,
      adults: data.adults,
      childrenFree: data.childrenFree,
      childrenHalf: data.childrenHalf,
      guest: data.guest,
      arrivalTime: data.arrivalTime,
      notes: data.notes,
    });

    const preference = await createMercadoPagoPreference({
      title: `Reserva ${reservation.code} - ${room.name}`,
      amount: Number(reservation.amountTotal),
      reservationCode: reservation.code,
      payerEmail: data.guest.email,
      payerName: data.guest.name,
    });

    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        mpPreferenceId: preference.id ?? null,
        status: "PROCESSING",
      },
    });

    const checkoutUrl = preference.sandbox_init_point ?? preference.init_point;

    return NextResponse.json({
      ok: true,
      reservationCode: reservation.code,
      reservationId: reservation.id,
      checkoutUrl,
      preferenceId: preference.id,
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
    if (message === "ROOM_CAPACITY_EXCEEDED") {
      return NextResponse.json({ ok: false, error: "ROOM_CAPACITY_EXCEEDED" }, { status: 400 });
    }

    if (message === "MERCADOPAGO_ACCESS_TOKEN_MISSING") {
      return NextResponse.json({ ok: false, error: "MP_NOT_CONFIGURED" }, { status: 500 });
    }

    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
