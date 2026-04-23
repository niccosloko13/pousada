import { NextResponse } from "next/server";
import { issueAdminCsrfToken } from "@/lib/adminCsrf";

export async function GET() {
  const token = await issueAdminCsrfToken();
  return NextResponse.json({ ok: true, csrfToken: token });
}
