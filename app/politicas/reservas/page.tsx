import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";

export default function PoliticaReservasPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="mx-auto w-full max-w-4xl px-4 py-10 md:px-6 md:py-14">
        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-800">Políticas</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 md:text-4xl">Política de reservas</h1>
          <div className="mt-6 space-y-4 text-sm leading-relaxed text-slate-700 md:text-[15px]">
            <p>A pré-reserva é realizada mediante pagamento de <strong>50% do valor total da hospedagem</strong>.</p>
            <p>Os <strong>50% restantes</strong> devem ser pagos diretamente na pousada, no momento do check-in.</p>
            <p>A reserva é considerada confirmada após identificação e compensação do pagamento do sinal.</p>
            <p>Valores, datas e disponibilidade permanecem sujeitos à confirmação do pagamento dentro do prazo da pré-reserva.</p>
            <p>Pedidos de alteração de datas são avaliados conforme disponibilidade e políticas internas vigentes no período solicitado.</p>
            <p>Horário padrão: check-in a partir das 15h e check-out até 11h, salvo negociação prévia com a equipe.</p>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}
