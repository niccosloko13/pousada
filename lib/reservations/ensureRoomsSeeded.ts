import pousada from "@/data/pousada.json";
import { prisma } from "@/lib/prisma";

let seedInFlight: Promise<void> | null = null;

function parseCapacity(capacity: string) {
  const match = capacity.match(/(\d+)/g);
  if (!match) return 2;
  const nums = match.map((n) => Number(n)).filter((n) => Number.isFinite(n));
  return nums.length ? Math.max(...nums) : 2;
}

async function seedRoomsFromCatalog() {
  for (const room of pousada.quartos) {
    const category = room.tipo === "casa" ? "casa" : room.tipo === "familia" ? "familia" : "casal";
    const pricingModel = room.preco_modelo === "por_pessoa" ? "por_pessoa" : "por_noite";

    await prisma.room.upsert({
      where: { slug: room.slug },
      create: {
        slug: room.slug,
        name: room.nome,
        description: room.descricao,
        category,
        capacity: parseCapacity(room.capacidade),
        bedSummary: room.tipo_de_cama,
        pricingModel,
        pricePerNight: pricingModel === "por_pessoa" ? null : room.preco_por_noite,
        pricePerPerson: pricingModel === "por_pessoa" ? (room.preco_por_pessoa ?? 140) : null,
        breakfastIncluded: room.cafe_da_manha_incluso,
        metadata: {
          comodidades: room.comodidades,
          destaque: room.destaque,
          imagem_capa: room.imagem_capa,
          imagens: room.imagens,
          quantidade_quartos: room.quantidade_quartos,
          quantidade_banheiros: room.quantidade_banheiros,
          sala: room.sala,
          cozinha_completa: room.cozinha_completa,
          varanda: room.varanda,
        },
      },
      update: {
        name: room.nome,
        description: room.descricao,
        category,
        capacity: parseCapacity(room.capacidade),
        bedSummary: room.tipo_de_cama,
        pricingModel,
        pricePerNight: pricingModel === "por_pessoa" ? null : room.preco_por_noite,
        pricePerPerson: pricingModel === "por_pessoa" ? (room.preco_por_pessoa ?? 140) : null,
        breakfastIncluded: room.cafe_da_manha_incluso,
        metadata: {
          comodidades: room.comodidades,
          destaque: room.destaque,
          imagem_capa: room.imagem_capa,
          imagens: room.imagens,
          quantidade_quartos: room.quantidade_quartos,
          quantidade_banheiros: room.quantidade_banheiros,
          sala: room.sala,
          cozinha_completa: room.cozinha_completa,
          varanda: room.varanda,
        },
      },
    });
  }
}

export async function ensureRoomsSeeded() {
  const count = await prisma.room.count();
  if (count > 0) return { seeded: false, count };

  if (!seedInFlight) {
    seedInFlight = seedRoomsFromCatalog();
  }

  await seedInFlight;
  const finalCount = await prisma.room.count();
  console.warn(`[reservations] Room catalog auto-seeded because database was empty. Loaded rooms: ${finalCount}`);
  return { seeded: true, count: finalCount };
}
