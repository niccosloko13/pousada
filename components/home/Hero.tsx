import Image from "next/image";
import { InfoBadge } from "@/components/ui/InfoBadge";
import pousada from "@/data/pousada.json";
import type { PousadaData } from "@/types/pousada";

export function Hero() {
  const pousadaData = pousada as PousadaData;
  const heroImage = pousadaData.imagens_por_secao?.hero?.[0] ?? "/fotos_pousada/pousada_001.jpg";

  return (
    <section className="relative overflow-hidden rounded-t-[2rem] pb-10 pt-7 text-white shadow-[0_-18px_50px_rgba(0,0,0,0.35)] md:pb-16 md:pt-10">
      <Image src={heroImage} alt="Vista da pousada" fill sizes="100vw" className="object-cover" priority />
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-900/70 to-cyan-900/60" />
      <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 md:grid-cols-2 md:items-center md:px-6">
        <div className="relative z-10 space-y-5">
          <div className="flex flex-wrap gap-2">
            <InfoBadge label={`${pousada.nota.toFixed(1)} Fantástico`} />
            <InfoBadge label={`${pousada.avaliacoes} avaliações`} />
            <InfoBadge label="Reserva direta e rápida" />
          </div>
          <h1 className="text-2xl font-extrabold leading-tight md:text-5xl">
            Garanta sua hospedagem em Ilha Comprida hoje, com reserva direta e confirmação rápida.
          </h1>
          <p className="max-w-xl text-base text-cyan-100 md:text-lg">
            Pousada acolhedora em Pedrinhas com piscina, café da manhã e atendimento que faz você se sentir em casa.
          </p>
        </div>

        <div className="relative z-10 flex justify-center md:justify-end">
          <div className="rounded-3xl border border-white/30 bg-white/15 p-4 backdrop-blur md:p-6">
            <Image
              src="/logopousada.jpeg"
              alt="Logo da Pousada em Pedrinhas"
              width={260}
              height={260}
              className="h-44 w-44 rounded-full border-4 border-amber-300 object-cover shadow-2xl md:h-64 md:w-64"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
