import type { Quarto } from "@/types/pousada";

export type ReservaResumo = {
  noites: number;
  diaria: number;
  valorAdultos: number;
  valorCriancas: number;
  criancasFree: number;
  criancasHalf: number;
  adultos: number;
  subtotal: number;
  total: number;
};

export function parseDate(dateValue: string) {
  if (!dateValue) return null;
  const parsed = new Date(`${dateValue}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function calcularNoites(checkin: string, checkout: string) {
  const checkinDate = parseDate(checkin);
  const checkoutDate = parseDate(checkout);

  if (!checkinDate || !checkoutDate) return 1;

  const diffMs = checkoutDate.getTime() - checkinDate.getTime();
  const diffNoites = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return diffNoites > 0 ? diffNoites : 1;
}

type CalculoArgs = {
  quarto: Quarto;
  checkin: string;
  checkout: string;
  adultos: number;
  childrenFree: number;
  childrenHalf: number;
};

export function calcularValorCriancas(diariaBaseCasal: number, childrenHalf: number) {
  const meiaPorCrianca = diariaBaseCasal * 0.5;
  return childrenHalf * meiaPorCrianca;
}

export function calcularValorTotalReserva(
  diariaBaseCasal: number,
  noites: number,
  adultos: number,
  childrenHalf: number,
) {
  const fatorAdultos = Math.max(1, adultos / 2);
  const valorAdultos = diariaBaseCasal * fatorAdultos * noites;
  const valorCriancas = calcularValorCriancas(diariaBaseCasal, childrenHalf) * noites;
  const subtotal = valorAdultos + valorCriancas;

  return {
    valorAdultos,
    valorCriancas,
    subtotal,
    total: subtotal,
  };
}

export function calcularResumoReserva({
  quarto,
  checkin,
  checkout,
  adultos,
  childrenFree,
  childrenHalf,
}: CalculoArgs): ReservaResumo {
  const noites = calcularNoites(checkin, checkout);
  const isPorPessoa = quarto.preco_modelo === "por_pessoa";
  const diaria = isPorPessoa ? quarto.preco_por_pessoa ?? 140 : quarto.preco_por_noite;

  const totals = isPorPessoa
    ? {
        valorAdultos: diaria * adultos * noites,
        valorCriancas: diaria * 0.5 * childrenHalf * noites,
        subtotal: diaria * adultos * noites + diaria * 0.5 * childrenHalf * noites,
        total: diaria * adultos * noites + diaria * 0.5 * childrenHalf * noites,
      }
    : calcularValorTotalReserva(diaria, noites, adultos, childrenHalf);

  return {
    noites,
    diaria,
    valorAdultos: totals.valorAdultos,
    valorCriancas: totals.valorCriancas,
    criancasFree: childrenFree,
    criancasHalf: childrenHalf,
    adultos,
    subtotal: totals.subtotal,
    total: totals.total,
  };
}

export function formatCurrencyBRL(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}
