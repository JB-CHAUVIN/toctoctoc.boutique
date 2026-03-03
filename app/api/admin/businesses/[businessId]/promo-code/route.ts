import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { togglePromoCode } from "@/lib/stripe";

export async function PATCH(
  req: Request,
  { params }: { params: { businessId: string } }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  if (user?.role !== "ADMIN") return NextResponse.json({ error: "Admin requis" }, { status: 403 });

  const business = await prisma.business.findUnique({
    where: { id: params.businessId },
    select: { stripePromoCodeId: true },
  });
  if (!business?.stripePromoCodeId) {
    return NextResponse.json({ error: "Aucun code promo associé" }, { status: 404 });
  }

  const { active } = await req.json();
  await togglePromoCode(business.stripePromoCodeId, !!active);

  return NextResponse.json({ success: true });
}
