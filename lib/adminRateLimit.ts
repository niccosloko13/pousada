type AttemptEntry = {
  count: number;
  resetAt: number;
};

const attempts = new Map<string, AttemptEntry>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;

function keyFor(ip: string, email: string) {
  return `${ip}::${email.trim().toLowerCase()}`;
}

export function assertAdminLoginRateLimit(ip: string, email: string) {
  const key = keyFor(ip, email);
  const now = Date.now();
  const existing = attempts.get(key);

  if (!existing || existing.resetAt <= now) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { ok: true as const, remaining: MAX_ATTEMPTS - 1 };
  }

  if (existing.count >= MAX_ATTEMPTS) {
    return { ok: false as const, retryAfterMs: existing.resetAt - now };
  }

  existing.count += 1;
  attempts.set(key, existing);
  return { ok: true as const, remaining: MAX_ATTEMPTS - existing.count };
}

export function clearAdminLoginAttempts(ip: string, email: string) {
  attempts.delete(keyFor(ip, email));
}
