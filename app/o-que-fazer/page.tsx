import Image from "next/image";
import Link from "next/link";
import { Fish, Mountain, Sunset, Waves } from "lucide-react";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { ImageGallery } from "@/components/shared/ImageGallery";
import pousada from "@/data/pousada.json";
import type { PousadaData } from "@/types/pousada";

export default function OQueFazerPage() {
  const pousadaData = pousada as PousadaData;
  const locais = pousadaData.imagens_por_secao?.locais ?? [];

  const experiences = [
    {
      icon: Waves,
      title: "Praias de Ilha Comprida",
      description: "Faixa extensa de areia para caminhadas, banho de mar e dias de descanso em família.",
      image: locais[0] ?? "/locais/deck.jpg",
    },
    {
      icon: Fish,
      title: "Gastronomia local e frutos do mar",
      description: "Experiências gastronômicas regionais com clima de vila litorânea e culinária caiçara.",
      image: locais[3] ?? "/locais/ostras.jpg",
    },
    {
      icon: Mountain,
      title: "Passeios de natureza",
      description: "Trilhas, dunas e rios para quem busca contato com paisagens naturais do litoral sul.",
      image: locais[1] ?? "/locais/rio.jpg",
    },
    {
      icon: Sunset,
      title: "Pôr do sol e contemplação",
      description: "No fim do dia, cenários perfeitos para relaxar e aproveitar o ritmo tranquilo da região.",
      image: locais[2] ?? "/locais/golfinho.jpg",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <section className="relative overflow-hidden bg-slate-950 py-16 text-white">
          <Image src={locais[0] ?? "/locais/deck.jpg"} alt="Experiências em Ilha Comprida" fill className="object-cover opacity-35" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 to-cyan-950/65" />
          <div className="relative mx-auto w-full max-w-7xl px-4 md:px-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-300">Experiências em Ilha Comprida</p>
            <h1 className="mt-2 max-w-3xl text-3xl font-extrabold leading-tight md:text-5xl">
              O que fazer durante sua hospedagem
            </h1>
            <p className="mt-3 max-w-2xl text-slate-100">
              Roteiro com praia, natureza, gastronomia e descanso para aproveitar cada dia na região.
            </p>
          </div>
        </section>

        <section className="mx-auto w-full max-w-7xl px-4 py-14 md:px-6">
          <div className="grid gap-5 md:grid-cols-2">
            {experiences.map((experience) => (
              <article key={experience.title} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="relative h-52 w-full">
                  <Image src={experience.image} alt={experience.title} fill className="object-cover" />
                </div>
                <div className="p-5">
                  <p className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-700">
                    <experience.icon className="h-4 w-4" />
                    {experience.title}
                  </p>
                  <p className="mt-2 text-sm text-slate-700">{experience.description}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto w-full max-w-7xl px-4 pb-14 md:px-6">
          <ImageGallery title="Locais e experiências reais da região" images={locais} />
          <div className="mt-8 rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <h2 className="text-lg font-bold text-slate-900">Sugestão rápida de roteiro</h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              <li>Manhã: praia e caminhada no entorno.</li>
              <li>Tarde: passeio de barco, rio ou trilhas leves.</li>
              <li>Noite: gastronomia local com clima tranquilo em Pedrinhas.</li>
            </ul>
            <Link href="/reserva" className="mt-4 inline-flex rounded-xl bg-cyan-700 px-4 py-2.5 text-sm font-bold text-white">
              Reservar agora
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
