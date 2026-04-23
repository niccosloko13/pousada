import Link from "next/link";
import { AlertTriangle, ArrowRight, CalendarCheck, CalendarClock, CalendarX, CircleDollarSign, FlaskConical, Percent, ShieldCheck } from "lucide-react";
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

  const [reservasHoje, checkinsHoje, checkoutsHoje, pendentesPagamento, recebidoAgg, upcoming, recentes, testeCount, aprovadasFuturas] = await Promise.all([
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
    prisma.reservation.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { customer: true, room: true, payments: { orderBy: { createdAt: "desc" }, take: 1 } },
    }),
    prisma.reservation.count({
      where: {
        OR: [{ notes: { contains: "[TESTE_GRATIS]" } }, { breakdown: { path: ["testReservation"], equals: true } }],
      },
    }),
    prisma.payment.aggregate({
      where: { status: "APPROVED", reservation: { checkinAt: { gte: dayStart } } },
      _sum: { amount: true },
    }),
  ]);

  const receitaRecebida = Number(recebidoAgg._sum.amount ?? 0);
  const receitaPrevista = Number(aprovadasFuturas._sum.amount ?? 0);

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
    { label: "Reservas hoje", value: String(reservasHoje), icon: CalendarClock },
    { label: "Check-ins hoje", value: String(checkinsHoje), icon: CalendarCheck },
    { label: "Check-outs hoje", value: String(checkoutsHoje), icon: CalendarX },
    { label: "Pendentes de pagamento", value: String(pendentesPagamento), icon: AlertTriangle },
    { label: "Receita prevista", value: formatCurrencyBRL(receitaPrevista), icon: CircleDollarSign },
    { label: "Ocupação", value: ocupacao, icon: Percent },
  ];

  const alerts: string[] = [];
  if (pendentesPagamento > 5) alerts.push("Muitas reservas pendentes de pagamento. Revise pré-reservas e tempo de expiração.");
  if (checkinsHoje === 0) alerts.push("Nenhum check-in hoje. Conferir agenda de chegadas e canais.");
  if (roomsCount > 0 && ocupadasHoje >= roomsCount) alerts.push("Inventário totalmente ocupado no período atual.");

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard operacional</h1>
          <p className="mt-1 text-sm text-slate-600">Visão diária de reservas, financeiro e ocupação com foco em operação hoteleira.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/reservas" className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-extrabold text-white">
            Ver reservas
          </Link>
          <Link href="/admin/configuracoes" className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-800">
            Gateway e ambiente
          </Link>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <article key={card.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="mb-1 inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              <card.icon className="h-3.5 w-3.5" />
              Indicador
            </p>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{card.label}</p>
            <p className="mt-2 text-2xl font-extrabold text-slate-900">{card.value}</p>
          </article>
        ))}
      </div>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">Ações rápidas</h2>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <Link href="/admin/reservas" className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-800">
              Criar reserva manual
            </Link>
            <Link href="/admin/reservas?status=pending" className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-800">
              Ver pendentes de pagamento
            </Link>
            <Link href="/admin/configuracoes" className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-800">
              Bloquear datas / regras
            </Link>
            <Link href="/admin/financeiro" className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-800">
              Ir para financeiro
            </Link>
            <Link href="/admin/configuracoes" className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-800">
              Testar pagamento
            </Link>
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">Alertas operacionais</h2>
          <div className="mt-3 space-y-2 text-sm">
            {alerts.length ? (
              alerts.map((alert) => (
                <p key={alert} className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-amber-900">
                  {alert}
                </p>
              ))
            ) : (
              <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-800">
                Operação sem alertas críticos no momento.
              </p>
            )}
            <p className="rounded-xl border border-cyan-200 bg-cyan-50 px-3 py-2 text-cyan-900">Reservas de teste registradas: {testeCount}</p>
          </div>
        </article>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-slate-900">Próximas reservas</h2>
            <Link href="/admin/reservas" className="inline-flex items-center gap-1 text-xs font-bold text-cyan-800 underline">
              Lista completa <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="space-y-2 text-sm">
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
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-lg font-bold text-slate-900">Reservas recentes</h2>
          <div className="space-y-2 text-sm">
            {recentes.map((reservation) => (
              <div key={reservation.id} className="rounded-lg bg-slate-50 px-3 py-2">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-slate-900">{reservation.code}</p>
                  <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-700">{reservation.status}</span>
                </div>
                <p className="text-xs text-slate-600">
                  {reservation.customer.name} · {reservation.room.name} · {formatCurrencyBRL(Number(reservation.amountTotal))}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-3 rounded-xl border border-cyan-200 bg-cyan-50 px-3 py-2 text-xs text-cyan-900">
            <p className="inline-flex items-center gap-1 font-semibold">
              <FlaskConical className="h-3.5 w-3.5" />
              Reservas de teste com voucher GRÁTIS são destacadas no admin de reservas.
            </p>
          </div>
          <div className="mt-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-900">
            <p className="inline-flex items-center gap-1 font-semibold">
              <ShieldCheck className="h-3.5 w-3.5" />
              Disponibilidade resumida: {ocupadasHoje}/{roomsCount} acomodações ocupadas no período atual.
            </p>
          </div>
        </article>
      </section>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700 shadow-sm">
        Receita recebida consolidada (aprovada): <span className="font-bold text-slate-900">{formatCurrencyBRL(receitaRecebida)}</span>
      </div>
    </div>
  );
}
