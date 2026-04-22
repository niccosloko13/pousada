import { CheckCircle2 } from "lucide-react";
import { SectionTitle } from "@/components/ui/SectionTitle";
import pousada from "@/data/pousada.json";

export function AmenitiesSection() {
  return (
    <section className="bg-slate-50 py-16">
      <div className="mx-auto w-full max-w-7xl px-4 md:px-6">
        <SectionTitle eyebrow="Comodidades" title="Tudo para uma estadia sem preocupação" />
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {pousada.comodidades.map((comodidade) => (
            <div key={comodidade} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-4 text-sm">
              <CheckCircle2 className="h-4 w-4 text-cyan-700" />
              <span className="font-medium text-slate-800">{comodidade}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
