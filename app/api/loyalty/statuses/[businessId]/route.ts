import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const DEFAULT_STATUSES = [
  { name: "Régulier", emoji: "😊", color: "#6366f1", minRewards: 1, order: 1, inactivityDays: 90 },
  { name: "Fidèle", emoji: "⭐", color: "#f59e0b", minRewards: 3, order: 2, inactivityDays: 120, extraReward: "10% de réduction sur votre prochain achat" },
  { name: "VIP", emoji: "👑", color: "#8b5cf6", minRewards: 7, order: 3, inactivityDays: null, extraReward: "Accès prioritaire et surprises exclusives" },
];

async function assertOwner(businessId: string, userId: string) {
  const biz = await prisma.business.findFirst({ where: { id: businessId, userId } });
  return !!biz;
}

/** GET → liste les statuts du commerce (les crée par défaut si vides) */
export async function GET(_req: Request, { params }: { params: { businessId: string } }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  if (!(await assertOwner(params.businessId, session.user.id)))
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

  let statuses = await prisma.loyaltyStatus.findMany({
    where: { businessId: params.businessId },
    orderBy: { order: "asc" },
  });

  // Créer les statuts par défaut si aucun n'existe encore
  if (statuses.length === 0) {
    await prisma.loyaltyStatus.createMany({
      data: DEFAULT_STATUSES.map((s) => ({ ...s, businessId: params.businessId })),
    });
    statuses = await prisma.loyaltyStatus.findMany({
      where: { businessId: params.businessId },
      orderBy: { order: "asc" },
    });
  }

  return NextResponse.json({ success: true, data: statuses });
}

/** POST → créer un nouveau statut */
export async function POST(req: Request, { params }: { params: { businessId: string } }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  if (!(await assertOwner(params.businessId, session.user.id)))
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

  const body = await req.json();
  const status = await prisma.loyaltyStatus.create({
    data: {
      businessId: params.businessId,
      name: body.name,
      emoji: body.emoji ?? "⭐",
      color: body.color ?? "#6366f1",
      minRewards: parseInt(body.minRewards ?? 1),
      extraReward: body.extraReward || null,
      inactivityDays: body.inactivityDays ? parseInt(body.inactivityDays) : null,
      order: parseInt(body.order ?? 0),
    },
  });

  return NextResponse.json({ success: true, data: status }, { status: 201 });
}
