import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const extraFieldSchema = z.object({
  key: z.string().min(1),
  label: z.string().min(1),
  type: z.enum(["text", "number", "tel", "email"]),
  required: z.boolean(),
});

const configSchema = z.object({
  mode: z.enum(["APPOINTMENT", "TABLE", "CLASS"]).optional(),
  openTime: z.string().optional(),
  closeTime: z.string().optional(),
  workDays: z.array(z.number().min(0).max(6)).optional(),
  defaultDuration: z.number().min(5).max(480).optional(),
  slotInterval: z.number().min(5).max(480).nullable().optional(),
  maxPerSlot: z.number().min(1).max(10000).nullable().optional(),
  bufferTime: z.number().min(0).max(120).optional(),
  maxAdvanceDays: z.number().min(1).max(365).optional(),
  minAdvanceHours: z.number().min(0).max(72).optional(),
  confirmationMsg: z.string().nullable().optional(),
  extraFields: z.array(extraFieldSchema).nullable().optional(),
});

const serviceSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  duration: z.number().min(5).nullable().optional(),
  price: z.number().min(0).nullable().optional(),
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

  const { extraFields, ...rest } = parsed.data;
  const extraFieldsValue: Prisma.InputJsonValue | typeof Prisma.DbNull =
    extraFields === null || extraFields === undefined
      ? Prisma.DbNull
      : (extraFields as Prisma.InputJsonValue);

  const config = await prisma.bookingConfig.upsert({
    where: { businessId: params.businessId },
    update: { ...rest, extraFields: extraFieldsValue },
    create: { businessId: params.businessId, ...rest, extraFields: extraFieldsValue },
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
