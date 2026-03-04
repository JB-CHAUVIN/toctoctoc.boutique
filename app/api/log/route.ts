import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const ALLOWED_ACTIONS = ["walkthrough.completed", "dashboard.configured"];

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  const body = await req.json();
  const { action, meta } = body as { action?: string; meta?: Record<string, unknown> };

  if (!action || !ALLOWED_ACTIONS.includes(action)) {
    return NextResponse.json({ error: "Action non autorisee" }, { status: 400 });
  }

  await prisma.log.create({
    data: {
      action,
      userId: session.user.id,
      meta: (meta ?? {}) as Record<string, string>,
    },
  });

  return NextResponse.json({ success: true });
}
