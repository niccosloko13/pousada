import Link from "next/link";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { SectionTitle } from "@/components/ui/SectionTitle";
import pousada from "@/data/pousada.json";
import { prisma } from "@/lib/prisma";
import { isIsoDate, isValidIsoDateRange } from "@/lib/reservations/dateParams";
import { ensureRoomsSeeded } from "@/lib/reservations/ensureRoomsSeeded";
import { computeStayPricing } from "@/lib/reservations/pricing";
import type { PousadaData } from "@/types/pousada";
import { CheckoutClient } from "./CheckoutClient";

export const dynamic = "force-dynamic";

type CheckoutPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function getParam(value: string | string[] | undefined, fallback: string) {
  if (Array.isArray(value)) return value[0] ?? fallback;
  return value ?? fallback;
}

function parseGuests(value: string, fallback: number, min = 0) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.trunc(n));
}

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const pousadaData = pousada as PousadaData;
  const params = await searchParams;
  await ensureRoomsSeeded();

  const quartoSlug = getParam(params.quarto, getParam(params.roomSlug, ""));
  const roomId = getParam(params.roomId, "");
  const destino = getParam(params.destino, "Pedrinhas, Ilha Comprida");
  const checkin = getParam(params.checkin, "");
  const checkout = getParam(params.checkout, "");
  const adultos = parseGuests(getParam(params.adultos, "2"), 2, 1);
  const criancasFree = parseGuests(getParam(params.criancasFree, "0"), 0, 0);
  const criancasHalf = parseGuests(getParam(params.criancasHalf, "0"), 0, 0);
  const quartos = getParam(params.quartos, "1");
  const datesValid = isValidIsoDateRange(checkin, checkout);
  const hasRequiredSearch = Boolean(quartoSlug || roomId) && isIsoDate(checkin) && isIsoDate(checkout) && datesValid;

  if (!hasRequiredSearch) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <main className="mx-auto w-full max-w-4xl px-4 py-10 md:px-6 md:py-14">
          <SectionTitle
            eyebrow="Checkout"
            title="Dados da busca incompletos"
            subtitle="Para abrir o checkout com cálculo correto, selecione uma acomodação a partir da busca de disponibilidade."
          />
          <section className="mt-6 rounded-3xl border border-amber-200 bg-amber-50 p-6">
            <p className="text-sm text-amber-900">
              Verifique se a URL contém `checkin`, `checkout`, hóspedes e a acomodação selecionada. O check-out também precisa ser depois do check-in.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link href="/" className="inline-flex h-11 items-center justify-center rounded-xl bg-slate-900 px-4 text-sm font-bold text-white hover:bg-slate-800">
                Refazer busca na home
              </Link>
              <Link href="/reserva" className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-4 text-sm font-bold text-slate-800 hover:bg-slate-50">
                Ver página de reserva
              </Link>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  const room = quartoSlug
    ? await prisma.room.findUnique({ where: { slug: quartoSlug } })
    : roomId
      ? await prisma.room.findUnique({ where: { id: roomId } })
      : null;
  if (!room) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <main className="mx-auto w-full max-w-4xl px-4 py-10 md:px-6 md:py-14">
          <SectionTitle
            eyebrow="Checkout"
            title="Acomodação não encontrada"
            subtitle="A acomodação selecionada não foi localizada. Volte para escolher uma opção disponível."
          />
          <div className="mt-6">
            <Link
              href={`/reserva?destino=${encodeURIComponent(destino)}&checkin=${encodeURIComponent(checkin)}&checkout=${encodeURIComponent(checkout)}&adultos=${adultos}&criancasFree=${criancasFree}&criancasHalf=${criancasHalf}&quartos=${encodeURIComponent(quartos)}`}
              className="inline-flex h-11 items-center justify-center rounded-xl bg-slate-900 px-4 text-sm font-bold text-white hover:bg-slate-800"
            >
              Voltar para os resultados
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const breakdown = computeStayPricing(room, checkin, checkout, adultos, criancasFree, criancasHalf);
  const pricingModelLabel = breakdown.pricingModel === "por_pessoa" ? "Modelo de preço por pessoa (grupo)" : "Modelo de preço por diária";

  const mercadoPagoPublicKey = process.env.MERCADOPAGO_PUBLIC_KEY || process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY;

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="mx-auto w-full max-w-7xl px-4 py-10 md:px-6 md:py-14">
        <SectionTitle
          eyebrow="Reserva direta"
          title="Checkout seguro e transparente"
          subtitle="Etapas claras, resumo fixo ao lado e pagamento via Mercado Pago (Pix e cartão)."
        />

        <CheckoutClient
          destino={destino}
          checkin={checkin}
          checkout={checkout}
          adults={adultos}
          childrenFree={criancasFree}
          childrenHalf={criancasHalf}
          quartos={quartos}
          roomSlug={room.slug}
          roomId={room.id}
          roomName={room.name}
          bedSummary={room.bedSummary}
          breakfastIncluded={room.breakfastIncluded}
          pricingModelLabel={pricingModelLabel}
          breakdown={breakdown}
          pousadaNome={pousadaData.nome}
          mercadoPagoPublicKey={mercadoPagoPublicKey}
        />
      </main>
      <Footer />
    </div>
  );
}
