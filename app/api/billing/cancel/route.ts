import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAction } from "@/lib/log";
import { stripe } from "@/lib/stripe";

const schema = z.object({
  reason: z.string().min(1).max(500),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Raison invalide" }, { status: 400 });

  const sub = await prisma.subscription.findUnique({
    where: { userId: session.user.id },
    select: { stripeSubscriptionId: true },
  });

  if (!sub?.stripeSubscriptionId) {
    return NextResponse.json({ error: "Aucun abonnement actif" }, { status: 404 });
  }

  await stripe.subscriptions.update(sub.stripeSubscriptionId, {
    cancel_at_period_end: true,
  });

  await prisma.subscription.update({
    where: { userId: session.user.id },
    data: {
      cancelAtPeriodEnd: true,
      cancelReason: parsed.data.reason,
      cancelledAt: new Date(),
    },
  });

  logAction("subscription.cancel_requested", { req, userId: session.user.id, meta: { reason: parsed.data.reason, stripeSubscriptionId: sub.stripeSubscriptionId } });

  return NextResponse.json({ success: true });
}
