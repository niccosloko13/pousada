import { Footer } from "@/components/layout/Footer";
import { EnhancedLocationSection } from "@/components/home/EnhancedLocationSection";
import { Header } from "@/components/layout/Header";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { ImageGallery } from "@/components/shared/ImageGallery";
import pousada from "@/data/pousada.json";
import type { PousadaData } from "@/types/pousada";

export default function LocalizacaoPage() {
  const pousadaData = pousada as PousadaData;

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <section className="mx-auto w-full max-w-7xl px-4 py-12 md:px-6">
          <SectionTitle title="Localização" subtitle="Como chegar, calcular rota e explorar o entorno de Ilha Comprida." />
        </section>
        <EnhancedLocationSection />
        <section className="mx-auto w-full max-w-7xl px-4 py-12 md:px-6">
          <ImageGallery title="Locais próximos e experiências" images={pousadaData.imagens_por_secao?.locais ?? []} />
        </section>
      </main>
      <Footer />
    </div>
  );
}
