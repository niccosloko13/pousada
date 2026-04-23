import { Prisma, ReservationStatus } from "@prisma/client";
import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";
import { validateHouseRules } from "@/lib/reservations/businessRules";
import { computeStayPricing } from "@/lib/reservations/pricing";

type DateRange = {
  checkin: Date;
  checkout: Date;
};

export async function checkAvailability(roomId: string, range: DateRange) {
  const blockingStatuses: ReservationStatus[] = ["PENDING_PAYMENT", "CONFIRMED", "CHECKED_IN"];

  const conflictingReservation = await prisma.reservation.findFirst({
    where: {
      roomId,
      status: { in: blockingStatuses },
      // Keep channel-agnostic conflict checks: site + external channels block inventory equally.
      OR: [
        {
          AND: [{ checkinAt: { lt: range.checkout } }, { checkoutAt: { gt: range.checkin } }],
        },
      ],
    },
  });

  const blocked = await prisma.blockedDate.findFirst({
    where: {
      roomId,
      AND: [{ startDate: { lt: range.checkout } }, { endDate: { gt: range.checkin } }],
    },
  });

  return {
    available: !conflictingReservation && !blocked,
    conflictingReservation,
    blocked,
  };
}

export async function holdInventory(roomId: string, range: DateRange) {
  // Today "hold" is modeled as creating a PENDING_PAYMENT reservation row (see createPendingReservation).
  // This helper keeps the API explicit for future channel managers / external inventory locks.
  return checkAvailability(roomId, range);
}

export async function releaseExpiredReservations() {
  const now = new Date();

  await prisma.reservation.updateMany({
    where: {
      status: "PENDING_PAYMENT",
      expiresAt: { lt: now },
    },
    data: {
      status: "EXPIRED",
    },
  });
}

export async function releaseExpiredReservation(reservationId: string) {
  const reservation = await prisma.reservation.findUnique({ where: { id: reservationId } });
  if (!reservation) return { ok: false as const, reason: "NOT_FOUND" as const };
  if (reservation.status !== "PENDING_PAYMENT") return { ok: true as const, noop: true as const };

  await prisma.reservation.update({
    where: { id: reservationId },
    data: { status: "EXPIRED", expiresAt: null },
  });

  return { ok: true as const };
}

