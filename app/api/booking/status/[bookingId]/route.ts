import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { BookingStatusEmail } from "@/emails/booking-status";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const schema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED", "NO_SHOW"]),
  cancellationReason: z.string().optional(),
});

export async function PATCH(req: Request, { params }: { params: { bookingId: string } }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const booking = await prisma.booking.findFirst({
    where: { id: params.bookingId, business: { userId: session.user.id } },
    include: {
      service: { select: { name: true } },
      business: { select: { name: true } },
    },
  });
  if (!booking) return NextResponse.json({ error: "Réservation introuvable" }, { status: 404 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Statut invalide" }, { status: 400 });

  const { status, cancellationReason } = parsed.data;

  const updated = await prisma.booking.update({
    where: { id: params.bookingId },
    data: { status },
  });

  // Envoyer un email au client si CONFIRMED ou CANCELLED
  if (status === "CONFIRMED" || status === "CANCELLED") {
    sendEmail({
      to: booking.customerEmail,
      subject:
        status === "CONFIRMED"
          ? `Votre réservation chez ${booking.business.name} est confirmée !`
          : `Votre réservation chez ${booking.business.name} a été annulée`,
      template: BookingStatusEmail({
        customerName: booking.customerName,
        businessName: booking.business.name,
        serviceName: booking.service?.name,
        date: format(booking.date, "EEEE d MMMM yyyy", { locale: fr }),
        time: format(booking.date, "HH:mm"),
        status,
        cancellationReason,
      }),
    }).catch((err) => console.error("[EMAIL_BOOKING_STATUS]", err));
  }

  return NextResponse.json({ success: true, data: updated });
}
