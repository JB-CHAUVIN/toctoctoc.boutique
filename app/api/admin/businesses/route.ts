import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  if (session.user.role !== "ADMIN") return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  const businesses = await prisma.business.findMany({
    where: { deletedAt: null },
    include: {
      user: { select: { id: true, name: true, email: true } },
      modules: { select: { module: true, isActive: true } },
      _count: { select: { bookings: true, loyaltyCards: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ success: true, data: businesses });
}
