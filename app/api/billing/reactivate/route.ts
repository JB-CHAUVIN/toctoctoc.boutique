import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const sub = await prisma.subscription.findUnique({
    where: { userId: session.user.id },
    select: { stripeSubscriptionId: true },
  });

  if (!sub?.stripeSubscriptionId) {
    return NextResponse.json({ error: "Aucun abonnement actif" }, { status: 404 });
  }

  await stripe.subscriptions.update(sub.stripeSubscriptionId, {
    cancel_at_period_end: false,
  });

  await prisma.subscription.update({
    where: { userId: session.user.id },
    data: {
      cancelAtPeriodEnd: false,
      cancelledAt: null,
      cancelReason: null,
    },
  });

  await prisma.log.create({
    data: {
      level: "INFO",
      action: "subscription.reactivated",
      userId: session.user.id,
      meta: { stripeSubscriptionId: sub.stripeSubscriptionId },
    },
  });

  return NextResponse.json({ success: true });
}
