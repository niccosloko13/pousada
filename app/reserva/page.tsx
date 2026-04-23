import Image from "next/image";
import Link from "next/link";
import { CircleCheck, Coffee, ShieldCheck, Sparkles, Timer, Wallet } from "lucide-react";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { CTAButton } from "@/components/ui/CTAButton";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { formatCurrencyBRL } from "@/lib/reservation";
import { formatDateBRFromIso, isIsoDate, isValidIsoDateRange } from "@/lib/reservations/dateParams";
import { checkAvailability } from "@/lib/reservations/engine";
import { computeStayPricing } from "@/lib/reservations/pricing";
import { categoryLabel, categoryOrder, parseRoomMetadata, recommendRoomSlug } from "@/lib/reservations/roomPresentation";
import { prisma } from "@/lib/prisma";
import { TrustSealBand } from "@/components/trust/TrustSealBand";
import { COMPANY_CNPJ, COMPANY_LEGAL_NAME } from "@/lib/company";

export const dynamic = "force-dynamic";

type ReservaPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function pickValue(value: string | string[] | undefined, fallback: string) {
  if (Array.isArray(value)) return value[0] ?? fallback;
  return value ?? fallback;
}

function parseGuestCount(value: string, fallback: number, min = 0) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.trunc(n));
}

