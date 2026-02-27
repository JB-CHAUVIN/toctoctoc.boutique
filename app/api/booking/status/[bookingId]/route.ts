import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED", "NO_SHOW"]),
});

export async function PATCH(req: Request, { params }: { params: { bookingId: string } }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const booking = await prisma.booking.findFirst({
    where: { id: params.bookingId, business: { userId: session.user.id } },
  });
  if (!booking) return NextResponse.json({ error: "Réservation introuvable" }, { status: 404 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Statut invalide" }, { status: 400 });

  const updated = await prisma.booking.update({
    where: { id: params.bookingId },
    data: { status: parsed.data.status },
  });

  return NextResponse.json({ success: true, data: updated });
}
