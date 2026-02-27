import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { ShowcaseBlockType } from "@prisma/client";

const DEFAULT_BLOCKS: Array<{ type: ShowcaseBlockType; order: number; isActive: boolean; content: object }> = [
  { type: "HERO",        order: 0,  isActive: true,  content: {} },
  { type: "BOOKING_CTA", order: 10, isActive: true,  content: {} },
  { type: "ABOUT",       order: 20, isActive: true,  content: {} },
  { type: "SERVICES",    order: 30, isActive: true,  content: {} },
  { type: "LOYALTY_CTA", order: 40, isActive: true,  content: {} },
  { type: "REVIEWS_CTA", order: 50, isActive: true,  content: {} },
  { type: "HOURS",       order: 60, isActive: true,  content: {} },
  { type: "CONTACT",     order: 70, isActive: true,  content: {} },
  { type: "SOCIAL",      order: 80, isActive: true,  content: {} },
  { type: "FAQ",         order: 90, isActive: false, content: { items: [] } },
  { type: "BANNER",      order: 95, isActive: false, content: { text: "" } },
];

async function checkOwnership(businessId: string, userId: string) {
  const business = await prisma.business.findFirst({
    where: { id: businessId, userId },
    select: { id: true },
  });
  return !!business;
}

/** GET → list blocks (creates defaults if none) */
export async function GET(req: Request, { params }: { params: { businessId: string } }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  if (!(await checkOwnership(params.businessId, session.user.id))) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  let blocks = await prisma.showcaseBlock.findMany({
    where: { businessId: params.businessId },
    orderBy: { order: "asc" },
  });

  // Auto-create defaults on first visit
  if (blocks.length === 0) {
    await prisma.showcaseBlock.createMany({
      data: DEFAULT_BLOCKS.map((b) => ({ ...b, businessId: params.businessId })),
    });
    blocks = await prisma.showcaseBlock.findMany({
      where: { businessId: params.businessId },
      orderBy: { order: "asc" },
    });
  }

  return NextResponse.json({ success: true, data: blocks });
}

/** POST → create a new block */
export async function POST(req: Request, { params }: { params: { businessId: string } }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  if (!(await checkOwnership(params.businessId, session.user.id))) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const { type, order = 100, content = {} } = body as {
    type: ShowcaseBlockType;
    order?: number;
    content?: object;
  };

  if (!type) return NextResponse.json({ error: "type requis" }, { status: 400 });

  const block = await prisma.showcaseBlock.create({
    data: { businessId: params.businessId, type, order, content },
  });

  return NextResponse.json({ success: true, data: block }, { status: 201 });
}
