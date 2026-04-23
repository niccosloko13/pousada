import { NextResponse } from "next/server";
import { clearAdminSessionCookie, getAdminSession } from "@/lib/adminAuth";
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
  await clearAdminSessionCookie();
  return NextResponse.json({ ok: true });
}
