import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, Clock3, MessageCircle, ShieldCheck } from "lucide-react";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { SectionTitle } from "@/components/ui/SectionTitle";
import pousada from "@/data/pousada.json";
import { formatCurrencyBRL } from "@/lib/reservation";
import { prisma } from "@/lib/prisma";
import type { PousadaData } from "@/types/pousada";
import { LegalEntityMini } from "@/components/trust/TrustSealBand";
import { COMPANY_WHATSAPP_E164 } from "@/lib/company";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function pick(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0];
  return value;
}

function maskEmail(email: string) {
  const [name, domain] = email.split("@");
  if (!name || !domain) return "não informado";
  const visible = name.slice(0, 2);
  return `${visible}${"*".repeat(Math.max(2, name.length - 2))}@${domain}`;
}

function maskPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (!digits) return "não informado";
  if (digits.length <= 4) return `***${digits}`;
  return `*** *** ${digits.slice(-4)}`;
}

function formatDateTimeBR(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function paymentStatusLabel(status: string) {
  if (status === "APPROVED") return { label: "Aprovado", tone: "text-emerald-800" as const };
  if (status === "PROCESSING" || status === "PENDING") return { label: "Em processamento", tone: "text-amber-900" as const };
  if (status === "REJECTED") return { label: "Recusado", tone: "text-rose-900" as const };
  return { label: status, tone: "text-slate-800" as const };
}

function reservationStatusLabel(status: string) {
  if (status === "CONFIRMED") return { label: "Confirmada", tone: "text-emerald-900" as const };
  if (status === "PENDING_PAYMENT") return { label: "Aguardando pagamento", tone: "text-amber-950" as const };
  if (status === "EXPIRED") return { label: "Expirada", tone: "text-slate-800" as const };
  if (status === "CANCELLED") return { label: "Cancelada", tone: "text-rose-900" as const };
  if (status === "CHECKED_IN") return { label: "Check-in realizado", tone: "text-cyan-950" as const };
  if (status === "CHECKED_OUT") return { label: "Check-out realizado", tone: "text-slate-900" as const };
  return { label: status, tone: "text-slate-900" as const };
}

export default async function ReservaSucessoPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const code = pick(params.code);
  const mpStatus = pick(params.status);
  const token = pick(params.t);

  if (!code) notFound();

  const reservation = await prisma.reservation.findUnique({
    where: { code },
    include: {
      room: true,
      customer: true,
      payments: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  if (!reservation) notFound();
  const hasValidAccessToken = Boolean(token && reservation.publicAccessToken && token === reservation.publicAccessToken);

  const payment = reservation.payments[0] ?? null;
  const breakdown = reservation.breakdown as Record<string, unknown> | null;
  const isTestReservation =
    reservation.notes?.includes("[TESTE_GRATIS]") || breakdown?.testReservation === true || breakdown?.voucherCode === "GRATIS";
  const subtotal = typeof breakdown?.subtotal === "number" ? breakdown.subtotal : Number(reservation.amountTotal);
  const discount = typeof breakdown?.discount === "number" ? breakdown.discount : 0;
  const finalTotal = typeof breakdown?.total === "number" ? breakdown.total : Number(reservation.amountTotal);
  const paymentUi = payment ? paymentStatusLabel(payment.status) : { label: "Sem pagamento registrado", tone: "text-slate-800" as const };
  const reservationUi = reservationStatusLabel(reservation.status);

  const pousadaData = pousada as PousadaData;
  const whatsappDigits = (process.env.NEXT_PUBLIC_WHATSAPP_E164 ?? COMPANY_WHATSAPP_E164).replace(/\D/g, "");
  const whatsappHref = whatsappDigits
    ? `https://wa.me/${whatsappDigits}?text=${encodeURIComponent(
        `Olá! Concluí minha reserva ${reservation.code}. Podem me ajudar com check-in?`,
      )}`
    : null;

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="mx-auto w-full max-w-5xl px-4 py-10 md:px-6 md:py-14">
        <SectionTitle
          eyebrow="Pós-reserva"
          title="Recebemos sua solicitação"
          subtitle="Abaixo está o resumo da estadia, o status da reserva e do pagamento — com orientações de check-in."
        />

        <section className="mt-6 grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Código da reserva</p>
                <p className="mt-1 text-3xl font-black tracking-tight text-slate-900">{reservation.code}</p>
                {isTestReservation ? (
                  <p className="mt-2 inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-900">
                    Reserva de teste (voucher GRÁTIS)
                  </p>
                ) : null}
                <p className="mt-2 text-sm text-slate-600">
                  Guarde este código. Ele é a referência oficial para suporte e check-in na pousada.
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Origem</p>
                <p className="mt-1 font-bold text-slate-900">Reserva direta (site)</p>
                <p className="mt-1 text-xs text-slate-600">Canal preparado para futuras integrações (Booking.com, etc.).</p>
              </div>
            </div>

            <div className="mt-6 grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Status da reserva</p>
                <p className={`mt-1 text-lg font-extrabold ${reservationUi.tone}`}>{reservationUi.label}</p>
                {reservation.expiresAt && reservation.status === "PENDING_PAYMENT" ? (
                  <p className="mt-2 inline-flex items-center gap-2 text-xs font-semibold text-amber-950">
                    <Clock3 className="h-4 w-4" />
                    Pré-reserva válida até {formatDateTimeBR(reservation.expiresAt)}
                  </p>
                ) : null}
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Status do pagamento</p>
                <p className={`mt-1 text-lg font-extrabold ${paymentUi.tone}`}>{paymentUi.label}</p>
                {mpStatus ? <p className="mt-2 text-xs text-slate-600">Retorno do checkout: {mpStatus}</p> : null}
              </div>
            </div>

            <div className="mt-6 space-y-2 text-sm text-slate-700">
              <p>
                <span className="font-semibold text-slate-900">Hóspede:</span> {reservation.customer.name}
              </p>
              <p>
                <span className="font-semibold text-slate-900">Contato:</span> {maskEmail(reservation.customer.email)} · {maskPhone(reservation.customer.phone)}
              </p>
              <p>
                <span className="font-semibold text-slate-900">Acomodação:</span> {reservation.room.name}
              </p>
              <p>
                <span className="font-semibold text-slate-900">Período:</span> {formatDateTimeBR(reservation.checkinAt)} → {formatDateTimeBR(reservation.checkoutAt)}
              </p>
              <p>
                <span className="font-semibold text-slate-900">Noites:</span> {reservation.nights}
              </p>
              <p>
                <span className="font-semibold text-slate-900">Hóspedes:</span> {reservation.adults} adultos · {reservation.childrenFree} crianças 0-6 ·{" "}
                {reservation.childrenHalf} crianças 7-12
              </p>
              <p>
                <span className="font-semibold text-slate-900">Subtotal:</span> {formatCurrencyBRL(subtotal)}
              </p>
              {discount > 0 ? (
                <p>
                  <span className="font-semibold text-slate-900">Desconto:</span> -{formatCurrencyBRL(discount)} (voucher GRÁTIS)
                </p>
              ) : null}
              <p>
                <span className="font-semibold text-slate-900">Total final:</span> {formatCurrencyBRL(finalTotal)}
              </p>
              {isTestReservation ? (
                <p>
                  <span className="font-semibold text-slate-900">Pagamento:</span> Isento para fluxo de teste (voucher GRÁTIS)
                </p>
              ) : null}
              {!hasValidAccessToken ? (
                <p className="rounded-lg border border-amber-200 bg-amber-50 px-2 py-1 text-xs text-amber-900">
                  Visualização parcial por segurança. Use o link completo da reserva para visualizar todos os detalhes.
                </p>
              ) : null}
            </div>

            <div className="mt-6 rounded-2xl border border-cyan-200 bg-cyan-50 p-4">
              <p className="inline-flex items-center gap-2 text-sm font-extrabold text-cyan-950">
                <ShieldCheck className="h-4 w-4" />
                Check-in e boas-vindas
              </p>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-800">
                <li>Horário padrão de check-in: a partir das 15h. Check-out até 11h.</li>
                <li>Traga um documento com foto do responsável pela reserva.</li>
                <li>Se o pagamento ainda estiver “em processamento” (Pix), aguarde a aprovação — você pode atualizar esta página.</li>
              </ul>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href={`/reserva/sucesso?code=${encodeURIComponent(reservation.code)}${hasValidAccessToken ? `&t=${encodeURIComponent(token ?? "")}` : ""}`}
                className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-4 text-sm font-bold text-slate-900 hover:bg-slate-50"
              >
                Atualizar status
              </Link>
              <Link href="/" className="inline-flex h-11 items-center justify-center rounded-xl bg-slate-900 px-4 text-sm font-extrabold text-white hover:bg-slate-800">
                Voltar para a home
              </Link>
            </div>
          </article>

          <aside className="space-y-4">
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-extrabold text-slate-900">Próximo passo</p>
              <p className="mt-2 text-sm text-slate-600">
                Se o pagamento foi aprovado, sua reserva deve aparecer como confirmada em alguns instantes (webhook do Mercado Pago).
              </p>
              <div className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-900">
                <CheckCircle2 className="h-4 w-4" />
                Experiência pensada para conversão com confiança
              </div>
            </article>

            <article className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5">
              <p className="text-sm font-extrabold text-emerald-950">Fale com a pousada no WhatsApp</p>
              <p className="mt-2 text-sm text-emerald-950">
                Envie seu código <span className="font-mono font-bold">{reservation.code}</span> para agilizar o atendimento.
              </p>
              {whatsappHref ? (
                <a
                  href={whatsappHref}
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 text-sm font-extrabold text-white shadow-lg shadow-emerald-900/20 transition hover:bg-emerald-600"
                >
                  <MessageCircle className="h-4 w-4" />
                  Abrir WhatsApp
                </a>
              ) : (
                <p className="mt-3 text-xs text-emerald-950">
                  Defina <span className="font-mono">NEXT_PUBLIC_WHATSAPP_E164</span> no <span className="font-mono">.env</span> para sobrescrever o padrão oficial.
                </p>
              )}
            </article>

            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-extrabold text-slate-900">{pousadaData.nome}</p>
              <p className="mt-2 text-sm text-slate-600">{pousadaData.endereco}</p>
              {pousadaData.link_google_maps ? (
                <a className="mt-3 inline-flex text-sm font-bold text-cyan-800 underline" href={pousadaData.link_google_maps}>
                  Abrir no Google Maps
                </a>
              ) : null}
            </article>
          </aside>
        </section>

        <section className="mx-auto mt-10 w-full max-w-5xl px-4 pb-4 md:px-6">
          <LegalEntityMini tone="light" />
        </section>
      </main>
      <Footer />
    </div>
  );
}
