import type { Prisma, Room } from "@prisma/client";

export type RoomMetadata = {
  comodidades?: string[];
  destaque?: string;
  imagem_capa?: string;
  imagens?: string[];
};

export function parseRoomMetadata(metadata: Prisma.JsonValue | null | undefined): RoomMetadata {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) return {};
  return metadata as RoomMetadata;
}

export function categoryLabel(category: string) {
  if (category === "familia") return "Família";
  if (category === "casa") return "Casa";
  return "Casal";
}

export function categoryOrder(category: string) {
  if (category === "casal") return 0;
  if (category === "familia") return 1;
  if (category === "casa") return 2;
  return 9;
}

export function recommendRoomSlug(input: {
  rooms: Room[];
  totalGuests: number;
  childrenFree: number;
  childrenHalf: number;
}) {
  const scored = input.rooms.map((room) => {
    const fits = input.totalGuests <= room.capacity;
    const headroom = room.capacity - input.totalGuests;

    let score = 0;
    if (fits) score += 1000;
    score -= Math.abs(headroom) * 5;

    if (room.category === "casa" && input.totalGuests >= 7) score += 120;
    if (room.category === "familia" && input.totalGuests >= 4) score += 90;
    if (room.category === "casal" && input.totalGuests <= 3) score += 70;

    // slight preference when traveling mostly with small children
    if (input.childrenFree >= 2 && room.category === "familia") score += 40;

    // discourage "casa" for very small groups unless capacity forces it
    if (room.category === "casa" && input.totalGuests <= 3) score -= 80;

    // discourage tight fits
    if (fits && headroom === 0) score -= 10;

    return { room, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored[0]?.room.slug;
}
