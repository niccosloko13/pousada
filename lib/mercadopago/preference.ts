import { MercadoPagoConfig, Preference } from "mercadopago";

export type CreatePreferenceInput = {
  title: string;
  amount: number;
  reservationCode: string;
  reservationAccessToken: string;
  payerEmail: string;
  payerName: string;
};

export async function createMercadoPagoPreference(input: CreatePreferenceInput) {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!accessToken) {
    throw new Error("MERCADOPAGO_ACCESS_TOKEN_MISSING");
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const client = new MercadoPagoConfig({ accessToken });
  const preference = new Preference(client);

  const body = {
    items: [
      {
        id: input.reservationCode,
        title: input.title,
        quantity: 1,
        currency_id: "BRL",
        unit_price: Number(input.amount.toFixed(2)),
      },
    ],
    payer: {
      name: input.payerName,
      email: input.payerEmail,
    },
    external_reference: input.reservationCode,
    metadata: {
      reservation_code: input.reservationCode,
    },
    payment_methods: {
      excluded_payment_methods: [],
      excluded_payment_types: [],
      installments: 12,
    },
    back_urls: {
      success: `${appUrl}/reserva/sucesso?code=${encodeURIComponent(input.reservationCode)}&t=${encodeURIComponent(input.reservationAccessToken)}`,
      failure: `${appUrl}/reserva/checkout?status=failure&code=${encodeURIComponent(input.reservationCode)}`,
      pending: `${appUrl}/reserva/sucesso?code=${encodeURIComponent(input.reservationCode)}&status=pending&t=${encodeURIComponent(input.reservationAccessToken)}`,
    },
    auto_return: "approved" as const,
    notification_url: `${appUrl}/api/payments/webhook`,
  };

  const response = await preference.create({ body });

  return {
    id: response.id,
    init_point: response.init_point,
    sandbox_init_point: response.sandbox_init_point,
    raw: response,
  };
}

export async function fetchMercadoPagoPayment(paymentId: string) {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!accessToken) {
    throw new Error("MERCADOPAGO_ACCESS_TOKEN_MISSING");
  }

  const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`MP_PAYMENT_FETCH_FAILED:${response.status}:${text}`);
  }

  return (await response.json()) as {
    id: string | number;
    status: string;
    external_reference?: string;
  };
}
