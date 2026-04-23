import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminClientesPage() {
  const customers = await prisma.customer.findMany({
    orderBy: { createdAt: "desc" },
    take: 60,
    include: { _count: { select: { reservations: true } } },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">Clientes</h1>
      <div className="grid gap-3 md:grid-cols-2">
        {customers.map((client) => (
          <article key={client.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="font-bold text-slate-900">{client.name}</p>
            <p className="text-sm text-slate-600">{client.email}</p>
            <p className="text-sm text-slate-600">{client.phone}</p>
            <p className="mt-2 text-xs font-semibold text-slate-600">{client._count.reservations} reserva(s)</p>
          </article>
        ))}
      </div>
    </div>
  );
}
