import Link from "next/link";
import { SectionTitle } from "@/components/ui/SectionTitle";
import pousada from "@/data/pousada.json";
import { AccommodationCard } from "@/components/quartos/AccommodationCard";
import { TrustSealBand } from "@/components/trust/TrustSealBand";
import type { PousadaData } from "@/types/pousada";

export function RoomsPreview() {
  const pousadaData = pousada as PousadaData;
  const suites = pousadaData.quartos.filter((q) => q.tipo !== "casa").slice(0, 2);
  const casa = pousadaData.quartos.find((q) => q.tipo === "casa");

  return (
    <section className="bg-slate-50 py-16">
      <div className="mx-auto w-full max-w-7xl px-4 md:px-6">
        <SectionTitle
          eyebrow="Quartos"
          title="Acomodações com padrão superior para descansar de verdade"
          subtitle="Apartamentos e casa para grupos com reserva direta, atendimento da pousada e estrutura completa em Pedrinhas."
        />
        <div className="mt-6 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <TrustSealBand tone="light" align="start" showLegalLine={false} />
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {suites.map((quarto) => (
            <AccommodationCard key={quarto.id} quarto={quarto} />
          ))}
        </div>

        {casa ? (
          <div className="mt-8">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">Casa para aluguel</p>
            <AccommodationCard quarto={casa} />
          </div>
        ) : null}

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700 shadow-sm">
          Todos os quartos padrão incluem cama de casal, cama de solteiro, ar-condicionado, TV Smart, Wi-Fi, frigobar, mini cozinha e banheiro privativo.
        </div>
        <Link href="/quartos" className="mt-6 inline-flex items-center rounded-xl border border-cyan-200 bg-cyan-50 px-4 py-2 text-sm font-bold text-cyan-800 hover:bg-cyan-100">
          Ver todas as acomodações
        </Link>
      </div>
    </section>
  );
}
