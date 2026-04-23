import Link from "next/link";
import pousada from "@/data/pousada.json";
import { COMPANY_CNPJ, COMPANY_LEGAL_NAME, COMPANY_WHATSAPP_E164 } from "@/lib/company";

export function Footer() {
  const whatsappDigits = COMPANY_WHATSAPP_E164.replace(/\D/g, "");
  const whatsappHref = `https://wa.me/${whatsappDigits}`;

  return (
    <footer className="border-t border-slate-800 bg-slate-950 text-slate-200">
      <div className="mx-auto w-full max-w-7xl px-4 py-10 md:px-6 md:py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.14em] text-cyan-200">Pousada</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-300">
              <li><Link href="/" className="hover:text-white">Sobre</Link></li>
              <li><Link href="/quartos" className="hover:text-white">Acomodações</Link></li>
              <li><Link href="/localizacao" className="hover:text-white">Localização</Link></li>
              <li><a href={whatsappHref} className="hover:text-white">Contato / WhatsApp</a></li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-black uppercase tracking-[0.14em] text-cyan-200">Reserva</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-300">
              <li><Link href="/como-funciona-reserva" className="hover:text-white">Como funciona a reserva</Link></li>
              <li><Link href="/como-funciona-reserva" className="hover:text-white">Pré-reserva e pagamento</Link></li>
              <li><Link href="/politicas/reservas" className="hover:text-white">Check-in / Check-out</Link></li>
              <li><Link href="/politicas/reservas" className="hover:text-white">Dúvidas frequentes</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-black uppercase tracking-[0.14em] text-cyan-200">Políticas</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-300">
              <li><Link href="/politicas/reservas" className="hover:text-white">Política de reservas</Link></li>
              <li><Link href="/politicas/cancelamento" className="hover:text-white">Política de cancelamento</Link></li>
              <li><Link href="/politicas/privacidade" className="hover:text-white">Política de privacidade</Link></li>
              <li><Link href="/politicas/termos" className="hover:text-white">Termos de uso</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-black uppercase tracking-[0.14em] text-cyan-200">Contato</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-300">
              <li><a href={whatsappHref} className="hover:text-white">WhatsApp {COMPANY_WHATSAPP_E164}</a></li>
              <li><a href={whatsappHref} className="hover:text-white">Telefone {COMPANY_WHATSAPP_E164}</a></li>
              <li><a href="mailto:contato@pousadapedrinhas.com.br" className="hover:text-white">contato@pousadapedrinhas.com.br</a></li>
              <li>{pousada.endereco}</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/50 px-4 py-3 text-sm text-slate-300">
          Reserva simples, atendimento direto e confirmação rápida.
        </div>

        <div className="mt-6 border-t border-slate-800 pt-4 text-xs text-slate-500 md:flex md:items-center md:justify-between">
          <p>
            <span className="font-semibold text-slate-300">{COMPANY_LEGAL_NAME}</span>
            <span className="mx-1 text-slate-600">·</span>
            <span className="font-mono text-slate-400">CNPJ {COMPANY_CNPJ}</span>
          </p>
          <p className="mt-2 md:mt-0">© {new Date().getFullYear()} Pousada em Pedrinhas. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
