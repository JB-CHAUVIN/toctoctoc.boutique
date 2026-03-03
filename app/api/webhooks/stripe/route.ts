import { NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe, PRICE_TO_PLAN, mapStripeStatus, downgradeModules } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { PrintOrderConfirmationEmail } from "@/emails/print-order-confirmation";
import { PrintOrderNotificationEmail } from "@/emails/print-order-notification";

// Résout userId : d'abord depuis metadata, sinon depuis le customerId en DB
async function resolveUserId(metadata: Record<string, string> | null, customerId: string): Promise<string | null> {
  if (metadata?.userId) return metadata.userId;
  const sub = await prisma.subscription.findFirst({
    where: { stripeCustomerId: customerId },
    select: { userId: true },
  });
  return sub?.userId ?? null;
}

// Extrait les dates de période de façon compatible avec toutes les versions de l'API Stripe
function extractPeriod(sub: Stripe.Subscription): { start: Date | null; end: Date | null } {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raw = sub as any;
  const start = raw.current_period_start ?? raw.items?.data?.[0]?.period?.start ?? null;
  const end = raw.current_period_end ?? raw.items?.data?.[0]?.period?.end ?? null;
  return {
    start: start ? new Date(start * 1000) : null,
    end: end ? new Date(end * 1000) : null,
  };
}

