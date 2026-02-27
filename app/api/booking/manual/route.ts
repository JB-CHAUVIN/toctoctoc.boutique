import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  businessId: z.string(),
  customerName: z.string().min(1),
  customerEmail: z.string().email(),
  customerPhone: z.string().optional(),
  serviceId: z.string().optional(),
  date: z.string(), // ISO string
  notes: z.string().optional(),
  status: z.enum(["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED", "NO_SHOW"]).default("CONFIRMED"),
});

/** POST → créer une réservation manuellement depuis le dashboard */
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const { businessId, customerName, customerEmail, customerPhone, serviceId, date, notes, status } =
    parsed.data;

  // Verify ownership
  const business = await prisma.business.findFirst({
    where: { id: businessId, userId: session.user.id },
  });
  if (!business) return NextResponse.json({ error: "Commerce introuvable" }, { status: 404 });

  const booking = await prisma.booking.create({
    data: {
      businessId,
      customerName,
      customerEmail,
      customerPhone,
      serviceId: serviceId || null,
      date: new Date(date),
      status,
      notes,
    },
    include: { service: true },
  });

  return NextResponse.json({ success: true, data: booking }, { status: 201 });
}
