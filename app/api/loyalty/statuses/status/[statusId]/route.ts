import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/** PATCH → modifier un statut */
export async function PATCH(req: Request, { params }: { params: { statusId: string } }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const status = await prisma.loyaltyStatus.findUnique({
    where: { id: params.statusId },
    include: { business: true },
  });
  if (!status) return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  if (status.business.userId !== session.user.id)
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

  const body = await req.json();
  const updated = await prisma.loyaltyStatus.update({
    where: { id: params.statusId },
    data: {
      name: body.name ?? status.name,
      emoji: body.emoji ?? status.emoji,
      color: body.color ?? status.color,
      minRewards: body.minRewards !== undefined ? parseInt(body.minRewards) : status.minRewards,
      extraReward: body.extraReward !== undefined ? (body.extraReward || null) : status.extraReward,
      inactivityDays: body.inactivityDays !== undefined
        ? (body.inactivityDays ? parseInt(body.inactivityDays) : null)
        : status.inactivityDays,
      order: body.order !== undefined ? parseInt(body.order) : status.order,
    },
  });

  return NextResponse.json({ success: true, data: updated });
}

/** DELETE → supprimer un statut */
export async function DELETE(_req: Request, { params }: { params: { statusId: string } }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const status = await prisma.loyaltyStatus.findUnique({
    where: { id: params.statusId },
    include: { business: true },
  });
  if (!status) return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  if (status.business.userId !== session.user.id)
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

  await prisma.loyaltyStatus.delete({ where: { id: params.statusId } });
  return NextResponse.json({ success: true });
}
