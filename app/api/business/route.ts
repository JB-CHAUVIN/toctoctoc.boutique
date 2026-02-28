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
  shortDesc: z.string().max(160).optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  website: z.string().url().optional().or(z.literal("")),
  primaryColor: z.string().default("#4f46e5"),
  secondaryColor: z.string().default("#312e81"),
  accentColor: z.string().default("#f59e0b"),
  fontFamily: z.string().optional(),
  facebookUrl: z.string().optional(),
  instagramUrl: z.string().optional(),
  googleMapsUrl: z.string().optional(),
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
    where: { userId: session.user.id, deletedAt: null },
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
      include: { subscription: true },
    });

    const plan = user?.subscription?.plan ?? "FREE";
    const limits = PLAN_LIMITS[plan];
    const businessCount = await prisma.business.count({
      where: { userId: session.user.id, deletedAt: null },
    });

    if (limits.maxBusinesses !== -1 && businessCount >= limits.maxBusinesses) {
      return NextResponse.json(
        { error: `Votre plan ${plan} est limité à ${limits.maxBusinesses} commerce(s). Passez à un plan supérieur.` },
        { status: 403 }
      );
    }

    const { name, ...rest } = parsed.data;

    // Générer un slug unique
    let slug = slugify(name);
    const existing = await prisma.business.findUnique({ where: { slug } });
    if (existing) slug = `${slug}-${Date.now()}`;

    const business = await prisma.business.create({
      data: {
        name,
        slug,
        ...rest,
        userId: session.user.id,
        modules: {
          create: [
            { module: "SHOWCASE", isActive: true },
            { module: "REVIEWS",  isActive: true },
            { module: "LOYALTY",  isActive: true },
          ],
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
