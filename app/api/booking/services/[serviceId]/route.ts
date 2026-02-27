import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: { serviceId: string } }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  // Vérifier propriété
  const service = await prisma.service.findFirst({
    where: {
      id: params.serviceId,
      bookingConfig: { business: { userId: session.user.id } },
    },
  });
  if (!service) return NextResponse.json({ error: "Service introuvable" }, { status: 404 });

  const body = await req.json();
  const updated = await prisma.service.update({
    where: { id: params.serviceId },
    data: body,
  });

  return NextResponse.json({ success: true, data: updated });
}

export async function DELETE(req: Request, { params }: { params: { serviceId: string } }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const service = await prisma.service.findFirst({
    where: {
      id: params.serviceId,
      bookingConfig: { business: { userId: session.user.id } },
    },
  });
  if (!service) return NextResponse.json({ error: "Service introuvable" }, { status: 404 });

  await prisma.service.delete({ where: { id: params.serviceId } });
  return NextResponse.json({ success: true });
}
