import { prisma } from "@/lib/prisma";
import { formatCurrencyBRL } from "@/lib/reservation";

export const dynamic = "force-dynamic";

export default async function AdminFinanceiroPage() {
  const [approved, pendingReservation, recentPayments] = await Promise.all([
    prisma.payment.aggregate({
      where: { status: "APPROVED" },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.reservation.aggregate({
      where: { status: "PENDING_PAYMENT" },
      _sum: { amountTotal: true },
      _count: true,
    }),
    prisma.payment.findMany({
      orderBy: { createdAt: "desc" },
      take: 25,
      include: {
        reservation: {
          include: { room: true, customer: true },
        },
      },
    }),
  ]);

  const recebido = Number(approved._sum.amount ?? 0);
  const pendente = Number(pendingReservation._sum.amountTotal ?? 0);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">Financeiro</h1>
      <div className="grid gap-3 sm:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Receita recebida</p>
          <p className="mt-2 text-2xl font-extrabold text-slate-900">{formatCurrencyBRL(recebido)}</p>
          <p className="mt-2 text-xs text-slate-600">{approved._count} pagamentos aprovados</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Pendente (reservas aguardando pagamento)</p>
          <p className="mt-2 text-2xl font-extrabold text-slate-900">{formatCurrencyBRL(pendente)}</p>
          <p className="mt-2 text-xs text-slate-600">{pendingReservation._count} reservas pendentes</p>
        </article>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">Últimos pagamentos</h2>
        <div className="mt-3 space-y-2 text-sm">
          {recentPayments.map((payment) => (
            <div key={payment.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2">
              <div>
                <p className="font-semibold text-slate-900">{payment.reservation.code}</p>
                <p className="text-xs text-slate-600">
                  {payment.reservation.customer.name} · {payment.reservation.room.name}
                </p>
                <p className="mt-1 text-xs text-slate-600">
                  Origem: <span className="font-semibold">{payment.reservation.channel}</span> · Provider:{" "}
                  <span className="font-semibold">{payment.provider}</span>
                </p>
              </div>
              <div className="text-right text-xs">
                <p className="font-extrabold text-slate-900">{formatCurrencyBRL(Number(payment.amount))}</p>
                <p className="mt-1 font-semibold text-slate-700">{payment.status}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
