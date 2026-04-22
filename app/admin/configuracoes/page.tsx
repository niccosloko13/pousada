export default function AdminConfiguracoesPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">Configurações</h1>
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="font-bold text-slate-900">Gateway de pagamento</h2>
        <p className="mt-1 text-sm text-slate-600">Integração preparada para Mercado Pago e PagSeguro.</p>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <label className="space-y-1 text-sm">
            <span className="font-medium text-slate-700">Gateway selecionado</span>
            <select className="h-10 w-full rounded-lg border border-slate-300 px-3">
              <option>Mercado Pago</option>
              <option>PagSeguro</option>
            </select>
          </label>
          <div className="rounded-lg border border-dashed border-cyan-300 bg-cyan-50 p-3 text-sm text-cyan-900">
            Em breve integração ativa com credenciais de produção.
          </div>
          <label className="space-y-1 text-sm">
            <span className="font-medium text-slate-700">Public Key</span>
            <input className="h-10 w-full rounded-lg border border-slate-300 px-3" placeholder="Em breve via .env" />
          </label>
          <label className="space-y-1 text-sm">
            <span className="font-medium text-slate-700">Access Token / API Key</span>
            <input className="h-10 w-full rounded-lg border border-slate-300 px-3" placeholder="Em breve via .env" />
          </label>
        </div>
      </section>
    </div>
  );
}
