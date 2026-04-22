import type { CreatePaymentPayload, CreatePaymentResult, PaymentProvider } from "@/lib/payments/base";

export class MercadoPagoProvider implements PaymentProvider {
  readonly provider = "mercadopago" as const;

  async createPayment(payload: CreatePaymentPayload): Promise<CreatePaymentResult> {
    const publicUrl = process.env.MP_CHECKOUT_BASE_URL ?? "https://www.mercadopago.com.br/checkout";

    return {
      provider: this.provider,
      paymentId: `mp_${payload.reservationCode}`,
      checkoutUrl: `${publicUrl}?external_reference=${payload.reservationCode}`,
      status: "ready",
    };
  }

  async parseWebhook(payload: unknown) {
    const data = payload as { id?: string; status?: string };
    return {
      paymentId: data.id ?? "mp_unknown",
      status: data.status ?? "pending",
    };
  }
}
