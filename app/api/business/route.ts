import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { PLAN_LIMITS } from "@/lib/constants";

const createBusinessSchema = z.object({
  name: z.string().min(2).max(100),
  businessType: z.string().optional(),
  description: z.string().optional(),
  primaryColor: z.string().default("#4f46e5"),
  secondaryColor: z.string().default("#312e81"),
  accentColor: z.string().default("#f59e0b"),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { subscription: true },
  });

  const plan = user?.subscription?.plan ?? "FREE";
  const limits = PLAN_LIMITS[plan];

  const businesses = await prisma.business.findMany({
    where: { userId: session.user.id },
    include: { modules: true, _count: { select: { bookings: true, loyaltyCards: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    success: true,
    data: businesses,
    meta: {
      plan,
      planLabel: limits.label,
      maxBusinesses: limits.maxBusinesses,
      businessCount: businesses.length,
    },
  });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  try {
    const body = await req.json();
    const parsed = createBusinessSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    // Vérifier les limites du plan
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        subscription: true,
        _count: { select: { businesses: true } },
      },
    });

    const plan = user?.subscription?.plan ?? "FREE";
    const limits = PLAN_LIMITS[plan];
    const businessCount = user?._count.businesses ?? 0;

    if (limits.maxBusinesses !== -1 && businessCount >= limits.maxBusinesses) {
      return NextResponse.json(
        { error: `Votre plan ${plan} est limité à ${limits.maxBusinesses} commerce(s). Passez à un plan supérieur.` },
        { status: 403 }
      );
    }

    const { name, businessType, description, primaryColor, secondaryColor, accentColor } = parsed.data;

    // Générer un slug unique
    let slug = slugify(name);
    const existing = await prisma.business.findUnique({ where: { slug } });
    if (existing) slug = `${slug}-${Date.now()}`;

    const business = await prisma.business.create({
      data: {
        name,
        slug,
        businessType,
        description,
        primaryColor,
        secondaryColor,
        accentColor,
        userId: session.user.id,
        modules: {
          create: [{ module: "SHOWCASE", isActive: true }],
        },
      },
      include: { modules: true },
    });

    return NextResponse.json({ success: true, data: business }, { status: 201 });
  } catch (error) {
    console.error("[BUSINESS_CREATE_ERROR]", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
