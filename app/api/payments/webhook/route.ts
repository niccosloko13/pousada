import { NextResponse } from "next/server";
import { getPaymentProvider } from "@/lib/payments";
import type { PaymentProviderName } from "@/lib/payments/base";

export async function POST(request: Request) {
  const providerName = (request.headers.get("x-payment-provider") as PaymentProviderName | null) ?? "mercadopago";
  const provider = getPaymentProvider(providerName);
  const payload = await request.json();
  const parsed = await provider.parseWebhook(payload);

  return NextResponse.json({
    ok: true,
    provider: providerName,
    payment: parsed,
    message: "Webhook recebido. Persistência de status será conectada no módulo de reservas.",
  });
}
