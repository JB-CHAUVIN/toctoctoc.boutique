import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function getCardWithOwnerCheck(qrCode: string, userId: string) {
  const card = await prisma.loyaltyCard.findUnique({
    where: { qrCode },
    include: { business: { select: { userId: true } } },
  });
  if (!card || card.business.userId !== userId) return null;
  return card;
}

/** GET → récupérer les infos d'une carte (lookup avant tampon) */
export async function GET(_req: Request, { params }: { params: { qrCode: string } }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

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
    return NextResponse.json({ error: "Cette carte n'appartient pas à votre commerce" }, { status: 403 });
  }

  const config = card.business.loyaltyConfig;
  const stampsRequired = config?.stampsRequired ?? 10;
  const progress = card.totalStamps % stampsRequired;

  return NextResponse.json({
    success: true,
    data: {
      id: card.id,
      qrCode: card.qrCode,
      customerName: card.customerName,
      customerEmail: card.customerEmail,
      totalStamps: card.totalStamps,
      totalRewards: card.totalRewards,
      progress,
      stampsRequired,
      rewardName: config?.rewardName ?? "Récompense",
      stampIcon: config?.stampIcon ?? "⭐",
    },
  });
}

/** PATCH → modifier les infos client */
export async function PATCH(req: Request, { params }: { params: { qrCode: string } }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const card = await getCardWithOwnerCheck(params.qrCode, session.user.id);
  if (!card) return NextResponse.json({ error: "Carte introuvable" }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const { customerName, customerEmail, customerPhone } = body as Record<string, string>;

  const updated = await prisma.loyaltyCard.update({
    where: { id: card.id },
    data: {
      ...(customerName && { customerName }),
      ...(customerEmail !== undefined && { customerEmail: customerEmail || null }),
      ...(customerPhone !== undefined && { customerPhone: customerPhone || null }),
    },
  });

  return NextResponse.json({ success: true, data: updated });
}

/** DELETE → supprimer une carte */
export async function DELETE(_req: Request, { params }: { params: { qrCode: string } }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const card = await getCardWithOwnerCheck(params.qrCode, session.user.id);
  if (!card) return NextResponse.json({ error: "Carte introuvable" }, { status: 404 });

  await prisma.loyaltyCard.delete({ where: { id: card.id } });
  return NextResponse.json({ success: true });
}
