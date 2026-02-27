import { NextResponse } from "next/server";
import { z } from "zod";
import { addMinutes, format, parseISO, setHours, setMinutes, isAfter, isBefore } from "date-fns";
import { prisma } from "@/lib/prisma";
import type { TimeSlot } from "@/types";

const createBookingSchema = z.object({
  serviceId: z.string(),
  date: z.string(), // ISO date string (YYYY-MM-DD)
  time: z.string(), // HH:mm
  customerName: z.string().min(2),
  customerEmail: z.string().email(),
  customerPhone: z.string().optional(),
  notes: z.string().optional(),
});

/** GET /api/booking/[businessId]?date=YYYY-MM-DD&serviceId=xxx → créneaux disponibles */
export async function GET(req: Request, { params }: { params: { businessId: string } }) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  const serviceId = searchParams.get("serviceId");

  if (!date || !serviceId) {
    return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });
  }

  const config = await prisma.bookingConfig.findUnique({
    where: { businessId: params.businessId },
    include: { services: true },
  });

  if (!config) return NextResponse.json({ error: "Réservations non configurées" }, { status: 404 });

  const service = config.services.find((s) => s.id === serviceId && s.isActive);
  if (!service) return NextResponse.json({ error: "Service introuvable" }, { status: 404 });

  const workDays = config.workDays as number[];
  const parsedDate = parseISO(date);
  const dayOfWeek = parsedDate.getDay();

  if (!workDays.includes(dayOfWeek)) {
    return NextResponse.json({ success: true, data: [] });
  }

  // Générer les créneaux
  const [openH, openM] = config.openTime.split(":").map(Number);
  const [closeH, closeM] = config.closeTime.split(":").map(Number);

  const dayStart = setMinutes(setHours(parsedDate, openH), openM);
  const dayEnd = setMinutes(setHours(parsedDate, closeH), closeM);

  const slotDuration = service.duration + config.bufferTime;
  const slots: TimeSlot[] = [];
  let current = dayStart;

  while (isBefore(addMinutes(current, service.duration), dayEnd) ||
         addMinutes(current, service.duration).getTime() === dayEnd.getTime()) {
    const slotEnd = addMinutes(current, service.duration);

    // Vérifier les conflits
    const conflictingBooking = await prisma.booking.findFirst({
      where: {
        businessId: params.businessId,
        status: { in: ["PENDING", "CONFIRMED"] },
        date: { gte: current, lt: slotEnd },
      },
    });

    slots.push({
      time: format(current, "HH:mm"),
      available: !conflictingBooking,
    });

    current = addMinutes(current, slotDuration);
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

    const { serviceId, date, time, customerName, customerEmail, customerPhone, notes } = parsed.data;

    const config = await prisma.bookingConfig.findUnique({
      where: { businessId: params.businessId },
      include: { services: true },
    });

    if (!config) return NextResponse.json({ error: "Réservations non configurées" }, { status: 404 });

    const service = config.services.find((s) => s.id === serviceId && s.isActive);
    if (!service) return NextResponse.json({ error: "Service introuvable" }, { status: 404 });

    const [h, m] = time.split(":").map(Number);
    const bookingDate = setMinutes(setHours(parseISO(date), h), m);
    const bookingEnd = addMinutes(bookingDate, service.duration);

    // Vérifier la disponibilité
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

    const booking = await prisma.booking.create({
      data: {
        businessId: params.businessId,
        serviceId,
        customerName,
        customerEmail,
        customerPhone,
        notes,
        date: bookingDate,
        endDate: bookingEnd,
        status: "PENDING",
      },
      include: { service: true },
    });

    return NextResponse.json({ success: true, data: booking }, { status: 201 });
  } catch (error) {
    console.error("[BOOKING_CREATE_ERROR]", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
