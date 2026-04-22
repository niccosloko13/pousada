type SectionTitleProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
};

export function SectionTitle({ eyebrow, title, subtitle }: SectionTitleProps) {
  return (
    <div className="max-w-2xl space-y-2">
      {eyebrow ? (
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">{eyebrow}</p>
      ) : null}
      <h2 className="text-2xl font-bold text-slate-900 md:text-3xl">{title}</h2>
      {subtitle ? <p className="text-slate-600">{subtitle}</p> : null}
    </div>
  );
}
