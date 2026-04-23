type SectionTitleProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  /** Fundo escuro (ex.: seções em slate-950) */
  variant?: "light" | "dark";
};

export function SectionTitle({ eyebrow, title, subtitle, variant = "light" }: SectionTitleProps) {
  const isDark = variant === "dark";

  return (
    <div className="max-w-2xl space-y-2">
      {eyebrow ? (
        <p
          className={`text-xs font-semibold uppercase tracking-[0.18em] ${isDark ? "text-amber-300/90" : "text-cyan-700"}`}
        >
          {eyebrow}
        </p>
      ) : null}
      <h2 className={`text-2xl font-bold md:text-3xl ${isDark ? "text-white" : "text-slate-900"}`}>{title}</h2>
      {subtitle ? <p className={isDark ? "text-slate-300" : "text-slate-600"}>{subtitle}</p> : null}
    </div>
  );
}
