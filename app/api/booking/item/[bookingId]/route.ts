import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function checkOwnership(bookingId: string, userId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { business: { select: { userId: true } } },
  });
  return booking?.business.userId === userId ? booking : null;
}

/** DELETE → supprimer une réservation */
export async function DELETE(_req: Request, { params }: { params: { bookingId: string } }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const booking = await checkOwnership(params.bookingId, session.user.id);
  if (!booking) return NextResponse.json({ error: "Introuvable" }, { status: 404 });

  await prisma.booking.delete({ where: { id: params.bookingId } });
  return NextResponse.json({ success: true });
}

/** PATCH → modifier les notes ou infos */
export async function PATCH(req: Request, { params }: { params: { bookingId: string } }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const booking = await checkOwnership(params.bookingId, session.user.id);
  if (!booking) return NextResponse.json({ error: "Introuvable" }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const { notes, customerName, customerEmail, customerPhone } = body as Record<string, string>;

  const updated = await prisma.booking.update({
    where: { id: params.bookingId },
    data: {
      ...(notes !== undefined && { notes }),
      ...(customerName && { customerName }),
      ...(customerEmail !== undefined && { customerEmail }),
      ...(customerPhone !== undefined && { customerPhone }),
    },
    include: { service: true },
  });

  return NextResponse.json({ success: true, data: updated });
}
