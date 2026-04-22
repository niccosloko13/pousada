import { MapPin } from "lucide-react";
import { SectionTitle } from "@/components/ui/SectionTitle";
import pousada from "@/data/pousada.json";

export function LocationSection() {
  return (
    <section className="bg-slate-50 py-16">
      <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 md:grid-cols-2 md:px-6">
        <div>
          <SectionTitle
            eyebrow="Localização"
            title="No coração de Pedrinhas, em Ilha Comprida"
            subtitle="Fácil acesso a praia, restaurantes e experiências locais."
          />
          <p className="mt-4 flex items-start gap-2 text-slate-700">
            <MapPin className="mt-0.5 h-4 w-4 text-cyan-700" />
            <span>{pousada.endereco}</span>
          </p>
        </div>
        <div className="flex min-h-60 items-center justify-center rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-600">
          Placeholder para mapa interativo (Google Maps/OpenStreetMap)
        </div>
      </div>
    </section>
  );
}
