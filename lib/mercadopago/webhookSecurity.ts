import crypto from "node:crypto";

function parseSignatureHeader(header: string) {
  const parts = header.split(",").map((p) => p.trim());
  let ts = "";
  let v1 = "";
  for (const part of parts) {
    const [k, v] = part.split("=");
    if (k === "ts") ts = v ?? "";
    if (k === "v1") v1 = v ?? "";
  }
  return { ts, v1 };
}

function timingSafeEqualHex(a: string, b: string) {
  const aa = Buffer.from(a, "hex");
  const bb = Buffer.from(b, "hex");
  if (aa.length !== bb.length) return false;
  return crypto.timingSafeEqual(aa, bb);
}

export function validateMercadoPagoWebhookSignature(input: {
  signatureHeader: string | null;
  requestIdHeader: string | null;
  paymentId: string;
  webhookSecret: string;
}) {
  if (!input.signatureHeader || !input.requestIdHeader || !input.paymentId || !input.webhookSecret) {
    return false;
  }

  const { ts, v1 } = parseSignatureHeader(input.signatureHeader);
  if (!ts || !v1) return false;

  const manifest = `id:${input.paymentId};request-id:${input.requestIdHeader};ts:${ts};`;
  const expected = crypto.createHmac("sha256", input.webhookSecret).update(manifest).digest("hex");

  return timingSafeEqualHex(v1, expected);
}
