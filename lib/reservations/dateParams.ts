export function isIsoDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export function isValidIsoDateRange(checkinIso: string, checkoutIso: string) {
  if (!isIsoDate(checkinIso) || !isIsoDate(checkoutIso)) return false;
  const checkin = new Date(`${checkinIso}T00:00:00`);
  const checkout = new Date(`${checkoutIso}T00:00:00`);
  if (Number.isNaN(checkin.getTime()) || Number.isNaN(checkout.getTime())) return false;
  return checkout.getTime() > checkin.getTime();
}

export function formatDateBRFromIso(iso: string) {
  const [y, m, d] = iso.split("-").map((n) => Number(n));
  if (!y || !m || !d) return iso;
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(y, m - 1, d));
}
