import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";

export default function PoliticaPrivacidadePage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="mx-auto w-full max-w-4xl px-4 py-10 md:px-6 md:py-14">
        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-800">Políticas</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 md:text-4xl">Política de privacidade</h1>
          <div className="mt-6 space-y-4 text-sm leading-relaxed text-slate-700 md:text-[15px]">
            <p>Coletamos dados informados no processo de reserva, como nome, e-mail, telefone e dados da estadia.</p>
            <p>Essas informações são usadas para atendimento, confirmação da pré-reserva, comunicação operacional e suporte ao hóspede.</p>
            <p>Podemos enviar mensagens relacionadas à reserva por e-mail ou WhatsApp, sempre com finalidade de atendimento.</p>
            <p>Adotamos medidas técnicas e organizacionais para reduzir risco de acesso não autorizado aos dados.</p>
            <p>Os dados são tratados apenas pelo tempo necessário para execução da reserva, obrigações legais e rotinas administrativas.</p>
            <p>Para solicitações sobre seus dados, utilize nosso canal de contato oficial disponível no rodapé do site.</p>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}
