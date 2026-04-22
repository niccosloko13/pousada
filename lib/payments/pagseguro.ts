import type { CreatePaymentPayload, CreatePaymentResult, PaymentProvider } from "@/lib/payments/base";

export class PagSeguroProvider implements PaymentProvider {
  readonly provider = "pagseguro" as const;

  async createPayment(payload: CreatePaymentPayload): Promise<CreatePaymentResult> {
    const publicUrl = process.env.PS_CHECKOUT_BASE_URL ?? "https://pagseguro.uol.com.br/checkout";

    return {
      provider: this.provider,
      paymentId: `ps_${payload.reservationCode}`,
      checkoutUrl: `${publicUrl}?reference=${payload.reservationCode}`,
      status: "ready",
    };
  }

  async parseWebhook(payload: unknown) {
    const data = payload as { code?: string; status?: string };
    return {
      paymentId: data.code ?? "ps_unknown",
      status: data.status ?? "pending",
    };
  }
}
