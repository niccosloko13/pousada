import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";

export default function PoliticaCancelamentoPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="mx-auto w-full max-w-4xl px-4 py-10 md:px-6 md:py-14">
        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-800">Políticas</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 md:text-4xl">Política de cancelamento</h1>
          <div className="mt-6 space-y-4 text-sm leading-relaxed text-slate-700 md:text-[15px]">
            <p>Cancelamentos solicitados com antecedência podem gerar remarcação, crédito ou devolução, conforme prazo e condição da tarifa.</p>
            <p>Cancelamentos próximos à data do check-in podem ter retenção parcial ou integral do sinal de pré-reserva.</p>
            <p>Em caso de no-show (não comparecimento sem aviso), a pousada pode reter o sinal pago para cobertura operacional.</p>
            <p>Pedidos de remarcação dependem de disponibilidade para o novo período e eventual ajuste de tarifa.</p>
            <p>Situações excepcionais serão analisadas individualmente pela administração da pousada, com tratativa por escrito.</p>
            <p>Esta política pode ser atualizada; a versão válida é a vigente na data de confirmação da reserva.</p>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}
