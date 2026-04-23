import bcrypt from "bcryptjs";
import pousada from "../data/pousada.json";
import { prisma } from "../lib/prisma";

function parseCapacity(capacity: string) {
  const match = capacity.match(/(\d+)/g);
  if (!match) return 2;
  const nums = match.map((n) => Number(n));
  return Math.max(...nums);
}

async function seedRooms() {
  for (const room of pousada.quartos) {
    const capacity = parseCapacity(room.capacidade);
    const category =
      room.tipo === "casa" ? "casa" : room.tipo === "familia" ? "familia" : "casal";

    await prisma.room.upsert({
      where: { slug: room.slug },
      create: {
        slug: room.slug,
        name: room.nome,
        description: room.descricao,
        category,
        capacity,
        bedSummary: room.tipo_de_cama,
        pricingModel: room.preco_modelo ?? "por_noite",
        pricePerNight: room.preco_modelo === "por_pessoa" ? null : room.preco_por_noite,
        pricePerPerson: room.preco_modelo === "por_pessoa" ? room.preco_por_pessoa ?? 140 : null,
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
        capacity,
        bedSummary: room.tipo_de_cama,
        pricingModel: room.preco_modelo ?? "por_noite",
        pricePerNight: room.preco_modelo === "por_pessoa" ? null : room.preco_por_noite,
        pricePerPerson: room.preco_modelo === "por_pessoa" ? room.preco_por_pessoa ?? 140 : null,
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

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL ?? "admin@pousada.local";
  const password = process.env.ADMIN_PASSWORD ?? "admin123";
  const hash = await bcrypt.hash(password, 10);

  await prisma.adminUser.upsert({
    where: { email },
    create: {
      email,
      name: "Administrador",
      password: hash,
    },
    update: {
      password: hash,
    },
  });
}

async function main() {
  await seedRooms();
  await seedAdmin();
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
