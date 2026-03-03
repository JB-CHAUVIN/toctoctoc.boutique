import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const configSchema = z.object({
  cardColor: z.string().optional(),
  cardTextColor: z.string().optional(),
  stampColor: z.string().optional(),
  stampIcon: z.string().max(4).optional(),
  stampsRequired: z.number().min(2).max(10).optional(),
  rewardName: z.string().min(1).optional(),
  rewardDescription: z.string().optional(),
  stampExpiryDays: z.number().min(1).optional().nullable(),
});

async function getAdminFlag(userId: string) {
  const dbUser = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
  return dbUser?.role === "ADMIN";
}

export async function GET(req: Request, { params }: { params: { businessId: string } }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const isAdmin = await getAdminFlag(session.user.id);
  const config = await prisma.loyaltyConfig.findFirst({
    where: isAdmin
      ? { businessId: params.businessId }
      : { businessId: params.businessId, business: { userId: session.user.id } },
  });

  if (!config) return NextResponse.json({ error: "Configuration introuvable" }, { status: 404 });

  return NextResponse.json({ success: true, data: config });
}

export async function PATCH(req: Request, { params }: { params: { businessId: string } }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const isAdmin = await getAdminFlag(session.user.id);
  const business = await prisma.business.findFirst({
    where: isAdmin ? { id: params.businessId } : { id: params.businessId, userId: session.user.id },
  });
  if (!business) return NextResponse.json({ error: "Commerce introuvable" }, { status: 404 });

  const body = await req.json();
  const parsed = configSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const config = await prisma.loyaltyConfig.upsert({
    where: { businessId: params.businessId },
    update: parsed.data,
    create: { businessId: params.businessId, ...parsed.data },
  });

  return NextResponse.json({ success: true, data: config });
}
