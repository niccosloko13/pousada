import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCurrencyBRL } from "@/lib/reservation";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function pick(value: string | string[] | undefined, fallback: string) {
  const v = Array.isArray(value) ? value[0] : value;
  return v ?? fallback;
}

export default async function AdminReservasPage({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {};
  const filter = pick(params.status, "all");

  const reservations = await prisma.reservation.findMany({
    where:
      filter === "all"
        ? undefined
        : filter === "pending"
          ? { status: "PENDING_PAYMENT" }
          : filter === "confirmed"
            ? { status: { in: ["CONFIRMED", "CHECKED_IN", "CHECKED_OUT"] } }
            : filter === "cancelled"
              ? { status: { in: ["CANCELLED", "EXPIRED"] } }
              : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      customer: true,
      room: true,
      payments: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    take: 100,
  });

  const chips = [
    { key: "all", label: "Todos" },
    { key: "pending", label: "Pendentes" },
    { key: "confirmed", label: "Confirmadas" },
    { key: "cancelled", label: "Canceladas/expiradas" },
  ] as const;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">Reservas</h1>

      <div className="flex flex-wrap gap-2 text-xs">
        {chips.map((chip) => {
          const active = filter === chip.key;
          return (
            <Link
              key={chip.key}
              href={chip.key === "all" ? "/admin/reservas" : `/admin/reservas?status=${chip.key}`}
              className={`rounded-full border px-3 py-1 font-semibold transition ${
                active ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              {chip.label}
            </Link>
          );
        })}
      </div>

      <div className="space-y-3">
        {reservations.map((reservation) => {
          const payment = reservation.payments[0] ?? null;
          const breakdown = reservation.breakdown as Record<string, unknown> | null;
          const isTestReservation =
            reservation.notes?.includes("[TESTE_GRATIS]") || breakdown?.testReservation === true || breakdown?.voucherCode === "GRATIS";
          return (
            <article key={reservation.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-extrabold text-slate-900">{reservation.code}</p>
                    {isTestReservation ? (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-900">
                        teste
                      </span>
                    ) : null}
                  </div>
                  <p className="text-sm text-slate-600">{reservation.customer.name}</p>
                  <p className="mt-1 text-xs text-slate-600">
                    {reservation.room.name} · {formatCurrencyBRL(Number(reservation.amountTotal))}
                  </p>
                </div>
                <div className="text-sm text-slate-700">
                  <p>
                    Status reserva: <span className="font-semibold">{reservation.status}</span>
                  </p>
                  <p>
                    Status pagamento: <span className="font-semibold">{isTestReservation ? "WAIVED_TEST" : payment?.status ?? "—"}</span>
                  </p>
                  <p className="mt-1 text-xs text-slate-600">
                    Canal: <span className="font-semibold">{reservation.channel}</span>
                  </p>
                </div>
                <Link href={`/admin/reservas/${reservation.id}`} className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold text-white">
                  Ver detalhes
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
