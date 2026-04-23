import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";

const steps = [
  "Escolha a acomodação ideal para seu grupo e período da viagem.",
  "Preencha os dados da estadia e do hóspede principal no checkout.",
  "Visualize o valor total da hospedagem com transparência.",
  "Pague 50% do total como sinal para garantir a pré-reserva.",
  "Receba a confirmação após aprovação do pagamento do sinal.",
  "Pague os 50% restantes no check-in, diretamente na pousada.",
];

export default function ComoFuncionaReservaPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="mx-auto w-full max-w-4xl px-4 py-10 md:px-6 md:py-14">
        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-800">Reserva online</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 md:text-4xl">Como funciona a pré-reserva</h1>
          <p className="mt-4 text-sm leading-relaxed text-slate-700 md:text-[15px]">
            Fluxo simples e transparente: você vê o valor total da hospedagem, paga apenas 50% agora e quita o restante no check-in.
          </p>

          <div className="mt-6 space-y-3">
            {steps.map((step, idx) => (
              <div key={step} className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cyan-700 text-xs font-black text-white">
                  {idx + 1}
                </span>
                <p className="text-sm text-slate-700">{step}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-2xl border border-cyan-200 bg-cyan-50 p-4">
            <p className="inline-flex items-center gap-2 text-sm font-extrabold text-cyan-950">
              <CheckCircle2 className="h-4 w-4" />
              Pré-reserva mediante pagamento de 50% do valor total.
            </p>
            <p className="mt-2 text-sm text-cyan-900">Saldo restante pago no check-in. Valores e confirmação sujeitos à compensação do sinal.</p>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/reserva" className="inline-flex h-11 items-center justify-center rounded-xl bg-slate-900 px-5 text-sm font-extrabold text-white hover:bg-slate-800">
              Buscar disponibilidade
            </Link>
            <Link href="/politicas/reservas" className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 text-sm font-bold text-slate-900 hover:bg-slate-50">
              Ler política de reservas
            </Link>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}
