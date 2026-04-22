import { Coffee, MapPin, ParkingCircle, Trees, Waves, Wind } from "lucide-react";
import { SectionTitle } from "@/components/ui/SectionTitle";

const items = [
  { icon: Waves, title: "Piscina ao ar livre", text: "Perfeita para relaxar em qualquer horário." },
  { icon: Coffee, title: "Café da manhã", text: "Comece o dia com praticidade e sabor." },
  { icon: ParkingCircle, title: "Estacionamento grátis", text: "Mais comodidade para quem viaja de carro." },
  { icon: Trees, title: "Tranquilidade", text: "Ambiente calmo para descansar de verdade." },
  { icon: MapPin, title: "Boa localização", text: "Perto da praia e pontos de interesse local." },
  { icon: Wind, title: "Clima litorâneo", text: "Sensação de descanso e natureza o ano todo." },
];

export function Highlights() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-16 md:px-6">
      <SectionTitle
        eyebrow="Destaques"
        title="Por que escolher a Pousada em Pedrinhas?"
        subtitle="Estrutura completa para uma viagem confortável em Ilha Comprida."
      />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <article key={item.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <item.icon className="h-5 w-5 text-cyan-700" />
            <h3 className="mt-3 font-semibold text-slate-900">{item.title}</h3>
            <p className="mt-1 text-sm text-slate-600">{item.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
