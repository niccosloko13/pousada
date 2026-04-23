"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, LogIn } from "lucide-react";

type AdminLoginClientProps = {
  expiredByIdle: boolean;
};

export function AdminLoginClient({ expiredByIdle }: AdminLoginClientProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [csrfToken, setCsrfToken] = useState("");
  const [csrfReady, setCsrfReady] = useState(false);

  async function loadCsrf() {
    const response = await fetch("/api/admin/auth/csrf", { credentials: "same-origin" });
    const json = (await response.json()) as { csrfToken?: string };
    if (json.csrfToken) {
      setCsrfToken(json.csrfToken);
      setCsrfReady(true);
    } else {
      setCsrfReady(false);
    }
  }

  useEffect(() => {
    fetch("/api/admin/auth/csrf", { credentials: "same-origin" })
      .then((response) => response.json())
      .then((json: { csrfToken?: string }) => {
        if (json.csrfToken) {
          setCsrfToken(json.csrfToken);
          setCsrfReady(true);
        } else {
          setCsrfReady(false);
        }
      })
      .catch(() => {
        setCsrfReady(false);
      });
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (!csrfReady || !csrfToken) {
      setError("Token de segurança ainda não carregado. Tente novamente em instantes.");
      return;
    }
    setLoading(true);

    try {
      const response = await fetch("/api/admin/auth/login", {
        method: "POST",
        credentials: "same-origin",
        headers: { "content-type": "application/json", "x-admin-csrf": csrfToken },
        body: JSON.stringify({ email, password }),
      });
      const json = (await response.json()) as { ok?: boolean; error?: string; retryAfterMs?: number };
      if (!response.ok || !json.ok) {
        if (json.error === "TOO_MANY_ATTEMPTS") {
          setError("Muitas tentativas de login. Aguarde alguns minutos e tente novamente.");
        } else if (json.error === "MISSING_FIELDS") {
          setError("Preencha e-mail e senha.");
        } else if (json.error === "CSRF_INVALID") {
          await loadCsrf().catch(() => {});
          setError("Sessão de formulário inválida. Atualize a página e tente novamente.");
        } else {
          setError("Credenciais inválidas.");
        }
        setLoading(false);
        return;
      }

      router.replace("/admin");
      router.refresh();
    } catch {
      setError("Falha ao autenticar. Verifique sua conexão e tente novamente.");
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
      <div className="mb-6 text-center">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Admin seguro</p>
        <h1 className="mt-1 text-2xl font-black text-slate-900">Entrar no painel</h1>
        <p className="mt-2 text-sm text-slate-600">Acesso restrito para gestão da pousada.</p>
        {expiredByIdle ? (
          <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-900">
            Sua sessão expirou por inatividade. Faça login novamente para continuar.
          </p>
        ) : null}
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <label className="block space-y-1 text-sm font-medium text-slate-700">
          <span>E-mail</span>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            className="h-11 w-full rounded-xl border border-slate-300 px-3 outline-none ring-cyan-500 focus:ring-2"
            placeholder="admin@pousada.local"
            autoComplete="email"
          />
        </label>
        <label className="block space-y-1 text-sm font-medium text-slate-700">
          <span>Senha</span>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            className="h-11 w-full rounded-xl border border-slate-300 px-3 outline-none ring-cyan-500 focus:ring-2"
            placeholder="Sua senha"
            autoComplete="current-password"
          />
        </label>

        {error ? (
          <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-900">{error}</p>
        ) : null}

        <button
          type="submit"
          disabled={loading || !csrfReady}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-extrabold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? <Lock className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}
          {loading ? "Autenticando..." : !csrfReady ? "Preparando segurança..." : "Entrar no admin"}
        </button>
      </form>
    </div>
  );
}
