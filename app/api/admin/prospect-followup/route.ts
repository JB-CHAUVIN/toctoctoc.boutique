import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { logAction } from "@/lib/log";
import { ProspectFollowupEmail, getFollowupSubject } from "@/emails/prospect-followup";

/**
 * POST /api/admin/prospect-followup
 * Sends a follow-up email to a prospected business.
 * Body: { businessId: string, step: 1 | 2 | 3 }
 */
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { role: true } });
  if (user?.role !== "ADMIN") return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

  const body = await req.json();
  const { businessId, step } = body as { businessId: string; step: 1 | 2 | 3 };

  if (!businessId || ![1, 2, 3].includes(step)) {
    return NextResponse.json({ error: "businessId et step (1|2|3) requis" }, { status: 400 });
  }

  const business = await prisma.business.findUnique({
    where: { id: businessId },
    select: { name: true, email: true, claimToken: true, claimedAt: true },
  });

  if (!business) return NextResponse.json({ error: "Commerce introuvable" }, { status: 404 });
  if (!business.email) return NextResponse.json({ error: "Pas d'email pour ce commerce" }, { status: 400 });
  if (business.claimedAt) return NextResponse.json({ error: "Commerce déjà claim" }, { status: 400 });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://toctoctoc.boutique";
  const claimUrl = business.claimToken ? `${appUrl}/claim/${business.claimToken}` : appUrl;

  // Count recent reviews for this business as social proof
  const scanCount = await prisma.review.count({
    where: {
      businessId,
      createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    },
  });

  const subject = getFollowupSubject(step, business.name);

  await sendEmail({
    to: business.email,
    subject,
    template: ProspectFollowupEmail({
      businessName: business.name,
      claimUrl,
      step,
      scanCount,
    }),
  });

  logAction("prospect.followup_sent", {
    req,
    userId: session.user.id,
    meta: { businessId, step, email: business.email },
  });

  return NextResponse.json({ success: true, step, email: business.email });
}

/**
 * GET /api/admin/prospect-followup?businessId=xxx
 * Returns follow-up history for a business (from logs).
 */
export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { role: true } });
  if (user?.role !== "ADMIN") return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const businessId = searchParams.get("businessId");

  if (!businessId) return NextResponse.json({ error: "businessId requis" }, { status: 400 });

  const logs = await prisma.log.findMany({
    where: { action: "prospect.followup_sent" },
    orderBy: { createdAt: "desc" },
    take: 100,
    select: { meta: true, createdAt: true },
  });

  // Filter by businessId in application code (JSON path not supported in MariaDB)
  const sentSteps = logs
    .filter((l) => (l.meta as Record<string, unknown>)?.businessId === businessId)
    .map((l) => ({
      step: (l.meta as Record<string, unknown>)?.step,
      sentAt: l.createdAt,
    }));

  return NextResponse.json({ success: true, data: sentSteps });
}
