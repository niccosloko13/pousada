import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/adminAuth";
import { writeAdminAuditLog } from "@/lib/adminAudit";
import { validateAdminCsrf } from "@/lib/adminCsrf";
import { getGatewayConfig, saveGatewayConfig } from "@/lib/adminGatewayConfig";

const bodySchema = z.object({
  gateway: z.enum(["mercadopago", "pagseguro"]),
  environment: z.enum(["sandbox", "production"]),
  publicKey: z.string().min(4),
  accessToken: z.string().min(10),
  webhookUrl: z.string().url(),
});

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ ok: false, error: "SESSION_EXPIRED" }, { status: 401 });
  const config = await getGatewayConfig();
  return NextResponse.json({ ok: true, config });
}

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ ok: false, error: "SESSION_EXPIRED" }, { status: 401 });
  const csrfOk = await validateAdminCsrf(request);
  if (!csrfOk) return NextResponse.json({ ok: false, error: "CSRF_INVALID" }, { status: 403 });

  const body = bodySchema.parse(await request.json());
  await saveGatewayConfig(body);
  await writeAdminAuditLog({
    adminUserId: session.userId,
    action: "admin.gateway_config.updated",
    resource: "gateway-config",
    ip: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown",
    userAgent: request.headers.get("user-agent"),
    metadata: { gateway: body.gateway, environment: body.environment, webhookUrl: body.webhookUrl },
  });
  const config = await getGatewayConfig();
  return NextResponse.json({ ok: true, config });
}