export async function createPendingReservation(input: {
  roomSlug: string;
  checkin: string;
  checkout: string;
  adults: number;
  childrenFree: number;
  childrenHalf: number;
  guest: { name: string; email: string; phone: string; cpf?: string };
  arrivalTime?: string;
  notes?: string;
  holdMinutes?: number;
}) {
  await releaseExpiredReservations();

  const room = await prisma.room.findUnique({ where: { slug: input.roomSlug } });
  if (!room) throw new Error("ROOM_NOT_FOUND");
  if (!room.isActive) throw new Error("ROOM_INACTIVE");

  const checkinAt = new Date(`${input.checkin}T15:00:00`);
  const checkoutAt = new Date(`${input.checkout}T11:00:00`);
  if (Number.isNaN(checkinAt.getTime()) || Number.isNaN(checkoutAt.getTime()) || checkoutAt <= checkinAt) {
    throw new Error("INVALID_DATE_RANGE");
  }

  const totalGuests = input.adults + input.childrenFree + input.childrenHalf;
  if (totalGuests > room.capacity) {
    throw new Error("ROOM_CAPACITY_EXCEEDED");
  }

  const availability = await checkAvailability(room.id, { checkin: checkinAt, checkout: checkoutAt });
  if (!availability.available) {
    throw new Error("ROOM_NOT_AVAILABLE");
  }

  const pricing = computeStayPricing(room, input.checkin, input.checkout, input.adults, input.childrenFree, input.childrenHalf);
  const total = Number(pricing.total.toFixed(2));
  const signalAmount = Number((total * 0.5).toFixed(2));
  const remainingAtCheckin = Number((total - signalAmount).toFixed(2));
  const houseRules = validateHouseRules({
    category: room.category,
    totalGuests,
    nights: pricing.nights,
  });
  if (!houseRules.ok) {
    if (houseRules.reason === "HOUSE_MIN_GUESTS") throw new Error("HOUSE_MIN_GUESTS");
    if (houseRules.reason === "HOUSE_MIN_NIGHTS") throw new Error("HOUSE_MIN_NIGHTS");
  }

  const expiresAt = new Date(Date.now() + (input.holdMinutes ?? 20) * 60 * 1000);

  const code = createSecureReservationCode();
  const publicAccessToken = crypto.randomBytes(24).toString("hex");

  return prisma.$transaction(
    async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${room.id}))`;
    const conflictingReservation = await tx.reservation.findFirst({
      where: {
        roomId: room.id,
        status: { in: ["PENDING_PAYMENT", "CONFIRMED", "CHECKED_IN"] },
        checkinAt: { lt: checkoutAt },
        checkoutAt: { gt: checkinAt },
      },
      select: { id: true },
    });
    if (conflictingReservation) throw new Error("ROOM_NOT_AVAILABLE");

    const blockedRange = await tx.blockedDate.findFirst({
      where: {
        roomId: room.id,
        startDate: { lt: checkoutAt },
        endDate: { gt: checkinAt },
      },
      select: { id: true },
    });
    if (blockedRange) throw new Error("ROOM_NOT_AVAILABLE");

    const customer = await tx.customer.upsert({
      where: { email: input.guest.email },
      create: {
        email: input.guest.email,
        name: input.guest.name,
        phone: input.guest.phone,
        cpf: input.guest.cpf,
      },
      update: {
        name: input.guest.name,
        phone: input.guest.phone,
        cpf: input.guest.cpf,
      },
    });

    const reservation = await tx.reservation.create({
      data: {
        code,
        publicAccessToken,
        channel: "DIRECT_WEB",
        externalId: null,
        roomId: room.id,
        customerId: customer.id,
        checkinAt,
        checkoutAt,
        nights: pricing.nights,
        adults: input.adults,
        childrenFree: input.childrenFree,
        childrenHalf: input.childrenHalf,
        amountTotal: new Prisma.Decimal(total.toFixed(2)),
        breakdown: {
          ...pricing,
          paymentPlan: {
            model: "fifty_fifty_pre_reserva",
            signalPercent: 50,
            signalAmount,
            remainingAtCheckin,
          },
        } as unknown as Prisma.JsonObject,
        status: "PENDING_PAYMENT",
        expiresAt,
        arrivalTime: input.arrivalTime,
        notes: input.notes,
      },
    });

    await tx.reservationGuest.create({
      data: {
        reservationId: reservation.id,
        name: input.guest.name,
        email: input.guest.email,
        phone: input.guest.phone,
      },
    });

    const payment = await tx.payment.create({
      data: {
        reservationId: reservation.id,
        amount: new Prisma.Decimal(signalAmount.toFixed(2)),
        status: "PENDING",
        provider: "MERCADOPAGO",
      },
    });

    return { reservation, payment, pricing, room, customer };
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      maxWait: 5_000,
      timeout: 15_000,
    },
  );
}

export async function createExternalBookingReservation(input: {
  roomId: string;
  externalId: string;
  checkinAt: Date;
  checkoutAt: Date;
  guest: { name: string; email: string; phone: string };
  adults: number;
  childrenFree: number;
  childrenHalf: number;
  amountTotal: number;
  notes?: string;
}) {
  const checkin = input.checkinAt;
  const checkout = input.checkoutAt;
  if (checkout <= checkin) throw new Error("INVALID_DATE_RANGE");

  return prisma.$transaction(
    async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${input.roomId}))`;
      const conflictingReservation = await tx.reservation.findFirst({
        where: {
          roomId: input.roomId,
          status: { in: ["PENDING_PAYMENT", "CONFIRMED", "CHECKED_IN"] },
          checkinAt: { lt: checkout },
          checkoutAt: { gt: checkin },
        },
        select: { id: true },
      });
      if (conflictingReservation) throw new Error("ROOM_NOT_AVAILABLE");

      const blockedRange = await tx.blockedDate.findFirst({
        where: {
          roomId: input.roomId,
          startDate: { lt: checkout },
          endDate: { gt: checkin },
        },
        select: { id: true },
      });
      if (blockedRange) throw new Error("ROOM_NOT_AVAILABLE");

      const customer = await tx.customer.upsert({
        where: { email: input.guest.email },
        create: {
          email: input.guest.email,
          name: input.guest.name,
          phone: input.guest.phone,
        },
        update: {
          name: input.guest.name,
          phone: input.guest.phone,
        },
      });

      const reservation = await tx.reservation.create({
        data: {
          code: createSecureReservationCode(),
          publicAccessToken: crypto.randomBytes(24).toString("hex"),
          channel: "BOOKING_COM",
          externalId: input.externalId,
          externalSource: "booking",
          roomId: input.roomId,
          customerId: customer.id,
          checkinAt: checkin,
          checkoutAt: checkout,
          nights: Math.max(1, Math.ceil((checkout.getTime() - checkin.getTime()) / (24 * 60 * 60 * 1000))),
          adults: input.adults,
          childrenFree: input.childrenFree,
          childrenHalf: input.childrenHalf,
          amountTotal: new Prisma.Decimal(input.amountTotal.toFixed(2)),
          breakdown: {
            source: "booking_import",
            syncedAt: new Date().toISOString(),
          } as Prisma.JsonObject,
          status: "CONFIRMED",
          notes: input.notes,
        },
      });

      await tx.reservationGuest.create({
        data: {
          reservationId: reservation.id,
          name: input.guest.name,
          email: input.guest.email,
          phone: input.guest.phone,
        },
      });

      return reservation;
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      maxWait: 5_000,
      timeout: 15_000,
    },
  );
}

