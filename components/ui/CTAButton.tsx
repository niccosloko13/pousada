import Link from "next/link";
import { cn } from "@/lib/utils";

type CTAButtonProps = {
  href: string;
  children: React.ReactNode;
  className?: string;
};

export function CTAButton({ href, children, className }: CTAButtonProps) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center justify-center rounded-xl bg-amber-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-400",
        className,
      )}
    >
      {children}
    </Link>
  );
}
