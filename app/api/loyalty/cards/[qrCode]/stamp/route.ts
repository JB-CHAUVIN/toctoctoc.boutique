import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/** POST → ajouter N tampons (depuis le dashboard commerçant) */
export async function POST(req: Request, { params }: { params: { qrCode: string } }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const count = Math.min(Math.max(parseInt(body.count ?? 1), 1), 10);

  const card = await prisma.loyaltyCard.findUnique({
    where: { qrCode: params.qrCode },
    include: {
      business: { include: { loyaltyConfig: true } },
    },
  });

  if (!card) return NextResponse.json({ error: "Carte introuvable" }, { status: 404 });

  // Admin bypass ownership check
  const dbUser = await prisma.user.findUnique({ where: { id: session.user.id }, select: { role: true } });
  if (dbUser?.role !== "ADMIN" && card.business.userId !== session.user.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const config = card.business.loyaltyConfig;
  if (!config) return NextResponse.json({ error: "Config fidélité introuvable" }, { status: 404 });

  const stampsRequired = config.stampsRequired;

  // Calculer les récompenses gagnées (basé sur currentStamps du cycle actuel)
  let progress = card.currentStamps % stampsRequired;
  let rewardsGranted = 0;
  for (let i = 0; i < count; i++) {
    progress++;
    if (progress >= stampsRequired) {
      progress = 0;
      rewardsGranted++;
    }
  }

  const now = new Date();

  // Transaction atomique
  await prisma.$transaction([
    ...Array.from({ length: count }, () =>
      prisma.loyaltyStamp.create({ data: { cardId: card.id } })
    ),
    ...Array.from({ length: rewardsGranted }, () =>
      prisma.loyaltyStamp.create({ data: { cardId: card.id, isReward: true } })
    ),
    prisma.loyaltyCard.update({
      where: { id: card.id },
      data: {
        totalStamps: { increment: count },
        currentStamps: { increment: count },
        totalRewards: { increment: rewardsGranted },
        lastActivityAt: now,
      },
    }),
  ]);

  return NextResponse.json({
    success: true,
    data: {
      customerName: card.customerName,
      totalStamps: card.totalStamps + count,
      currentStamps: card.currentStamps + count,
      progress,
      stampsRequired,
    },
    stampsAdded: count,
    rewardsGranted,
    rewardName: rewardsGranted > 0 ? config.rewardName : null,
  });
}
