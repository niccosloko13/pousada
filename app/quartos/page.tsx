import Image from "next/image";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import pousada from "@/data/pousada.json";
import { AccommodationCard } from "@/components/quartos/AccommodationCard";
import { ImageGallery } from "@/components/shared/ImageGallery";
import { TrustSealBand } from "@/components/trust/TrustSealBand";
import type { PousadaData } from "@/types/pousada";

export default function QuartosPage() {
  const pousadaData = pousada as PousadaData;
  const suites = pousadaData.quartos.filter((quarto) => quarto.tipo !== "casa");
  const casa = pousadaData.quartos.find((quarto) => quarto.tipo === "casa");

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <section className="relative overflow-hidden bg-slate-950 py-16 text-white">
          <Image src="/quartos/cama4.jpg" alt="Quartos da pousada" fill className="object-cover opacity-35" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 to-cyan-950/65" />
          <div className="relative mx-auto w-full max-w-7xl px-4 md:px-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-300">Quartos e acomodações</p>
            <h1 className="mt-2 max-w-3xl text-3xl font-extrabold leading-tight md:text-5xl">
              Escolha a acomodação ideal para sua viagem
            </h1>
            <p className="mt-3 max-w-2xl text-slate-100">
              Quartos completos e casa para grupos com conforto, praticidade e atendimento direto da pousada.
            </p>
            <div className="mt-8 max-w-3xl rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md">
              <TrustSealBand tone="dark" align="start" />
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-7xl px-4 py-14 md:px-6">
          <h2 className="text-2xl font-bold text-slate-900">Suítes e apartamentos</h2>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {suites.map((quarto) => (
              <AccommodationCard key={quarto.id} quarto={quarto} />
            ))}
          </div>
        </section>

        {casa ? (
          <section className="bg-slate-50 py-14">
            <div className="mx-auto w-full max-w-7xl px-4 md:px-6">
              <h2 className="text-2xl font-bold text-slate-900">Casa para grupos e famílias</h2>
              <p className="mt-2 max-w-3xl text-slate-600">
                Opção especial para grupos grandes, com estrutura completa e conforto para até 11 pessoas em Pedrinhas.
              </p>
              <div className="mt-6">
                <AccommodationCard quarto={casa} />
              </div>
            </div>
          </section>
        ) : null}

        <section className="mx-auto w-full max-w-7xl space-y-10 px-4 py-14 md:px-6">
          <ImageGallery title="Ambientes dos quartos" images={pousadaData.imagens_por_secao?.quartos ?? []} />
          <ImageGallery title="Café da manhã incluso nas diárias" images={pousadaData.imagens_por_secao?.cafe_da_manha ?? []} />
          <ImageGallery title="Lazer e descanso na pousada" images={pousadaData.imagens_por_secao?.lazer ?? []} />
          {pousadaData.imagens_por_secao?.casa?.length ? (
            <ImageGallery title="Fotos da casa para aluguel" images={pousadaData.imagens_por_secao.casa} />
          ) : null}

          <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-700 shadow-sm">
            Todos os quartos padrão incluem cama de casal, cama de solteiro, ar-condicionado, TV Smart, Wi-Fi, frigobar, mini cozinha e banheiro privativo.
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
