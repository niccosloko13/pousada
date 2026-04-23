export function getAdminSessionSecretValue() {
  if (process.env.ADMIN_SESSION_SECRET && process.env.ADMIN_SESSION_SECRET.length >= 32) {
    return process.env.ADMIN_SESSION_SECRET;
  }
  const fallback = process.env.DATABASE_URL || "dev-admin-session-secret-local";
  return `fallback-${fallback}`;
}

export function getAdminConfigSecretValue() {
  if (process.env.ADMIN_CONFIG_SECRET && process.env.ADMIN_CONFIG_SECRET.length >= 32) {
    return process.env.ADMIN_CONFIG_SECRET;
  }
  return getAdminSessionSecretValue();
}
