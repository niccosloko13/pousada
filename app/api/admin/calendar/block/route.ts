import { ReservationStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminSession } from "@/lib/adminAuth";
import { validateAdminCsrf } from "@/lib/adminCsrf";
import { prisma } from "@/lib/prisma";

const bodySchema = z.object({
  roomId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

function dayBounds(dateIso: string) {
  const day = new Date(`${dateIso}T00:00:00`);
  const start = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 0, 0, 0, 0);
  const end = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 23, 59, 59, 999);
  return { start, end };
}

export async function POST(request: Request) {
  try {
    await requireAdminSession();
    const csrfOk = await validateAdminCsrf(request);
    if (!csrfOk) return NextResponse.json({ ok: false, error: "INVALID_CSRF" }, { status: 403 });

    const body = bodySchema.parse(await request.json());
    const { start, end } = dayBounds(body.date);

    const room = await prisma.room.findUnique({ where: { id: body.roomId }, select: { id: true } });
    if (!room) return NextResponse.json({ ok: false, error: "ROOM_NOT_FOUND" }, { status: 404 });

    const blockingStatuses: ReservationStatus[] = ["PENDING_PAYMENT", "CONFIRMED", "CHECKED_IN"];
    const reservation = await prisma.reservation.findFirst({
      where: {
        roomId: body.roomId,
        status: { in: blockingStatuses },
        checkinAt: { lt: end },
        checkoutAt: { gt: start },
      },
      select: { id: true },
    });
    if (reservation) {
      return NextResponse.json({ ok: false, error: "RESERVATION_EXISTS" }, { status: 409 });
    }

    const existingManual = await prisma.blockedDate.findFirst({
      where: {
        roomId: body.roomId,
        reason: "manual_block",
        startDate: { lte: end },
        endDate: { gte: start },
      },
      select: { id: true },
    });

    if (!existingManual) {
      await prisma.blockedDate.create({
        data: {
          roomId: body.roomId,
          startDate: start,
          endDate: end,
          reason: "manual_block",
        },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ ok: false, error: "INVALID_BODY" }, { status: 400 });
    return NextResponse.json({ ok: false, error: "UNKNOWN_ERROR" }, { status: 500 });
  }
}
