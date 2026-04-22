import Link from "next/link";
import { SectionTitle } from "@/components/ui/SectionTitle";
import pousada from "@/data/pousada.json";
import { AccommodationCard } from "@/components/quartos/AccommodationCard";
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
          title="Acomodações com conforto e praticidade"
          subtitle="Ambientes pensados para descanso, com estrutura para estadias curtas ou longas."
        />
        <div className="mt-8 grid gap-5 md:grid-cols-2">
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

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
          Todos os quartos padrão incluem cama de casal, cama de solteiro, ar-condicionado, TV Smart, Wi-Fi, frigobar, mini cozinha e banheiro privativo.
        </div>
        <Link href="/quartos" className="mt-6 inline-block text-sm font-semibold text-cyan-700 hover:text-cyan-600">
          Ver todos os detalhes dos quartos
        </Link>
      </div>
    </section>
  );
}
