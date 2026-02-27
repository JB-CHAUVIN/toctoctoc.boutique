import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET → Polling public pour le client (pas d'auth requise)
 * Le qrCode sert de jeton d'accès (cuid aléatoire)
 */
export async function GET(_req: Request, { params }: { params: { qrCode: string } }) {
  const card = await prisma.loyaltyCard.findUnique({
    where: { qrCode: params.qrCode },
    include: {
      business: {
        include: {
          loyaltyConfig: true,
          loyaltyStatuses: { orderBy: { order: "desc" } },
        },
      },
    },
  });

  if (!card) return NextResponse.json({ error: "Carte introuvable" }, { status: 404 });

  const config = card.business.loyaltyConfig;
  const stampsRequired = config?.stampsRequired ?? 10;
  const progress = card.currentStamps % stampsRequired;

  // Calcul du statut actuel (dynamique, pas de cron nécessaire)
  const now = new Date();
  const statuses = card.business.loyaltyStatuses;
  const currentStatus = statuses.find((s) => {
    if (card.totalRewards < s.minRewards) return false;
    if (s.inactivityDays && card.lastActivityAt) {
      const cutoff = new Date(now.getTime() - s.inactivityDays * 86_400_000);
      if (card.lastActivityAt < cutoff) return false;
    }
    return true;
  }) ?? null;

  return NextResponse.json({
    currentStamps: card.currentStamps,
    totalRewards: card.totalRewards,
    resetCount: card.resetCount,
    progress,
    stampsRequired,
    status: currentStatus
      ? {
          name: currentStatus.name,
          emoji: currentStatus.emoji,
          color: currentStatus.color,
          extraReward: currentStatus.extraReward,
        }
      : null,
  });
}
