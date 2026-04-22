export type PaymentProviderName = "mercadopago" | "pagseguro";

export type CreatePaymentPayload = {
  reservationCode: string;
  amount: number;
  guestName: string;
  guestEmail: string;
  description: string;
};

export type CreatePaymentResult = {
  provider: PaymentProviderName;
  paymentId: string;
  checkoutUrl: string;
  status: "pending" | "ready";
};

export interface PaymentProvider {
  readonly provider: PaymentProviderName;
  createPayment(payload: CreatePaymentPayload): Promise<CreatePaymentResult>;
  parseWebhook(payload: unknown): Promise<{ paymentId: string; status: string }>;
}
