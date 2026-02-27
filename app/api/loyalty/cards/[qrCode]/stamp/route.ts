import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/** POST → ajouter un tampon (depuis le dashboard) */
export async function POST(req: Request, { params }: { params: { qrCode: string } }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const card = await prisma.loyaltyCard.findUnique({
    where: { qrCode: params.qrCode },
    include: {
      stamps: true,
      business: {
        include: { loyaltyConfig: true },
      },
    },
  });

  if (!card) return NextResponse.json({ error: "Carte introuvable" }, { status: 404 });

  // Vérifier que l'utilisateur possède ce commerce
  if (card.business.userId !== session.user.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const config = card.business.loyaltyConfig;
  if (!config) return NextResponse.json({ error: "Config fidélité introuvable" }, { status: 404 });

  const stampsRequired = config.stampsRequired;
  const activeStamps = card.stamps.filter((s) => !s.isReward).length;
  const stampsSinceLastReward = activeStamps % stampsRequired;

  // Ajouter le tampon
  await prisma.loyaltyStamp.create({
    data: { cardId: card.id },
  });

  let rewardGranted = false;

  // Si on atteint le nombre requis → récompense
  if (stampsSinceLastReward + 1 >= stampsRequired) {
    await prisma.loyaltyStamp.create({
      data: { cardId: card.id, isReward: true },
    });

    await prisma.loyaltyCard.update({
      where: { id: card.id },
      data: {
        totalStamps: { increment: 1 },
        totalRewards: { increment: 1 },
      },
    });

    rewardGranted = true;
  } else {
    await prisma.loyaltyCard.update({
      where: { id: card.id },
      data: { totalStamps: { increment: 1 } },
    });
  }

  const updatedCard = await prisma.loyaltyCard.findUnique({
    where: { id: card.id },
    include: { stamps: { orderBy: { createdAt: "desc" } } },
  });

  return NextResponse.json({
    success: true,
    data: updatedCard,
    rewardGranted,
    rewardName: rewardGranted ? config.rewardName : null,
  });
}
