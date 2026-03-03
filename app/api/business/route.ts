import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { PLAN_LIMITS } from "@/lib/constants";
import { getOrCreateProspectCoupon, createBusinessPromoCode } from "@/lib/stripe";

type RewardSeed = { name: string; description: string; probability: number; color: string; emoji: string; expiryDays: number; isActive: boolean };

function getDefaultRewards(businessType: string | null): RewardSeed[] {
  const t = businessType?.toLowerCase() ?? "";

  if (t.includes("boulangerie") || t.includes("pâtisserie") || t.includes("chocolaterie")) {
    return [
      { name: "Croissant offert",     description: "Un croissant au beurre offert lors de votre prochaine visite", probability: 0.40, color: "#f59e0b", emoji: "🥐", expiryDays: 14, isActive: true },
      { name: "Baguette offerte",     description: "Une baguette tradition offerte",                                probability: 0.30, color: "#d97706", emoji: "🥖", expiryDays: 7,  isActive: true },
      { name: "Café offert",          description: "Un café ou une boisson chaude offert",                         probability: 0.20, color: "#92400e", emoji: "☕", expiryDays: 30, isActive: true },
      { name: "Surprise du chef",     description: "Une création du jour offerte par le chef",                     probability: 0.10, color: "#4f46e5", emoji: "🎁", expiryDays: 7,  isActive: true },
    ];
  }
  if (t.includes("restaurant") || t.includes("traiteur") || t.includes("boucherie") || t.includes("fromagerie") || t.includes("poissonnerie")) {
    return [
      { name: "Café offert",          description: "Un café en fin de repas offert",                               probability: 0.40, color: "#92400e", emoji: "☕", expiryDays: 30, isActive: true },
      { name: "Dessert offert",       description: "Le dessert de votre choix offert",                             probability: 0.30, color: "#ec4899", emoji: "🍰", expiryDays: 30, isActive: true },
      { name: "Entrée offerte",       description: "Une entrée du jour offerte",                                   probability: 0.20, color: "#10b981", emoji: "🥗", expiryDays: 30, isActive: true },
      { name: "Réduction 10%",        description: "10% de réduction sur votre prochaine addition",                probability: 0.10, color: "#4f46e5", emoji: "🌟", expiryDays: 60, isActive: true },
    ];
  }
  if (t.includes("café") || t.includes("bar") || t.includes("glacier")) {
    return [
      { name: "Café offert",          description: "Un café ou expresso offert",                                   probability: 0.45, color: "#92400e", emoji: "☕", expiryDays: 30, isActive: true },
      { name: "Boisson offerte",      description: "Une boisson fraîche de votre choix offerte",                   probability: 0.35, color: "#3b82f6", emoji: "🧃", expiryDays: 30, isActive: true },
      { name: "Viennoiserie offerte", description: "Une viennoiserie au choix offerte",                            probability: 0.20, color: "#f59e0b", emoji: "🥐", expiryDays: 14, isActive: true },
    ];
  }
  if (t.includes("coiffure") || t.includes("barbier") || t.includes("beauté") || t.includes("esthétique") || t.includes("nail") || t.includes("spa") || t.includes("yoga") || t.includes("coach")) {
    return [
      { name: "Réduction 10%",        description: "10% de réduction sur votre prochaine prestation",              probability: 0.50, color: "#4f46e5", emoji: "🌟", expiryDays: 60, isActive: true },
      { name: "Soin offert",          description: "Un soin ou complément offert lors de votre prochaine visite",  probability: 0.30, color: "#ec4899", emoji: "💆", expiryDays: 60, isActive: true },
      { name: "Bon cadeau 10€",       description: "Un bon d'achat de 10€ à utiliser sur une prestation",          probability: 0.20, color: "#10b981", emoji: "🎁", expiryDays: 90, isActive: true },
    ];
  }

  // Générique
  return [
    { name: "Petite surprise",        description: "Un cadeau offert lors de votre prochaine visite",              probability: 0.40, color: "#4f46e5", emoji: "🎁", expiryDays: 30, isActive: true },
    { name: "Bon d'achat 5€",         description: "Un bon d'achat de 5€ à valider en caisse",                    probability: 0.30, color: "#10b981", emoji: "💚", expiryDays: 60, isActive: true },
    { name: "Réduction 10%",          description: "10% de réduction sur votre prochain achat",                   probability: 0.20, color: "#f59e0b", emoji: "🌟", expiryDays: 60, isActive: true },
    { name: "Cadeau mystère",         description: "Une surprise exclusive réservée à nos meilleurs clients",      probability: 0.10, color: "#ec4899", emoji: "🏆", expiryDays: 30, isActive: true },
  ];
}

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
  reviewUrl: z.string().optional(),
  logoUrl: z.string().optional(),
  logoBackground: z.string().optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { subscription: true },
  });

  const isAdmin = user?.role === "ADMIN";
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
      maxBusinesses: isAdmin ? -1 : limits.maxBusinesses,
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

    const isAdmin = user?.role === "ADMIN";
    const plan = user?.subscription?.plan ?? "FREE";
    const limits = PLAN_LIMITS[plan];
    const businessCount = await prisma.business.count({
      where: { userId: session.user.id, deletedAt: null },
    });

    if (!isAdmin && limits.maxBusinesses !== -1 && businessCount >= limits.maxBusinesses) {
      return NextResponse.json(
        { error: `Votre plan ${plan} est limité à ${limits.maxBusinesses} commerce(s). Passez à un plan supérieur.` },
        { status: 403 }
      );
    }

    const { name, reviewUrl, ...rest } = parsed.data;

    // Générer un slug unique
    let slug = slugify(name);
    const existing = await prisma.business.findUnique({ where: { slug } });
    if (existing) slug = `${slug}-${Date.now()}`;

    const business = await prisma.business.create({
      data: {
        name,
        slug,
        ...rest,
        isPublished: true,
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

    // Créer ReviewConfig + rewards par défaut
    const defaultRewards = getDefaultRewards(parsed.data.businessType ?? null);
    await prisma.reviewConfig.create({
      data: {
        businessId: business.id,
        googleUrl: reviewUrl || null,
        rewards: { create: defaultRewards },
      },
    });

    // Générer un code promo Stripe pour les prospects (admin uniquement)
    if (isAdmin) {
      try {
        const couponId = await getOrCreateProspectCoupon();
        const { code, stripePromoCodeId } = await createBusinessPromoCode(name, couponId);
        await prisma.business.update({
          where: { id: business.id },
          data: { promoCode: code, stripePromoCodeId },
        });
        business.promoCode = code;
        business.stripePromoCodeId = stripePromoCodeId;
      } catch (err) {
        console.error("[PROMO_CODE_CREATE_ERROR]", err);
        // Non-bloquant : on continue même si le promo code échoue
      }
    }

    return NextResponse.json({ success: true, data: business }, { status: 201 });
  } catch (error) {
    console.error("[BUSINESS_CREATE_ERROR]", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
