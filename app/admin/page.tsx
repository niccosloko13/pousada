import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CalendarCheck,
  CalendarClock,
  CalendarDays,
  CalendarRange,
  CalendarX,
  CircleDollarSign,
  FlaskConical,
  Percent,
  ShieldCheck,
  Users,
  Wallet,
} from "lucide-react";
import { ReservationStatus } from "@prisma/client";
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

function overlapNightsInRange(startA: Date, endA: Date, startB: Date, endB: Date) {
  const start = Math.max(startA.getTime(), startB.getTime());
  const end = Math.min(endA.getTime(), endB.getTime());
  if (end <= start) return 0;
  return Math.ceil((end - start) / (24 * 60 * 60 * 1000));
}

export default async function AdminDashboardPage() {
  const now = new Date();
  const dayStart = startOfDay(now);
  const dayEnd = endOfDay(now);
  const tomorrow = new Date(dayStart);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const reservingStatuses: ReservationStatus[] = ["PENDING_PAYMENT", "CONFIRMED", "CHECKED_IN", "CHECKED_OUT"];

  const [reservasHoje, checkinsHoje, checkoutsHoje, pendentesPagamento, recebidoAgg, upcoming, recentes, testeCount, testReservations, aprovadasFuturas, roomsCount, monthReservations] = await Promise.all([
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
    prisma.reservation.findMany({
      where: {
        OR: [{ notes: { contains: "[TESTE_GRATIS]" } }, { breakdown: { path: ["testReservation"], equals: true } }],
      },
      orderBy: { createdAt: "desc" },
      take: 4,
      include: { customer: true, room: true },
    }),
    prisma.payment.aggregate({
      where: { status: "APPROVED", reservation: { checkinAt: { gte: dayStart } } },
      _sum: { amount: true },
    }),
    prisma.room.count({ where: { isActive: true } }),
    prisma.reservation.findMany({
      where: {
        status: { in: reservingStatuses },
        checkinAt: { lt: monthEnd },
        checkoutAt: { gt: monthStart },
      },
      select: {
        checkinAt: true,
        checkoutAt: true,
      },
    }),
  ]);

  const receitaRecebida = Number(recebidoAgg._sum.amount ?? 0);
  const receitaPrevista = Number(aprovadasFuturas._sum.amount ?? 0);

  const ocupadasHoje = await prisma.reservation.count({
    where: {
      status: { in: ["CONFIRMED", "CHECKED_IN", "PENDING_PAYMENT"] },
      checkinAt: { lt: tomorrow },
      checkoutAt: { gt: dayStart },
    },
  });
  const occupiedRoomNights = monthReservations.reduce((acc, reservation) => {
    return acc + overlapNightsInRange(reservation.checkinAt, reservation.checkoutAt, monthStart, monthEnd);
  }, 0);
  const monthInventory = roomsCount * daysInMonth;
  const monthlyOccupancy = monthInventory > 0 ? Math.min(100, Math.round((occupiedRoomNights / monthInventory) * 100)) : 0;

  const cards = [
    { label: "Reservas hoje", value: String(reservasHoje), icon: CalendarClock, tone: "text-cyan-700 bg-cyan-50 border-cyan-200" },
    { label: "Check-ins hoje", value: String(checkinsHoje), icon: CalendarCheck, tone: "text-emerald-700 bg-emerald-50 border-emerald-200" },
    { label: "Check-outs hoje", value: String(checkoutsHoje), icon: CalendarX, tone: "text-indigo-700 bg-indigo-50 border-indigo-200" },
    { label: "Pendentes de pagamento", value: String(pendentesPagamento), icon: AlertTriangle, tone: "text-amber-700 bg-amber-50 border-amber-200" },
    { label: "Receita prevista", value: formatCurrencyBRL(receitaPrevista), icon: CircleDollarSign, tone: "text-violet-700 bg-violet-50 border-violet-200" },
    { label: "Ocupação do mês", value: `${monthlyOccupancy}%`, icon: Percent, tone: "text-slate-700 bg-slate-100 border-slate-200" },
  ];

  const alerts: string[] = [];
  if (pendentesPagamento > 5) alerts.push("Muitas reservas pendentes de pagamento. Revise pré-reservas e tempo de expiração.");
  if (checkinsHoje === 0) alerts.push("Nenhum check-in hoje. Conferir agenda de chegadas e canais.");
  if (roomsCount > 0 && ocupadasHoje >= roomsCount) alerts.push("Inventário totalmente ocupado no período atual.");

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-900 to-slate-800 p-5 text-white shadow-[0_24px_70px_rgba(15,23,42,0.25)]">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">Admin · Operação diária</p>
            <h1 className="mt-1 text-3xl font-black tracking-tight">Painel operacional da pousada</h1>
            <p className="mt-2 text-sm text-slate-200">Indicadores em tempo real para reservas, ocupação e decisões rápidas.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/admin/calendario" className="rounded-lg bg-cyan-600 px-3 py-2 text-xs font-extrabold text-white hover:bg-cyan-500">
              Ir para calendário
            </Link>
            <Link href="/admin/reservas" className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-xs font-bold text-white hover:bg-white/20">
              Ver reservas
            </Link>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-slate-900">Visão executiva</h2>
          <p className="mt-1 text-sm text-slate-600">Resumo do dia e do mês para operação estilo PMS.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/financeiro" className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-800 hover:bg-slate-50">
            Ver financeiro
          </Link>
          <Link href="/admin/clientes" className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-800 hover:bg-slate-50">
            Ver clientes
          </Link>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <article key={card.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{card.label}</p>
                <p className="mt-2 text-2xl font-extrabold text-slate-900">{card.value}</p>
              </div>
              <span className={`inline-flex h-9 w-9 items-center justify-center rounded-xl border ${card.tone}`}>
                <card.icon className="h-4 w-4" />
              </span>
            </div>
          </article>
        ))}
      </div>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">Ações rápidas</h2>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <Link href="/admin/calendario" className="inline-flex items-center gap-2 rounded-xl border border-cyan-200 bg-cyan-50 px-3 py-2 text-sm font-semibold text-cyan-900">
              <CalendarRange className="h-4 w-4" />
              Ir para Calendário
            </Link>
            <Link href="/admin/reservas" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-800">
              <CalendarDays className="h-4 w-4" />
              Ver Reservas
            </Link>
            <Link href="/admin/calendario" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-800">
              <CalendarRange className="h-4 w-4" />
              Criar bloqueio
            </Link>
            <Link href="/admin/financeiro" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-800">
              <Wallet className="h-4 w-4" />
              Ver Financeiro
            </Link>
            <Link href="/admin/clientes" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-800">
              <Users className="h-4 w-4" />
              Ver Clientes
            </Link>
            <Link href="/admin/reservas?status=pending" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-800">
              <AlertTriangle className="h-4 w-4" />
              Pendentes de pagamento
            </Link>
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">Alertas operacionais</h2>
          <div className="mt-3 space-y-2 text-sm">
            <p className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-800">
              <span className="font-semibold">Hoje:</span> {checkinsHoje} check-in(s) · {checkoutsHoje} check-out(s) · {pendentesPagamento} pendente(s)
            </p>
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

      <section className="grid gap-4 lg:grid-cols-3">
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
                  <p className="mt-1">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                        reservation.channel === "BOOKING_COM" ? "bg-indigo-100 text-indigo-900" : "bg-cyan-100 text-cyan-900"
                      }`}
                    >
                      {reservation.channel === "BOOKING_COM" ? "BOOKING" : "SITE"}
                    </span>
                  </p>
                </div>
                <div className="text-right text-xs text-slate-600">
                  <p className="inline-flex rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-700">{reservation.status}</p>
                  <p>
                    {reservation.checkinAt.toLocaleDateString("pt-BR")} → {reservation.checkoutAt.toLocaleDateString("pt-BR")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:col-span-2">
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
                <p className="mt-1">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                      reservation.channel === "BOOKING_COM" ? "bg-indigo-100 text-indigo-900" : "bg-cyan-100 text-cyan-900"
                    }`}
                  >
                    {reservation.channel === "BOOKING_COM" ? "BOOKING" : "SITE"}
                  </span>
                  {reservation.externalId ? (
                    <span className="ml-2 text-[10px] font-mono text-slate-600">{reservation.externalId}</span>
                  ) : null}
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
              Disponibilidade atual: {ocupadasHoje}/{roomsCount} acomodações ocupadas hoje.
            </p>
          </div>
        </article>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-slate-900">Reservas de teste (voucher GRÁTIS)</h2>
          <Link href="/admin/reservas" className="text-xs font-bold text-cyan-800 underline">
            Ver no módulo de reservas
          </Link>
        </div>
        {testReservations.length ? (
          <div className="grid gap-2 md:grid-cols-2">
            {testReservations.map((reservation) => (
              <div key={reservation.id} className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm">
                <p className="font-bold text-amber-900">{reservation.code}</p>
                <p className="text-xs text-amber-900">
                  {reservation.customer.name} · {reservation.room.name}
                </p>
                <p className="text-[11px] text-amber-800">{reservation.createdAt.toLocaleString("pt-BR")}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">Nenhuma reserva de teste registrada recentemente.</p>
        )}
      </section>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700 shadow-sm">
        Receita recebida consolidada (pagamentos aprovados): <span className="font-bold text-slate-900">{formatCurrencyBRL(receitaRecebida)}</span>
      </div>
    </div>
  );
}
