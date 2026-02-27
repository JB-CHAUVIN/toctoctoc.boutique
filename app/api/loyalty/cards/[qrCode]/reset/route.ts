import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * POST → Reset de la carte (commerçant authentifié uniquement)
 * Remet currentStamps à 0, incrémente resetCount.
 * totalStamps et totalRewards sont conservés (historique).
 */
export async function POST(_req: Request, { params }: { params: { qrCode: string } }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const card = await prisma.loyaltyCard.findUnique({
    where: { qrCode: params.qrCode },
    include: { business: true },
  });

  if (!card) return NextResponse.json({ error: "Carte introuvable" }, { status: 404 });

  if (card.business.userId !== session.user.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const updated = await prisma.loyaltyCard.update({
    where: { id: card.id },
    data: {
      currentStamps: 0,
      resetCount: { increment: 1 },
    },
  });

  return NextResponse.json({
    success: true,
    data: {
      customerName: card.customerName,
      currentStamps: updated.currentStamps,
      totalRewards: updated.totalRewards,
      resetCount: updated.resetCount,
    },
  });
}
