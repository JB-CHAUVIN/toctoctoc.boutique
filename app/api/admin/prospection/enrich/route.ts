import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { enrichLeadsWithDetails } from "@/lib/enrich-leads";

const schema = z.object({ streetId: z.string().min(1) });

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  if (dbUser?.role !== "ADMIN") return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });

  const enrichedCount = await enrichLeadsWithDetails(parsed.data.streetId);

  // Return updated leads
  const leads = await prisma.prospectLead.findMany({
    where: { streetId: parsed.data.streetId },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({
    success: true,
    data: { leads },
    meta: { enrichedCount },
  });
}
