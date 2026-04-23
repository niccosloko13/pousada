export const HOUSE_MIN_GUESTS = 10;
export const HOUSE_MIN_NIGHTS = 2;
export const HOUSE_PRICE_PER_PERSON = 100;

export function isHouseCategory(category: string) {
  return category === "casa";
}

export function validateHouseRules(input: { category: string; totalGuests: number; nights: number }) {
  if (!isHouseCategory(input.category)) {
    return { ok: true as const };
  }
  if (input.totalGuests < HOUSE_MIN_GUESTS) {
    return { ok: false as const, reason: "HOUSE_MIN_GUESTS" as const };
  }
  if (input.nights < HOUSE_MIN_NIGHTS) {
    return { ok: false as const, reason: "HOUSE_MIN_NIGHTS" as const };
  }
  return { ok: true as const };
}
