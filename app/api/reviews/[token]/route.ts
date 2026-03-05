import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logAction } from "@/lib/log";
import { generateRewardCode, pickRewardByProbability } from "@/lib/utils";

/** GET → récupère les infos d'un token de review */
export async function GET(req: Request, { params }: { params: { token: string } }) {
  const review = await prisma.review.findUnique({
    where: { token: params.token },
    include: {
      reward: true,
      reviewConfig: {
        include: { rewards: { where: { isActive: true } } },
      },
    },
  });

  if (!review) return NextResponse.json({ error: "Token invalide" }, { status: 404 });

  return NextResponse.json({ success: true, data: review });
}

/** PATCH → marque l'avis comme initié (clic sur le lien Google) */
export async function PATCH(req: Request, { params }: { params: { token: string } }) {
  const review = await prisma.review.findUnique({ where: { token: params.token } });
  if (!review) return NextResponse.json({ error: "Token invalide" }, { status: 404 });

  const body = await req.json();
  const action = body.action as "initiate" | "spin";

  if (action === "initiate") {
    const updated = await prisma.review.update({
      where: { token: params.token },
      data: {
        googleReviewInitiated: true,
        googleReviewInitiatedAt: new Date(),
      },
    });

    // Fire-and-forget tracking
    logAction("review.google_clicked", { req, meta: { businessId: review.businessId, token: params.token } });

    return NextResponse.json({ success: true, data: updated });
  }

  if (action === "spin") {
    // Déjà eu une récompense ?
    if (review.rewardCode) {
      const full = await prisma.review.findUnique({
        where: { token: params.token },
        include: { reward: true },
      });
      return NextResponse.json({ success: true, data: full });
    }

    // L'avis doit avoir été initié
    if (!review.googleReviewInitiated) {
      return NextResponse.json(
        { error: "Vous devez d'abord cliquer sur le lien pour laisser un avis" },
        { status: 400 }
      );
    }

    const config = await prisma.reviewConfig.findUnique({
      where: { businessId: review.businessId },
      include: { rewards: { where: { isActive: true } } },
    });

    const reward = config?.rewards ? pickRewardByProbability(config.rewards) : null;
    const rewardCode = generateRewardCode();

    const updated = await prisma.review.update({
      where: { token: params.token },
      data: {
        rewardId: reward?.id ?? null,
        rewardCode,
      },
      include: { reward: true },
    });

    // Fire-and-forget tracking
    logAction("review.spin", { req, meta: { businessId: review.businessId, rewardName: reward?.name ?? null } });

    return NextResponse.json({ success: true, data: updated });
  }

  return NextResponse.json({ error: "Action invalide" }, { status: 400 });
}
