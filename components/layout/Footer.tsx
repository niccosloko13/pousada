import { COMPANY_CNPJ, COMPANY_LEGAL_NAME } from "@/lib/company";

export function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 text-slate-200">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-10 md:flex-row md:items-center md:justify-between md:px-6">
        <div>
          <p className="font-semibold text-white">Pousada em Pedrinhas</p>
          <p className="text-sm text-slate-400">52 Rua Alípio Rosa de Oliveira, Ilha Comprida - SP</p>
          <p className="mt-3 max-w-xl text-[11px] leading-relaxed text-slate-500">
            <span className="font-semibold text-slate-300">{COMPANY_LEGAL_NAME}</span>
            <span className="mx-1 text-slate-600">·</span>
            <span className="font-mono text-slate-400">CNPJ {COMPANY_CNPJ}</span>
          </p>
        </div>
        <p className="max-w-sm text-sm text-slate-400">
          Reservas diretas com atendimento da pousada, transparência de valores e confirmação rápida após o pagamento.
        </p>
      </div>
    </footer>
  );
}
