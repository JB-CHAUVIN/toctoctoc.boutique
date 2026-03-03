import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const configSchema = z.object({
  googleUrl: z.string().url().optional().or(z.literal("")).nullable(),
  instructions: z.string().optional().nullable(),
});

const rewardSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  probability: z.number().min(0.01).max(1),
  color: z.string().default("#4f46e5"),
  emoji: z.string().default("🎁"),
  expiryDays: z.number().min(1).default(30),
  isActive: z.boolean().default(true),
});

export async function GET(req: Request, { params }: { params: { businessId: string } }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const dbUser = await prisma.user.findUnique({ where: { id: session.user.id }, select: { role: true } });
  const isAdmin = dbUser?.role === "ADMIN";

  const config = await prisma.reviewConfig.findFirst({
    where: {
      businessId: params.businessId,
      ...(isAdmin ? {} : { business: { userId: session.user.id } }),
    },
    include: { rewards: { orderBy: { probability: "desc" } } },
  });

  if (!config) return NextResponse.json({ error: "Configuration introuvable" }, { status: 404 });

  return NextResponse.json({ success: true, data: config });
}

export async function PATCH(req: Request, { params }: { params: { businessId: string } }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const business = await prisma.business.findFirst({
    where: { id: params.businessId, userId: session.user.id },
  });
  if (!business) return NextResponse.json({ error: "Commerce introuvable" }, { status: 404 });

  const body = await req.json();
  const parsed = configSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const config = await prisma.reviewConfig.upsert({
    where: { businessId: params.businessId },
    update: parsed.data,
    create: { businessId: params.businessId, ...parsed.data },
    include: { rewards: true },
  });

  return NextResponse.json({ success: true, data: config });
}

/** POST → ajouter une récompense */
export async function POST(req: Request, { params }: { params: { businessId: string } }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const business = await prisma.business.findFirst({
    where: { id: params.businessId, userId: session.user.id },
  });
  if (!business) return NextResponse.json({ error: "Commerce introuvable" }, { status: 404 });

  const body = await req.json();
  const parsed = rewardSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const config = await prisma.reviewConfig.upsert({
    where: { businessId: params.businessId },
    update: {},
    create: { businessId: params.businessId },
  });

  const reward = await prisma.reward.create({
    data: { reviewConfigId: config.id, ...parsed.data },
  });

  return NextResponse.json({ success: true, data: reward }, { status: 201 });
}
