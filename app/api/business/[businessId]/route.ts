import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

const updateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  description: z.string().optional(),
  shortDesc: z.string().max(160).optional(),
  businessType: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  zipCode: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  website: z.string().url().optional().or(z.literal("")),
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
  accentColor: z.string().optional(),
  fontFamily: z.string().optional(),
  facebookUrl: z.string().optional(),
  instagramUrl: z.string().optional(),
  googleMapsUrl: z.string().optional(),
  isPublished: z.boolean().optional(),
  logoUrl: z.string().optional(),
  logoBackground: z.string().optional(),
});

async function getOwnedBusiness(businessId: string, userId: string) {
  return prisma.business.findFirst({ where: { id: businessId, userId, deletedAt: null } });
}

export async function GET(req: Request, { params }: { params: { businessId: string } }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const business = await prisma.business.findFirst({
    where: { id: params.businessId, userId: session.user.id },
    include: {
      modules: true,
      bookingConfig: { include: { services: true } },
      reviewConfig: { include: { rewards: true } },
      loyaltyConfig: true,
      _count: { select: { bookings: true, reviews: true, loyaltyCards: true } },
    },
  });

  if (!business) return NextResponse.json({ error: "Commerce introuvable" }, { status: 404 });

  return NextResponse.json({ success: true, data: business });
}

export async function PATCH(req: Request, { params }: { params: { businessId: string } }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const business = await getOwnedBusiness(params.businessId, session.user.id);
  if (!business) return NextResponse.json({ error: "Commerce introuvable" }, { status: 404 });

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const data = parsed.data;

  // Mettre à jour le slug si le nom change
  if (data.name && data.name !== business.name) {
    let newSlug = slugify(data.name);
    const existing = await prisma.business.findFirst({
      where: { slug: newSlug, id: { not: params.businessId } },
    });
    if (existing) newSlug = `${newSlug}-${Date.now()}`;
    (data as Record<string, unknown>).slug = newSlug;
  }

  const updated = await prisma.business.update({
    where: { id: params.businessId },
    data,
    include: { modules: true },
  });

  // Log publish toggle
  if (data.isPublished !== undefined) {
    prisma.log.create({
      data: {
        action: "business.published",
        userId: session.user.id,
        meta: { businessId: params.businessId, slug: updated.slug, isPublished: updated.isPublished },
      },
    }).catch(() => {});
  }

  // Log dashboard.configured (tracks that the user actually did something)
  prisma.log.create({
    data: {
      action: "dashboard.configured",
      userId: session.user.id,
      meta: { businessId: params.businessId },
    },
  }).catch(() => {});

  return NextResponse.json({ success: true, data: updated });
}

export async function DELETE(req: Request, { params }: { params: { businessId: string } }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const business = await getOwnedBusiness(params.businessId, session.user.id);
  if (!business) return NextResponse.json({ error: "Commerce introuvable" }, { status: 404 });

  await prisma.$transaction([
    prisma.business.update({
      where: { id: params.businessId },
      data: { deletedAt: new Date(), isPublished: false, claimToken: null },
    }),
    // Réinitialiser les leads de prospection liés à ce commerce
    prisma.prospectLead.updateMany({
      where: { businessId: params.businessId },
      data: { businessId: null, status: "DISCOVERED" },
    }),
  ]);

  return NextResponse.json({ success: true });
}
