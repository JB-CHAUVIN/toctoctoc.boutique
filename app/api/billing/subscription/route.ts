import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { subscription: true },
  });

  const sub = user?.subscription ?? null;

  // Fetch promo code from any business owned by this user
  let promoCode: string | null = null;
  if (sub?.plan === "FREE" || !sub) {
    const biz = await prisma.business.findFirst({
      where: { userId: session.user.id, promoCode: { not: null } },
      select: { promoCode: true },
    });
    promoCode = biz?.promoCode ?? null;
  }

  return NextResponse.json({ success: true, data: sub, promoCode });
}
