import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const createCardSchema = z.object({
  businessId: z.string(),
  customerName: z.string().min(2),
  customerEmail: z.string().email().optional(),
  customerPhone: z.string().optional(),
});

/** GET → liste les cartes (dashboard) */
export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const businessId = searchParams.get("businessId");
  if (!businessId) return NextResponse.json({ error: "businessId requis" }, { status: 400 });

  const business = await prisma.business.findFirst({
    where: { id: businessId, userId: session.user.id },
  });
  if (!business) return NextResponse.json({ error: "Commerce introuvable" }, { status: 404 });

  const cards = await prisma.loyaltyCard.findMany({
    where: { businessId },
    include: { stamps: { orderBy: { createdAt: "desc" } } },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({ success: true, data: cards });
}

/** POST → créer ou récupérer une carte (côté public) */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = createCardSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const { businessId, customerName, customerEmail, customerPhone } = parsed.data;

    // Vérifier que le business existe et que la fidélité est activée
    const business = await prisma.business.findFirst({
      where: { id: businessId, isPublished: true },
      include: { modules: true },
    });
    if (!business) return NextResponse.json({ error: "Commerce introuvable" }, { status: 404 });

    const loyaltyModule = business.modules.find((m) => m.module === "LOYALTY" && m.isActive);
    if (!loyaltyModule) {
      return NextResponse.json({ error: "Module fidélité non activé" }, { status: 400 });
    }

    // Upsert : récupérer ou créer la carte
    let card;
    if (customerEmail) {
      card = await prisma.loyaltyCard.upsert({
        where: { businessId_customerEmail: { businessId, customerEmail } },
        update: { customerName, customerPhone },
        create: { businessId, customerName, customerEmail, customerPhone },
        include: { stamps: { orderBy: { createdAt: "desc" } } },
      });
    } else {
      card = await prisma.loyaltyCard.create({
        data: { businessId, customerName, customerEmail, customerPhone },
        include: { stamps: { orderBy: { createdAt: "desc" } } },
      });
    }

    return NextResponse.json({ success: true, data: card });
  } catch (error) {
    console.error("[LOYALTY_CARD_CREATE]", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
