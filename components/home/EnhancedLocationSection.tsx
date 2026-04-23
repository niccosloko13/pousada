"use client";

import { useCallback, useMemo, useState } from "react";
import { ExternalLink, MapPin, MapPinned, Navigation, Route } from "lucide-react";
import { SectionTitle } from "@/components/ui/SectionTitle";
import pousada from "@/data/pousada.json";
import { buildGoogleDirectionsUrl, buildGooglePlaceSearchUrl, prepareOriginForMaps, stripAccents } from "@/lib/mapsRoute";
import { COMPANY_CNPJ, COMPANY_LEGAL_NAME } from "@/lib/company";
import type { PousadaData } from "@/types/pousada";

const MAPS_SHORT_LINK = "https://maps.app.goo.gl/6KKtwnu5WcVBCkhL6";

function estimateRoute(origin: string) {
  const text = stripAccents(origin);
  if (!origin.trim()) return { distance: "—", duration: "—" };
  if (text.includes("sao paulo")) return { distance: "≈ 230 km", duration: "≈ 3h 50" };
  if (text.includes("santos")) return { distance: "≈ 170 km", duration: "≈ 2h 50" };
  if (text.includes("registro")) return { distance: "≈ 70 km", duration: "≈ 1h 20" };
  if (text.includes("curitiba")) return { distance: "≈ 480 km", duration: "≈ 6h 30" };
  if (text.includes("rio de janeiro") || /^rio\b/.test(text)) {
    return { distance: "≈ 360 km", duration: "≈ 5h 20" };
  }
  if (text.includes("campinas")) return { distance: "≈ 280 km", duration: "≈ 4h 30" };
  if (text.includes("belo horizonte")) return { distance: "≈ 900 km", duration: "≈ 11h" };
  if (text.includes("florianopolis") || text.includes("floripa")) return { distance: "≈ 780 km", duration: "≈ 10h" };
  if (text.includes("joinville")) return { distance: "≈ 620 km", duration: "≈ 8h 30" };
  if (text.includes("londrina")) return { distance: "≈ 520 km", duration: "≈ 7h" };
  return { distance: "Rota no Maps", duration: "Tempo conforme trânsito" };
}

