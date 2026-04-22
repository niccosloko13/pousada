import { mockReservations } from "@/data/admin-mock";
import { formatCurrencyBRL } from "@/lib/reservation";

export default function AdminFinanceiroPage() {
  const recebido = mockReservations.filter((r) => r.paymentStatus === "paid").reduce((acc, r) => acc + r.total, 0);
  const pendente = mockReservations.filter((r) => r.paymentStatus === "pending").reduce((acc, r) => acc + r.total, 0);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">Financeiro</h1>
      <div className="grid gap-3 sm:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Receita recebida</p>
          <p className="mt-2 text-2xl font-extrabold text-slate-900">{formatCurrencyBRL(recebido)}</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Receita pendente</p>
          <p className="mt-2 text-2xl font-extrabold text-slate-900">{formatCurrencyBRL(pendente)}</p>
        </article>
      </div>
    </div>
  );
}
