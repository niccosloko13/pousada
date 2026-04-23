"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

async function getLatestPayment(reservationId: string) {
  return prisma.payment.findFirst({
    where: { reservationId },
    orderBy: { createdAt: "desc" },
  });
}

export async function confirmReservationAction(formData: FormData) {
  const reservationId = String(formData.get("reservationId") ?? "");
  const reservation = await prisma.reservation.findUnique({ where: { id: reservationId } });
  if (!reservation) throw new Error("NOT_FOUND");

  const payment = await getLatestPayment(reservation.id);
  if (!payment || payment.status !== "APPROVED") {
    throw new Error("PAYMENT_NOT_APPROVED");
  }

  await prisma.reservation.update({
    where: { id: reservation.id },
    data: { status: "CONFIRMED", expiresAt: null },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/reservas");
  revalidatePath(`/admin/reservas/${reservation.id}`);
}

export async function cancelReservationAction(formData: FormData) {
  const reservationId = String(formData.get("reservationId") ?? "");
  const reservation = await prisma.reservation.findUnique({ where: { id: reservationId } });
  if (!reservation) throw new Error("NOT_FOUND");

  const payment = await getLatestPayment(reservation.id);
  if (payment?.status === "APPROVED") {
    throw new Error("CANCEL_NOT_ALLOWED_WITH_APPROVED_PAYMENT");
  }

  await prisma.$transaction(async (tx) => {
    await tx.reservation.update({
      where: { id: reservation.id },
      data: { status: "CANCELLED", expiresAt: null },
    });

    if (payment && payment.status !== "APPROVED") {
      await tx.payment.update({
        where: { id: payment.id },
        data: { status: "REJECTED" },
      });
    }
  });

  revalidatePath("/admin");
  revalidatePath("/admin/reservas");
  revalidatePath(`/admin/reservas/${reservation.id}`);
  revalidatePath("/admin/financeiro");
}

export async function checkInReservationAction(formData: FormData) {
  const reservationId = String(formData.get("reservationId") ?? "");
  const reservation = await prisma.reservation.findUnique({ where: { id: reservationId } });
  if (!reservation) throw new Error("NOT_FOUND");
  if (reservation.status !== "CONFIRMED") throw new Error("INVALID_STATUS");

  await prisma.reservation.update({
    where: { id: reservation.id },
    data: { status: "CHECKED_IN" },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/reservas");
  revalidatePath(`/admin/reservas/${reservation.id}`);
}

export async function checkOutReservationAction(formData: FormData) {
  const reservationId = String(formData.get("reservationId") ?? "");
  const reservation = await prisma.reservation.findUnique({ where: { id: reservationId } });
  if (!reservation) throw new Error("NOT_FOUND");
  if (reservation.status !== "CHECKED_IN") throw new Error("INVALID_STATUS");

  await prisma.reservation.update({
    where: { id: reservation.id },
    data: { status: "CHECKED_OUT" },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/reservas");
  revalidatePath(`/admin/reservas/${reservation.id}`);
}
