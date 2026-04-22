import Image from "next/image";
import { Coffee, ShieldCheck, Timer, Wallet } from "lucide-react";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import pousada from "@/data/pousada.json";
import { calcularResumoReserva, formatCurrencyBRL } from "@/lib/reservation";
import { SectionTitle } from "@/components/ui/SectionTitle";
import type { PousadaData } from "@/types/pousada";

type CheckoutPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function getParam(value: string | string[] | undefined, fallback: string) {
  if (Array.isArray(value)) return value[0] ?? fallback;
  return value ?? fallback;
}

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const pousadaData = pousada as PousadaData;
  const params = await searchParams;
  const quartoSlug = getParam(params.quarto, "");
  const destino = getParam(params.destino, "Pedrinhas, Ilha Comprida");
  const checkin = getParam(params.checkin, "Não informado");
  const checkout = getParam(params.checkout, "Não informado");
  const adultos = Number(getParam(params.adultos, "2"));
  const criancasFree = Number(getParam(params.criancasFree, "0"));
  const criancasHalf = Number(getParam(params.criancasHalf, "0"));
  const quartos = getParam(params.quartos, "1");

  const quarto = pousadaData.quartos.find((item) => item.slug === quartoSlug) ?? pousadaData.quartos[0];
  const isCasa = quarto.tipo === "casa";
  const resumo = calcularResumoReserva({
    quarto,
    checkin,
    checkout,
    adultos,
    childrenFree: criancasFree,
    childrenHalf: criancasHalf,
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="mx-auto w-full max-w-7xl px-4 py-10 md:px-6 md:py-14">
        <SectionTitle
          eyebrow="Etapa 3 - Checkout"
          title="Finalize sua pré-reserva"
          subtitle="Preencha seus dados para avançar para confirmação e pagamento."
        />
        <section className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_0.9fr]">
          <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
            <h2 className="text-lg font-bold text-slate-900">Dados do hóspede</h2>
            <p className="mt-1 text-sm text-slate-600">Reserva rápida e simples com atendimento direto da pousada.</p>

            <form className="mt-6 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-1 text-sm font-medium text-slate-700">
                  <span>Nome completo</span>
                  <input className="h-11 w-full rounded-xl border border-slate-300 px-3 outline-none ring-cyan-500 focus:ring-2" placeholder="Seu nome completo" />
                </label>
                <label className="space-y-1 text-sm font-medium text-slate-700">
                  <span>E-mail</span>
                  <input type="email" className="h-11 w-full rounded-xl border border-slate-300 px-3 outline-none ring-cyan-500 focus:ring-2" placeholder="voce@email.com" />
                </label>
                <label className="space-y-1 text-sm font-medium text-slate-700">
                  <span>Telefone</span>
                  <input className="h-11 w-full rounded-xl border border-slate-300 px-3 outline-none ring-cyan-500 focus:ring-2" placeholder="(11) 99999-9999" />
                </label>
                <label className="space-y-1 text-sm font-medium text-slate-700">
                  <span>CPF (opcional)</span>
                  <input className="h-11 w-full rounded-xl border border-slate-300 px-3 outline-none ring-cyan-500 focus:ring-2" placeholder="000.000.000-00" />
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-1 text-sm font-medium text-slate-700">
                  <span>Horário previsto de chegada</span>
                  <input type="time" className="h-11 w-full rounded-xl border border-slate-300 px-3 outline-none ring-cyan-500 focus:ring-2" />
                </label>
                <label className="space-y-1 text-sm font-medium text-slate-700">
                  <span>Observações</span>
                  <input className="h-11 w-full rounded-xl border border-slate-300 px-3 outline-none ring-cyan-500 focus:ring-2" placeholder="Informações adicionais" />
                </label>
              </div>

              <label className="flex items-start gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                <input type="checkbox" className="mt-0.5" required />
                <span>Li e aceito as políticas da reserva, check-in/check-out e condições gerais da pousada.</span>
              </label>

              <label className="flex items-start gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                <input type="checkbox" className="mt-0.5" />
                <span>Quero receber confirmação e atualizações da reserva por WhatsApp.</span>
              </label>

              <button
                type="button"
                className="h-12 w-full rounded-xl bg-cyan-700 text-sm font-extrabold text-white shadow-lg shadow-cyan-900/30 transition hover:bg-cyan-600"
              >
                Confirmar pré-reserva
              </button>
            </form>
          </article>

          <aside className="space-y-4">
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <Image
                  src="/logopousada.jpeg"
                  alt="Logo da Pousada em Pedrinhas"
                  width={64}
                  height={64}
                  className="h-14 w-14 rounded-full border-2 border-amber-300 object-cover"
                />
                <div>
                  <p className="font-bold text-slate-900">{pousadaData.nome}</p>
                  <p className="text-xs text-slate-600">{destino}</p>
                </div>
              </div>

              <div className="mt-4 space-y-2 text-sm">
                <p className="font-semibold text-slate-900">{quarto.nome}</p>
                <p className="text-slate-600">{quarto.tipo_de_cama}</p>
                <p className="text-slate-600">{isCasa ? "Modelo de preço por pessoa" : "Modelo de preço por diária"}</p>
                <p className="text-slate-600">
                  {checkin} até {checkout}
                </p>
                <p className="text-slate-600">
                  {adultos} adultos, {criancasFree} crianças 0-6, {criancasHalf} crianças 7-12, {quartos} quarto(s)
                </p>
              </div>

              <div className="mt-4 border-t border-slate-200 pt-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">{isCasa ? "Base por pessoa" : "Diária base"} ({resumo.noites} noite(s))</span>
                  <span className="font-semibold text-slate-900">{formatCurrencyBRL(resumo.diaria)}</span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-slate-600">Adultos</span>
                  <span className="font-semibold text-slate-900">{formatCurrencyBRL(resumo.valorAdultos)}</span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-slate-600">Crianças 7-12 (meia)</span>
                  <span className="font-semibold text-slate-900">{formatCurrencyBRL(resumo.valorCriancas)}</span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-slate-600">Crianças 0-6</span>
                  <span className="font-semibold text-emerald-700">Não paga</span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-slate-600">Subtotal</span>
                  <span className="font-semibold text-slate-900">{formatCurrencyBRL(resumo.subtotal)}</span>
                </div>
                <div className="mt-2 flex items-center justify-between border-t border-slate-200 pt-2">
                  <span className="font-bold text-slate-900">Total final</span>
                  <span className="text-lg font-extrabold text-slate-900">{formatCurrencyBRL(resumo.total)}</span>
                </div>
                {!isCasa ? (
                  <p className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-cyan-800">
                    <Coffee className="h-4 w-4" />
                    Café da manhã incluso
                  </p>
                ) : (
                  <p className="mt-2 text-xs font-semibold text-slate-700">Casa para aluguel com diária por pessoa</p>
                )}
                <p className="mt-1 text-xs text-slate-600">Regra crianças: 0-6 não paga, 7-12 paga meia, 13+ tarifa normal.</p>
              </div>
            </article>

            <article className="rounded-3xl border border-cyan-200 bg-cyan-50 p-5">
              <p className="font-semibold text-slate-900">Confiança e praticidade</p>
              <ul className="mt-3 space-y-2 text-sm text-slate-700">
                <li className="inline-flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-cyan-700" />
                  Atendimento direto da pousada
                </li>
                <li className="inline-flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-cyan-700" />
                  Sem taxas escondidas
                </li>
                <li className="inline-flex items-center gap-2">
                  <Timer className="h-4 w-4 text-cyan-700" />
                  Reserva rápida e simples
                </li>
              </ul>
            </article>
          </aside>
        </section>
      </main>
      <Footer />
    </div>
  );
}
