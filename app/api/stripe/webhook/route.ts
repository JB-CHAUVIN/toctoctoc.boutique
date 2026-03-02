import { NextResponse } from "next/server";
import { stripe, PRICE_TO_PLAN, mapStripeStatus, downgradeModules } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { SubscriptionConfirmedEmail } from "@/emails/subscription-confirmed";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import type Stripe from "stripe";

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) return NextResponse.json({ error: "Signature manquante" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Signature invalide" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode !== "subscription") break;

        const userId = session.metadata?.userId;
        const stripeSubId = session.subscription as string;
        if (!userId || !stripeSubId) break;

        const stripeSub = await stripe.subscriptions.retrieve(stripeSubId);
        const priceId = stripeSub.items.data[0]?.price.id;
        const plan = PRICE_TO_PLAN[priceId] ?? "STARTER";
        const status = mapStripeStatus(stripeSub.status);
        const periodEnd = new Date(stripeSub.current_period_end * 1000);
        const trialEnd = stripeSub.trial_end ? new Date(stripeSub.trial_end * 1000) : null;
        const isTrialing = stripeSub.status === "trialing";

        await prisma.subscription.update({
          where: { userId },
          data: {
            plan,
            status,
            stripeSubscriptionId: stripeSubId,
            stripePriceId: priceId,
            currentPeriodStart: new Date(stripeSub.current_period_start * 1000),
            currentPeriodEnd: periodEnd,
            trialEnd,
            cancelAtPeriodEnd: stripeSub.cancel_at_period_end,
            cancelledAt: null,
          },
        });

        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { email: true, name: true },
        });

        if (user?.email) {
          const displayDate = isTrialing && trialEnd
            ? format(trialEnd, "d MMMM yyyy", { locale: fr })
            : format(periodEnd, "d MMMM yyyy", { locale: fr });

          const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://toctoctoc.boutique";
          sendEmail({
            to: user.email,
            subject: isTrialing
              ? `Votre essai ${plan} démarre — 14 jours offerts !`
              : `Abonnement ${plan} activé — Merci !`,
            template: SubscriptionConfirmedEmail({
              name: user.name ?? user.email,
              plan,
              periodEnd: displayDate,
              dashboardUrl: `${appUrl}/dashboard`,
              isTrialing,
            }),
          }).catch((err) => console.error("[EMAIL_SUBSCRIPTION]", err));
        }
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.userId;
        if (!userId) break;

        const priceId = sub.items.data[0]?.price.id;
        const plan = PRICE_TO_PLAN[priceId] ?? "STARTER";
        const status = mapStripeStatus(sub.status);

        await prisma.subscription.update({
          where: { userId },
          data: {
            plan,
            status,
            stripePriceId: priceId,
            currentPeriodStart: new Date(sub.current_period_start * 1000),
            currentPeriodEnd: new Date(sub.current_period_end * 1000),
            trialEnd: sub.trial_end ? new Date(sub.trial_end * 1000) : null,
            cancelAtPeriodEnd: sub.cancel_at_period_end,
          },
        });
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.userId;
        if (!userId) break;

        await prisma.subscription.update({
          where: { userId },
          data: {
            plan: "FREE",
            status: "CANCELLED",
            cancelledAt: new Date(),
            stripeSubscriptionId: null,
            stripePriceId: null,
            currentPeriodEnd: null,
          },
        });

        await downgradeModules(userId);
        break;
      }
    }
  } catch (err) {
    console.error("[STRIPE_WEBHOOK_ERROR]", err);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
