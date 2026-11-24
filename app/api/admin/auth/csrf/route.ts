import { NextResponse } from "next/server";
import { ADMIN_CSRF_COOKIE, issueAdminCsrfToken } from "@/lib/adminCsrf";

export const dynamic = "force-dynamic";

export async function GET() {
  const token = await issueAdminCsrfToken();
  const response = NextResponse.json({ ok: true, csrfToken: token });
  response.headers.set("Cache-Control", "no-store, max-age=0");
  response.cookies.set(ADMIN_CSRF_COOKIE, token, {
    httpOnly: false,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  return response;
}
