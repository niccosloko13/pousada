import { notFound } from "next/navigation";
import { AdminReservationActions } from "@/app/admin/reservations/AdminReservationActions";
import { prisma } from "@/lib/prisma";
import { formatCurrencyBRL } from "@/lib/reservation";
import { HOUSE_MIN_GUESTS, HOUSE_MIN_NIGHTS, HOUSE_PRICE_PER_PERSON, isHouseCategory } from "@/lib/reservations/businessRules";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function AdminReservaDetalhePage({ params }: Props) {
  const { id } = await params;

  const reservation = await prisma.reservation.findUnique({
    where: { id },
    include: {
      customer: true,
      room: true,
      payments: { orderBy: { createdAt: "desc" } },
      guests: true,
    },
  });

  if (!reservation) return notFound();

  const latestPayment = reservation.payments[0] ?? null;
  const breakdown = reservation.breakdown as Record<string, unknown> | null;
  const isTestReservation =
    reservation.notes?.includes("[TESTE_GRATIS]") || breakdown?.testReservation === true || breakdown?.voucherCode === "GRATIS";

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Reserva</p>
            <h1 className="text-2xl font-black text-slate-900">{reservation.code}</h1>
            {isTestReservation ? (
              <p className="mt-2 inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-amber-900">
                Reserva de teste (voucher GRÁTIS)
              </p>
            ) : null}
            <p className="mt-2 text-sm text-slate-600">
              Canal: <span className="font-semibold">{reservation.channel}</span>
              {reservation.externalId ? (
                <>
                  {" "}
                  · External ID: <span className="font-mono font-semibold">{reservation.externalId}</span>
                </>
              ) : null}
            </p>
          </div>
          <div className="text-right text-sm">
            <p className="font-semibold text-slate-900">{formatCurrencyBRL(Number(reservation.amountTotal))}</p>
            <p className="mt-1 text-xs text-slate-600">{reservation.nights} noite(s)</p>
          </div>
        </div>

        <div className="mt-5">
          <AdminReservationActions reservationId={reservation.id} reservationStatus={reservation.status} paymentStatus={latestPayment?.status ?? null} />
          <p className="mt-2 text-xs text-slate-600">
            “Confirmar” só habilita quando o pagamento estiver aprovado, mantendo coerência entre financeiro e ocupação.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">Hóspede</h2>
          <div className="mt-3 space-y-2 text-sm text-slate-700">
            <p>
              <span className="font-semibold text-slate-900">Nome:</span> {reservation.customer.name}
            </p>
            <p>
              <span className="font-semibold text-slate-900">E-mail:</span> {reservation.customer.email}
            </p>
            <p>
              <span className="font-semibold text-slate-900">Telefone:</span> {reservation.customer.phone}
            </p>
            {reservation.customer.cpf ? (
              <p>
                <span className="font-semibold text-slate-900">CPF:</span> {reservation.customer.cpf}
              </p>
            ) : null}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">Estadia</h2>
          <div className="mt-3 space-y-2 text-sm text-slate-700">
            <p>
              <span className="font-semibold text-slate-900">Quarto:</span> {reservation.room.name}
            </p>
            <p>
              <span className="font-semibold text-slate-900">Check-in:</span> {reservation.checkinAt.toLocaleString("pt-BR")}
            </p>
            <p>
              <span className="font-semibold text-slate-900">Check-out:</span> {reservation.checkoutAt.toLocaleString("pt-BR")}
            </p>
            <p>
              <span className="font-semibold text-slate-900">Hóspedes:</span> {reservation.adults} adultos · {reservation.childrenFree} crianças 0-6 ·{" "}
              {reservation.childrenHalf} crianças 7-12
            </p>
            {reservation.arrivalTime ? (
              <p>
                <span className="font-semibold text-slate-900">Chegada prevista:</span> {reservation.arrivalTime}
              </p>
            ) : null}
            {reservation.notes ? (
              <p>
                <span className="font-semibold text-slate-900">Observações:</span> {reservation.notes}
              </p>
            ) : null}
            {isHouseCategory(reservation.room.category) ? (
              <p className="rounded-lg border border-amber-200 bg-amber-50 px-2 py-1 text-xs text-amber-900">
                Regra da casa: mínimo de {HOUSE_MIN_GUESTS} pessoas, mínimo de {HOUSE_MIN_NIGHTS} diárias, R$ {HOUSE_PRICE_PER_PERSON}/pessoa/noite.
              </p>
            ) : null}
          </div>
        </section>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">Pagamentos</h2>
        <div className="mt-3 space-y-2 text-sm">
          {reservation.payments.length ? (
            reservation.payments.map((payment) => (
              <div key={payment.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-slate-50 px-3 py-2">
                <div>
                  <p className="font-semibold text-slate-900">
                    {payment.provider} · {isTestReservation ? "WAIVED_TEST" : payment.status}
                  </p>
                  <p className="text-xs text-slate-600">
                    Pref: <span className="font-mono">{payment.mpPreferenceId ?? "—"}</span> · Pay:{" "}
                    <span className="font-mono">{payment.mpPaymentId ?? "—"}</span>
                  </p>
                </div>
                <p className="font-extrabold text-slate-900">{formatCurrencyBRL(Number(payment.amount))}</p>
              </div>
            ))
          ) : (
            <p className="text-slate-600">Nenhum pagamento registrado.</p>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">Hóspedes cadastrados na reserva</h2>
        <div className="mt-3 space-y-2 text-sm text-slate-700">
          {reservation.guests.length ? (
            reservation.guests.map((guest) => (
              <div key={guest.id} className="rounded-xl bg-slate-50 px-3 py-2">
                <p className="font-semibold text-slate-900">{guest.name}</p>
                <p className="text-xs text-slate-600">
                  {guest.email ?? "—"} · {guest.phone ?? "—"}
                </p>
              </div>
            ))
          ) : (
            <p className="text-slate-600">Sem registros adicionais além do hóspede principal.</p>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">Breakdown (JSON)</h2>
        <pre className="mt-3 overflow-x-auto rounded-xl bg-slate-950 p-4 text-xs text-slate-100">{JSON.stringify(reservation.breakdown, null, 2)}</pre>
      </section>
    </div>
  );
}
