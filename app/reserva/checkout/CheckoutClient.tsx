"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { CheckCircle2, Coffee, Loader2, Lock, ShieldCheck, Ticket, Timer, Wallet, XCircle } from "lucide-react";
import type { StayBreakdown } from "@/lib/reservations/pricing";
import { formatCurrencyBRL } from "@/lib/reservation";
import { LegalEntityMini, TrustSealBand } from "@/components/trust/TrustSealBand";

type CheckoutClientProps = {
  destino: string;
  checkin: string;
  checkout: string;
  adults: number;
  childrenFree: number;
  childrenHalf: number;
  quartos: string;
  roomSlug: string;
  roomId: string;
  roomName: string;
  bedSummary: string;
  breakfastIncluded: boolean;
  pricingModelLabel: string;
  breakdown: StayBreakdown;
  pousadaNome: string;
  mercadoPagoPublicKey?: string;
};

type StepKey = "dados" | "pagamento";

function normalizeVoucher(input: string) {
  return input
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toUpperCase()
    .trim();
}

export function CheckoutClient(props: CheckoutClientProps) {
  const [step, setStep] = useState<StepKey>("dados");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [cpf, setCpf] = useState("");
  const [arrivalTime, setArrivalTime] = useState("");
  const [notes, setNotes] = useState("");
  const [acceptPolicies, setAcceptPolicies] = useState(false);
  const [whatsappOptIn, setWhatsappOptIn] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [voucherInput, setVoucherInput] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState<string | null>(null);
  const [voucherFeedback, setVoucherFeedback] = useState<{ kind: "ok" | "error"; message: string } | null>(null);

  const pricing = useMemo(() => {
    const normalizedApplied = appliedVoucher ? normalizeVoucher(appliedVoucher) : "";
    const totalHospedagem = props.breakdown.total;
    const discount = normalizedApplied === "GRATIS" ? totalHospedagem : 0;
    const total = Math.max(0, totalHospedagem - discount);
    const signalDueNow = Number((total * 0.5).toFixed(2));
    const remainingAtCheckin = Number((total - signalDueNow).toFixed(2));
    const isFreeTest = normalizedApplied === "GRATIS";
    const perNightLine = props.breakdown.pricingModel === "por_pessoa" ? "Tarifa por pessoa (média do grupo)" : "Diária base (casal)";
    return { perNightLine, totalHospedagem, discount, total, signalDueNow, remainingAtCheckin, isFreeTest };
  }, [appliedVoucher, props.breakdown.pricingModel, props.breakdown.total]);

  function applyVoucher() {
    const normalized = normalizeVoucher(voucherInput);
    if (!normalized) {
      setAppliedVoucher(null);
      setVoucherFeedback(null);
      return;
    }

    if (normalized === "GRATIS") {
      setAppliedVoucher(voucherInput);
      setVoucherFeedback({ kind: "ok", message: "Voucher GRÁTIS aplicado. Total zerado para teste de fluxo." });
      return;
    }

    setAppliedVoucher(null);
    setVoucherFeedback({ kind: "error", message: "Voucher inválido para este ambiente." });
  }

  async function startPayment() {
    setError(null);
    setLoading(true);
    try {
      const response = await fetch("/api/reservations/hold", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          roomSlug: props.roomSlug,
          checkin: props.checkin,
          checkout: props.checkout,
          adults: props.adults,
          childrenFree: props.childrenFree,
          childrenHalf: props.childrenHalf,
          guest: {
            name,
            email,
            phone,
            cpf: cpf.trim() ? cpf.trim() : undefined,
          },
          arrivalTime: arrivalTime || undefined,
          notes: notes ? `${notes}${whatsappOptIn ? " | Quero atualizações por WhatsApp." : ""}` : whatsappOptIn ? "Quero atualizações por WhatsApp." : undefined,
          voucherCode: appliedVoucher ?? undefined,
        }),
      });

      const json = (await response.json()) as {
        ok?: boolean;
        checkoutUrl?: string;
        completionUrl?: string;
        mode?: string;
        error?: string;
      };

      if (!response.ok || !json.ok || (!json.checkoutUrl && !json.completionUrl)) {
        if (json.error === "ROOM_NOT_AVAILABLE") {
          setError("Este quarto acabou de ser reservado para essas datas. Volte e escolha outra acomodação.");
        } else if (json.error === "ROOM_INACTIVE") {
          setError("Esta acomodação não está mais disponível para novas reservas.");
        } else if (json.error === "INVALID_DATE_RANGE") {
          setError("Período inválido: o check-out precisa ser depois do check-in.");
        } else if (json.error === "ROOM_CAPACITY_EXCEEDED") {
          setError("A quantidade de hóspedes excede a capacidade do quarto selecionado.");
        } else if (json.error === "HOUSE_MIN_GUESTS") {
          setError("A casa exige mínimo de 10 pessoas.");
        } else if (json.error === "HOUSE_MIN_NIGHTS") {
          setError("A casa exige estadia mínima de 2 diárias.");
        } else if (json.error === "MP_NOT_CONFIGURED") {
          setError("Mercado Pago não está configurado neste ambiente. Para testar fluxo completo, aplique o voucher GRÁTIS.");
        } else {
          setError("Não foi possível iniciar o pagamento. Tente novamente em instantes.");
        }
        setLoading(false);
        return;
      }

      if (json.completionUrl) {
        window.location.href = json.completionUrl;
        return;
      }
      if (json.checkoutUrl) {
        window.location.href = json.checkoutUrl;
        return;
      }
    } catch {
      setError("Falha de conexão. Verifique sua internet e tente novamente.");
      setLoading(false);
    }
  }

  return (
    <div className="mt-6 lg:grid lg:grid-cols-[1.58fr_0.92fr] lg:items-start lg:gap-8">
      <div className="space-y-6">
        <section className="overflow-hidden rounded-[2rem] border border-slate-200/80 bg-gradient-to-b from-white to-slate-50/50 shadow-[0_28px_80px_rgba(15,23,42,0.12)]">
          <div className="border-b border-slate-200/80 bg-slate-900 px-5 py-5 text-white md:px-7">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-200">Checkout exclusivo</p>
                <h2 className="mt-1 text-2xl font-black tracking-tight md:text-3xl">Finalize sua reserva com segurança</h2>
                <p className="mt-2 text-sm text-slate-200">Experiência premium com confirmação rápida e total transparência de valores.</p>
              </div>
              <div className="rounded-2xl border border-white/20 bg-white/10 px-3 py-2 text-[11px] font-semibold text-cyan-100 backdrop-blur">
                {props.mercadoPagoPublicKey ? "Ambiente de pagamento pronto" : "Configure MERCADOPAGO_ACCESS_TOKEN para pagamento real"}
              </div>
            </div>
          </div>

          <div className="px-5 pb-7 pt-6 md:px-7">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <LegalEntityMini tone="light" />
              <TrustSealBand tone="light" align="start" className="mt-3" showLegalLine={false} />
            </div>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="grid gap-3 md:grid-cols-[1fr_auto_1fr_auto_1.2fr] md:items-center">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Busca</p>
                  <p className="mt-1 text-sm font-bold text-slate-900">Datas e hóspedes</p>
                </div>
                <div className="hidden h-8 w-px bg-slate-200 md:block" />
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Acomodação</p>
                  <p className="mt-1 truncate text-sm font-bold text-slate-900">{props.roomName}</p>
                </div>
                <div className="hidden h-8 w-px bg-slate-200 md:block" />
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-black ${
                          step === "dados" ? "bg-cyan-700 text-white" : "bg-emerald-600 text-white"
                        }`}
                      >
                        {step === "pagamento" ? "✓" : "1"}
                      </span>
                      <span className={`text-xs font-semibold ${step === "dados" ? "text-slate-900" : "text-slate-600"}`}>Dados</span>
                    </div>
                    <div className="h-0.5 w-8 rounded-full bg-slate-300" />
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-black ${
                          step === "pagamento" ? "bg-cyan-700 text-white" : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        2
                      </span>
                      <span className={`text-xs font-semibold ${step === "pagamento" ? "text-slate-900" : "text-slate-600"}`}>Pagamento</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {step === "dados" ? (
              <div className="mt-7 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
                <h3 className="text-xl font-black tracking-tight text-slate-900">Dados do hóspede principal</h3>
                <p className="mt-1 text-sm text-slate-600">Preenchimento rápido para confirmação da reserva e envio de comprovante.</p>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <label className="space-y-1.5 text-sm font-semibold text-slate-700">
                    <span>Nome completo</span>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="h-12 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none ring-cyan-500/40 transition focus:border-cyan-600 focus:ring-4"
                      placeholder="Seu nome completo"
                      autoComplete="name"
                    />
                  </label>
                  <label className="space-y-1.5 text-sm font-semibold text-slate-700">
                    <span>E-mail</span>
                    <input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      type="email"
                      className="h-12 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none ring-cyan-500/40 transition focus:border-cyan-600 focus:ring-4"
                      placeholder="voce@email.com"
                      autoComplete="email"
                    />
                  </label>
                  <label className="space-y-1.5 text-sm font-semibold text-slate-700">
                    <span>Telefone (WhatsApp)</span>
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="h-12 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none ring-cyan-500/40 transition focus:border-cyan-600 focus:ring-4"
                      placeholder="(11) 99999-9999"
                      autoComplete="tel"
                    />
                  </label>
                  <label className="space-y-1.5 text-sm font-semibold text-slate-700">
                    <span>CPF (opcional)</span>
                    <input
                      value={cpf}
                      onChange={(e) => setCpf(e.target.value)}
                      className="h-12 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none ring-cyan-500/40 transition focus:border-cyan-600 focus:ring-4"
                      placeholder="000.000.000-00"
                    />
                  </label>
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <label className="space-y-1.5 text-sm font-semibold text-slate-700">
                    <span>Horário previsto de chegada</span>
                    <input
                      value={arrivalTime}
                      onChange={(e) => setArrivalTime(e.target.value)}
                      type="time"
                      className="h-12 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none ring-cyan-500/40 transition focus:border-cyan-600 focus:ring-4"
                    />
                  </label>
                  <label className="space-y-1.5 text-sm font-semibold text-slate-700">
                    <span>Observações</span>
                    <input
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="h-12 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none ring-cyan-500/40 transition focus:border-cyan-600 focus:ring-4"
                      placeholder="Berço, andar preferido, etc."
                    />
                  </label>
                </div>

                <label className="mt-4 flex items-start gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                  <input checked={acceptPolicies} onChange={(e) => setAcceptPolicies(e.target.checked)} type="checkbox" className="mt-0.5" required />
                  <span>Li e aceito as políticas da reserva, horários de check-in/check-out e condições gerais da pousada.</span>
                </label>

                <label className="mt-3 flex items-start gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                  <input checked={whatsappOptIn} onChange={(e) => setWhatsappOptIn(e.target.checked)} type="checkbox" className="mt-0.5" />
                  <span>Quero receber confirmação e atualizações da reserva por WhatsApp.</span>
                </label>

                <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <Link
                    href={`/reserva?destino=${encodeURIComponent(props.destino)}&checkin=${encodeURIComponent(props.checkin)}&checkout=${encodeURIComponent(
                      props.checkout,
                    )}&adultos=${props.adults}&criancasFree=${props.childrenFree}&criancasHalf=${props.childrenHalf}&quartos=${encodeURIComponent(props.quartos)}&quarto=${encodeURIComponent(props.roomSlug)}&roomId=${encodeURIComponent(props.roomId)}`}
                    className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-4 text-sm font-bold text-slate-800 transition hover:bg-slate-50"
                  >
                    Voltar para acomodações
                  </Link>

                  <button
                    type="button"
                    disabled={!acceptPolicies || !name.trim() || !email.trim() || !phone.trim()}
                    onClick={() => {
                      setStep("pagamento");
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="inline-flex h-12 items-center justify-center rounded-xl bg-gradient-to-r from-slate-900 to-slate-800 px-6 text-sm font-black text-white shadow-[0_16px_35px_rgba(15,23,42,0.30)] transition hover:from-slate-800 hover:to-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Continuar para pagamento
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-7 space-y-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
                  <h3 className="text-xl font-black tracking-tight text-slate-900">Pagamento seguro</h3>
                  <p className="mt-1 text-sm text-slate-600">
                    {pricing.isFreeTest
                      ? "Voucher GRÁTIS ativo: esta reserva de teste será confirmada sem redirecionamento para pagamento externo."
                    : "Você verá o valor total da hospedagem, mas paga apenas 50% agora como sinal de pré-reserva. O restante é pago no check-in."}
                  </p>

                  <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                    <p className="inline-flex items-center gap-2 text-sm font-bold text-slate-900">
                      <Ticket className="h-4 w-4 text-cyan-700" />
                      Voucher/Cupom
                    </p>
                    <p className="mt-1 text-xs text-slate-600">Para teste de fluxo neste ambiente, use o código: GRÁTIS</p>
                    <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                      <input
                        value={voucherInput}
                        onChange={(event) => setVoucherInput(event.target.value)}
                        placeholder="Digite seu voucher"
                        className="h-11 flex-1 rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none ring-cyan-500/40 transition focus:border-cyan-600 focus:ring-4"
                      />
                      <button
                        type="button"
                        onClick={applyVoucher}
                        className="inline-flex h-11 items-center justify-center rounded-xl bg-slate-900 px-4 text-sm font-bold text-white transition hover:bg-slate-800"
                      >
                        Aplicar voucher
                      </button>
                    </div>
                    {voucherFeedback ? (
                      <p
                        className={`mt-3 inline-flex items-center gap-1 text-xs font-semibold ${
                          voucherFeedback.kind === "ok" ? "text-emerald-700" : "text-rose-700"
                        }`}
                      >
                        {voucherFeedback.kind === "ok" ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : (
                          <XCircle className="h-4 w-4" />
                        )}
                        {voucherFeedback.message}
                      </p>
                    ) : null}
                  </div>

                  <div className="mt-4 rounded-2xl border border-slate-200 bg-white px-4 py-3">
                    <LegalEntityMini tone="light" />
                    <p className="mt-2 text-xs text-slate-600">
                      Pré-reserva mediante pagamento de 50% do valor total. Os 50% restantes são pagos no check-in.
                    </p>
                  </div>

                  <div className="mt-5 grid gap-3 rounded-2xl border border-cyan-200 bg-cyan-50 p-4 md:grid-cols-3">
                    <div className="flex items-start gap-2">
                      <Lock className="mt-0.5 h-4 w-4 text-cyan-800" />
                      <div>
                        <p className="text-sm font-bold text-slate-900">Ambiente cifrado</p>
                        <p className="mt-1 text-xs text-slate-700">Processamento pelo Mercado Pago, com antifraude e suporte a Pix.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Timer className="mt-0.5 h-4 w-4 text-cyan-800" />
                      <div>
                        <p className="text-sm font-bold text-slate-900">Pré-reserva com tempo</p>
                        <p className="mt-1 text-xs text-slate-700">Enquanto você paga, o quarto fica reservado para evitar overbooking.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <ShieldCheck className="mt-0.5 h-4 w-4 text-cyan-800" />
                      <div>
                        <p className="text-sm font-bold text-slate-900">Reserva direta</p>
                        <p className="mt-1 text-xs text-slate-700">Sem taxas escondidas: o total abaixo é o valor da estadia calculado aqui.</p>
                      </div>
                    </div>
                  </div>

                  {error ? <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-900">{error}</p> : null}

                  <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <button
                      type="button"
                      onClick={() => setStep("dados")}
                      className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-4 text-sm font-bold text-slate-800 transition hover:bg-slate-50"
                    >
                      Revisar dados
                    </button>

                    <div className="flex min-w-0 flex-1 flex-col items-stretch gap-2 sm:max-w-md sm:items-end">
                      <TrustSealBand tone="light" align="end" showLegalLine={false} />
                      <button
                        type="button"
                        disabled={loading}
                        onClick={startPayment}
                        className="inline-flex h-12 min-w-[260px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-700 via-cyan-600 to-emerald-600 px-6 text-sm font-black text-white shadow-[0_18px_40px_rgba(8,145,178,0.35)] transition hover:from-cyan-600 hover:via-cyan-500 hover:to-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wallet className="h-4 w-4" />}
                        {pricing.isFreeTest ? "Confirmar reserva de teste" : "Pagar sinal de pré-reserva (50%)"}
                      </button>
                    </div>
                  </div>

                  <p className="mt-3 text-xs text-slate-600">
                    {pricing.isFreeTest
                      ? "Fluxo de teste: o voucher GRÁTIS confirma a reserva sem pagamento externo."
                    : "Você pagará agora apenas o sinal de 50% no checkout externo do Mercado Pago. O saldo de 50% é pago no check-in."}
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>

      <aside className="mt-8 space-y-4 lg:sticky lg:top-24 lg:mt-0">
        <article className="overflow-hidden rounded-[1.75rem] border border-slate-200/90 bg-white shadow-[0_22px_70px_rgba(15,23,42,0.14)]">
          <div className="bg-gradient-to-r from-slate-900 to-cyan-900 px-5 py-4 text-white">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-200">Resumo da reserva</p>
            <p className="mt-1 text-lg font-black tracking-tight">Total transparente antes do pagamento</p>
          </div>

          <div className="p-5">
            <div className="flex items-center gap-3">
              <Image src="/logopousada.jpeg" alt="Logo da Pousada em Pedrinhas" width={64} height={64} className="h-14 w-14 rounded-full border-2 border-amber-300 object-cover" />
              <div>
                <p className="font-black text-slate-900">{props.pousadaNome}</p>
                <p className="text-xs font-medium text-slate-600">{props.destino}</p>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-sm font-bold text-slate-900">{props.roomName}</p>
              <p className="mt-1 text-xs text-slate-600">{props.bedSummary}</p>
              <p className="mt-1 text-xs text-slate-600">{props.pricingModelLabel}</p>
              <p className="mt-2 text-xs font-medium text-slate-700">
                {props.checkin} → {props.checkout}
              </p>
              <p className="text-xs text-slate-600">
                {props.adults} adultos · {props.childrenFree} crianças 0-6 · {props.childrenHalf} crianças 7-12 · {props.quartos} quarto(s)
              </p>
            </div>

            <div className="mt-4">
              <LegalEntityMini tone="light" />
              <TrustSealBand tone="light" align="start" className="mt-3" showLegalLine={false} />
            </div>

            <div className="mt-4 border-t border-slate-200 pt-4 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-600">
                  {pricing.perNightLine} ({props.breakdown.nights} noite(s))
                </span>
                <span className="font-semibold text-slate-900">{formatCurrencyBRL(props.breakdown.baseUnitAmount)}</span>
              </div>

              <div className="mt-3 space-y-2 rounded-2xl bg-slate-50 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Adultos</span>
                  <span className="font-semibold text-slate-900">{formatCurrencyBRL(props.breakdown.adultsTotal)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Crianças 7-12 (meia)</span>
                  <span className="font-semibold text-slate-900">{formatCurrencyBRL(props.breakdown.childrenHalfTotal)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Crianças 0-6</span>
                  <span className="font-semibold text-emerald-700">Não paga</span>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-3">
                <span className="text-slate-600">Valor total da hospedagem</span>
                <span className="font-semibold text-slate-900">{formatCurrencyBRL(pricing.totalHospedagem)}</span>
              </div>

              {pricing.discount > 0 ? (
                <div className="mt-2 flex items-center justify-between">
                  <span className="font-semibold text-emerald-700">Desconto voucher GRÁTIS</span>
                  <span className="font-extrabold text-emerald-700">- {formatCurrencyBRL(pricing.discount)}</span>
                </div>
              ) : null}

              <div className="mt-3 rounded-2xl border border-cyan-200 bg-cyan-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-800">Sinal para pré-reserva (50%)</p>
                <p className={`mt-1 text-3xl font-black tracking-tight ${pricing.signalDueNow === 0 ? "text-emerald-700" : "text-cyan-900"}`}>
                  {formatCurrencyBRL(pricing.signalDueNow)}
                </p>
                <p className="mt-1 text-xs text-cyan-900">Você paga apenas 50% agora para garantir sua pré-reserva.</p>
              </div>

              <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                <p className="text-xs text-slate-700">
                  <span className="font-semibold text-slate-900">Restante no check-in (50%):</span> {formatCurrencyBRL(pricing.remainingAtCheckin)}
                </p>
              </div>

              {pricing.total === 0 ? (
                <p className="mt-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800">
                  Reserva de teste com valor zerado. Ao confirmar, você será direcionado para a página de sucesso sem abrir o Mercado Pago.
                </p>
              ) : null}

              {props.breakfastIncluded ? (
                <p className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-cyan-800">
                  <Coffee className="h-4 w-4" />
                  Café da manhã incluso
                </p>
              ) : (
                <p className="mt-2 text-xs font-semibold text-slate-700">
                  Casa para grupos: R$ 100 por pessoa/noite, mínimo de 10 pessoas e 2 diárias (café da manhã não incluso)
                </p>
              )}

              <p className="mt-2 text-xs text-slate-600">
                Regras de crianças: 0-6 não paga, 7-12 paga meia, 13+ conta como adulto na tarifa. Valores calculados com base nas regras atuais da pousada.
              </p>
            </div>
          </div>
        </article>

        <article className="rounded-[1.75rem] border border-cyan-200 bg-gradient-to-br from-cyan-50 to-white p-5 shadow-sm">
          <p className="font-black text-slate-900">Por que reservar aqui</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-700">
            <li className="inline-flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-cyan-700" />
              Atendimento direto com a pousada
            </li>
            <li className="inline-flex items-center gap-2">
              <Wallet className="h-4 w-4 text-cyan-700" />
              Total transparente antes do pagamento
            </li>
            <li className="inline-flex items-center gap-2">
              <Timer className="h-4 w-4 text-cyan-700" />
              Confirmação automática após pagamento aprovado
            </li>
          </ul>
        </article>
      </aside>
    </div>
  );
}
