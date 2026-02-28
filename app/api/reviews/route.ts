import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { PLAN_LIMITS } from "@/lib/constants";

const createReviewSchema = z.object({
  businessId: z.string(),
  customerName: z.string().optional(),
  customerEmail: z.string().email().optional(),
  customerPhone: z.string().optional(),
});

/** POST → créer un token de review (côté public) */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = createReviewSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const { businessId, customerName, customerEmail, customerPhone } = parsed.data;

    const business = await prisma.business.findFirst({
      where: { id: businessId, isPublished: true },
      include: {
        modules: { where: { module: "REVIEWS", isActive: true } },
        user: { include: { subscription: true } },
      },
    });

    if (!business || !business.modules.length) {
      return NextResponse.json({ error: "Module avis non disponible" }, { status: 400 });
    }

    // Vérifier la limite du plan FREE
    const plan = business.user?.subscription?.plan ?? "FREE";
    const limits = PLAN_LIMITS[plan];
    if (limits.maxReviews !== -1) {
      const reviewCount = await prisma.review.count({ where: { businessId } });
      if (reviewCount >= limits.maxReviews) {
        return NextResponse.json(
          { error: "demo_limit_reached", message: "Ce commerce a atteint la limite de sa version gratuite." },
          { status: 403 }
        );
      }
    }

    const reviewConfig = await prisma.reviewConfig.findUnique({
      where: { businessId },
    });

    const review = await prisma.review.create({
      data: {
        businessId,
        reviewConfigId: reviewConfig?.id,
        customerName,
        customerEmail,
        customerPhone,
      },
    });

    return NextResponse.json({ success: true, data: review }, { status: 201 });
  } catch (error) {
    console.error("[REVIEW_CREATE_ERROR]", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
