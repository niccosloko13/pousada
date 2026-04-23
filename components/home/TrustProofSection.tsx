import { TrustSealBand } from "@/components/trust/TrustSealBand";
import { SectionTitle } from "@/components/ui/SectionTitle";

export function TrustProofSection() {
  return (
    <section className="border-y border-slate-200/80 bg-gradient-to-b from-slate-50 to-white py-16">
      <div className="mx-auto w-full max-w-7xl px-4 md:px-6">
        <SectionTitle
          eyebrow="Confiança"
          title="Reserva com transparência, do primeiro clique ao check-in"
          subtitle="Você fala direto com a pousada — com dados da empresa visíveis e processo claro."
        />
        <div className="mt-8 rounded-[1.75rem] border border-slate-200/90 bg-white p-6 shadow-[0_22px_60px_rgba(15,23,42,0.08)] md:p-8">
          <TrustSealBand tone="light" align="start" />
        </div>
      </div>
    </section>
  );
}
