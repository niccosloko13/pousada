import { CTAButton } from "@/components/ui/CTAButton";

export function FinalCTA() {
  return (
    <section className="bg-gradient-to-r from-cyan-800 to-slate-900 py-16 text-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col items-start justify-between gap-5 px-4 md:flex-row md:items-center md:px-6">
        <div>
          <h2 className="text-2xl font-bold md:text-3xl">Garanta sua hospedagem em Ilha Comprida</h2>
          <p className="mt-2 text-cyan-100">Consulte disponibilidade agora e reserve direto com a pousada.</p>
        </div>
        <CTAButton href="/reserva" className="bg-amber-400 text-slate-950 hover:bg-amber-300">
          Ver disponibilidade
        </CTAButton>
      </div>
    </section>
  );
}
