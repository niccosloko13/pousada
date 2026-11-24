import { NextResponse } from "next/server";
import { ADMIN_ACTIVITY_COOKIE, ADMIN_SESSION_COOKIE, getAdminSession } from "@/lib/adminAuth";
import { writeAdminAuditLog } from "@/lib/adminAudit";
import { validateAdminCsrf } from "@/lib/adminCsrf";

export async function POST(request: Request) {
  const csrfOk = await validateAdminCsrf(request);
  if (!csrfOk) {
    return NextResponse.json({ ok: false, error: "CSRF_INVALID" }, { status: 403 });
  }
  const session = await getAdminSession();
  await writeAdminAuditLog({
    adminUserId: session?.userId ?? null,
    action: "admin.logout",
    resource: "auth",
    ip: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown",
    userAgent: request.headers.get("user-agent"),
  });
  const response = NextResponse.json({ ok: true });
  const cookieOptions = {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  };
  response.cookies.set(ADMIN_SESSION_COOKIE, "", cookieOptions);
  response.cookies.set(ADMIN_ACTIVITY_COOKIE, "", cookieOptions);
  return response;
}
