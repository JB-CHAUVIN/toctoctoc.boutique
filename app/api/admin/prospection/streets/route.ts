import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  if (dbUser?.role !== "ADMIN") return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  const streets = await prisma.prospectStreet.findMany({
    include: {
      leads: {
        select: {
          id: true,
          name: true,
          address: true,
          businessType: true,
          rating: true,
          reviewCount: true,
          status: true,
          lat: true,
          lng: true,
          googleMapsUrl: true,
          phone: true,
          website: true,
          businessId: true,
          notes: true,
          osmId: true,
          contactedAt: true,
          createdAt: true,
        },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { searchedAt: "desc" },
  });

  return NextResponse.json({ success: true, data: streets });
}
