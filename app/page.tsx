import { AmenitiesSection } from "@/components/home/AmenitiesSection";
import { AttractionsSection } from "@/components/home/AttractionsSection";
import { BookingSearchBar } from "@/components/home/BookingSearchBar";
import { FinalCTA } from "@/components/home/FinalCTA";
import { GalleryPreview } from "@/components/home/GalleryPreview";
import { GoogleReviewsSection } from "@/components/home/GoogleReviewsSection";
import { Hero } from "@/components/home/Hero";
import { Highlights } from "@/components/home/Highlights";
import { EnhancedLocationSection } from "@/components/home/EnhancedLocationSection";
import { RoomsPreview } from "@/components/home/RoomsPreview";
import { StickyBookingBar } from "@/components/home/StickyBookingBar";
import { TrustProofSection } from "@/components/home/TrustProofSection";
import { TrustSealBand } from "@/components/trust/TrustSealBand";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { CTAButton } from "@/components/ui/CTAButton";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <StickyBookingBar />
      <main className="pb-20 md:pb-0">
        <section id="busca" className="bg-slate-950 px-4 pb-8 pt-5 md:px-6 md:pb-10">
          <div className="mx-auto w-full max-w-7xl">
            <p className="mb-3 text-center text-xs font-semibold uppercase tracking-[0.18em] text-amber-300">
              Reserva Direta Em Pedrinhas
            </p>
            <p className="mb-3 text-center text-sm font-medium text-cyan-100">
              Atendimento da própria pousada, confirmação rápida e experiência pensada para você descansar melhor.
            </p>
            <BookingSearchBar />
            <TrustSealBand tone="dark" className="mt-5" showLegalLine={false} />
          </div>
        </section>
        <GoogleReviewsSection />
        <Hero />
        <RoomsPreview />
        <EnhancedLocationSection />
        <TrustProofSection />
        <Highlights />
        <GalleryPreview />
        <AmenitiesSection />
        <AttractionsSection />
        <FinalCTA />
      </main>
      <div className="fixed bottom-3 left-3 right-3 z-40 md:hidden">
        <CTAButton href="#busca" className="w-full py-3 text-sm font-extrabold shadow-xl">
          Ver disponibilidade agora
        </CTAButton>
      </div>
      <Footer />
    </div>
  );
}
