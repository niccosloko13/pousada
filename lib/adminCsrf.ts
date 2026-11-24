import crypto from "node:crypto";
import { isTrustedOrigin } from "@/lib/security/request";

export const ADMIN_CSRF_COOKIE = "admin_csrf";

export async function issueAdminCsrfToken() {
  return crypto.randomBytes(32).toString("hex");
}

export async function validateAdminCsrf(request: Request) {
  const headerToken = request.headers.get("x-admin-csrf") ?? "";
  const cookieHeader = request.headers.get("cookie") ?? "";
  const cookieToken =
    cookieHeader
      .split(";")
      .map((part) => part.trim())
      .find((part) => part.startsWith(`${ADMIN_CSRF_COOKIE}=`))
      ?.slice(ADMIN_CSRF_COOKIE.length + 1) ?? "";

  if (!isTrustedOrigin(request)) return false;
  if (!/^[a-f0-9]{64}$/i.test(headerToken) || !/^[a-f0-9]{64}$/i.test(cookieToken)) return false;

  return crypto.timingSafeEqual(Buffer.from(headerToken, "hex"), Buffer.from(cookieToken, "hex"));
}
