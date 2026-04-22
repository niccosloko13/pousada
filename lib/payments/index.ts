import type { PaymentProviderName } from "@/lib/payments/base";
import { MercadoPagoProvider } from "@/lib/payments/mercadopago";
import { PagSeguroProvider } from "@/lib/payments/pagseguro";

export function getPaymentProvider(provider: PaymentProviderName) {
  if (provider === "pagseguro") return new PagSeguroProvider();
  return new MercadoPagoProvider();
}
