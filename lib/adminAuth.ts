import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAdminSessionSecretValue } from "@/lib/adminSecrets";

export const ADMIN_SESSION_COOKIE = "admin_session";
export const ADMIN_ACTIVITY_COOKIE = "admin_last_activity";
const SESSION_TTL_SECONDS = 60 * 60 * 8;
export const ADMIN_IDLE_TIMEOUT_SECONDS = 60 * 30;

type AdminJwtPayload = {
  sub: string;
  email: string;
  role: "admin";
};

function getSessionSecret() {
  return new TextEncoder().encode(getAdminSessionSecretValue());
}

export async function createAdminSessionToken(input: { userId: string; email: string }) {
  const now = Math.floor(Date.now() / 1000);
  return new SignJWT({ email: input.email, role: "admin" })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setSubject(input.userId)
    .setIssuedAt(now)
    .setExpirationTime(now + SESSION_TTL_SECONDS)
    .sign(getSessionSecret());
}

export async function verifyAdminSessionToken(token: string) {
  const verified = await jwtVerify<AdminJwtPayload>(token, getSessionSecret(), { algorithms: ["HS256"] });
  const payload = verified.payload;
  if (!payload.sub || !payload.email || payload.role !== "admin") {
    throw new Error("INVALID_ADMIN_SESSION");
  }
  return { userId: payload.sub, email: payload.email, exp: payload.exp ?? 0 };
}

export async function setAdminSessionCookie(token: string) {
  const store = await cookies();
  store.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
  store.set(ADMIN_ACTIVITY_COOKIE, String(Date.now()), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function clearAdminSessionCookie() {
  const store = await cookies();
  store.set(ADMIN_SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  store.set(ADMIN_ACTIVITY_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export async function getAdminSession() {
  const store = await cookies();
  const token = store.get(ADMIN_SESSION_COOKIE)?.value;
  const activityRaw = store.get(ADMIN_ACTIVITY_COOKIE)?.value;
  if (!token) return null;
  if (!activityRaw) return null;
  const lastActivity = Number(activityRaw);
  if (!Number.isFinite(lastActivity)) return null;
  if (Date.now() - lastActivity > ADMIN_IDLE_TIMEOUT_SECONDS * 1000) return null;
  try {
    return await verifyAdminSessionToken(token);
  } catch {
    return null;
  }
}

export async function requireAdminSession() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  return session;
}