function createSecureReservationCode() {
  return `PP-${crypto.randomBytes(5).toString("base64url").toUpperCase()}`;
}

export async function createFreeTestReservation(input: {
  roomSlug: string;
  checkin: string;
  checkout: string;
  adults: number;
  childrenFree: number;
  childrenHalf: number;
  guest: { name: string; email: string; phone: string; cpf?: string };
  arrivalTime?: string;
  notes?: string;
}) {
  const testNotes = [input.notes, "[TESTE_GRATIS]"].filter(Boolean).join(" ");
  const base = await createPendingReservation({
    ...input,
    notes: testNotes,
    holdMinutes: 5,
  });

  const patchedBreakdown = {
    ...(base.reservation.breakdown as Record<string, unknown>),
    subtotal: Number(base.reservation.amountTotal),
    discount: Number(base.reservation.amountTotal),
    total: 0,
    voucherCode: "GRATIS",
    testReservation: true,
  };

  const updated = await prisma.$transaction(async (tx) => {
    const reservation = await tx.reservation.update({
      where: { id: base.reservation.id },
      data: {
        amountTotal: new Prisma.Decimal("0.00"),
        breakdown: patchedBreakdown as Prisma.JsonObject,
        status: "CONFIRMED",
        expiresAt: null,
      },
    });

    const payment = await tx.payment.update({
      where: { id: base.payment.id },
      data: {
        amount: new Prisma.Decimal("0.00"),
        status: "APPROVED",
        mpPaymentId: `TEST-GRATIS-${reservation.code}`,
      },
    });

    await tx.paymentEvent.create({
      data: {
        paymentId: payment.id,
        type: "payment.waived_test",
        payload: { voucherCode: "GRATIS", mode: "test" },
        reservationId: reservation.id,
      },
    });

    return { reservation, payment };
  });

  return {
    reservation: updated.reservation,
    payment: updated.payment,
    room: base.room,
    customer: base.customer,
    pricing: base.pricing,
  };
}

export async function confirmReservation(reservationId: string) {
  await prisma.reservation.update({
    where: { id: reservationId },
    data: { status: "CONFIRMED", expiresAt: null },
  });
}

export async function confirmReservationFromPayment(reservationId: string, mpPaymentId: string) {
  return prisma.$transaction(async (tx) => {
    const payment = await tx.payment.findFirst({
      where: { reservationId },
      orderBy: { createdAt: "desc" },
    });

    if (!payment) {
      throw new Error("PAYMENT_NOT_FOUND");
    }

    await tx.payment.update({
      where: { id: payment.id },
      data: {
        status: "APPROVED",
        mpPaymentId,
      },
    });

    await tx.reservation.update({
      where: { id: reservationId },
      data: {
        status: "CONFIRMED",
        expiresAt: null,
      },
    });

    await tx.paymentEvent.create({
      data: {
        paymentId: payment.id,
        type: "payment.approved",
        payload: { mpPaymentId },
        reservationId,
      },
    });

    return payment;
  });
}
