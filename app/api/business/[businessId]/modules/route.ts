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
    where: { id: params.businessId, userId: session.user.id },
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
      await prisma.reviewConfig.upsert({
        where: { businessId: params.businessId },
        update: {},
        create: { businessId: params.businessId },
      });
    }
    if (module === "LOYALTY") {
      await prisma.loyaltyConfig.upsert({
        where: { businessId: params.businessId },
        update: {},
        create: { businessId: params.businessId },
      });
    }
  }

  return NextResponse.json({ success: true, data: moduleRecord });
}
