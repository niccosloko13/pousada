"use client";

import { useMemo, useState } from "react";
import { ExternalLink, MapPin, Navigation } from "lucide-react";
import { SectionTitle } from "@/components/ui/SectionTitle";
import pousada from "@/data/pousada.json";
import type { PousadaData } from "@/types/pousada";

const DESTINO_QUERY = "52 Rua Alípio Rosa de Oliveira, Ilha Comprida - SP, CEP 11925-000";

function estimateRoute(origin: string) {
  const text = origin.toLowerCase();
  if (!origin.trim()) return { distance: "--", duration: "--" };
  if (text.includes("são paulo") || text.includes("sao paulo")) return { distance: "230 km", duration: "3h 50min" };
  if (text.includes("santos")) return { distance: "170 km", duration: "2h 50min" };
  if (text.includes("registro")) return { distance: "70 km", duration: "1h 20min" };
  return { distance: "Distância variável", duration: "Tempo depende da rota" };
}

export function EnhancedLocationSection() {
  const pousadaData = pousada as PousadaData;
  const [origin, setOrigin] = useState("");
  const estimate = useMemo(() => estimateRoute(origin), [origin]);
  const routeUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin || "São Paulo")}&destination=${encodeURIComponent(
    DESTINO_QUERY,
  )}`;

  return (
    <section className="bg-slate-50 py-16">
      <div className="mx-auto w-full max-w-7xl space-y-6 px-4 md:px-6">
        <SectionTitle
          eyebrow="Localização em destaque"
          title="Chegue fácil à Pousada em Pedrinhas"
          subtitle="Localização estratégica em Ilha Comprida, com acesso simples e rota direta pelo Google Maps."
        />

        <div className="grid gap-5 lg:grid-cols-[1fr_1.2fr]">
          <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-700">
              <MapPin className="h-4 w-4" />
              Endereço oficial
            </p>
            <p className="mt-2 text-slate-700">{pousadaData.endereco}</p>

            <a
              href={pousadaData.link_google_maps ?? "https://maps.app.goo.gl/6KKtwnu5WcVBCkhL6"}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white"
            >
              Abrir no Google Maps
              <ExternalLink className="h-4 w-4" />
            </a>

            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-900">De onde você está saindo?</p>
              <input
                value={origin}
                onChange={(event) => setOrigin(event.target.value)}
                placeholder="Ex.: São Paulo, Santos, Registro..."
                className="mt-2 h-11 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none ring-cyan-500 focus:ring-2"
              />
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-600">
                <span className="rounded-full bg-white px-3 py-1">Distância estimada: {estimate.distance}</span>
                <span className="rounded-full bg-white px-3 py-1">Tempo estimado: {estimate.duration}</span>
              </div>
              <a
                href={routeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-2 rounded-lg bg-cyan-700 px-3 py-2 text-xs font-bold text-white"
              >
                <Navigation className="h-4 w-4" />
                Traçar rota no Google Maps
              </a>
            </div>
          </article>

          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <iframe
              title="Mapa da Pousada em Pedrinhas"
              src={`https://www.google.com/maps?q=${encodeURIComponent(DESTINO_QUERY)}&output=embed`}
              className="h-[430px] w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
