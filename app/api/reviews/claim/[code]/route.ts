import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/** GET /api/reviews/claim/[code] → récupère les infos d'un code récompense */
export async function GET(req: Request, { params }: { params: { code: string } }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const review = await prisma.review.findUnique({
    where: { rewardCode: params.code },
    include: {
      reward: true,
      business: { select: { id: true, name: true, userId: true } },
    },
  });

  if (!review || !review.rewardCode) {
    return NextResponse.json({ error: "Code introuvable" }, { status: 404 });
  }

  // Admin bypass ownership check
  const dbUser = await prisma.user.findUnique({ where: { id: session.user.id }, select: { role: true } });
  if (dbUser?.role !== "ADMIN" && review.business.userId !== session.user.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  return NextResponse.json({
    success: true,
    data: {
      reviewId: review.id,
      customerName: review.customerName,
      customerEmail: review.customerEmail,
      rewardCode: review.rewardCode,
      reward: review.reward,
      rewardClaimed: review.rewardClaimed,
      rewardClaimedAt: review.rewardClaimedAt?.toISOString() ?? null,
      createdAt: review.createdAt.toISOString(),
    },
  });
}

/** POST /api/reviews/claim/[code] → valide (consomme) le lot */
export async function POST(req: Request, { params }: { params: { code: string } }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const review = await prisma.review.findUnique({
    where: { rewardCode: params.code },
    include: {
      reward: true,
      business: { select: { id: true, userId: true } },
    },
  });

  if (!review || !review.rewardCode) {
    return NextResponse.json({ error: "Code introuvable" }, { status: 404 });
  }

  // Admin bypass ownership check
  const dbUser2 = await prisma.user.findUnique({ where: { id: session.user.id }, select: { role: true } });
  if (dbUser2?.role !== "ADMIN" && review.business.userId !== session.user.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  if (review.rewardClaimed) {
    return NextResponse.json({ error: "Ce lot a déjà été utilisé" }, { status: 409 });
  }

  const updated = await prisma.review.update({
    where: { id: review.id },
    data: { rewardClaimed: true, rewardClaimedAt: new Date() },
    include: { reward: true },
  });

  return NextResponse.json({
    success: true,
    data: {
      reviewId: updated.id,
      customerName: updated.customerName,
      reward: updated.reward,
      rewardClaimed: updated.rewardClaimed,
      rewardClaimedAt: updated.rewardClaimedAt?.toISOString() ?? null,
    },
  });
}
