import { mockReservations } from "@/data/admin-mock";
import { formatCurrencyBRL } from "@/lib/reservation";

export default function AdminDashboardPage() {
  const hoje = "2026-04-22";
  const reservasHoje = mockReservations.filter((r) => r.createdAt.startsWith(hoje)).length;
  const checkinsHoje = mockReservations.filter((r) => r.checkin === hoje).length;
  const checkoutsHoje = mockReservations.filter((r) => r.checkout === hoje).length;
  const pendentes = mockReservations.filter((r) => r.status === "pending").length;
  const receitaPrevista = mockReservations.reduce((acc, r) => acc + r.total, 0);
  const ocupacao = `${Math.min(100, Math.round((mockReservations.length / 10) * 100))}%`;

  const cards = [
    { label: "Reservas de hoje", value: reservasHoje },
    { label: "Check-ins de hoje", value: checkinsHoje },
    { label: "Check-outs de hoje", value: checkoutsHoje },
    { label: "Reservas pendentes", value: pendentes },
    { label: "Receita prevista", value: formatCurrencyBRL(receitaPrevista) },
    { label: "Ocupação resumida", value: ocupacao },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">Dashboard do proprietário</h1>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <article key={card.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{card.label}</p>
            <p className="mt-2 text-2xl font-extrabold text-slate-900">{card.value}</p>
          </article>
        ))}
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">Próximos hóspedes</h2>
        <div className="mt-3 space-y-2 text-sm">
          {mockReservations.slice(0, 5).map((reservation) => (
            <div key={reservation.id} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
              <span className="font-medium text-slate-800">{reservation.guestName}</span>
              <span className="text-slate-600">
                {reservation.checkin} - {reservation.checkout}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
