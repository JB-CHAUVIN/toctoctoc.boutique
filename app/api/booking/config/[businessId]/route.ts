import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const configSchema = z.object({
  openTime: z.string().optional(),
  closeTime: z.string().optional(),
  workDays: z.array(z.number().min(0).max(6)).optional(),
  defaultDuration: z.number().min(15).max(480).optional(),
  bufferTime: z.number().min(0).max(120).optional(),
  maxAdvanceDays: z.number().min(1).max(365).optional(),
  minAdvanceHours: z.number().min(0).max(72).optional(),
  confirmationMsg: z.string().optional(),
});

const serviceSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  duration: z.number().min(15),
  price: z.number().optional(),
  isActive: z.boolean().optional(),
});

export async function GET(req: Request, { params }: { params: { businessId: string } }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const config = await prisma.bookingConfig.findFirst({
    where: { businessId: params.businessId, business: { userId: session.user.id } },
    include: { services: true },
  });

  if (!config) return NextResponse.json({ error: "Configuration introuvable" }, { status: 404 });

  return NextResponse.json({ success: true, data: config });
}

export async function PATCH(req: Request, { params }: { params: { businessId: string } }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const business = await prisma.business.findFirst({
    where: { id: params.businessId, userId: session.user.id },
  });
  if (!business) return NextResponse.json({ error: "Commerce introuvable" }, { status: 404 });

  const body = await req.json();
  const parsed = configSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const config = await prisma.bookingConfig.upsert({
    where: { businessId: params.businessId },
    update: parsed.data,
    create: { businessId: params.businessId, ...parsed.data },
    include: { services: true },
  });

  return NextResponse.json({ success: true, data: config });
}

/** POST /api/booking/config/[businessId] → ajouter un service */
export async function POST(req: Request, { params }: { params: { businessId: string } }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const business = await prisma.business.findFirst({
    where: { id: params.businessId, userId: session.user.id },
  });
  if (!business) return NextResponse.json({ error: "Commerce introuvable" }, { status: 404 });

  const body = await req.json();
  const parsed = serviceSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  // S'assurer que la config existe
  const config = await prisma.bookingConfig.upsert({
    where: { businessId: params.businessId },
    update: {},
    create: { businessId: params.businessId },
  });

  const service = await prisma.service.create({
    data: { bookingConfigId: config.id, ...parsed.data },
  });

  return NextResponse.json({ success: true, data: service }, { status: 201 });
}
