import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCurrencyBRL } from "@/lib/reservation";

export const dynamic = "force-dynamic";

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

export default async function AdminDashboardPage() {
  const now = new Date();
  const dayStart = startOfDay(now);
  const dayEnd = endOfDay(now);
  const tomorrow = new Date(dayStart);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [reservasHoje, checkinsHoje, checkoutsHoje, pendentesPagamento, recebidoAgg, upcoming] = await Promise.all([
    prisma.reservation.count({
      where: { createdAt: { gte: dayStart, lte: dayEnd } },
    }),
    prisma.reservation.count({
      where: {
        status: { in: ["CONFIRMED", "CHECKED_IN"] },
        checkinAt: { gte: dayStart, lt: tomorrow },
      },
    }),
    prisma.reservation.count({
      where: {
        status: { in: ["CONFIRMED", "CHECKED_IN", "CHECKED_OUT"] },
        checkoutAt: { gte: dayStart, lt: tomorrow },
      },
    }),
    prisma.reservation.count({
      where: {
        status: "PENDING_PAYMENT",
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
      },
    }),
    prisma.payment.aggregate({
      where: { status: "APPROVED" },
      _sum: { amount: true },
    }),
    prisma.reservation.findMany({
      where: { status: { in: ["CONFIRMED", "PENDING_PAYMENT", "CHECKED_IN"] } },
      orderBy: { checkinAt: "asc" },
      take: 6,
      include: { customer: true, room: true, payments: { orderBy: { createdAt: "desc" }, take: 1 } },
    }),
  ]);

  const receitaRecebida = Number(recebidoAgg._sum.amount ?? 0);

  const roomsCount = await prisma.room.count();
  const ocupadasHoje = await prisma.reservation.count({
    where: {
      status: { in: ["CONFIRMED", "CHECKED_IN", "PENDING_PAYMENT"] },
      checkinAt: { lt: tomorrow },
      checkoutAt: { gt: dayStart },
    },
  });
  const ocupacao = roomsCount > 0 ? `${Math.min(100, Math.round((ocupadasHoje / roomsCount) * 100))}%` : "—";

  const cards = [
    { label: "Reservas criadas hoje", value: String(reservasHoje) },
    { label: "Check-ins hoje", value: String(checkinsHoje) },
    { label: "Check-outs hoje", value: String(checkoutsHoje) },
    { label: "Pendentes de pagamento", value: String(pendentesPagamento) },
    { label: "Receita recebida (pagamentos aprovados)", value: formatCurrencyBRL(receitaRecebida) },
    { label: "Ocupação (visão dia)", value: ocupacao },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard do proprietário</h1>
          <p className="mt-1 text-sm text-slate-600">Dados reais do PostgreSQL (reservas, pagamentos e clientes).</p>
        </div>
        <Link href="/admin/reservas" className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-extrabold text-white">
          Ver reservas
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <article key={card.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{card.label}</p>
            <p className="mt-2 text-2xl font-extrabold text-slate-900">{card.value}</p>
          </article>
        ))}
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-slate-900">Próximos hóspedes</h2>
          <Link href="/admin/reservas" className="text-xs font-bold text-cyan-800 underline">
            Lista completa
          </Link>
        </div>
        <div className="mt-3 space-y-2 text-sm">
          {upcoming.map((reservation) => (
            <div key={reservation.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2">
              <div>
                <p className="font-semibold text-slate-900">{reservation.customer.name}</p>
                <p className="text-xs text-slate-600">
                  {reservation.code} · {reservation.room.name}
                </p>
              </div>
              <div className="text-right text-xs text-slate-600">
                <p className="font-semibold text-slate-800">{reservation.status}</p>
                <p>
                  {reservation.checkinAt.toLocaleDateString("pt-BR")} → {reservation.checkoutAt.toLocaleDateString("pt-BR")}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
