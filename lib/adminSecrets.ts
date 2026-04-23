export function getAdminSessionSecretValue() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (secret && secret.length >= 32) {
    return secret;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("ADMIN_SESSION_SECRET_INVALID");
  }

  if (!secret) {
    console.warn("[admin-security] ADMIN_SESSION_SECRET ausente em dev; usando segredo efemero não persistente.");
  } else {
    console.warn("[admin-security] ADMIN_SESSION_SECRET menor que 32 chars em dev; usando segredo efemero não persistente.");
  }
  return cryptoRandomDevSecret();
}

export function getAdminConfigSecretValue() {
  if (process.env.ADMIN_CONFIG_SECRET && process.env.ADMIN_CONFIG_SECRET.length >= 32) {
    return process.env.ADMIN_CONFIG_SECRET;
  }
  return getAdminSessionSecretValue();
}

function cryptoRandomDevSecret() {
  return `dev-only-${globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`}`;
}
