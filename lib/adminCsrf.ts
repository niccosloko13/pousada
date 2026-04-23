import crypto from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_CSRF_COOKIE = "admin_csrf";

export async function issueAdminCsrfToken() {
  const token = crypto.randomBytes(32).toString("hex");
  const store = await cookies();
  store.set(ADMIN_CSRF_COOKIE, token, {
    httpOnly: false,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  return token;
}

export async function validateAdminCsrf(request: Request) {
  const headerToken = request.headers.get("x-admin-csrf") ?? "";
  const store = await cookies();
  const cookieToken = store.get(ADMIN_CSRF_COOKIE)?.value ?? "";
  return Boolean(headerToken && cookieToken && headerToken === cookieToken);
}
