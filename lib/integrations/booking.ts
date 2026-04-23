import { createExternalBookingReservation } from "@/lib/reservations/engine";

export type BookingReservationPayload = {
  externalId: string;
  roomId: string;
  checkinAt: Date;
  checkoutAt: Date;
  guest: { name: string; email: string; phone: string };
  adults: number;
  childrenFree: number;
  childrenHalf: number;
  amountTotal: number;
  notes?: string;
};

export async function pullBookingReservations() {
  // TODO: replace with Booking.com API pull integration.
  return { ok: true as const, imported: 0 };
}

export async function pushBookingAvailability() {
  // TODO: replace with Booking.com availability push integration.
  return { ok: true as const };
}

export async function handleBookingWebhook() {
  // TODO: validate signature and map Booking webhook events.
  return { ok: true as const };
}

export async function importSingleBookingReservation(payload: BookingReservationPayload) {
  return createExternalBookingReservation(payload);
}
