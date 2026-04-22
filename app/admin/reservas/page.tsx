import Link from "next/link";
import { mockReservations } from "@/data/admin-mock";

export default function AdminReservasPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">Reservas</h1>
      <div className="flex flex-wrap gap-2 text-xs">
        {["all", "pending", "confirmed", "cancelled"].map((status) => (
          <button key={status} type="button" className="rounded-full border border-slate-300 bg-white px-3 py-1 font-semibold text-slate-700">
            {status === "all" ? "Todos" : status}
          </button>
        ))}
      </div>
      <div className="space-y-3">
        {mockReservations.map((reservation) => (
          <article key={reservation.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-bold text-slate-900">{reservation.code}</p>
                <p className="text-sm text-slate-600">{reservation.guestName}</p>
              </div>
              <div className="text-sm text-slate-700">
                <p>Status reserva: <span className="font-semibold">{reservation.status}</span></p>
                <p>Status pagamento: <span className="font-semibold">{reservation.paymentStatus}</span></p>
              </div>
              <Link href={`/admin/reservas/${reservation.id}`} className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold text-white">
                Ver detalhes
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
