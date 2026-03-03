import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
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

  const info = await prisma.prospectInfo.findUnique({
    where: { businessId: params.businessId },
  });

  return NextResponse.json({
    success: true,
    data: info ?? { paperType: "A4 200g", printableSize: "9.3 × 9.3 cm" },
  });
}

export async function PUT(
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
  const { paperType, printableSize } = body;

  const info = await prisma.prospectInfo.upsert({
    where: { businessId: params.businessId },
    create: {
      businessId: params.businessId,
      paperType: paperType ?? "A4 200g",
      printableSize: printableSize ?? "9.3 × 9.3 cm",
    },
    update: {
      ...(paperType !== undefined && { paperType }),
      ...(printableSize !== undefined && { printableSize }),
    },
  });

  return NextResponse.json({ success: true, data: info });
}
