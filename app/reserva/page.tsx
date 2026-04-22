import Image from "next/image";
import { CircleCheck, Coffee, ShieldCheck, Timer, Wallet } from "lucide-react";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { CTAButton } from "@/components/ui/CTAButton";
import { SectionTitle } from "@/components/ui/SectionTitle";
import pousada from "@/data/pousada.json";
import { formatCurrencyBRL } from "@/lib/reservation";
import type { PousadaData } from "@/types/pousada";

type ReservaPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function pickValue(value: string | string[] | undefined, fallback: string) {
  if (Array.isArray(value)) return value[0] ?? fallback;
  return value ?? fallback;
}

export default async function ReservaPage({ searchParams }: ReservaPageProps) {
  const pousadaData = pousada as PousadaData;
  const params = await searchParams;
  const destino = pickValue(params.destino, "Pedrinhas, Ilha Comprida");
  const checkin = pickValue(params.checkin, "Não informado");
  const checkout = pickValue(params.checkout, "Não informado");
  const adultos = pickValue(params.adultos, "2");
  const criancasFree = pickValue(params.criancasFree, "0");
  const criancasHalf = pickValue(params.criancasHalf, "0");
  const quartos = pickValue(params.quartos, "1");
  const quartoSelecionado = pickValue(params.quarto, "");

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="mx-auto w-full max-w-7xl px-4 py-10 md:px-6 md:py-14">
        <SectionTitle
          eyebrow="Etapa 2 - Reserva"
          title="Escolha sua acomodação disponível"
          subtitle="Confira sua busca e selecione o quarto ideal para continuar a reserva."
        />

        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <div className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Destino</p>
              <p className="mt-1 font-semibold text-slate-900">{destino}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Check-in</p>
              <p className="mt-1 font-semibold text-slate-900">{checkin}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Check-out</p>
              <p className="mt-1 font-semibold text-slate-900">{checkout}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Hóspedes</p>
              <p className="mt-1 font-semibold text-slate-900">
                {adultos} adultos, {criancasFree} crianças 0-6, {criancasHalf} crianças 7-12, {quartos} quarto(s)
              </p>
            </div>
          </div>
          <p className="mt-3 text-xs font-medium text-slate-600">
            Regra crianças: 0-6 não paga, 7-12 paga meia, 13+ tarifa normal.
          </p>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.5fr_0.8fr]">
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900">Acomodações disponíveis</h2>
            {pousadaData.quartos.map((quarto) => {
              const isSelected = quarto.slug === quartoSelecionado;
              const isFamilia = quarto.tipo === "familia";
              const isCasa = quarto.tipo === "casa";
              const priceText = isCasa
                ? `${formatCurrencyBRL(quarto.preco_por_pessoa ?? 140)} por pessoa`
                : `${formatCurrencyBRL(quarto.preco_por_noite)} / diária`;
              return (
                <article
                  key={quarto.id}
                  className={`rounded-3xl border bg-white p-5 shadow-sm md:p-6 ${
                    isSelected ? "border-cyan-600 ring-2 ring-cyan-200" : "border-slate-200"
                  }`}
                >
                  <div className="mb-4 grid gap-3 md:grid-cols-[190px_1fr]">
                    <div className="relative h-40 overflow-hidden rounded-2xl">
                      <Image
                        src={quarto.imagem_capa ?? "/fotos_pousada/pousada_001.jpg"}
                        alt={quarto.nome}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{quarto.nome}</h3>
                      <p className="mt-1 text-sm text-slate-600">{quarto.descricao}</p>
                      {isFamilia ? (
                        <p className="mt-2 inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                          Quarto família - ideal para famílias
                        </p>
                      ) : null}
                      {isCasa ? (
                        <p className="mt-2 inline-flex rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-800">
                          Casa para grupos - até 11 pessoas
                        </p>
                      ) : null}
                    </div>
                    {isSelected ? (
                      <span className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-semibold text-cyan-800">
                        Selecionado na busca
                      </span>
                    ) : null}
                  </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {quarto.comodidades.slice(0, 6).map((item) => (
                      <span key={item} className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700">
                        <CircleCheck className="h-3.5 w-3.5 text-cyan-700" />
                        {item}
                      </span>
                    ))}
                  </div>

                  <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-slate-50 p-3">
                    <div className="text-xs text-slate-600 md:text-sm">
                      <p>
                        <span className="font-semibold text-slate-800">Capacidade:</span> {quarto.capacidade}
                      </p>
                      <p>
                        <span className="font-semibold text-slate-800">Camas:</span> {quarto.tipo_de_cama}
                      </p>
                      <p>
                        <span className="font-semibold text-slate-800">Obs.:</span> {quarto.camas_extras_ou_observacao}
                      </p>
                      {!isCasa ? (
                        <p className="mt-1 inline-flex items-center gap-1 font-semibold text-cyan-800">
                          <Coffee className="h-4 w-4" />
                          Café da manhã incluso
                        </p>
                      ) : (
                        <p className="mt-1 font-semibold text-slate-700">Diária modelo por pessoa para grupos</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Preço</p>
                      <p className="text-lg font-extrabold text-slate-900">{priceText}</p>
                    </div>
                    <CTAButton
                      href={`/reserva/checkout?quarto=${quarto.slug}&destino=${encodeURIComponent(destino)}&checkin=${encodeURIComponent(
                        checkin,
                      )}&checkout=${encodeURIComponent(checkout)}&adultos=${adultos}&criancasFree=${criancasFree}&criancasHalf=${criancasHalf}&quartos=${quartos}`}
                    >
                      Continuar reserva
                    </CTAButton>
                  </div>
                </article>
              );
            })}
          </div>

          <aside className="space-y-4">
            <div className="rounded-3xl border border-cyan-200 bg-cyan-50 p-5">
              <div className="flex items-center gap-3">
                <Image
                  src="/logopousada.jpeg"
                  alt="Logo da Pousada em Pedrinhas"
                  width={64}
                  height={64}
                  className="h-14 w-14 rounded-full border-2 border-amber-300 object-cover"
                />
                <div>
                  <p className="font-bold text-slate-900">Reserva direta com a pousada</p>
                  <p className="text-xs text-slate-600">Atendimento humano e rápido</p>
                </div>
              </div>
              <ul className="mt-4 space-y-2 text-sm text-slate-700">
                <li className="inline-flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-cyan-700" />
                  Sem taxas escondidas
                </li>
                <li className="inline-flex items-center gap-2">
                  <Timer className="h-4 w-4 text-cyan-700" />
                  Confirmação rápida da reserva
                </li>
                <li className="inline-flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-cyan-700" />
                  Processo simples, rápido e seguro
                </li>
                <li className="inline-flex items-center gap-2">
                  <Coffee className="h-4 w-4 text-cyan-700" />
                  Café da manhã incluso em todas as diárias
                </li>
              </ul>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5">
              <p className="text-sm font-semibold text-slate-900">Próximo passo do funil</p>
              <p className="mt-2 text-sm text-slate-600">
                Após escolher o quarto, você informa seus dados e visualiza o total da hospedagem com cálculo de diárias e café da manhã incluso.
              </p>
            </div>
          </aside>
        </section>
      </main>
      <Footer />
    </div>
  );
}
