import Image from "next/image";
import Link from "next/link";
import { BedDouble, Coffee, Home, Users, Wifi } from "lucide-react";
import { formatCurrencyBRL } from "@/lib/reservation";
import type { Quarto } from "@/types/pousada";

type AccommodationCardProps = {
  quarto: Quarto;
};

export function AccommodationCard({ quarto }: AccommodationCardProps) {
  const isCasa = quarto.tipo === "casa";
  const priceText = isCasa
    ? `${formatCurrencyBRL(quarto.preco_por_pessoa ?? 140)} por pessoa`
    : `${formatCurrencyBRL(quarto.preco_por_noite)} / diária`;

  return (
    <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <div className="relative h-52 w-full">
        <Image src={quarto.imagem_capa ?? "/fotos_pousada/pousada_001.jpg"} alt={quarto.nome} fill className="object-cover" />
        <div className="absolute left-3 top-3 rounded-full bg-slate-950/70 px-3 py-1 text-xs font-semibold text-white">
          {isCasa ? "Casa para grupos" : "Acomodação"}
        </div>
      </div>
      <div className="space-y-3 p-5">
        <h3 className="text-xl font-bold text-slate-900">{quarto.nome}</h3>
        <p className="text-sm text-slate-600">{quarto.descricao}</p>

        <div className="flex flex-wrap gap-2 text-xs text-slate-700">
          <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-1">
            <Users className="h-3.5 w-3.5 text-cyan-700" />
            {quarto.capacidade}
          </span>
          <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-1">
            <BedDouble className="h-3.5 w-3.5 text-cyan-700" />
            {quarto.tipo_de_cama}
          </span>
          <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-1">
            <Wifi className="h-3.5 w-3.5 text-cyan-700" />
            Wi-Fi
          </span>
          {isCasa ? (
            <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-1">
              <Home className="h-3.5 w-3.5 text-cyan-700" />
              {quarto.quantidade_quartos} quartos / {quarto.quantidade_banheiros} banheiros
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-1">
              <Coffee className="h-3.5 w-3.5 text-cyan-700" />
              Café da manhã incluso
            </span>
          )}
        </div>

        <div className="flex items-end justify-between gap-3 pt-1">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Preço</p>
            <p className="text-lg font-extrabold text-slate-900">{priceText}</p>
          </div>
          <Link
            href={`/reserva?quarto=${quarto.slug}`}
            className="inline-flex items-center justify-center rounded-xl bg-cyan-700 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-cyan-600"
          >
            Reservar
          </Link>
        </div>
      </div>
    </article>
  );
}
