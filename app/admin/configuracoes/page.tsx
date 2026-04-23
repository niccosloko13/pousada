export default function AdminConfiguracoesPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">Configurações</h1>
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="font-bold text-slate-900">Gateway de pagamento</h2>
        <p className="mt-1 text-sm text-slate-600">
          O checkout real usa credenciais do arquivo <span className="font-mono">.env</span> (não editamos segredos pelo painel).
        </p>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <label className="space-y-1 text-sm">
            <span className="font-medium text-slate-700">Gateway selecionado</span>
            <select className="h-10 w-full rounded-lg border border-slate-300 px-3">
              <option>Mercado Pago</option>
              <option>PagSeguro</option>
            </select>
          </label>
          <div className="rounded-lg border border-dashed border-cyan-300 bg-cyan-50 p-3 text-sm text-cyan-900">
            Variáveis ativas hoje: <span className="font-mono">MERCADOPAGO_ACCESS_TOKEN</span>, <span className="font-mono">MERCADOPAGO_PUBLIC_KEY</span>,{" "}
            <span className="font-mono">NEXT_PUBLIC_APP_URL</span>.
          </div>
          <label className="space-y-1 text-sm">
            <span className="font-medium text-slate-700">Public Key</span>
            <input className="h-10 w-full rounded-lg border border-slate-300 px-3" placeholder="Definir em MERCADOPAGO_PUBLIC_KEY" disabled />
          </label>
          <label className="space-y-1 text-sm">
            <span className="font-medium text-slate-700">Access Token / API Key</span>
            <input className="h-10 w-full rounded-lg border border-slate-300 px-3" placeholder="Definir em MERCADOPAGO_ACCESS_TOKEN" disabled />
          </label>
        </div>
      </section>
    </div>
  );
}
