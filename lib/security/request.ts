export function getClientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "unknown";
}

function getHostFromUrl(raw: string) {
  try {
    return new URL(raw).host;
  } catch {
    return "";
  }
}

export function isTrustedOrigin(request: Request, options?: { allowMissing?: boolean }) {
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const appHost = getHostFromUrl(appUrl);

  const incomingHost = getHostFromUrl(origin ?? referer ?? "");
  if (!incomingHost) return Boolean(options?.allowMissing);
  if (!appHost) return false;

  if (incomingHost === appHost) return true;
  if (process.env.NODE_ENV !== "production" && (incomingHost.startsWith("localhost:") || incomingHost.startsWith("127.0.0.1:"))) {
    return true;
  }
  return false;
}
