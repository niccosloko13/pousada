import { ReservationStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type CalendarDay = {
  iso: string;
  label: string;
  dayNumber: number;
  isToday: boolean;
  isWeekend: boolean;
};

export type DayCellState = "available" | "reserved" | "blocked";

export type DayCell = {
  state: DayCellState;
  reservationId?: string;
  reservationCode?: string;
  guestName?: string;
  checkinLabel?: string;
  checkoutLabel?: string;
  blockedId?: string;
};

export type RoomCalendarRow = {
  roomId: string;
  roomName: string;
  roomCategory: string;
  isActive: boolean;
  cells: Record<string, DayCell>;
};

export type AvailabilityCalendar = {
  monthStart: Date;
  monthEnd: Date;
  monthLabel: string;
  days: CalendarDay[];
  rows: RoomCalendarRow[];
};

function toIsoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function dayBoundsLocal(date: Date) {
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
  const end = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
  return { start, end };
}

export function parseMonthInput(raw?: string) {
  const now = new Date();
  if (!raw || !/^\d{4}-\d{2}$/.test(raw)) {
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }
  const [yearStr, monthStr] = raw.split("-");
  const year = Number(yearStr);
  const month = Number(monthStr);
  if (!Number.isFinite(year) || !Number.isFinite(month) || month < 1 || month > 12) {
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }
  return new Date(year, month - 1, 1);
}

export function monthParam(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

export async function buildAvailabilityCalendar(monthDate: Date): Promise<AvailabilityCalendar> {
  const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0, 23, 59, 59, 999);
  const daysInMonth = monthEnd.getDate();
  const todayIso = toIsoDate(new Date());

  const days: CalendarDay[] = Array.from({ length: daysInMonth }, (_, idx) => {
    const d = new Date(monthStart.getFullYear(), monthStart.getMonth(), idx + 1);
    const weekday = d.getDay();
    return {
      iso: toIsoDate(d),
      label: d.toLocaleDateString("pt-BR", { weekday: "short" }),
      dayNumber: idx + 1,
      isToday: toIsoDate(d) === todayIso,
      isWeekend: weekday === 0 || weekday === 6,
    };
  });

  const blockingStatuses: ReservationStatus[] = ["PENDING_PAYMENT", "CONFIRMED", "CHECKED_IN"];

  const [rooms, reservations, blockedDates] = await Promise.all([
    prisma.room.findMany({
      orderBy: [{ isActive: "desc" }, { name: "asc" }],
      select: { id: true, name: true, category: true, isActive: true },
    }),
    prisma.reservation.findMany({
      where: {
        status: { in: blockingStatuses },
        checkinAt: { lt: monthEnd },
        checkoutAt: { gt: monthStart },
      },
      select: {
        id: true,
        code: true,
        roomId: true,
        checkinAt: true,
        checkoutAt: true,
        customer: { select: { name: true } },
      },
    }),
    prisma.blockedDate.findMany({
      where: {
        startDate: { lte: monthEnd },
        endDate: { gte: monthStart },
      },
      select: {
        id: true,
        roomId: true,
        startDate: true,
        endDate: true,
      },
    }),
  ]);

  const rows: RoomCalendarRow[] = rooms.map((room) => {
    const roomReservations = reservations.filter((r) => r.roomId === room.id);
    const roomBlocks = blockedDates.filter((b) => b.roomId === room.id);
    const cells: Record<string, DayCell> = {};

    days.forEach((day) => {
      const dayDate = new Date(`${day.iso}T00:00:00`);
      const { start, end } = dayBoundsLocal(dayDate);

      const reservation = roomReservations.find((r) => r.checkinAt < end && r.checkoutAt > start);
      if (reservation) {
        cells[day.iso] = {
          state: "reserved",
          reservationId: reservation.id,
          reservationCode: reservation.code,
          guestName: reservation.customer.name,
          checkinLabel: reservation.checkinAt.toLocaleDateString("pt-BR"),
          checkoutLabel: reservation.checkoutAt.toLocaleDateString("pt-BR"),
        };
        return;
      }

      const blocked = roomBlocks.find((b) => b.startDate <= end && b.endDate >= start);
      if (blocked) {
        cells[day.iso] = { state: "blocked", blockedId: blocked.id };
        return;
      }

      cells[day.iso] = { state: "available" };
    });

    return {
      roomId: room.id,
      roomName: room.name,
      roomCategory: room.category,
      isActive: room.isActive,
      cells,
    };
  });

  const monthLabel = monthStart.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  return { monthStart, monthEnd, monthLabel, days, rows };
}
