"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { AvailabilityCalendar } from "@/lib/calendar/availability";

type CalendarGridProps = {
  calendar: AvailabilityCalendar;
};

type OpenMenu = { roomId: string; iso: string } | null;

function cellTone(state: "available" | "reserved" | "blocked") {
  if (state === "reserved") return "border-rose-500 bg-rose-500/90 hover:bg-rose-500";
  if (state === "blocked") return "border-slate-400 bg-slate-300 hover:bg-slate-400";
  return "border-emerald-500 bg-emerald-500/85 hover:bg-emerald-500";
}

function roomGroupLabel(roomName: string, roomCategory: string) {
  const name = roomName.toLowerCase();
  const category = roomCategory.toLowerCase();
  if (name.includes("casa") || category.includes("casa")) return "Casa";
  if (name.includes("fam") || category.includes("familia")) return "Família";
  if (name.includes("primeiro andar") || name.includes("1º andar")) return "Primeiro andar";
  if (name.includes("térreo") || name.includes("terreo")) return "Térreo";
  return "Outras acomodações";
}

export function CalendarGrid({ calendar }: CalendarGridProps) {
  const router = useRouter();
  const [csrfToken, setCsrfToken] = useState("");
  const [openMenu, setOpenMenu] = useState<OpenMenu>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [loadingKey, setLoadingKey] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/auth/csrf")
      .then((response) => response.json())
      .then((json: { csrfToken?: string }) => {
        if (json.csrfToken) setCsrfToken(json.csrfToken);
      })
      .catch(() => {});
  }, []);

  const labels = useMemo(
    () => ({
      available: "Disponível",
      reserved: "Reservado",
      blocked: "Bloqueado manual",
    }),
    [],
  );

  const groupedRows = useMemo(() => {
    const order = ["Primeiro andar", "Térreo", "Família", "Casa", "Outras acomodações"];
    const map = new Map<string, typeof calendar.rows>();
    calendar.rows.forEach((row) => {
      const group = roomGroupLabel(row.roomName, row.roomCategory);
      map.set(group, [...(map.get(group) ?? []), row]);
    });
    return [...map.entries()].sort((a, b) => order.indexOf(a[0]) - order.indexOf(b[0]));
  }, [calendar]);

  async function doAction(action: "block" | "unblock", roomId: string, date: string) {
    const key = `${action}:${roomId}:${date}`;
    setLoadingKey(key);
    setFeedback(null);
    try {
      const response = await fetch(`/api/admin/calendar/${action}`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-admin-csrf": csrfToken,
        },
        body: JSON.stringify({ roomId, date }),
      });
      const json = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok || !json.ok) {
        if (json.error === "RESERVATION_EXISTS") {
          setFeedback("Este dia já está reservado e não pode ser bloqueado manualmente.");
        } else {
          setFeedback("Não foi possível concluir a ação. Tente novamente.");
        }
        return;
      }
      setOpenMenu(null);
      router.refresh();
    } catch {
      setFeedback("Falha de conexão ao salvar alteração.");
    } finally {
      setLoadingKey(null);
    }
  }

  return (
    <div className="space-y-4">
      {feedback ? <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-900">{feedback}</p> : null}

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-700">
          <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1"><span className="h-3 w-3 rounded bg-emerald-500" /> Disponível</span>
          <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1"><span className="h-3 w-3 rounded bg-rose-500" /> Reservado</span>
          <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1"><span className="h-3 w-3 rounded bg-slate-400" /> Bloqueado</span>
          <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1"><span className="h-3 w-3 rounded border-2 border-cyan-500 bg-cyan-100" /> Hoje</span>
          <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1"><span className="h-3 w-3 rounded bg-slate-200" /> Final de semana</span>
        </div>
      </div>

      <div className="overflow-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="min-w-[1320px]">
          <div className="sticky top-0 z-30 grid grid-cols-[320px_repeat(var(--days),minmax(38px,1fr))] border-b border-slate-200 bg-white" style={{ ["--days" as string]: calendar.days.length }}>
            <div className="sticky left-0 z-40 border-r border-slate-200 bg-white px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-600">Acomodações</div>
            {calendar.days.map((day) => (
              <div
                key={day.iso}
                className={`border-r border-slate-100 px-1 py-3 text-center text-[11px] font-semibold ${
                  day.isToday ? "bg-cyan-50 text-cyan-900" : day.isWeekend ? "bg-slate-50 text-slate-600" : "text-slate-700"
                }`}
                title={new Date(`${day.iso}T00:00:00`).toLocaleDateString("pt-BR")}
              >
                <p className="uppercase">{day.label.replace(".", "")}</p>
                <p className={`text-sm font-black ${day.isToday ? "text-cyan-900" : ""}`}>{day.dayNumber}</p>
              </div>
            ))}
          </div>

          <div>
            {groupedRows.map(([groupName, rows]) => (
              <div key={groupName}>
                <div className="sticky left-0 z-20 grid grid-cols-[320px_repeat(var(--days),minmax(38px,1fr))] border-y border-slate-200 bg-slate-900/95 text-white" style={{ ["--days" as string]: calendar.days.length }}>
                  <div className="sticky left-0 z-30 border-r border-slate-700 px-5 py-2.5 text-xs font-extrabold uppercase tracking-[0.15em] text-cyan-200">{groupName}</div>
                  <div className="col-span-full" />
                </div>

                {rows.map((row, idx) => (
                  <div
                    key={row.roomId}
                    className={`grid grid-cols-[320px_repeat(var(--days),minmax(38px,1fr))] border-b border-slate-100`}
                    style={{ ["--days" as string]: calendar.days.length }}
                  >
                    <div className={`sticky left-0 z-20 border-r border-slate-200 px-5 py-3 ${idx % 2 === 0 ? "bg-white" : "bg-slate-50"}`}>
                      <p className="text-sm font-bold text-slate-900">{row.roomName}</p>
                      <p className="text-xs text-slate-500">
                        {row.roomCategory} {row.isActive ? "" : "· inativo"}
                      </p>
                    </div>

                    {calendar.days.map((day) => {
                      const cell = row.cells[day.iso];
                      const key = `${row.roomId}:${day.iso}`;
                      const isOpen = openMenu?.roomId === row.roomId && openMenu?.iso === day.iso;

                      return (
                        <div key={key} className={`relative border-r border-slate-100 px-1 py-1.5 ${day.isWeekend ? "bg-slate-50/80" : idx % 2 === 1 ? "bg-slate-50/30" : "bg-white"}`}>
                          <button
                            type="button"
                            onClick={() => setOpenMenu(isOpen ? null : { roomId: row.roomId, iso: day.iso })}
                            className={`h-9 w-full rounded-md border shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] transition ${cellTone(cell.state)} ${
                              day.isToday ? "ring-2 ring-cyan-500 ring-offset-1 ring-offset-white" : ""
                            }`}
                            title={
                              cell.state === "reserved"
                                ? `${labels.reserved}: ${cell.guestName ?? "Hóspede"} (${cell.checkinLabel} → ${cell.checkoutLabel})`
                                : labels[cell.state]
                            }
                            aria-label={`${row.roomName} em ${day.iso}: ${labels[cell.state]}`}
                          />

                          {isOpen ? (
                            <div className="absolute left-1 top-12 z-40 w-52 rounded-xl border border-slate-200 bg-white p-2.5 shadow-2xl">
                              <p className="px-1 pb-2 text-xs font-semibold text-slate-600">{day.dayNumber}/{day.iso.slice(5, 7)} · {labels[cell.state]}</p>
                              {cell.state === "reserved" ? (
                                <div className="rounded-lg border border-rose-200 bg-rose-50 px-2 py-2 text-xs text-rose-900">
                                  <p className="font-semibold">{cell.guestName}</p>
                                  <p className="mt-1">{cell.checkinLabel} → {cell.checkoutLabel}</p>
                                </div>
                              ) : null}
                              <div className="mt-2 space-y-1">
                                <button
                                  type="button"
                                  disabled={cell.state === "reserved" || loadingKey === `block:${row.roomId}:${day.iso}`}
                                  onClick={() => doAction("block", row.roomId, day.iso)}
                                  className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-left text-xs font-semibold text-slate-800 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  Bloquear dia
                                </button>
                                <button
                                  type="button"
                                  disabled={cell.state !== "blocked" || loadingKey === `unblock:${row.roomId}:${day.iso}`}
                                  onClick={() => doAction("unblock", row.roomId, day.iso)}
                                  className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-left text-xs font-semibold text-slate-800 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  Desbloquear dia
                                </button>
                              </div>
                            </div>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
