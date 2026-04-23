import Image from "next/image";
import { Binoculars, Fish, Footprints, Sailboat, Sun, UtensilsCrossed } from "lucide-react";
import { SectionTitle } from "@/components/ui/SectionTitle";

const attractions = [
  {
    icon: Sun,
    title: "Vila de Pedrinhas e clima caiçara",
    text: "Ruas tranquilas, ritmo acolhedor e atmosfera de vila para quem quer desacelerar.",
    image: "/locais/deck.jpg",
  },
  {
    icon: Sailboat,
    title: "Passeios pelo Mar Pequeno",
    text: "Passeios de barco e cenários naturais para curtir o melhor do litoral sul paulista.",
    image: "/locais/rio.jpg",
  },
  {
    icon: Footprints,
    title: "Trilhas ecológicas e dunas",
    text: "Rotas ao ar livre para caminhada, contato com a natureza e belas paisagens.",
    image: "/fotos_pousada/pousada_003.jpg",
  },
  {
    icon: Binoculars,
    title: "Observação de aves e natureza",
    text: "Região rica em fauna e manguezais para quem gosta de experiências naturais autênticas.",
    image: "/locais/golfinho.jpg",
  },
  {
    icon: UtensilsCrossed,
    title: "Gastronomia local e frutos do mar",
    text: "Sabores caiçaras, pratos regionais e restaurantes tradicionais no entorno.",
    image: "/locais/ostras2.jpg",
  },
  {
    icon: Fish,
    title: "Praias para caminhada e descanso",
    text: "Faixas de areia amplas para caminhar, relaxar e aproveitar o pôr do sol.",
    image: "/fotos_pousada/pousada_004.jpg",
  },
];

export function AttractionsSection() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-16 md:px-6">
      <SectionTitle
        eyebrow="O que fazer"
        title="O que fazer durante sua hospedagem em Pedrinhas"
        subtitle="Experiências reais da região para transformar sua viagem em descanso, natureza e boa gastronomia."
      />
      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {attractions.map((item) => (
          <article key={item.title} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_14px_38px_rgba(15,23,42,0.10)]">
            <div className="relative h-44 w-full">
              <Image src={item.image} alt={item.title} fill sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/55 to-transparent" />
            </div>
            <div className="p-5">
              <item.icon className="h-5 w-5 text-cyan-700" />
              <h3 className="mt-3 text-base font-extrabold text-slate-900">{item.title}</h3>
              <p className="mt-1 text-sm text-slate-600">{item.text}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
