import { mockReservations } from "@/data/admin-mock";

export default function AdminClientesPage() {
  const uniqueClients = Array.from(
    new Map(mockReservations.map((r) => [r.guestEmail, { nome: r.guestName, email: r.guestEmail, telefone: r.guestPhone }])).values(),
  );

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">Clientes</h1>
      <div className="grid gap-3 md:grid-cols-2">
        {uniqueClients.map((client) => (
          <article key={client.email} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="font-bold text-slate-900">{client.nome}</p>
            <p className="text-sm text-slate-600">{client.email}</p>
            <p className="text-sm text-slate-600">{client.telefone}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
