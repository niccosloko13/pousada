import crypto from "node:crypto";
import { Channel } from "@prisma/client";
import type { Prisma } from "@prisma/client";
import { getAdminConfigSecretValue } from "@/lib/adminSecrets";
import { prisma } from "@/lib/prisma";

const CONFIG_MESSAGE = "gateway_config_v1";

type PersistedConfig = {
  gateway: "mercadopago" | "pagseguro";
  environment: "sandbox" | "production";
  publicKey: string;
  accessTokenEncrypted: string;
  accessTokenMask: string;
  webhookUrl: string;
  updatedAt: string;
};

function getCryptoSecret() {
  const secret = getAdminConfigSecretValue();
  return crypto.createHash("sha256").update(secret).digest();
}

function encryptSecret(value: string) {
  const iv = crypto.randomBytes(12);
  const key = getCryptoSecret();
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("base64")}.${tag.toString("base64")}.${encrypted.toString("base64")}`;
}

function decryptSecret(payload: string) {
  const [ivB64, tagB64, dataB64] = payload.split(".");
  if (!ivB64 || !tagB64 || !dataB64) return "";
  const key = getCryptoSecret();
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, Buffer.from(ivB64, "base64"));
  decipher.setAuthTag(Buffer.from(tagB64, "base64"));
  const decrypted = Buffer.concat([decipher.update(Buffer.from(dataB64, "base64")), decipher.final()]);
  return decrypted.toString("utf8");
}

function maskSecret(value: string) {
  if (!value) return "";
  if (value.length <= 8) return "********";
  return `${value.slice(0, 4)}••••${value.slice(-4)}`;
}

export async function getGatewayConfig() {
  const record = await prisma.channelSyncLog.findFirst({
    where: { channel: Channel.OTHER, message: CONFIG_MESSAGE },
    orderBy: { createdAt: "desc" },
  });

  const envPublicKey = process.env.MERCADOPAGO_PUBLIC_KEY ?? process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY ?? "";
  const envAccessToken = process.env.MERCADOPAGO_ACCESS_TOKEN ?? "";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const webhookUrl = `${appUrl}/api/payments/webhook`;

  if (!record?.payload || typeof record.payload !== "object") {
    const hasPublic = Boolean(envPublicKey);
    const hasToken = Boolean(envAccessToken);
    return {
      gateway: "mercadopago" as const,
      environment: envAccessToken.startsWith("APP_USR-") ? "production" : "sandbox",
      publicKey: envPublicKey,
      accessTokenMask: maskSecret(envAccessToken),
      webhookUrl,
      hasPublic,
      hasToken,
      status: resolveStatus(hasPublic, hasToken),
    };
  }

  const payload = record.payload as unknown as PersistedConfig;
  const decrypted = payload.accessTokenEncrypted ? decryptSecret(payload.accessTokenEncrypted) : "";
  const hasPublic = Boolean(payload.publicKey);
  const hasToken = Boolean(decrypted);
  return {
    gateway: payload.gateway ?? "mercadopago",
    environment: payload.environment ?? "sandbox",
    publicKey: payload.publicKey ?? "",
    accessTokenMask: payload.accessTokenMask || maskSecret(decrypted),
    webhookUrl: payload.webhookUrl || webhookUrl,
    hasPublic,
    hasToken,
    status: resolveStatus(hasPublic, hasToken),
  };
}

function resolveStatus(hasPublic: boolean, hasToken: boolean) {
  if (!hasPublic && !hasToken) return "not_configured";
  if (hasPublic !== hasToken) return "partial";
  return "ready_test";
}

export async function saveGatewayConfig(input: {
  gateway: "mercadopago" | "pagseguro";
  environment: "sandbox" | "production";
  publicKey: string;
  accessToken: string;
  webhookUrl: string;
}) {
  const payload: PersistedConfig = {
    gateway: input.gateway,
    environment: input.environment,
    publicKey: input.publicKey.trim(),
    accessTokenEncrypted: encryptSecret(input.accessToken.trim()),
    accessTokenMask: maskSecret(input.accessToken.trim()),
    webhookUrl: input.webhookUrl.trim(),
    updatedAt: new Date().toISOString(),
  };

  await prisma.channelSyncLog.create({
    data: {
      channel: Channel.OTHER,
      message: CONFIG_MESSAGE,
      payload: payload as unknown as Prisma.JsonObject,
    },
  });
}
