import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { ImageGallery } from "@/components/shared/ImageGallery";
import { SectionTitle } from "@/components/ui/SectionTitle";
import pousada from "@/data/pousada.json";
import type { PousadaData } from "@/types/pousada";

export default function GaleriaPage() {
  const pousadaData = pousada as PousadaData;

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="mx-auto w-full max-w-7xl space-y-10 px-4 py-16 md:px-6">
        <SectionTitle title="Galeria" subtitle="Ambientes da pousada para você conhecer antes da viagem." />
        <ImageGallery title="Pousada e áreas gerais" images={pousada.galeria} />
        <ImageGallery title="Quartos" images={pousadaData.imagens_por_secao?.quartos ?? []} />
        <ImageGallery title="Café da manhã" images={pousadaData.imagens_por_secao?.cafe_da_manha ?? []} />
        <ImageGallery title="Lazer" images={pousadaData.imagens_por_secao?.lazer ?? []} />
        <ImageGallery title="Casa para grupos" images={pousadaData.imagens_por_secao?.casa ?? []} />
      </main>
      <Footer />
    </div>
  );
}
