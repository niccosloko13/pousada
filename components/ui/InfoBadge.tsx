type InfoBadgeProps = {
  label: string;
};

export function InfoBadge({ label }: InfoBadgeProps) {
  return (
    <span className="inline-flex items-center rounded-full bg-cyan-100 px-3 py-1 text-xs font-semibold text-cyan-800">
      {label}
    </span>
  );
}
