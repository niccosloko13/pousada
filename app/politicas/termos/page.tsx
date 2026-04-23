import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";

export default function TermosUsoPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="mx-auto w-full max-w-4xl px-4 py-10 md:px-6 md:py-14">
        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-800">Políticas</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 md:text-4xl">Termos de uso</h1>
          <div className="mt-6 space-y-4 text-sm leading-relaxed text-slate-700 md:text-[15px]">
            <p>Ao utilizar este site, você concorda com as condições de uso e com as políticas de reserva vigentes.</p>
            <p>O hóspede é responsável pela veracidade dos dados informados durante o processo de reserva.</p>
            <p>A confirmação da hospedagem depende de disponibilidade e da compensação do sinal de pré-reserva (50% do total).</p>
            <p>Valores apresentados no sistema correspondem à hospedagem contratada para o período e configuração de hóspedes informados.</p>
            <p>Alterações, cancelamentos e remarcações seguem as regras oficiais da pousada e podem ter restrições por período.</p>
            <p>O uso indevido da plataforma pode resultar em bloqueio de acesso e medidas administrativas cabíveis.</p>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}
