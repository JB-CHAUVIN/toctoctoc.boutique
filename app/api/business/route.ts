import { NextResponse } from "next/server";
import { z } from "zod";
import { randomBytes } from "crypto";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAction } from "@/lib/log";
import { slugify } from "@/lib/utils";
import { PLAN_LIMITS } from "@/lib/constants";
import { getOrCreateProspectCoupon, createBusinessPromoCode } from "@/lib/stripe";

import { getDefaultRewards, getDefaultLoyaltyConfig } from "@/lib/default-rewards";

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
  brandStyle: z.any().optional(),
  googleRating: z.number().min(0).max(5).nullable().optional(),
  googleReviewCount: z.number().int().min(0).nullable().optional(),
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

    const { name, reviewUrl, googleRating, googleReviewCount, ...rest } = parsed.data;

    // Générer un slug unique : nom-type-ville
    const slugParts = [name, parsed.data.businessType, parsed.data.city].filter(Boolean).join("-");
    let slug = slugify(slugParts);
    const existing = await prisma.business.findUnique({ where: { slug } });
    if (existing) slug = `${slug}-${Date.now()}`;

    const business = await prisma.business.create({
      data: {
        name,
        slug,
        ...rest,
        ...(googleRating != null && { googleRating }),
        ...(googleReviewCount != null && { googleReviewCount }),
        isPublished: true,
        userId: session.user.id,
        // Admin crée un prospect → claimToken auto-généré
        ...(isAdmin && { claimToken: randomBytes(24).toString("hex") }),
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

    // Log business creation
    logAction("business.created", { req, userId: session.user.id, meta: { businessId: business.id, name: business.name, byAdmin: isAdmin } });

    // Créer ReviewConfig + rewards par défaut
    const defaultRewards = getDefaultRewards(parsed.data.businessType ?? null);
    await prisma.reviewConfig.create({
      data: {
        businessId: business.id,
        googleUrl: reviewUrl || null,
        rewards: { create: defaultRewards },
      },
    });

    // Créer LoyaltyConfig par défaut (adapté au type de commerce)
    const loyaltyDefaults = getDefaultLoyaltyConfig(parsed.data.businessType ?? null);
    await prisma.loyaltyConfig.create({
      data: {
        businessId: business.id,
        cardColor: parsed.data.primaryColor,
        cardTextColor: "#ffffff",
        stampColor: parsed.data.accentColor,
        stampIcon: loyaltyDefaults.stampIcon,
        stampsRequired: loyaltyDefaults.stampsRequired,
        rewardName: loyaltyDefaults.rewardName,
        rewardDescription: loyaltyDefaults.rewardDescription,
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
