import { clearRateLimit, consumeRateLimit } from "@/lib/security/rateLimit";

const WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;

function keyFor(ip: string, email: string) {
  return `${ip}::${email.trim().toLowerCase()}`;
}

export async function assertAdminLoginRateLimit(ip: string, email: string) {
  return consumeRateLimit({
    scope: "admin_login",
    identifier: keyFor(ip, email),
    limit: MAX_ATTEMPTS,
    windowMs: WINDOW_MS,
    blockMs: WINDOW_MS,
  });
}

export async function clearAdminLoginAttempts(ip: string, email: string) {
  await clearRateLimit("admin_login", keyFor(ip, email));
}
