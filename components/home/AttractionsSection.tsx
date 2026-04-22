import Image from "next/image";
import { Fish, Palmtree, Sun, Waves } from "lucide-react";
import { SectionTitle } from "@/components/ui/SectionTitle";

const attractions = [
  { icon: Waves, title: "Praias extensas", text: "Dias de sol com espaço para caminhar e relaxar.", image: "/quartos/praia.jpg" },
  { icon: Fish, title: "Pesca", text: "Região conhecida por experiências de pesca esportiva.", image: "/locais/ostras.jpg" },
  { icon: Palmtree, title: "Natureza", text: "Dunas, trilhas e paisagens naturais no entorno.", image: "/quartos/dunas.jpg" },
  { icon: Sun, title: "Descanso", text: "Ritmo tranquilo para recarregar as energias.", image: "/locais/deck.jpg" },
];

export function AttractionsSection() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-16 md:px-6">
      <SectionTitle
        eyebrow="O que fazer"
        title="Ilha Comprida para aproveitar cada momento"
        subtitle="Um destino ideal para praia, natureza e turismo de descanso."
      />
      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {attractions.map((item) => (
          <article key={item.title} className="overflow-hidden rounded-2xl bg-slate-900 text-white">
            <div className="relative h-36 w-full">
              <Image src={item.image} alt={item.title} fill className="object-cover opacity-80" />
            </div>
            <div className="p-5">
            <item.icon className="h-5 w-5 text-amber-300" />
            <h3 className="mt-3 font-semibold">{item.title}</h3>
            <p className="mt-1 text-sm text-slate-300">{item.text}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
