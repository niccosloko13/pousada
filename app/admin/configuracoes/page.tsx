"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Eye, EyeOff, Info, Loader2, ShieldCheck } from "lucide-react";

type GatewayConfig = {
  gateway: "mercadopago" | "pagseguro";
  environment: "sandbox" | "production";
  publicKey: string;
  accessTokenMask: string;
  webhookUrl: string;
  hasPublic: boolean;
  hasToken: boolean;
  status: "not_configured" | "partial" | "ready_test";
};

const statusMap = {
  not_configured: { label: "Não configurado", classes: "bg-rose-100 text-rose-900 border-rose-200" },
  partial: { label: "Parcialmente configurado", classes: "bg-amber-100 text-amber-900 border-amber-200" },
  ready_test: { label: "Pronto para teste", classes: "bg-emerald-100 text-emerald-900 border-emerald-200" },
};

export default function AdminConfiguracoesPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showSecret, setShowSecret] = useState(false);
  const [csrfToken, setCsrfToken] = useState("");
  const [config, setConfig] = useState<GatewayConfig | null>(null);
  const [publicKey, setPublicKey] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [gateway, setGateway] = useState<"mercadopago" | "pagseguro">("mercadopago");
  const [environment, setEnvironment] = useState<"sandbox" | "production">("sandbox");
  const [webhookUrl, setWebhookUrl] = useState("");

  useEffect(() => {
    fetch("/api/admin/auth/csrf")
      .then((response) => response.json())
      .then((json: { csrfToken?: string }) => {
        if (json.csrfToken) setCsrfToken(json.csrfToken);
      })
      .catch(() => {});

    async function load() {
      const response = await fetch("/api/admin/gateway-config");
      const json = (await response.json()) as { ok?: boolean; config?: GatewayConfig; error?: string };
      if (!response.ok || !json.ok || !json.config) {
        setError(json.error === "SESSION_EXPIRED" ? "Sua sessão expirou. Faça login novamente." : "Não foi possível carregar as configurações do gateway.");
        setLoading(false);
        return;
      }

      setConfig(json.config);
      setPublicKey(json.config.publicKey ?? "");
      setGateway(json.config.gateway);
      setEnvironment(json.config.environment);
      setWebhookUrl(json.config.webhookUrl);
      setLoading(false);
    }

    load().catch(() => {
      setError("Falha ao carregar configurações.");
      setLoading(false);
    });
  }, []);

  const currentStatus = useMemo(() => {
    if (!config) return statusMap.not_configured;
    return statusMap[config.status];
  }, [config]);

  async function onSave() {
    setError(null);
    setSuccess(null);
    setSaving(true);
    try {
      const response = await fetch("/api/admin/gateway-config", {
        method: "POST",
        headers: { "content-type": "application/json", "x-admin-csrf": csrfToken },
        body: JSON.stringify({ gateway, environment, publicKey, accessToken, webhookUrl }),
      });
      const json = (await response.json()) as { ok?: boolean; config?: GatewayConfig; error?: string };
      if (!response.ok || !json.ok || !json.config) {
        if (json.error === "SESSION_EXPIRED") {
          setError("Sessão expirada por inatividade. Faça login novamente.");
        } else if (json.error === "CSRF_INVALID") {
          setError("Token de segurança inválido. Atualize a página e tente novamente.");
        } else {
          setError("Não foi possível salvar as configurações.");
        }
        setSaving(false);
        return;
      }
      setConfig(json.config);
      setAccessToken("");
      setSuccess("Configuração salva com sucesso. Segredo mantido apenas no backend.");
    } catch {
      setError("Falha de conexão ao salvar configuração.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Configurações do gateway</h1>
        <p className="mt-1 text-sm text-slate-600">Segredos ficam no backend; o painel nunca expõe Access Token em texto claro.</p>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        {loading ? (
          <p className="inline-flex items-center gap-2 text-sm text-slate-700">
            <Loader2 className="h-4 w-4 animate-spin" /> Carregando configurações...
          </p>
        ) : (
          <>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-slate-900">Gateway selecionado</p>
                <p className="text-xs text-slate-600">Checkout principal: Mercado Pago.</p>
              </div>
              <span className={`rounded-full border px-3 py-1 text-xs font-bold ${currentStatus.classes}`}>{currentStatus.label}</span>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <label className="space-y-1 text-sm">
                <span className="font-medium text-slate-700">Gateway</span>
                <select value={gateway} onChange={(e) => setGateway(e.target.value as "mercadopago" | "pagseguro")} className="h-10 w-full rounded-lg border border-slate-300 px-3">
                  <option value="mercadopago">Mercado Pago</option>
                  <option value="pagseguro">PagSeguro</option>
                </select>
              </label>
              <label className="space-y-1 text-sm">
                <span className="font-medium text-slate-700">Ambiente</span>
                <select value={environment} onChange={(e) => setEnvironment(e.target.value as "sandbox" | "production")} className="h-10 w-full rounded-lg border border-slate-300 px-3">
                  <option value="sandbox">Sandbox / Teste</option>
                  <option value="production">Produção</option>
                </select>
              </label>
              <label className="space-y-1 text-sm">
                <span className="font-medium text-slate-700">Public Key</span>
                <input value={publicKey} onChange={(e) => setPublicKey(e.target.value)} className="h-10 w-full rounded-lg border border-slate-300 px-3" placeholder="APP_USR-..." />
              </label>
              <label className="space-y-1 text-sm">
                <span className="font-medium text-slate-700">Access Token / API Key</span>
                <div className="flex items-center gap-2">
                  <input
                    value={accessToken}
                    onChange={(e) => setAccessToken(e.target.value)}
                    type={showSecret ? "text" : "password"}
                    className="h-10 w-full rounded-lg border border-slate-300 px-3"
                    placeholder={config?.accessTokenMask || "APP_USR-..."}
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecret((x) => !x)}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-700"
                  >
                    {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </label>
              <label className="space-y-1 text-sm md:col-span-2">
                <span className="font-medium text-slate-700">Webhook URL</span>
                <input value={webhookUrl} onChange={(e) => setWebhookUrl(e.target.value)} className="h-10 w-full rounded-lg border border-slate-300 px-3" />
              </label>
            </div>

            <div className="mt-4 rounded-xl border border-cyan-200 bg-cyan-50 p-3 text-sm text-cyan-900">
              <p className="inline-flex items-center gap-1 font-semibold">
                <Info className="h-4 w-4" />
                Sandbox vs produção
              </p>
              <p className="mt-1 text-xs">
                Sandbox é recomendado para testes operacionais. Em produção, valide chave pública, token e webhook antes de ativar o checkout real.
              </p>
            </div>

            <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
              <p className="inline-flex items-center gap-1 font-semibold">
                <ShieldCheck className="h-4 w-4" />
                Segurança de segredos
              </p>
              <p className="mt-1 text-xs">O valor sensível é processado e armazenado apenas no backend, com mascaramento no painel.</p>
            </div>

            {error ? <p className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-900">{error}</p> : null}
            {success ? (
              <p className="mt-3 inline-flex items-center gap-1 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
                <CheckCircle2 className="h-4 w-4" />
                {success}
              </p>
            ) : null}

            <button
              type="button"
              onClick={onSave}
              disabled={saving}
              className="mt-4 inline-flex h-11 items-center justify-center rounded-xl bg-slate-900 px-4 text-sm font-extrabold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Salvando..." : "Salvar configuração"}
            </button>
          </>
        )}
      </section>
    </div>
  );
}
