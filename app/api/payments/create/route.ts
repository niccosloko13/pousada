import { NextResponse } from "next/server";
import { z } from "zod";
import { getPaymentProvider } from "@/lib/payments";
import type { PaymentProviderName } from "@/lib/payments/base";
import { logSecurityEvent } from "@/lib/security/logger";
import { consumeRateLimit } from "@/lib/security/rateLimit";
import { getClientIp, isTrustedOrigin } from "@/lib/security/request";

const payloadSchema = z.object({
  provider: z.enum(["mercadopago", "pagseguro"]).optional(),
  reservationCode: z.string().min(3),
  amount: z.number().positive(),
  guestName: z.string().min(2),
  guestEmail: z.string().email(),
  description: z.string().min(3).max(200),
});

export async function POST(request: Request) {
  const ip = getClientIp(request);
  if (!isTrustedOrigin(request)) {
    logSecurityEvent("payments.create.invalid_origin", { ip });
    return NextResponse.json({ ok: false, error: "INVALID_ORIGIN" }, { status: 403 });
  }

  const rate = await consumeRateLimit({
    scope: "payments_create",
    identifier: ip,
    limit: 20,
    windowMs: 10 * 60 * 1000,
  });
  if (!rate.ok) {
    return NextResponse.json({ ok: false, error: "RATE_LIMITED", retryAfterMs: rate.retryAfterMs }, { status: 429 });
  }

  const parsed = payloadSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "INVALID_BODY", issues: parsed.error.issues }, { status: 400 });
  }
  const body = parsed.data as {
    provider?: PaymentProviderName;
    reservationCode: string;
    amount: number;
    guestName: string;
    guestEmail: string;
    description: string;
  };

  const providerName = body.provider ?? "mercadopago";
  const provider = getPaymentProvider(providerName);

  const payment = await provider.createPayment({
    reservationCode: body.reservationCode,
    amount: body.amount,
    guestName: body.guestName,
    guestEmail: body.guestEmail,
    description: body.description,
  });

  return NextResponse.json({
    ok: true,
    provider: providerName,
    payment,
    message: "Base de pagamento pronta para integração real com credenciais .env",
  });
}