export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get("stripe-signature") ?? "";

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error("[webhook] Signature invalide", err);
    return NextResponse.json({ error: "Signature invalide" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        // ── Print order (one-shot payment) ──
        if (session.mode === "payment" && session.metadata?.type === "print_order") {
          const printOrderId = session.metadata.printOrderId;
          if (!printOrderId) break;

          const paymentIntentId = typeof session.payment_intent === "string"
            ? session.payment_intent
            : session.payment_intent?.id ?? null;

          const order = await prisma.printOrder.update({
            where: { id: printOrderId },
            data: {
              status: "PAID",
              stripePaymentIntentId: paymentIntentId,
            },
          });

          // Reconstituer les items avec les noms produits
          const items = order.items as Array<{ productId: string; name: string; quantity: number; unitPrice: number }>;

          // Email confirmation client
          try {
            await sendEmail({
              to: order.shippingEmail,
              subject: "Commande confirmée — TocTocToc.boutique",
              template: PrintOrderConfirmationEmail({
                name: order.shippingName,
                items,
                totalAmount: order.totalAmount,
                shipping: {
                  name: order.shippingName,
                  address: order.shippingAddress,
                  city: order.shippingCity,
                  zipCode: order.shippingZipCode,
                  country: order.shippingCountry,
                },
              }),
            });
          } catch (e) {
            console.error("[webhook] Erreur email confirmation print order", e);
          }

          // Email notification interne
          try {
            await sendEmail({
              to: "contact@toctoctoc.boutique",
              subject: `Nouvelle commande supports #${order.id.slice(-6)}`,
              template: PrintOrderNotificationEmail({
                orderId: order.id,
                items,
                totalAmount: order.totalAmount,
                shipping: {
                  name: order.shippingName,
                  address: order.shippingAddress,
                  city: order.shippingCity,
                  zipCode: order.shippingZipCode,
                  country: order.shippingCountry,
                  phone: order.shippingPhone,
                  email: order.shippingEmail,
                },
              }),
            });
          } catch (e) {
            console.error("[webhook] Erreur email notification print order", e);
          }

          await prisma.log.create({
            data: {
              level: "INFO",
              action: "print_order.paid",
              userId: session.metadata.userId,
              meta: { printOrderId, amount: order.totalAmount },
            },
          });
          break;
        }

        // ── Subscription checkout ──
        if (session.mode !== "subscription") break;

        const userId = session.metadata?.userId;
        if (!userId) break;

        const subId = typeof session.subscription === "string"
          ? session.subscription
          : session.subscription?.id ?? null;

        await prisma.subscription.upsert({
          where: { userId },
          update: {
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: subId,
          },
          create: {
            userId,
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: subId,
          },
        });

        await prisma.log.create({
          data: {
            level: "INFO",
            action: "checkout.session.completed",
            userId,
            meta: { sessionId: session.id, subscriptionId: subId },
          },
        });
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
        const userId = await resolveUserId(sub.metadata, customerId);
        if (!userId) {
          console.warn("[webhook] userId introuvable pour customer", customerId);
          break;
        }

        const priceId = sub.items.data[0]?.price.id ?? null;
        const plan = (priceId && PRICE_TO_PLAN[priceId]) || "FREE";
        const status = mapStripeStatus(sub.status);
        const { start, end } = extractPeriod(sub);
        const trialEnd = sub.trial_end ? new Date(sub.trial_end * 1000) : null;

        await prisma.subscription.upsert({
          where: { userId },
          update: {
            plan,
            status,
            stripePriceId: priceId,
            stripeSubscriptionId: sub.id,
            stripeCustomerId: customerId,
            cancelAtPeriodEnd: sub.cancel_at_period_end,
            trialEnd,
            ...(start && { currentPeriodStart: start }),
            ...(end && { currentPeriodEnd: end }),
          },
          create: {
            userId,
            plan,
            status,
            stripePriceId: priceId,
            stripeSubscriptionId: sub.id,
            stripeCustomerId: customerId,
            cancelAtPeriodEnd: sub.cancel_at_period_end,
            trialEnd,
            currentPeriodStart: start ?? undefined,
            currentPeriodEnd: end ?? undefined,
          },
        });

        await prisma.log.create({
          data: {
            level: "INFO",
            action: `subscription.${event.type === "customer.subscription.created" ? "created" : "updated"}`,
            userId,
            meta: { subscriptionId: sub.id, plan, status },
          },
        });
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
        const userId = await resolveUserId(sub.metadata, customerId);
        if (!userId) break;

        await prisma.subscription.updateMany({
          where: { userId },
          data: {
            plan: "FREE",
            status: "CANCELLED",
            cancelAtPeriodEnd: false,
            stripePriceId: null,
            stripeSubscriptionId: null,
          },
        });

        await downgradeModules(userId);

        await prisma.log.create({
          data: {
            level: "WARN",
            action: "subscription.deleted",
            userId,
            meta: { subscriptionId: sub.id },
          },
        });
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const subId = typeof invoice.subscription === "string"
          ? invoice.subscription
          : invoice.subscription?.id ?? null;
        if (!subId) break;

        const dbSub = await prisma.subscription.findFirst({
          where: { stripeSubscriptionId: subId },
          select: { userId: true },
        });
        if (!dbSub) break;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const inv = invoice as any;
        const periodStart = inv.period_start ?? inv.lines?.data?.[0]?.period?.start ?? null;
        const periodEnd = inv.period_end ?? inv.lines?.data?.[0]?.period?.end ?? null;

        await prisma.subscription.update({
          where: { userId: dbSub.userId },
          data: {
            status: "ACTIVE",
            ...(periodStart && { currentPeriodStart: new Date(periodStart * 1000) }),
            ...(periodEnd && { currentPeriodEnd: new Date(periodEnd * 1000) }),
          },
        });

        await prisma.log.create({
          data: {
            level: "INFO",
            action: "payment.succeeded",
            userId: dbSub.userId,
            meta: { invoiceId: invoice.id, amount: invoice.amount_paid },
          },
        });
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const subId = typeof invoice.subscription === "string"
          ? invoice.subscription
          : invoice.subscription?.id ?? null;
        if (!subId) break;

        const dbSub = await prisma.subscription.findFirst({
          where: { stripeSubscriptionId: subId },
          select: { userId: true },
        });
        if (!dbSub) break;

        await prisma.subscription.update({
          where: { userId: dbSub.userId },
          data: { status: "PAST_DUE" },
        });

        await prisma.log.create({
          data: {
            level: "WARN",
            action: "payment.failed",
            userId: dbSub.userId,
            meta: { invoiceId: invoice.id, amount: invoice.amount_due },
          },
        });
        break;
      }

      default:
        break;
    }
  } catch (err) {
    console.error(`[webhook] Erreur interne (${event.type})`, err);
    await prisma.log.create({
      data: {
        level: "ERROR",
        action: `webhook.error.${event.type}`,
        meta: { error: String(err) },
      },
    }).catch(() => null);

    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
