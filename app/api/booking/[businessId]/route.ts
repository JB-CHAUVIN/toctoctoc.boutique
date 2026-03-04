import { NextResponse } from "next/server";
import { z } from "zod";
import { addMinutes, format, parseISO, setHours, setMinutes, isBefore } from "date-fns";
import { fr } from "date-fns/locale";
import { prisma } from "@/lib/prisma";
import type { TimeSlot } from "@/types";
import { sendEmail } from "@/lib/email";
import { BookingConfirmedEmail } from "@/emails/booking-confirmed";

const createBookingSchema = z.object({
  serviceId: z.string().optional(),
  date: z.string(),
  time: z.string(),
  customerName: z.string().min(2),
  customerEmail: z.string().email(),
  customerPhone: z.string().optional(),
  notes: z.string().optional(),
  guestCount: z.number().min(1).optional(),
  customData: z.record(z.string()).optional(),
});

/** GET /api/booking/[businessId]?date=YYYY-MM-DD&serviceId=xxx → créneaux disponibles */
export async function GET(req: Request, { params }: { params: { businessId: string } }) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  const serviceId = searchParams.get("serviceId");

  if (!date) {
    return NextResponse.json({ error: "Paramètre date manquant" }, { status: 400 });
  }

  const config = await prisma.bookingConfig.findUnique({
    where: { businessId: params.businessId },
    include: { services: true },
  });

  if (!config) return NextResponse.json({ error: "Réservations non configurées" }, { status: 404 });

  const workDays = config.workDays as number[];
  const parsedDate = parseISO(date);
  const dayOfWeek = parsedDate.getDay();

  if (!workDays.includes(dayOfWeek)) {
    return NextResponse.json({ success: true, data: [] });
  }

  // Durée d'un rendez-vous
  let appointmentDuration = config.defaultDuration;
  if (serviceId) {
    const service = config.services.find((s) => s.id === serviceId && s.isActive);
    if (service?.duration) appointmentDuration = service.duration;
  }

  // Intervalle entre créneaux (slotInterval ou durée du rendez-vous)
  const step = config.slotInterval ?? appointmentDuration;

  const [openH, openM] = config.openTime.split(":").map(Number);
  const [closeH, closeM] = config.closeTime.split(":").map(Number);

  const dayStart = setMinutes(setHours(parsedDate, openH), openM);
  const dayEnd = setMinutes(setHours(parsedDate, closeH), closeM);

  const slots: TimeSlot[] = [];
  let current = dayStart;

  while (
    isBefore(addMinutes(current, appointmentDuration), dayEnd) ||
    addMinutes(current, appointmentDuration).getTime() === dayEnd.getTime()
  ) {
    const slotEnd = addMinutes(current, appointmentDuration);
    let available: boolean;

    if (config.maxPerSlot) {
      // Mode TABLE / CLASS : vérifier la capacité du créneau
      const count = await prisma.booking.count({
        where: {
          businessId: params.businessId,
          status: { in: ["PENDING", "CONFIRMED"] },
          date: { gte: current, lt: addMinutes(current, 1) },
        },
      });
      available = count < config.maxPerSlot;
    } else {
      // Mode APPOINTMENT : vérifier les conflits
      const conflict = await prisma.booking.findFirst({
        where: {
          businessId: params.businessId,
          status: { in: ["PENDING", "CONFIRMED"] },
          date: { gte: current, lt: slotEnd },
        },
      });
      available = !conflict;
    }

    slots.push({ time: format(current, "HH:mm"), available });

    const stepWithBuffer = config.maxPerSlot
      ? step
      : step + config.bufferTime;
    current = addMinutes(current, stepWithBuffer);
  }

  return NextResponse.json({ success: true, data: slots });
}

/** POST /api/booking/[businessId] → créer une réservation */
export async function POST(req: Request, { params }: { params: { businessId: string } }) {
  try {
    const body = await req.json();
    const parsed = createBookingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const { serviceId, date, time, customerName, customerEmail, customerPhone, notes, guestCount, customData } = parsed.data;

    const config = await prisma.bookingConfig.findUnique({
      where: { businessId: params.businessId },
      include: { services: true },
    });

    if (!config) return NextResponse.json({ error: "Réservations non configurées" }, { status: 404 });

    let appointmentDuration = config.defaultDuration;
    let resolvedServiceId: string | undefined = serviceId;

    if (serviceId) {
      const service = config.services.find((s) => s.id === serviceId && s.isActive);
      if (!service) return NextResponse.json({ error: "Service introuvable" }, { status: 404 });
      if (service.duration) appointmentDuration = service.duration;
    } else {
      resolvedServiceId = undefined;
    }

    const [h, m] = time.split(":").map(Number);
    const bookingDate = setMinutes(setHours(parseISO(date), h), m);
    const bookingEnd = addMinutes(bookingDate, appointmentDuration);

    // Vérifier la disponibilité
    if (config.maxPerSlot) {
      const count = await prisma.booking.count({
        where: {
          businessId: params.businessId,
          status: { in: ["PENDING", "CONFIRMED"] },
          date: { gte: bookingDate, lt: addMinutes(bookingDate, 1) },
        },
      });
      if (count >= config.maxPerSlot) {
        return NextResponse.json({ error: "Ce créneau est complet" }, { status: 409 });
      }
    } else {
      const conflict = await prisma.booking.findFirst({
        where: {
          businessId: params.businessId,
          status: { in: ["PENDING", "CONFIRMED"] },
          OR: [
            { date: { gte: bookingDate, lt: bookingEnd } },
            { endDate: { gt: bookingDate, lte: bookingEnd } },
          ],
        },
      });
      if (conflict) {
        return NextResponse.json({ error: "Ce créneau n'est plus disponible" }, { status: 409 });
      }
    }

    const booking = await prisma.booking.create({
      data: {
        businessId: params.businessId,
        serviceId: resolvedServiceId,
        customerName,
        customerEmail,
        customerPhone,
        notes,
        guestCount,
        customData: customData ?? undefined,
        date: bookingDate,
        endDate: bookingEnd,
        status: "PENDING",
      },
      include: {
        service: true,
        business: { select: { name: true, slug: true, address: true, city: true } },
      },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://toctoctoc.boutique";
    const formattedDate = format(bookingDate, "EEEE d MMMM yyyy", { locale: fr });
    const formattedTime = format(bookingDate, "HH:mm");
    const address = [booking.business.address, booking.business.city].filter(Boolean).join(", ");

    // Fire-and-forget tracking
    prisma.log.create({ data: { action: "booking.created", meta: { businessId: params.businessId, customerName, serviceName: booking.service?.name ?? null } } }).catch(() => {});

    sendEmail({
      to: customerEmail,
      subject: `Réservation chez ${booking.business.name} — ${formattedDate}`,
      template: BookingConfirmedEmail({
        customerName,
        businessName: booking.business.name,
        serviceName: booking.service?.name,
        date: formattedDate,
        time: formattedTime,
        address: address || null,
        businessUrl: `${appUrl}/${booking.business.slug}`,
      }),
    }).catch((err) => console.error("[EMAIL_BOOKING]", err));

    return NextResponse.json({ success: true, data: booking }, { status: 201 });
  } catch (error) {
    console.error("[BOOKING_CREATE_ERROR]", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
