import { NextResponse } from "next/server";
import { getPaymentProvider } from "@/lib/payments";
import type { PaymentProviderName } from "@/lib/payments/base";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    provider?: PaymentProviderName;
    reservationCode?: string;
    amount?: number;
    guestName?: string;
    guestEmail?: string;
    description?: string;
  };

  const providerName = body.provider ?? "mercadopago";
  const provider = getPaymentProvider(providerName);

  const payment = await provider.createPayment({
    reservationCode: body.reservationCode ?? "R-LOCAL-001",
    amount: body.amount ?? 0,
    guestName: body.guestName ?? "Hóspede",
    guestEmail: body.guestEmail ?? "hospede@example.com",
    description: body.description ?? "Reserva Pousada em Pedrinhas",
  });

  return NextResponse.json({
    ok: true,
    provider: providerName,
    payment,
    message: "Base de pagamento pronta para integração real com credenciais .env",
  });
}
