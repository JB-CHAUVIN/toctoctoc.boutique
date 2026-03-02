import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { businessId: string } },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  if (dbUser?.role !== "ADMIN") {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const business = await prisma.business.findUnique({
    where: { id: params.businessId },
    select: { id: true },
  });
  if (!business) {
    return NextResponse.json({ error: "Business introuvable" }, { status: 404 });
  }

  const body = await req.json();
  const prospected: boolean = !!body.prospected;

  await prisma.business.update({
    where: { id: params.businessId },
    data: { prospectedAt: prospected ? new Date() : null },
  });

  return NextResponse.json({ success: true });
}
