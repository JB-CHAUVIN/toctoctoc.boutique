import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PLAN_LIMITS } from "@/lib/constants";
import type { ModuleType } from "@prisma/client";

const toggleSchema = z.object({
  module: z.string(),
  isActive: z.boolean(),
});

export async function POST(req: Request, { params }: { params: { businessId: string } }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const business = await prisma.business.findFirst({
    where: { id: params.businessId, userId: session.user.id, deletedAt: null },
    select: { id: true, primaryColor: true, secondaryColor: true, accentColor: true },
  });
  if (!business) return NextResponse.json({ error: "Commerce introuvable" }, { status: 404 });

  const body = await req.json();
  const parsed = toggleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Données invalides" }, { status: 400 });
  }

  const { module, isActive } = parsed.data;

  // Vérifier que le plan autorise ce module
  if (isActive) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { subscription: true },
    });
    const plan = user?.subscription?.plan ?? "FREE";
    const allowedModules = PLAN_LIMITS[plan].modules as string[];

    if (!allowedModules.includes(module)) {
      return NextResponse.json(
        { error: `Le module ${module} n'est pas disponible dans votre plan ${plan}.` },
        { status: 403 }
      );
    }
  }

  const moduleRecord = await prisma.businessModule.upsert({
    where: { businessId_module: { businessId: params.businessId, module: module as ModuleType } },
    update: { isActive },
    create: { businessId: params.businessId, module: module as ModuleType, isActive },
  });

  // Créer les configs associées si on active pour la première fois
  if (isActive) {
    if (module === "BOOKING") {
      await prisma.bookingConfig.upsert({
        where: { businessId: params.businessId },
        update: {},
        create: { businessId: params.businessId },
      });
    }

    if (module === "REVIEWS") {
      const existing = await prisma.reviewConfig.findUnique({
        where: { businessId: params.businessId },
        select: { id: true },
      });
      if (!existing) {
        await prisma.reviewConfig.create({
          data: {
            businessId: params.businessId,
            rewards: {
              create: [
                {
                  name: "Café offert",
                  description: "Un café de votre choix offert sur votre prochaine visite",
                  emoji: "☕",
                  color: business.primaryColor,
                  probability: 0.35,
                  expiryDays: 30,
                },
                {
                  name: "10% de réduction",
                  description: "10% de réduction sur votre prochaine commande",
                  emoji: "🎉",
                  color: business.accentColor,
                  probability: 0.45,
                  expiryDays: 30,
                },
                {
                  name: "Produit offert",
                  description: "Un produit de votre choix offert (valeur jusqu'à 5€)",
                  emoji: "🎁",
                  color: business.secondaryColor,
                  probability: 0.2,
                  expiryDays: 15,
                },
              ],
            },
          },
        });
      }
    }

    if (module === "LOYALTY") {
      await prisma.loyaltyConfig.upsert({
        where: { businessId: params.businessId },
        update: {},
        create: {
          businessId: params.businessId,
          cardColor: business.primaryColor,
          stampColor: business.accentColor,
          cardTextColor: "#ffffff",
        },
      });
    }
  }

  // Log dashboard.configured
  prisma.log.create({
    data: {
      action: "dashboard.configured",
      userId: session.user.id,
      meta: { businessId: params.businessId, module, isActive } as Record<string, string | boolean>,
    },
  }).catch(() => {});

  return NextResponse.json({ success: true, data: moduleRecord });
}
