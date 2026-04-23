import Image from "next/image";
import Link from "next/link";
import { BedDouble, Building2, ChevronRight, Coffee, Home, Sparkles, Users, Wifi } from "lucide-react";
import { formatCurrencyBRL } from "@/lib/reservation";
import type { Quarto } from "@/types/pousada";

type AccommodationCardProps = {
  quarto: Quarto;
};

export function AccommodationCard({ quarto }: AccommodationCardProps) {
  const isCasa = quarto.tipo === "casa";
  const isFamilia = quarto.tipo === "familia";
  const priceText = isCasa
    ? `${formatCurrencyBRL(quarto.preco_por_pessoa ?? 140)} / pessoa`
    : `${formatCurrencyBRL(quarto.preco_por_noite)} / diária`;

  const chips = (quarto.comodidades ?? []).slice(0, 6);

  return (
    <article className="group relative overflow-hidden rounded-[1.75rem] border border-slate-200/90 bg-white shadow-[0_24px_65px_rgba(15,23,42,0.10)] ring-1 ring-slate-900/[0.04] transition duration-300 hover:-translate-y-1 hover:border-cyan-200/90 hover:shadow-[0_30px_90px_rgba(14,116,144,0.20)]">
      <div className="relative h-64 w-full overflow-hidden md:h-80">
        <Image
          src={quarto.imagem_capa ?? "/fotos_pousada/pousada_001.jpg"}
          alt={quarto.nome}
          fill
          sizes="(min-width: 768px) 50vw, 100vw"
          className="object-cover transition duration-700 group-hover:scale-[1.03]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/10 to-transparent" />

        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          {isCasa ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-purple-950/80 px-3 py-1 text-xs font-bold text-white shadow-sm backdrop-blur-md">
              <Home className="h-3.5 w-3.5" />
              Casa para grupos
            </span>
          ) : isFamilia ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-amber-500/90 px-3 py-1 text-xs font-bold text-slate-950 shadow-sm backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5" />
              Família
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-slate-950/75 px-3 py-1 text-xs font-bold text-white shadow-sm backdrop-blur-md">
              <BedDouble className="h-3.5 w-3.5" />
              Casal / Standard
            </span>
          )}
          {!isCasa ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/40 bg-emerald-600/90 px-3 py-1 text-xs font-bold text-white shadow-sm backdrop-blur-md">
              <Coffee className="h-3.5 w-3.5" />
              Café da manhã incluso
            </span>
          ) : null}
        </div>

        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-cyan-100/95">Valor da estadia</p>
            <p className="text-3xl font-black text-white drop-shadow-sm md:text-4xl">{priceText}</p>
          </div>
        </div>
      </div>

      <div className="space-y-5 p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-2xl font-black tracking-tight text-slate-900">{quarto.nome}</h3>
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-600">{quarto.descricao}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-800">
            <Users className="h-3.5 w-3.5 text-cyan-700" />
            {quarto.capacidade}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-800">
            <BedDouble className="h-3.5 w-3.5 text-cyan-700" />
            {quarto.tipo_de_cama}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-800">
            <Wifi className="h-3.5 w-3.5 text-cyan-700" />
            Wi-Fi
          </span>
          {isCasa ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-800">
              <Building2 className="h-3.5 w-3.5 text-cyan-700" />
              {quarto.quantidade_quartos ?? 0} quartos · {quarto.quantidade_banheiros ?? 0} banheiros
            </span>
          ) : null}
        </div>

        {chips.length ? (
          <div className="flex flex-wrap gap-2">
            {chips.map((item) => (
              <span
                key={item}
                className="inline-flex items-center rounded-full border border-cyan-100 bg-cyan-50 px-3 py-1 text-[11px] font-semibold text-cyan-950"
              >
                {item}
              </span>
            ))}
          </div>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
          <p className="text-xs font-semibold text-slate-600">Reserva direta com a pousada · confirmação rápida</p>
          <Link
            href={`/reserva?quarto=${quarto.slug}`}
            className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-800 transition hover:border-slate-400 hover:bg-slate-50"
          >
            Ver datas
          </Link>
          <Link
            href={`/reserva?quarto=${quarto.slug}`}
            className="inline-flex items-center justify-center gap-1 rounded-xl bg-gradient-to-r from-cyan-700 to-cyan-600 px-5 py-2.5 text-sm font-extrabold text-white shadow-lg shadow-cyan-900/25 transition hover:from-cyan-600 hover:to-cyan-500"
          >
            Reservar agora
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}
