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

function StepPill({ label, active, done }: { label: string; active: boolean; done: boolean }) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <span
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-extrabold ${
          active ? "bg-cyan-700 text-white" : done ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-700"
        }`}
      >
        {done ? "✓" : ""}
      </span>
      <span className={`min-w-0 truncate text-xs font-semibold ${active ? "text-slate-900" : "text-slate-600"}`}>{label}</span>
    </div>
  );
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
    const subtotal = props.breakdown.total;
    const discount = normalizedApplied === "GRATIS" ? subtotal : 0;
    const total = Math.max(0, subtotal - discount);
    const isFreeTest = normalizedApplied === "GRATIS";
    const perNightLine = props.breakdown.pricingModel === "por_pessoa" ? "Tarifa por pessoa (média do grupo)" : "Diária base (casal)";
    return { perNightLine, subtotal, discount, total, isFreeTest };
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
        } else if (json.error === "INVALID_DATE_RANGE") {
          setError("Período inválido: o check-out precisa ser depois do check-in.");
        } else if (json.error === "ROOM_CAPACITY_EXCEEDED") {
          setError("A quantidade de hóspedes excede a capacidade do quarto selecionado.");
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
    <div className="mt-6 lg:grid lg:grid-cols-[1.55fr_0.95fr] lg:items-start lg:gap-8">
      <div className="space-y-6">
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Fluxo guiado</p>
              <h2 className="mt-1 text-xl font-extrabold text-slate-900">Checkout premium</h2>
              <p className="mt-1 text-sm text-slate-600">
                Transparência total do valor, etapas claras e pagamento seguro via Mercado Pago.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] font-semibold text-slate-700">
              {props.mercadoPagoPublicKey ? "Sandbox ativo" : "Configure MERCADOPAGO_ACCESS_TOKEN para pagamento real"}
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-slate-200/90 bg-slate-50/80 p-4">
            <LegalEntityMini tone="light" />
            <TrustSealBand tone="light" align="start" className="mt-3" showLegalLine={false} />
          </div>

          <div className="mt-6 grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-5 md:items-center">
            <div className="md:col-span-1">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Busca</p>
              <p className="mt-1 text-sm font-bold text-slate-900">Datas e hóspedes</p>
            </div>
            <div className="hidden h-px w-full bg-slate-200 md:block md:h-8 md:w-px md:justify-self-center" />
            <div className="md:col-span-1">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Acomodação</p>
              <p className="mt-1 text-sm font-bold text-slate-900">{props.roomName}</p>
            </div>
            <div className="hidden h-px w-full bg-slate-200 md:block md:h-8 md:w-px md:justify-self-center" />
            <div className="md:col-span-2">
              <div className="grid grid-cols-2 gap-3">
                <StepPill label="Dados" active={step === "dados"} done={step === "pagamento"} />
                <StepPill label="Pagamento" active={step === "pagamento"} done={false} />
              </div>
            </div>
          </div>

          {step === "dados" ? (
            <div className="mt-7">
              <h3 className="text-lg font-bold text-slate-900">Dados do hóspede principal</h3>
              <p className="mt-1 text-sm text-slate-600">Usamos essas informações para confirmar sua reserva e enviar o comprovante.</p>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <label className="space-y-1 text-sm font-medium text-slate-700">
                  <span>Nome completo</span>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-11 w-full rounded-xl border border-slate-300 px-3 outline-none ring-cyan-500 focus:ring-2"
                    placeholder="Seu nome completo"
                    autoComplete="name"
                  />
                </label>
                <label className="space-y-1 text-sm font-medium text-slate-700">
                  <span>E-mail</span>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    className="h-11 w-full rounded-xl border border-slate-300 px-3 outline-none ring-cyan-500 focus:ring-2"
                    placeholder="voce@email.com"
                    autoComplete="email"
                  />
                </label>
                <label className="space-y-1 text-sm font-medium text-slate-700">
                  <span>Telefone (WhatsApp)</span>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="h-11 w-full rounded-xl border border-slate-300 px-3 outline-none ring-cyan-500 focus:ring-2"
                    placeholder="(11) 99999-9999"
                    autoComplete="tel"
                  />
                </label>
                <label className="space-y-1 text-sm font-medium text-slate-700">
                  <span>CPF (opcional)</span>
                  <input
                    value={cpf}
                    onChange={(e) => setCpf(e.target.value)}
                    className="h-11 w-full rounded-xl border border-slate-300 px-3 outline-none ring-cyan-500 focus:ring-2"
                    placeholder="000.000.000-00"
                  />
                </label>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <label className="space-y-1 text-sm font-medium text-slate-700">
                  <span>Horário previsto de chegada</span>
                  <input
                    value={arrivalTime}
                    onChange={(e) => setArrivalTime(e.target.value)}
                    type="time"
                    className="h-11 w-full rounded-xl border border-slate-300 px-3 outline-none ring-cyan-500 focus:ring-2"
                  />
                </label>
                <label className="space-y-1 text-sm font-medium text-slate-700">
                  <span>Observações</span>
                  <input
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="h-11 w-full rounded-xl border border-slate-300 px-3 outline-none ring-cyan-500 focus:ring-2"
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

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Link
                  href={`/reserva?destino=${encodeURIComponent(props.destino)}&checkin=${encodeURIComponent(props.checkin)}&checkout=${encodeURIComponent(
                    props.checkout,
                  )}&adultos=${props.adults}&criancasFree=${props.childrenFree}&criancasHalf=${props.childrenHalf}&quartos=${encodeURIComponent(props.quartos)}&quarto=${encodeURIComponent(props.roomSlug)}&roomId=${encodeURIComponent(props.roomId)}`}
                  className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-4 text-sm font-bold text-slate-800 hover:bg-slate-50"
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
                  className="inline-flex h-12 items-center justify-center rounded-xl bg-slate-900 px-5 text-sm font-extrabold text-white shadow-lg shadow-slate-900/20 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Continuar para pagamento
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-7">
              <h3 className="text-lg font-bold text-slate-900">Pagamento seguro</h3>
              <p className="mt-1 text-sm text-slate-600">
                {pricing.isFreeTest
                  ? "Voucher GRÁTIS ativo: esta reserva de teste será confirmada sem redirecionamento para pagamento externo."
                  : "Você será redirecionado ao Mercado Pago para pagar com Pix ou cartão. Após a aprovação, sua reserva é confirmada automaticamente."}
              </p>

              <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
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
                    className="h-11 flex-1 rounded-xl border border-slate-300 px-3 text-sm outline-none ring-cyan-500 focus:ring-2"
                  />
                  <button
                    type="button"
                    onClick={applyVoucher}
                    className="inline-flex h-11 items-center justify-center rounded-xl bg-slate-900 px-4 text-sm font-bold text-white hover:bg-slate-800"
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
                  Pagamento processado pelo Mercado Pago. Você está reservando diretamente com a pousada — dados da empresa acima para sua segurança.
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
                  className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-4 text-sm font-bold text-slate-800 hover:bg-slate-50"
                >
                  Revisar dados
                </button>

                <div className="flex min-w-0 flex-1 flex-col items-stretch gap-2 sm:max-w-md sm:items-end">
                  <TrustSealBand tone="light" align="end" showLegalLine={false} />
                  <button
                    type="button"
                    disabled={loading}
                    onClick={startPayment}
                    className="inline-flex h-12 min-w-[240px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-700 to-cyan-600 px-6 text-sm font-extrabold text-white shadow-lg shadow-cyan-900/25 transition hover:from-cyan-600 hover:to-cyan-500 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wallet className="h-4 w-4" />}
                    {pricing.isFreeTest ? "Confirmar reserva de teste" : "Pagar com Mercado Pago"}
                  </button>
                </div>
              </div>

              <p className="mt-3 text-xs text-slate-600">
                {pricing.isFreeTest
                  ? "Fluxo de teste: o voucher GRÁTIS confirma a reserva sem pagamento externo."
                  : "Ao continuar, você concorda em seguir para o checkout externo do Mercado Pago. Em ambiente sandbox, use contas de teste do Mercado Pago."}
              </p>
            </div>
          )}
        </section>
      </div>

      <aside className="mt-8 space-y-4 lg:sticky lg:top-24 lg:mt-0">
        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <Image src="/logopousada.jpeg" alt="Logo da Pousada em Pedrinhas" width={64} height={64} className="h-14 w-14 rounded-full border-2 border-amber-300 object-cover" />
            <div>
              <p className="font-bold text-slate-900">{props.pousadaNome}</p>
              <p className="text-xs text-slate-600">{props.destino}</p>
            </div>
          </div>

          <div className="mt-4">
            <LegalEntityMini tone="light" />
            <TrustSealBand tone="light" align="start" className="mt-3" showLegalLine={false} />
          </div>

          <div className="mt-4 space-y-2 text-sm">
            <p className="font-semibold text-slate-900">{props.roomName}</p>
            <p className="text-slate-600">{props.bedSummary}</p>
            <p className="text-slate-600">{props.pricingModelLabel}</p>
            <p className="text-slate-600">
              {props.checkin} → {props.checkout}
            </p>
            <p className="text-slate-600">
              {props.adults} adultos · {props.childrenFree} crianças 0-6 · {props.childrenHalf} crianças 7-12 · {props.quartos} quarto(s)
            </p>
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
              <span className="text-slate-600">Subtotal</span>
              <span className="font-semibold text-slate-900">{formatCurrencyBRL(pricing.subtotal)}</span>
            </div>
            {pricing.discount > 0 ? (
              <div className="mt-2 flex items-center justify-between">
                <span className="font-semibold text-emerald-700">Desconto voucher GRÁTIS</span>
                <span className="font-extrabold text-emerald-700">- {formatCurrencyBRL(pricing.discount)}</span>
              </div>
            ) : null}
            <div className="mt-2 flex items-center justify-between border-t border-slate-200 pt-3">
              <span className="font-bold text-slate-900">Total final</span>
              <span className={`text-lg font-extrabold ${pricing.total === 0 ? "text-emerald-700" : "text-slate-900"}`}>{formatCurrencyBRL(pricing.total)}</span>
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
              <p className="mt-2 text-xs font-semibold text-slate-700">Casa para aluguel: café da manhã não incluso (modelo por pessoa)</p>
            )}

            <p className="mt-2 text-xs text-slate-600">
              Regras de crianças: 0-6 não paga, 7-12 paga meia, 13+ conta como adulto na tarifa. Valores calculados com base nas regras atuais da pousada.
            </p>
          </div>
        </article>

        <article className="rounded-3xl border border-cyan-200 bg-cyan-50 p-5">
          <p className="font-semibold text-slate-900">Por que reservar aqui</p>
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
