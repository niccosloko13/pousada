import { cn } from "@/lib/utils";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};

export function Input({ label, className, ...props }: InputProps) {
  return (
    <label className="flex w-full flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
      <span>{label}</span>
      <input
        className={cn(
          "h-12 w-full rounded-lg border border-slate-200 px-3 text-sm text-slate-900 outline-none ring-cyan-500 transition focus:border-cyan-500 focus:ring-2",
          className,
        )}
        {...props}
      />
    </label>
  );
}
