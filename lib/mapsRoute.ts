/**
 * Normaliza texto digitado pelo hóspede (espaços, unicode) para uso em links do Google Maps.
 */
export function normalizeUserLocationInput(raw: string): string {
  return raw
    .normalize("NFC")
    .replace(/\u00a0/g, " ")
    .replace(/[\u0000-\u001F\u007F]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Prepara origem para o Google Maps: limpa colagens estranhas, `+`, percent-encoding acidental,
 * caracteres invisíveis e reduz ruído comum que quebra a URL de direções.
 */
export function prepareOriginForMaps(raw: string): string {
  let s = normalizeUserLocationInput(raw);

  // Colagens vindas de URLs (ex.: "S%C3%A3o+Paulo")
  if (/%[0-9A-Fa-f]{2}/.test(s) && !/^https?:\/\//i.test(s)) {
    try {
      s = normalizeUserLocationInput(decodeURIComponent(s.replace(/\+/g, "%20")));
    } catch {
      // mantém string original
    }
  }

  s = s.replace(/\+/g, " ");
  s = s.replace(/[\u200B-\u200D\uFEFF]/g, "");
  s = s.replace(/[<>]/g, " ");
  s = s.replace(/\s*,\s*,/g, ", ");
  s = normalizeUserLocationInput(s);

  return s;
}

/** Apenas para heurísticas locais (estimativa de distância), comparação sem acento. */
export function stripAccents(value: string): string {
  return value.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
}

const DESTINATION_FALLBACK = "52 Rua Alípio Rosa de Oliveira, Ilha Comprida - SP, CEP 11925-000";

export function buildGoogleDirectionsUrl(originInput: string, destination?: string): string {
  const dest = (destination ?? DESTINATION_FALLBACK).trim() || DESTINATION_FALLBACK;
  const origin = prepareOriginForMaps(originInput);

  const params = new URLSearchParams();
  params.set("api", "1");
  params.set("destination", dest);
  params.set("travelmode", "driving");

  // Só envia origem quando há texto minimamente útil (evita "a" virar rota estranha)
  if (origin.length >= 2) {
    const originForMaps = origin.includes(",") ? origin : `${origin}, Brasil`;
    params.set("origin", originForMaps);
  }

  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

/** Link de lugar (sem origem) — útil como fallback e para “abrir mapa”. */
export function buildGooglePlaceSearchUrl(query: string): string {
  const q = prepareOriginForMaps(query) || DESTINATION_FALLBACK;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
}
