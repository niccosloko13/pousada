import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { createAdminSessionToken, setAdminSessionCookie } from "@/lib/adminAuth";
import { writeAdminAuditLog } from "@/lib/adminAudit";
import { validateAdminCsrf } from "@/lib/adminCsrf";
import { assertAdminLoginRateLimit, clearAdminLoginAttempts } from "@/lib/adminRateLimit";
import { prisma } from "@/lib/prisma";

type LoginBody = {
  email?: string;
  password?: string;
};

function unauthorized() {
  return NextResponse.json({ ok: false, error: "INVALID_CREDENTIALS" }, { status: 401 });
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const userAgent = request.headers.get("user-agent");
  const csrfOk = await validateAdminCsrf(request);
  if (!csrfOk) {
    return NextResponse.json({ ok: false, error: "CSRF_INVALID" }, { status: 403 });
  }
  const body = (await request.json()) as LoginBody;
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");

  if (!email || !password) {
    await writeAdminAuditLog({
      action: "admin.login.failed",
      resource: "auth",
      ip,
      userAgent,
      metadata: { reason: "missing_fields", email },
    });
    return NextResponse.json({ ok: false, error: "MISSING_FIELDS" }, { status: 400 });
  }

  const limit = await assertAdminLoginRateLimit(ip, email);
  if (!limit.ok) {
    await writeAdminAuditLog({
      action: "admin.login.blocked",
      resource: "auth",
      ip,
      userAgent,
      metadata: { reason: "too_many_attempts", email },
    });
    return NextResponse.json({ ok: false, error: "TOO_MANY_ATTEMPTS", retryAfterMs: limit.retryAfterMs }, { status: 429 });
  }

  const user = await prisma.adminUser.findUnique({ where: { email } });
  if (!user) {
    await writeAdminAuditLog({
      action: "admin.login.failed",
      resource: "auth",
      ip,
      userAgent,
      metadata: { reason: "invalid_credentials", email },
    });
    return unauthorized();
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    await writeAdminAuditLog({
      adminUserId: user.id,
      action: "admin.login.failed",
      resource: "auth",
      ip,
      userAgent,
      metadata: { reason: "invalid_credentials", email },
    });
    return unauthorized();
  }

  await clearAdminLoginAttempts(ip, email);
  const token = await createAdminSessionToken({ userId: user.id, email: user.email });
  await setAdminSessionCookie(token);
  await writeAdminAuditLog({
    adminUserId: user.id,
    action: "admin.login.success",
    resource: "auth",
    ip,
    userAgent,
    metadata: { email: user.email },
  });

  return NextResponse.json({ ok: true });
}
