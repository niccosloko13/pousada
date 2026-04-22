import Link from "next/link";

const nav = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/reservas", label: "Reservas" },
  { href: "/admin/clientes", label: "Clientes" },
  { href: "/admin/financeiro", label: "Financeiro" },
  { href: "/admin/configuracoes", label: "Configurações" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto grid w-full max-w-7xl gap-4 px-4 py-6 md:grid-cols-[220px_1fr] md:px-6">
        <aside className="rounded-2xl bg-slate-900 p-4 text-slate-100">
          <p className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-amber-300">Admin Pousada</p>
          <nav className="space-y-1">
            {nav.map((item) => (
              <Link key={item.href} href={item.href} className="block rounded-lg px-3 py-2 text-sm font-medium transition hover:bg-slate-800">
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>
        <main>{children}</main>
      </div>
    </div>
  );
}
