"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, LogOut, Settings, Users, Wallet, CalendarDays, CalendarRange } from "lucide-react";

const nav = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/reservas", label: "Reservas", icon: CalendarDays },
  { href: "/admin/calendario", label: "Calendário", icon: CalendarRange },
  { href: "/admin/clientes", label: "Clientes", icon: Users },
  { href: "/admin/financeiro", label: "Financeiro", icon: Wallet },
  { href: "/admin/configuracoes", label: "Configurações", icon: Settings },
];

export function AdminFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === "/admin/login";
  const [csrfToken, setCsrfToken] = useState("");

  useEffect(() => {
    fetch("/api/admin/auth/csrf")
      .then((response) => response.json())
      .then((json: { csrfToken?: string }) => {
        if (json.csrfToken) setCsrfToken(json.csrfToken);
      })
      .catch(() => {});
  }, []);

  async function logout() {
    await fetch("/api/admin/auth/logout", { method: "POST", headers: { "x-admin-csrf": csrfToken } });
    router.replace("/admin/login");
    router.refresh();
  }

  if (isLoginPage) {
    return <div className="min-h-screen bg-slate-100 px-4 py-12 md:px-6">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto grid w-full max-w-7xl gap-4 px-4 py-6 md:grid-cols-[250px_1fr] md:px-6">
        <aside className="rounded-2xl bg-slate-900 p-4 text-slate-100">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.25em] text-amber-300">Admin Pousada</p>
          <nav className="space-y-1">
            {nav.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                    active ? "bg-cyan-700 text-white" : "text-slate-200 hover:bg-slate-800"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <button
            type="button"
            onClick={logout}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm font-bold text-slate-100 hover:bg-slate-800"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </button>
        </aside>
        <main className="space-y-4">{children}</main>
      </div>
    </div>
  );
}
