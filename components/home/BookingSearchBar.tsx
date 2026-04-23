"use client";

import { FormEvent, useMemo, useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useRouter } from "next/navigation";
import { CalendarDays, ChevronDown, MapPin, ShieldCheck, Star, Users } from "lucide-react";

type SearchState = {
  destino: string;
  checkin: string;
  checkout: string;
  adultos: number;
  criancasFree: number;
  criancasHalf: number;
  quartos: number;
};

const initialState: SearchState = {
  destino: "Pedrinhas, Ilha Comprida",
  checkin: "",
  checkout: "",
  adultos: 2,
  criancasFree: 0,
  criancasHalf: 0,
  quartos: 1,
};

type BookingSearchBarProps = {
  compact?: boolean;
};

export function BookingSearchBar({ compact = false }: BookingSearchBarProps) {
  const router = useRouter();
  const [state, setState] = useState<SearchState>(initialState);
  const [guestPickerOpen, setGuestPickerOpen] = useState(false);

  const guestsLabel = `${state.adultos} adulto${state.adultos > 1 ? "s" : ""}, ${
    state.criancasFree + state.criancasHalf
  } criança(s), ${state.quartos} quarto${state.quartos > 1 ? "s" : ""}`;

  const dateSummary = useMemo(() => {
    if (!state.checkin || !state.checkout) return "Selecione as datas";
    const checkinDate = new Date(`${state.checkin}T00:00:00`);
    const checkoutDate = new Date(`${state.checkout}T00:00:00`);
    return `${format(checkinDate, "dd MMM", { locale: ptBR })} - ${format(checkoutDate, "dd MMM", { locale: ptBR })}`;
  }, [state.checkin, state.checkout]);

  function updateCount(key: "adultos" | "criancasFree" | "criancasHalf" | "quartos", delta: number) {
    setState((old) => {
      const min = key === "criancasFree" || key === "criancasHalf" ? 0 : 1;
      return { ...old, [key]: Math.max(min, old[key] + delta) };
    });
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams({
      destino: state.destino,
      checkin: state.checkin,
      checkout: state.checkout,
      adultos: String(state.adultos),
      criancasFree: String(state.criancasFree),
      criancasHalf: String(state.criancasHalf),
      quartos: String(state.quartos),
    });

    router.push(`/reserva?${params.toString()}`);
    setGuestPickerOpen(false);
  }

  return (
    <form
      onSubmit={onSubmit}
      className={`mx-auto w-full max-w-7xl rounded-3xl border-4 border-amber-400 bg-white shadow-[0_24px_65px_rgba(2,6,23,0.28)] ${
        compact ? "p-2 md:p-3" : "p-3 md:p-4"
      }`}
    >
      <div className="mb-2 flex items-center justify-between gap-3 px-1">
        <p className="text-sm font-bold text-slate-900 md:text-base">Consulte disponibilidade e reserve direto com a pousada</p>
        <div className="flex items-center gap-3 text-[11px] font-semibold text-cyan-700 md:text-xs">
          <span className="inline-flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5" />
            Sem taxas escondidas
          </span>
          <span className="hidden items-center gap-1 sm:inline-flex">
            <Star className="h-3.5 w-3.5 fill-current" />
            Nota 9.0
          </span>
        </div>
      </div>
      <div className="grid gap-2 lg:grid-cols-[1.5fr_1.05fr_1.05fr_1.1fr_auto]">
        <label className="group flex min-h-14 flex-col justify-center rounded-xl border border-slate-300 px-3 transition focus-within:border-cyan-600 focus-within:ring-2 focus-within:ring-cyan-200">
          <span className="mb-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">Destino</span>
          <span className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-cyan-700" />
            <input
              value={state.destino}
              onChange={(e) => setState((old) => ({ ...old, destino: e.target.value }))}
              className="w-full text-sm font-semibold text-slate-900 outline-none"
              placeholder="Destino"
            />
          </span>
        </label>

        <label className="group flex min-h-14 flex-col justify-center rounded-xl border border-slate-300 px-3 transition focus-within:border-cyan-600 focus-within:ring-2 focus-within:ring-cyan-200">
          <span className="mb-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">Check-in</span>
          <span className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-cyan-700" />
            <input
              type="date"
              value={state.checkin}
              onChange={(e) => setState((old) => ({ ...old, checkin: e.target.value }))}
              className="w-full text-sm font-semibold text-slate-900 outline-none"
              required
            />
          </span>
        </label>

        <label className="group flex min-h-14 flex-col justify-center rounded-xl border border-slate-300 px-3 transition focus-within:border-cyan-600 focus-within:ring-2 focus-within:ring-cyan-200">
          <span className="mb-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">Check-out</span>
          <span className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-cyan-700" />
            <input
              type="date"
              value={state.checkout}
              onChange={(e) => setState((old) => ({ ...old, checkout: e.target.value }))}
              className="w-full text-sm font-semibold text-slate-900 outline-none"
              required
            />
          </span>
        </label>

        <div className="relative">
          <button
            type="button"
            onClick={() => setGuestPickerOpen((old) => !old)}
            className="flex min-h-14 w-full flex-col justify-center rounded-xl border border-slate-300 px-3 text-left transition hover:border-cyan-500 focus:border-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-200"
          >
            <span className="mb-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">Hóspedes e quartos</span>
            <span className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
                <Users className="h-4 w-4 text-cyan-700" />
                {guestsLabel}
              </span>
              <ChevronDown className={`h-4 w-4 text-slate-500 transition ${guestPickerOpen ? "rotate-180" : ""}`} />
            </span>
          </button>

          {guestPickerOpen ? (
            <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl">
              {[
                { key: "adultos", label: "Adultos", min: 1 },
                { key: "criancasFree", label: "Crianças 0-6 (não paga)", min: 0 },
                { key: "criancasHalf", label: "Crianças 7-12 (meia)", min: 0 },
                { key: "quartos", label: "Quartos", min: 1 },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between py-2">
                  <span className="text-sm font-medium text-slate-700">{item.label}</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="h-8 w-8 rounded-full border border-slate-300 text-lg font-bold text-slate-700 disabled:opacity-40"
                      onClick={() =>
                        updateCount(item.key as "adultos" | "criancasFree" | "criancasHalf" | "quartos", -1)
                      }
                      disabled={
                        state[item.key as "adultos" | "criancasFree" | "criancasHalf" | "quartos"] <= item.min
                      }
                    >
                      -
                    </button>
                    <span className="w-6 text-center text-sm font-semibold text-slate-900">
                      {state[item.key as "adultos" | "criancasFree" | "criancasHalf" | "quartos"]}
                    </span>
                    <button
                      type="button"
                      className="h-8 w-8 rounded-full border border-slate-300 text-lg font-bold text-slate-700"
                      onClick={() =>
                        updateCount(item.key as "adultos" | "criancasFree" | "criancasHalf" | "quartos", 1)
                      }
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setGuestPickerOpen(false)}
                className="mt-2 h-10 w-full rounded-lg bg-slate-900 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Confirmar seleção
              </button>
            </div>
          ) : null}
        </div>

        <button
          type="submit"
          className="h-14 rounded-xl bg-cyan-700 px-6 text-sm font-extrabold text-white shadow-lg shadow-cyan-900/30 transition hover:-translate-y-0.5 hover:bg-cyan-600 md:text-base"
        >
          Ver disponibilidade
        </button>
      </div>
      {!compact ? (
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
          <p>Período selecionado: <span className="font-semibold text-slate-700">{dateSummary}</span></p>
          <p className="font-semibold text-slate-700">Reserva direta, prática e com atendimento próprio</p>
        </div>
      ) : null}
    </form>
  );
}
