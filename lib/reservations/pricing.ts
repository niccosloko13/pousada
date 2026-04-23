import type { Room } from "@prisma/client";
import { calcularNoites } from "@/lib/reservation";
import { HOUSE_PRICE_PER_PERSON, isHouseCategory } from "@/lib/reservations/businessRules";

export type StayBreakdown = {
  nights: number;
  pricingModel: "por_noite" | "por_pessoa";
  baseUnitLabel: string;
  baseUnitAmount: number;
  adults: number;
  childrenFree: number;
  childrenHalf: number;
  adultsTotal: number;
  childrenHalfTotal: number;
  childrenFreeTotal: number;
  subtotal: number;
  total: number;
};

export function computeStayPricing(
  room: Room,
  checkin: string,
  checkout: string,
  adults: number,
  childrenFree: number,
  childrenHalf: number,
): StayBreakdown {
  const nights = calcularNoites(checkin, checkout);
  const model = room.pricingModel === "por_pessoa" ? "por_pessoa" : "por_noite";

  if (model === "por_pessoa") {
    const totalGuests = adults + childrenFree + childrenHalf;
    const perPerson = isHouseCategory(room.category) ? HOUSE_PRICE_PER_PERSON : Number(room.pricePerPerson ?? 0);
    const adultsTotal = perPerson * adults * nights;
    const childrenHalfTotal = isHouseCategory(room.category) ? perPerson * childrenHalf * nights : perPerson * 0.5 * childrenHalf * nights;
    const childrenFreeTotal = isHouseCategory(room.category) ? perPerson * childrenFree * nights : 0;
    const subtotal = isHouseCategory(room.category)
      ? perPerson * totalGuests * nights
      : adultsTotal + childrenHalfTotal;

    return {
      nights,
      pricingModel: "por_pessoa",
      baseUnitLabel: isHouseCategory(room.category) ? "Tarifa por pessoa (casa)" : "Tarifa por pessoa",
      baseUnitAmount: perPerson,
      adults,
      childrenFree,
      childrenHalf,
      adultsTotal,
      childrenHalfTotal,
      childrenFreeTotal,
      subtotal,
      total: subtotal,
    };
  }

  const perNightCouple = Number(room.pricePerNight ?? 0);
  const adultFactor = Math.max(1, adults / 2);
  const adultsTotal = perNightCouple * adultFactor * nights;
  const meia = perNightCouple * 0.5;
  const childrenHalfTotal = meia * childrenHalf * nights;
  const childrenFreeTotal = 0;
  const subtotal = adultsTotal + childrenHalfTotal;

  return {
    nights,
    pricingModel: "por_noite",
    baseUnitLabel: "Diária base (casal)",
    baseUnitAmount: perNightCouple,
    adults,
    childrenFree,
    childrenHalf,
    adultsTotal,
    childrenHalfTotal,
    childrenFreeTotal,
    subtotal,
    total: subtotal,
  };
}