export function EnhancedLocationSection() {
  const pousadaData = pousada as PousadaData;
  const destination = pousadaData.endereco;
  const [origin, setOrigin] = useState("");

  const normalizedOrigin = useMemo(() => prepareOriginForMaps(origin), [origin]);
  const estimate = useMemo(() => estimateRoute(normalizedOrigin), [normalizedOrigin]);
  const routeUrl = useMemo(() => buildGoogleDirectionsUrl(normalizedOrigin, destination), [normalizedOrigin, destination]);
  const placeSearchUrl = useMemo(() => buildGooglePlaceSearchUrl(destination), [destination]);

  const originStatus = useMemo(() => {
    if (normalizedOrigin.length === 0) return { tone: "muted" as const, label: "Informe sua cidade para traçar a rota a partir da origem." };
    if (normalizedOrigin.length === 1) return { tone: "warn" as const, label: "Digite pelo menos 2 caracteres para definir a origem da rota." };
    return { tone: "ok" as const, label: "Origem pronta — a rota será aberta no Google Maps com destino na pousada." };
  }, [normalizedOrigin.length]);

  const openRoute = useCallback(() => {
    window.open(routeUrl, "_blank", "noopener,noreferrer");
  }, [routeUrl]);

  const onOriginBlur = useCallback(() => {
    setOrigin((prev) => prepareOriginForMaps(prev));
  }, []);

  const embedQuery = destination;

  return (
    <section className="bg-gradient-to-b from-slate-50 via-white to-slate-50 py-16 md:py-20">
      <div className="mx-auto w-full max-w-7xl space-y-10 px-4 md:px-6">
        <SectionTitle
          eyebrow="Localização"
          title="Encontre a pousada e trace sua rota com um clique"
          subtitle="Mapa ampliado, endereço oficial e campo de origem pensado para qualquer cidade — com normalização e link correto para o Google Maps."
        />

        {/* Mapa em destaque — largura quase full-bleed no mobile */}
        <div className="relative -mx-4 overflow-hidden rounded-[1.75rem] border border-slate-200/90 bg-slate-950 shadow-[0_32px_90px_rgba(15,23,42,0.18)] ring-1 ring-slate-900/10 md:mx-0">
          <div className="pointer-events-none absolute left-4 top-4 z-10 inline-flex items-center gap-2 rounded-full border border-white/20 bg-slate-950/70 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white backdrop-blur-md">
            <MapPinned className="h-3.5 w-3.5 text-amber-300" />
            Mapa interativo
          </div>
          <iframe
            title="Mapa da Pousada em Pedrinhas"
            src={`https://www.google.com/maps?q=${encodeURIComponent(embedQuery)}&output=embed`}
            className="aspect-[16/11] min-h-[340px] w-full md:min-h-[520px] lg:min-h-[580px]"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/10 bg-slate-950/90 px-4 py-3 text-[11px] text-slate-200">
            <span className="font-medium text-slate-300">{COMPANY_LEGAL_NAME}</span>
            <span className="font-mono text-slate-200">CNPJ {COMPANY_CNPJ}</span>
            <a
              href={placeSearchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto inline-flex items-center gap-1 font-semibold text-amber-300 underline decoration-amber-400/60 underline-offset-2 hover:text-amber-200"
            >
              Abrir mapa ampliado
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_1fr] lg:items-start">
          <article className="flex flex-col rounded-[1.75rem] border border-slate-200/90 bg-white p-6 shadow-[0_22px_60px_rgba(15,23,42,0.08)] md:p-7">
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-800">
              <MapPin className="h-4 w-4" />
              Endereço oficial
            </p>
            <p className="mt-3 text-base leading-relaxed text-slate-700">{destination}</p>

            <div className="mt-5 flex flex-wrap gap-3">
              <a
                href={MAPS_SHORT_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-slate-900/20 transition hover:bg-slate-800"
              >
                Abrir no Google Maps
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>

            <form
              className="mt-8 rounded-2xl border border-slate-200/90 bg-slate-50/90 p-5"
              onSubmit={(event) => {
                event.preventDefault();
                openRoute();
              }}
            >
              <p className="text-sm font-bold text-slate-900">De onde você está saindo?</p>
              <p className="mt-1 text-xs text-slate-600">
                Aceita cidade, bairro ou referência. Corrigimos espaços duplos, sinais &quot;+&quot;, colagens codificadas (%C3%A3…) e caracteres invisíveis. A rota usa{" "}
                <span className="font-semibold">encodeURIComponent</span> via parâmetros oficiais do Google.
              </p>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-stretch">
                <div className="relative min-w-0 flex-1">
                  <Route className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cyan-700" />
                  <input
                    value={origin}
                    onChange={(event) => setOrigin(event.target.value)}
                    onBlur={onOriginBlur}
                    placeholder="Ex.: São Paulo, Santos, Curitiba, Florianópolis..."
                    autoComplete="address-level2"
                    className="h-12 w-full rounded-2xl border border-slate-300 bg-white pl-10 pr-3 text-sm font-medium text-slate-900 shadow-sm outline-none ring-cyan-500/40 transition focus:border-cyan-500 focus:ring-4"
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-2xl bg-cyan-700 px-5 text-sm font-extrabold text-white shadow-lg shadow-cyan-900/25 transition hover:bg-cyan-600"
                >
                  <Navigation className="h-4 w-4" />
                  Traçar rota
                </button>
              </div>

              <p
                className={`mt-3 text-xs font-medium ${
                  originStatus.tone === "ok"
                    ? "text-emerald-800"
                    : originStatus.tone === "warn"
                      ? "text-amber-800"
                      : "text-slate-500"
                }`}
              >
                {originStatus.label}
              </p>

              <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-semibold text-slate-600">
                <span className="rounded-full border border-slate-200 bg-white px-3 py-1">Distância: {estimate.distance}</span>
                <span className="rounded-full border border-slate-200 bg-white px-3 py-1">Tempo: {estimate.duration}</span>
              </div>

              <button
                type="button"
                onClick={() => window.open(routeUrl, "_blank", "noopener,noreferrer")}
                className="mt-3 text-left text-xs font-semibold text-cyan-800 underline decoration-cyan-300 decoration-2 underline-offset-2 hover:text-cyan-700"
              >
                Preferir abrir a URL da rota diretamente?
              </button>
            </form>
          </article>

          <aside className="rounded-[1.75rem] border border-cyan-200/80 bg-gradient-to-br from-cyan-50 to-white p-6 shadow-sm md:p-7">
            <p className="text-sm font-extrabold text-cyan-950">Confiança na localização</p>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              Você está vendo o endereço e o mapa da <span className="font-semibold text-slate-900">{COMPANY_LEGAL_NAME}</span>, CNPJ{" "}
              <span className="font-mono font-semibold">{COMPANY_CNPJ}</span>.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-slate-700">
              <li>• Mapa oficial do Google embutido no site.</li>
              <li>• Botão de rota com parâmetros <span className="font-mono text-xs">api=1</span> e destino fixo na pousada.</li>
              <li>• Origem opcional: se estiver vazia, o Google abre a rota a partir do destino.</li>
            </ul>
          </aside>
        </div>
      </div>
    </section>
  );
}
