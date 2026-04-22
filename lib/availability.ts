import type { AvailabilityBlock, Reservation } from "@/types/pousada";

export function hasDateOverlap(startA: string, endA: string, startB: string, endB: string) {
  const aStart = new Date(`${startA}T00:00:00`).getTime();
  const aEnd = new Date(`${endA}T00:00:00`).getTime();
  const bStart = new Date(`${startB}T00:00:00`).getTime();
  const bEnd = new Date(`${endB}T00:00:00`).getTime();

  return aStart < bEnd && bStart < aEnd;
}

export function hasReservationConflict(
  roomSlug: string,
  checkin: string,
  checkout: string,
  reservations: Reservation[],
  blocks: AvailabilityBlock[],
) {
  const conflictsReservations = reservations.some(
    (reservation) =>
      reservation.roomSlug === roomSlug &&
      reservation.status !== "cancelled" &&
      hasDateOverlap(checkin, checkout, reservation.checkin, reservation.checkout),
  );

  const conflictsBlocks = blocks.some(
    (block) =>
      block.roomSlug === roomSlug && hasDateOverlap(checkin, checkout, block.startDate, block.endDate),
  );

  return conflictsReservations || conflictsBlocks;
}
