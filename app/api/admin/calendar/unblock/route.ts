import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminSession } from "@/lib/adminAuth";
import { validateAdminCsrf } from "@/lib/adminCsrf";
import { prisma } from "@/lib/prisma";

const bodySchema = z.object({
  roomId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

function dayBounds(dateIso: string) {
  const day = new Date(`${dateIso}T00:00:00`);
  const start = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 0, 0, 0, 0);
  const end = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 23, 59, 59, 999);
  return { start, end };
}

export async function POST(request: Request) {
  try {
    await requireAdminSession();
    const csrfOk = await validateAdminCsrf(request);
    if (!csrfOk) return NextResponse.json({ ok: false, error: "INVALID_CSRF" }, { status: 403 });

    const body = bodySchema.parse(await request.json());
    const { start, end } = dayBounds(body.date);

    await prisma.blockedDate.deleteMany({
      where: {
        roomId: body.roomId,
        reason: "manual_block",
        startDate: { lte: end },
        endDate: { gte: start },
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ ok: false, error: "INVALID_BODY" }, { status: 400 });
    return NextResponse.json({ ok: false, error: "UNKNOWN_ERROR" }, { status: 500 });
  }
}
