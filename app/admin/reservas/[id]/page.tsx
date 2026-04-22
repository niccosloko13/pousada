import { notFound } from "next/navigation";
import { mockReservations } from "@/data/admin-mock";
import { formatCurrencyBRL } from "@/lib/reservation";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function AdminReservaDetalhePage({ params }: Props) {
  const { id } = await params;
  const reservation = mockReservations.find((item) => item.id === id);

  if (!reservation) return notFound();

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h1 className="text-2xl font-bold text-slate-900">Reserva {reservation.code}</h1>
      <div className="mt-4 grid gap-2 text-sm text-slate-700 md:grid-cols-2">
        <p><span className="font-semibold">Hóspede:</span> {reservation.guestName}</p>
        <p><span className="font-semibold">Quarto:</span> {reservation.roomSlug}</p>
        <p><span className="font-semibold">Check-in:</span> {reservation.checkin}</p>
        <p><span className="font-semibold">Check-out:</span> {reservation.checkout}</p>
        <p><span className="font-semibold">Status:</span> {reservation.status}</p>
        <p><span className="font-semibold">Pagamento:</span> {reservation.paymentStatus}</p>
        <p><span className="font-semibold">Total:</span> {formatCurrencyBRL(reservation.total)}</p>
      </div>
    </div>
  );
}
