import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CalendarGrid } from "@/components/admin/CalendarGrid";
import { buildAvailabilityCalendar, monthParam, parseMonthInput } from "@/lib/calendar/availability";
import { requireAdminSession } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function pick(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AdminCalendarioPage({ searchParams }: PageProps) {
  await requireAdminSession();
  const params = (await searchParams) ?? {};
  const monthRaw = pick(params.month);
  const month = parseMonthInput(monthRaw);
  const prevMonth = new Date(month.getFullYear(), month.getMonth() - 1, 1);
  const nextMonth = new Date(month.getFullYear(), month.getMonth() + 1, 1);
  const calendar = await buildAvailabilityCalendar(month);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-900 to-slate-800 p-5 text-white shadow-[0_18px_60px_rgba(15,23,42,0.30)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">Gestão de disponibilidade</p>
            <h1 className="text-2xl font-black tracking-tight text-white">Calendário operacional</h1>
            <p className="text-sm text-slate-200">Leitura rápida por acomodação e dia para controle de reservas e bloqueios.</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/admin/calendario?month=${monthParam(prevMonth)}`}
              className="inline-flex h-9 items-center justify-center rounded-lg border border-white/20 bg-white/10 px-3 text-sm font-bold text-white hover:bg-white/20"
            >
              <ChevronLeft className="h-4 w-4" />
            </Link>
            <div className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm font-bold capitalize text-white">{calendar.monthLabel}</div>
            <Link
              href={`/admin/calendario?month=${monthParam(nextMonth)}`}
              className="inline-flex h-9 items-center justify-center rounded-lg border border-white/20 bg-white/10 px-3 text-sm font-bold text-white hover:bg-white/20"
            >
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      <CalendarGrid calendar={calendar} />
    </div>
  );
}