export default async function ReservaPage({ searchParams }: ReservaPageProps) {
  const params = await searchParams;

  const destino = pickValue(params.destino, "Pedrinhas, Ilha Comprida");
  const checkinRaw = pickValue(params.checkin, "");
  const checkoutRaw = pickValue(params.checkout, "");
  const adultos = parseGuestCount(pickValue(params.adultos, "2"), 2, 1);
  const criancasFree = parseGuestCount(pickValue(params.criancasFree, "0"), 0, 0);
  const criancasHalf = parseGuestCount(pickValue(params.criancasHalf, "0"), 0, 0);
  const quartos = pickValue(params.quartos, "1");
  const quartoSelecionado = pickValue(params.quarto, "");

  const datesOk = isIsoDate(checkinRaw) && isIsoDate(checkoutRaw);
  const dateRangeOk = isValidIsoDateRange(checkinRaw, checkoutRaw);
  const searchReady = datesOk && dateRangeOk;
  const checkinLabel = datesOk ? formatDateBRFromIso(checkinRaw) : checkinRaw || "Escolha na busca";
  const checkoutLabel = datesOk ? formatDateBRFromIso(checkoutRaw) : checkoutRaw || "Escolha na busca";

  const rooms = await prisma.room.findMany({ orderBy: [{ name: "asc" }] });
  const totalGuests = Math.max(0, adultos) + Math.max(0, criancasFree) + Math.max(0, criancasHalf);
  const recommendedSlug = recommendRoomSlug({
    rooms,
    totalGuests,
    childrenFree: criancasFree,
    childrenHalf: criancasHalf,
  });

  const enrichedRooms = await Promise.all(
    rooms.map(async (room) => {
      const meta = parseRoomMetadata(room.metadata);
      const cover = meta.imagem_capa ?? "/fotos_pousada/pousada_001.jpg";
      const amenities = meta.comodidades ?? [];

      const pricing = searchReady ? computeStayPricing(room, checkinRaw, checkoutRaw, adultos, criancasFree, criancasHalf) : null;

      const checkinAt = searchReady ? new Date(`${checkinRaw}T15:00:00`) : null;
      const checkoutAt = searchReady ? new Date(`${checkoutRaw}T11:00:00`) : null;
      const availability =
        searchReady && checkinAt && checkoutAt ? await checkAvailability(room.id, { checkin: checkinAt, checkout: checkoutAt }) : null;

      const fitsCapacity = totalGuests <= room.capacity;
      const isAvailable = Boolean(availability?.available && fitsCapacity);
      const isRecommended = recommendedSlug === room.slug;

      return {
        room,
        meta,
        cover,
        amenities,
        pricing,
        availability,
        fitsCapacity,
        isAvailable,
        isRecommended,
      };
    }),
  );

  const grouped = [...enrichedRooms].sort((a, b) => {
    const c = categoryOrder(a.room.category) - categoryOrder(b.room.category);
    if (c !== 0) return c;
    return a.room.name.localeCompare(b.room.name);
  });

  const groups = new Map<string, typeof enrichedRooms>();
  for (const item of grouped) {
    const arr = groups.get(item.room.category) ?? [];
    arr.push(item);
    groups.set(item.room.category, arr);
  }

  const availableRooms = grouped.filter((item) => item.isAvailable);
  const availableCount = availableRooms.length;
  const totalOptions = grouped.length;
  const primarySlug = availableRooms[0]?.room.slug ?? grouped[0]?.room.slug ?? "";

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="mx-auto w-full max-w-7xl px-4 py-10 md:px-6 md:py-14">
        <SectionTitle
          eyebrow="Resultado da busca"
          title="Acomodações disponíveis para suas datas"
          subtitle="Resultados em tempo real com total da estadia e disponibilidade por período."
        />

        {!searchReady ? (
          <div className="mt-6 rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-950">
            <p className="font-bold">Busca incompleta ou período inválido.</p>
            <p className="mt-2 text-amber-900">
              Volte para a home e selecione check-in/check-out válidos pelo calendário. O checkout exige datas no formato AAAA-MM-DD e check-out após check-in.
            </p>
            <div className="mt-4">
              <CTAButton href="/">Voltar para a busca</CTAButton>
            </div>
          </div>
        ) : null}

        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <div className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Destino</p>
              <p className="mt-1 font-semibold text-slate-900">{destino}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Check-in</p>
              <p className="mt-1 font-semibold text-slate-900">{checkinLabel}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Check-out</p>
              <p className="mt-1 font-semibold text-slate-900">{checkoutLabel}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Hóspedes</p>
              <p className="mt-1 font-semibold text-slate-900">
                {adultos} adultos · {criancasFree} crianças 0-6 · {criancasHalf} crianças 7-12 · {quartos} quarto(s)
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-bold text-slate-900">Regras de crianças (visíveis e objetivas)</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
              <li>
                <span className="font-semibold text-slate-900">0 a 6 anos:</span> não paga (conta na capacidade).
              </li>
              <li>
                <span className="font-semibold text-slate-900">7 a 12 anos:</span> meia tarifa (conforme modelo do quarto/casa).
              </li>
              <li>
                <span className="font-semibold text-slate-900">13+:</span> tarifa de adulto.
              </li>
            </ul>
            <p className="mt-2 text-xs text-slate-600">
              O preço mostrado abaixo é o <span className="font-semibold">total estimado da estadia</span> para o seu grupo e datas — não apenas a diária “de vitrine”.
            </p>
          </div>

          <div className="mt-5 rounded-2xl border border-slate-200/90 bg-slate-50/80 p-4">
            <TrustSealBand tone="light" align="start" />
          </div>
        </section>

        <section className="mt-6 rounded-3xl border border-cyan-100 bg-cyan-50/70 p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-cyan-800">Resultados encontrados</p>
              <p className="mt-1 text-xl font-black text-slate-900">
                {availableCount} {availableCount === 1 ? "opção disponível" : "opções disponíveis"}
              </p>
              <p className="text-sm text-slate-600">
                Mostrando {totalOptions} acomodações analisadas para {checkinLabel} → {checkoutLabel}.
              </p>
            </div>
            {availableCount > 0 ? (
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">
                <CircleCheck className="h-4 w-4" />
                Disponibilidade confirmada
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800">
                Ajuste datas ou hóspedes para ampliar resultados
              </span>
            )}
          </div>
        </section>

        {availableCount === 0 ? (
          <section className="mt-6 rounded-3xl border border-amber-200 bg-amber-50 p-6">
            <h2 className="text-lg font-extrabold text-amber-950">Nenhuma acomodação disponível para os filtros atuais</h2>
            <p className="mt-2 text-sm text-amber-900">
              Isso pode ocorrer por capacidade acima do permitido ou por bloqueios de datas. Tente ajustar datas, quantidade de hóspedes ou categoria.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <CTAButton href="/">Refazer busca</CTAButton>
              <CTAButton href="/quartos" className="bg-slate-900 text-white hover:bg-slate-800">
                Ver todas as acomodações
              </CTAButton>
            </div>
          </section>
        ) : null}

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.62fr_0.85fr] lg:items-start">
          <div className="space-y-8">
            {[...groups.entries()]
              .sort((a, b) => categoryOrder(a[0]) - categoryOrder(b[0]))
              .map(([category, categoryRooms]) => (
                <section key={category} className="space-y-4">
                  <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Categoria</p>
                      <h2 className="text-xl font-extrabold text-slate-900">{categoryLabel(category)}</h2>
                      <p className="mt-1 text-sm text-slate-600">
                        {category === "casal"
                          ? "Quartos ideais para casais e grupos pequenos, com café da manhã incluso."
                          : category === "familia"
                            ? "Mais espaço para famílias com crianças — com café da manhã incluso."
                            : "Casa completa para grupos, com tarifa por pessoa e estrutura de imóvel."}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {categoryRooms.map((item) => {
                      const { room, meta, cover, amenities, pricing, availability, fitsCapacity, isAvailable, isRecommended } = item;
                      const isSelected = quartoSelecionado === room.slug;
                      const isTopPick = room.slug === primarySlug;

                      return (
                        <article
                          key={room.id}
                          className={`rounded-[1.75rem] border bg-white p-5 shadow-[0_22px_60px_rgba(15,23,42,0.07)] ring-1 ring-slate-900/[0.03] transition hover:-translate-y-0.5 hover:shadow-[0_28px_80px_rgba(8,145,178,0.12)] md:p-6 ${
                            isSelected ? "border-cyan-600 ring-2 ring-cyan-200" : "border-slate-200/90"
                          }`}
                        >
                          <div className="mb-4 grid gap-4 md:grid-cols-[250px_1fr]">
                            <div className="relative h-52 overflow-hidden rounded-2xl ring-1 ring-slate-900/5">
                              <Image src={cover} alt={room.name} fill sizes="(min-width: 768px) 250px, 100vw" className="object-cover" />
                              {isTopPick ? (
                                <div className="absolute left-3 top-3 inline-flex items-center gap-2 rounded-full bg-white/95 px-3 py-1 text-xs font-extrabold text-cyan-900 shadow-sm">
                                  <Sparkles className="h-4 w-4 text-amber-500" />
                                  Melhor opção para começar
                                </div>
                              ) : isRecommended ? (
                                <div className="absolute left-3 top-3 inline-flex items-center gap-2 rounded-full bg-white/95 px-3 py-1 text-xs font-extrabold text-cyan-900 shadow-sm">
                                  <Sparkles className="h-4 w-4 text-amber-500" />
                                  Melhor opção para seu grupo
                                </div>
                              ) : null}
                            </div>

                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <h3 className="truncate text-lg font-extrabold text-slate-900">{room.name}</h3>
                                  {isSelected ? (
                                    <span className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-semibold text-cyan-900">Selecionado na busca</span>
                                  ) : null}
                                </div>
                                <p className="mt-2 text-sm text-slate-600">{room.description}</p>
                                {meta.destaque ? (
                                  <p className="mt-3 inline-flex max-w-full rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-800">
                                    {meta.destaque}
                                  </p>
                                ) : null}
                              </div>

                              <div className="w-full shrink-0 text-left sm:w-auto sm:text-right">
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total da estadia</p>
                                <p className="text-2xl font-black text-slate-900">{pricing ? formatCurrencyBRL(pricing.total) : "—"}</p>
                                <p className="mt-1 text-xs text-slate-600">
                                  {pricing
                                    ? `${pricing.nights} noite(s) · ${pricing.pricingModel === "por_pessoa" ? "modelo por pessoa" : "modelo por diária"}`
                                    : "Informe datas válidas para calcular"}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 flex flex-wrap gap-2">
                            {amenities.slice(0, 8).map((amenity) => (
                              <span
                                key={amenity}
                                className="inline-flex items-center gap-1 rounded-full border border-cyan-100 bg-cyan-50/90 px-3 py-1.5 text-[11px] font-semibold text-cyan-950"
                              >
                                <CircleCheck className="h-3.5 w-3.5 text-cyan-700" />
                                {amenity}
                              </span>
                            ))}
                          </div>

                          <div className="mt-3 flex flex-wrap items-center gap-2 text-[10px] font-semibold text-slate-600">
                            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                            <span>Reserva segura · empresa registrada · CNPJ {COMPANY_CNPJ}</span>
                          </div>

                          <div className="mt-5 grid gap-3 rounded-2xl bg-slate-50 p-4 md:grid-cols-[1fr_auto] md:items-center">
                            <div className="text-sm text-slate-700">
                              <p>
                                <span className="font-semibold text-slate-900">Capacidade:</span> até {room.capacity} hóspedes
                              </p>
                              <p>
                                <span className="font-semibold text-slate-900">Camas:</span> {room.bedSummary}
                              </p>
                              <p className="mt-2">
                                <span className="font-semibold text-slate-900">Disponibilidade:</span>{" "}
                                {!datesOk ? (
                                  <span className="text-slate-700">informe datas válidas</span>
                                ) : !fitsCapacity ? (
                                  <span className="font-semibold text-rose-800">grupo acima da capacidade</span>
                                ) : availability?.available ? (
                                  <span className="font-semibold text-emerald-800">disponível para o período</span>
                                ) : (
                                  <span className="font-semibold text-rose-800">indisponível para o período</span>
                                )}
                              </p>
                              {room.breakfastIncluded ? (
                                <p className="mt-2 inline-flex items-center gap-1 font-semibold text-cyan-900">
                                  <Coffee className="h-4 w-4" />
                                  Café da manhã incluso
                                </p>
                              ) : (
                                <p className="mt-2 font-semibold text-slate-800">Casa para aluguel (café da manhã não incluso)</p>
                              )}
                            </div>

                            <div className="flex flex-col gap-2 md:items-end">
                              {!searchReady ? (
                                <CTAButton href="/">Ajustar datas na busca</CTAButton>
                              ) : (
                                <CTAButton disabled={!isAvailable} href={`/reserva/checkout?${new URLSearchParams({
                                  quarto: room.slug,
                                  roomSlug: room.slug,
                                  roomId: room.id,
                                  destino,
                                  checkin: checkinRaw,
                                  checkout: checkoutRaw,
                                  adultos: String(adultos),
                                  criancasFree: String(criancasFree),
                                  criancasHalf: String(criancasHalf),
                                  quartos,
                                }).toString()}`}>
                                  Reservar agora
                                </CTAButton>
                              )}
                              {!searchReady ? (
                                <p className="text-xs text-slate-600">O checkout exige datas no formato AAAA-MM-DD.</p>
                              ) : !fitsCapacity ? (
                                <p className="text-xs text-rose-800">Ajuste o número de hóspedes ou escolha uma categoria maior.</p>
                              ) : !availability?.available ? (
                                <p className="text-xs text-rose-800">Indisponível (reserva em andamento, confirmada ou bloqueio administrativo).</p>
                              ) : (
                                <p className="text-xs text-slate-600">Ao pagar, o sistema cria uma pré-reserva com tempo para evitar overbooking.</p>
                              )}
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </section>
              ))}
          </div>

          <aside className="space-y-4 lg:sticky lg:top-24">
            <div className="rounded-3xl border border-cyan-200 bg-cyan-50 p-5">
              <p className="mb-3 rounded-2xl border border-cyan-200/80 bg-white/70 px-3 py-2 text-[10px] font-semibold leading-snug text-cyan-950">
                {COMPANY_LEGAL_NAME}
                <span className="mt-1 block font-mono text-[10px] font-bold text-cyan-900">CNPJ {COMPANY_CNPJ}</span>
              </p>
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
                  <p className="text-xs text-slate-600">Atendimento humano + confirmação automática após pagamento</p>
                </div>
              </div>
              <ul className="mt-4 space-y-2 text-sm text-slate-700">
                <li className="inline-flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-cyan-700" />
                  Preço total da estadia antes do pagamento
                </li>
                <li className="inline-flex items-center gap-2">
                  <Timer className="h-4 w-4 text-cyan-700" />
                  Trava de inventário no checkout (anti-overbooking)
                </li>
                <li className="inline-flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-cyan-700" />
                  Mercado Pago (Pix e cartão) em sandbox
                </li>
                <li className="inline-flex items-center gap-2">
                  <Coffee className="h-4 w-4 text-cyan-700" />
                  Café da manhã incluso nos quartos (exceto casa)
                </li>
              </ul>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5">
              <p className="text-sm font-semibold text-slate-900">Arquitetura pronta para canais</p>
              <p className="mt-2 text-sm text-slate-600">
                O banco já modela canal/origem e IDs externos para futura sincronização com Booking.com, sem mudar o fluxo da sua reserva direta.
              </p>
              <div className="mt-4 text-xs text-slate-600">
                <p>
                  Dúvidas rápidas?{" "}
                  <Link className="font-semibold text-cyan-800 underline" href="/localizacao">
                    Localização
                  </Link>{" "}
                  ·{" "}
                  <Link className="font-semibold text-cyan-800 underline" href="/quartos">
                    Quartos
                  </Link>
                </p>
              </div>
            </div>
          </aside>
        </section>
      </main>
      <Footer />
    </div>
  );
}
