import {
  cancelReservationAction,
  checkInReservationAction,
  checkOutReservationAction,
  confirmReservationAction,
} from "@/app/admin/reservations/actions";

type Props = {
  reservationId: string;
  reservationStatus: string;
  paymentStatus: string | null;
};

function SubmitButton({
  label,
  intent,
  disabled,
}: {
  label: string;
  intent: "primary" | "danger" | "ghost";
  disabled?: boolean;
}) {
  const base =
    intent === "primary"
      ? "bg-slate-900 text-white hover:bg-slate-800"
      : intent === "danger"
        ? "border border-rose-300 bg-white text-rose-900 hover:bg-rose-50"
        : "border border-slate-300 bg-white text-slate-900 hover:bg-slate-50";

  return (
    <button
      type="submit"
      disabled={disabled}
      className={`rounded-lg px-3 py-2 text-xs font-extrabold ${base} ${disabled ? "cursor-not-allowed opacity-40" : ""}`}
    >
      {label}
    </button>
  );
}

export function AdminReservationActions({ reservationId, reservationStatus, paymentStatus }: Props) {
  const canConfirm = reservationStatus === "PENDING_PAYMENT" && paymentStatus === "APPROVED";
  const canCancel = reservationStatus !== "CANCELLED" && reservationStatus !== "CHECKED_OUT";
  const canCheckIn = reservationStatus === "CONFIRMED";
  const canCheckOut = reservationStatus === "CHECKED_IN";

  return (
    <div className="flex flex-wrap gap-2">
      <form action={confirmReservationAction}>
        <input type="hidden" name="reservationId" value={reservationId} />
        <SubmitButton label="Confirmar" intent="primary" disabled={!canConfirm} />
      </form>

      <form action={cancelReservationAction}>
        <input type="hidden" name="reservationId" value={reservationId} />
        <SubmitButton label="Cancelar" intent="danger" disabled={!canCancel} />
      </form>

      <form action={checkInReservationAction}>
        <input type="hidden" name="reservationId" value={reservationId} />
        <SubmitButton label="Marcar check-in" intent="ghost" disabled={!canCheckIn} />
      </form>

      <form action={checkOutReservationAction}>
        <input type="hidden" name="reservationId" value={reservationId} />
        <SubmitButton label="Marcar check-out" intent="ghost" disabled={!canCheckOut} />
      </form>
    </div>
  );
}
