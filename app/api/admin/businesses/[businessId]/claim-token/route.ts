import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";

export async function POST(
  _req: Request,
  { params }: { params: { businessId: string } }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  if (dbUser?.role !== "ADMIN") return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  const business = await prisma.business.findUnique({
    where: { id: params.businessId },
    select: { id: true, claimToken: true },
  });
  if (!business) return NextResponse.json({ error: "Business introuvable" }, { status: 404 });

  // Return existing token or generate new one
  const token = business.claimToken ?? randomBytes(24).toString("hex");

  if (!business.claimToken) {
    await prisma.business.update({
      where: { id: params.businessId },
      data: { claimToken: token },
    });
  }

  return NextResponse.json({ success: true, token });
}

export async function DELETE(
  _req: Request,
  { params }: { params: { businessId: string } }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  if (dbUser?.role !== "ADMIN") return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  await prisma.business.update({
    where: { id: params.businessId },
    data: { claimToken: null },
  });

  return NextResponse.json({ success: true });
}
