import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { ADMIN_ACTIVITY_COOKIE, ADMIN_IDLE_TIMEOUT_SECONDS, ADMIN_SESSION_COOKIE } from "@/lib/adminAuth";
import { getAdminSessionSecretValue } from "@/lib/adminSecrets";

function getSecret() {
  return new TextEncoder().encode(getAdminSessionSecretValue());
}

async function isAuthenticated(request: NextRequest) {
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const activityRaw = request.cookies.get(ADMIN_ACTIVITY_COOKIE)?.value;
  if (!token) return false;
  if (!activityRaw) return false;
  const lastActivity = Number(activityRaw);
  if (!Number.isFinite(lastActivity)) return false;
  if (Date.now() - lastActivity > ADMIN_IDLE_TIMEOUT_SECONDS * 1000) return false;
  const secret = getSecret();
  try {
    await jwtVerify(token, secret, { algorithms: ["HS256"] });
    return true;
  } catch {
    return false;
  }
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isAdminRoute = pathname.startsWith("/admin") || pathname.startsWith("/api/admin");
  if (!isAdminRoute) return NextResponse.next();

  const isLoginRoute = pathname === "/admin/login";
  const isApiAdmin = pathname.startsWith("/api/admin");
  const isPublicAdminApi = pathname === "/api/admin/auth/login" || pathname === "/api/admin/auth/csrf";
  const authed = await isAuthenticated(request);

  if (!authed && !isLoginRoute && !isPublicAdminApi) {
    if (isApiAdmin) {
      return NextResponse.json({ ok: false, error: "SESSION_EXPIRED" }, { status: 401 });
    }
    const loginUrl = new URL("/admin/login?reason=expired", request.url);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.set(ADMIN_SESSION_COOKIE, "", { path: "/", maxAge: 0 });
    response.cookies.set(ADMIN_ACTIVITY_COOKIE, "", { path: "/", maxAge: 0 });
    return response;
  }

  if (authed && isLoginRoute) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  const response = NextResponse.next();
  if (authed) {
    response.cookies.set(ADMIN_ACTIVITY_COOKIE, String(Date.now()), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 8,
    });
  }
  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
