import { BadgeCheck, Building2, ShieldCheck, Sparkles, Wallet, Zap } from "lucide-react";
import { COMPANY_CNPJ, COMPANY_LEGAL_NAME } from "@/lib/company";
import { cn } from "@/lib/utils";

const CHIPS = [
  { Icon: ShieldCheck, label: "Reserva segura" },
  { Icon: Building2, label: "Atendimento direto da pousada" },
  { Icon: Sparkles, label: "Empresa registrada" },
  { Icon: BadgeCheck, label: "CNPJ verificado" },
  { Icon: Wallet, label: "Sem taxas escondidas" },
  { Icon: Zap, label: "Confirmação rápida" },
] as const;

type TrustSealBandProps = {
  className?: string;
  /** Fundo escuro (ex.: faixa da home atrás da busca) */
  tone?: "light" | "dark";
  showLegalLine?: boolean;
  align?: "start" | "center" | "end";
};

export function TrustSealBand({ className, tone = "light", showLegalLine = true, align = "center" }: TrustSealBandProps) {
  const chip =
    tone === "dark"
      ? "border-white/15 bg-white/5 text-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.25)]"
      : "border-slate-200/90 bg-white/90 text-slate-700 shadow-sm";

  const rowAlign =
    align === "end" ? "justify-end" : align === "start" ? "justify-start" : "justify-center md:justify-start";

  return (
    <div className={cn("space-y-3", className)}>
      <div className={cn("flex flex-wrap gap-2", rowAlign)}>
        {CHIPS.map(({ Icon, label }) => (
          <span
            key={label}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold tracking-tight backdrop-blur-sm",
              chip,
            )}
          >
            <Icon className="h-3.5 w-3.5 shrink-0 opacity-90" aria-hidden />
            {label}
          </span>
        ))}
      </div>
      {showLegalLine ? (
        <p
          className={cn(
            "text-[10px] leading-relaxed",
            align === "end" ? "text-right" : align === "start" ? "text-left" : "text-center md:text-left",
            tone === "dark" ? "text-slate-300" : "text-slate-500",
          )}
        >
          <span className={cn("font-semibold", tone === "dark" ? "text-white" : "text-slate-800")}>{COMPANY_LEGAL_NAME}</span>
          <span className={tone === "dark" ? "text-slate-400" : "text-slate-500"}> · </span>
          <span className="font-mono">CNPJ {COMPANY_CNPJ}</span>
        </p>
      ) : null}
    </div>
  );
}

export function LegalEntityMini({ tone = "light" }: { tone?: "light" | "dark" }) {
  return (
    <div
      className={cn(
        "rounded-2xl border px-3 py-2 text-[10px] leading-snug backdrop-blur-sm",
        tone === "dark" ? "border-white/15 bg-white/5 text-slate-200" : "border-slate-200/90 bg-white/90 text-slate-600",
      )}
    >
      <p className={cn("font-semibold", tone === "dark" ? "text-white" : "text-slate-900")}>{COMPANY_LEGAL_NAME}</p>
      <p className="mt-0.5 font-mono text-[10px]">CNPJ {COMPANY_CNPJ}</p>
    </div>
  );
}
