import Image from "next/image";
import Link from "next/link";
import { CTAButton } from "@/components/ui/CTAButton";

const navItems = [
  { href: "/quartos", label: "Quartos" },
  { href: "/galeria", label: "Galeria" },
  { href: "/localizacao", label: "Localização" },
  { href: "/o-que-fazer", label: "O que fazer" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 md:px-6">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logopousada.jpeg"
            alt="Logo da Pousada em Pedrinhas"
            width={64}
            height={64}
            className="h-14 w-14 rounded-full border-2 border-amber-300 object-cover shadow-md md:h-16 md:w-16"
            priority
          />
          <div>
            <p className="text-sm font-extrabold text-slate-900 md:text-base">Pousada em Pedrinhas</p>
            <p className="text-xs text-slate-600">Ilha Comprida - SP</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="text-sm font-medium text-slate-700 transition hover:text-cyan-700">
              {item.label}
            </Link>
          ))}
        </nav>

        <CTAButton href="/reserva" className="px-3 py-2 text-xs md:px-4 md:text-sm">
          Ver disponibilidade
        </CTAButton>
      </div>
    </header>
  );
}
