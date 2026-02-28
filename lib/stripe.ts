import Stripe from "stripe";
import { prisma } from "./prisma";
import { PLAN_LIMITS } from "./constants";
import type { PlanType, SubStatus } from "@prisma/client";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
});

// Maps between Stripe price IDs and plan types
export const PRICE_TO_PLAN: Record<string, PlanType> = {
  [process.env.STRIPE_PRICE_STARTER_MONTHLY!]: "STARTER",
  [process.env.STRIPE_PRICE_PRO_MONTHLY!]: "PRO",
};

export const PLAN_TO_PRICE: Partial<Record<PlanType, string>> = {
  STARTER: process.env.STRIPE_PRICE_STARTER_MONTHLY!,
  PRO: process.env.STRIPE_PRICE_PRO_MONTHLY!,
};

export async function getOrCreateCustomer(userId: string, email: string): Promise<string> {
  const sub = await prisma.subscription.findUnique({
    where: { userId },
    select: { stripeCustomerId: true },
  });

  if (sub?.stripeCustomerId) return sub.stripeCustomerId;

  const customer = await stripe.customers.create({ email, metadata: { userId } });

  await prisma.subscription.upsert({
    where: { userId },
    update: { stripeCustomerId: customer.id },
    create: { userId, stripeCustomerId: customer.id },
  });

  return customer.id;
}

export function mapStripeStatus(status: Stripe.Subscription.Status): SubStatus {
  switch (status) {
    case "trialing":
      return "TRIALING";
    case "active":
      return "ACTIVE";
    case "past_due":
    case "unpaid":
      return "PAST_DUE";
    case "canceled":
    case "incomplete_expired":
      return "CANCELLED";
    default:
      return "ACTIVE";
  }
}

export async function downgradeModules(userId: string): Promise<void> {
  const freeModules = PLAN_LIMITS.FREE.modules as string[];

  const businesses = await prisma.business.findMany({
    where: { userId, deletedAt: null },
    select: { id: true },
  });

  if (businesses.length === 0) return;

  await prisma.businessModule.updateMany({
    where: {
      businessId: { in: businesses.map((b) => b.id) },
      module: { notIn: freeModules as never[] },
      isActive: true,
    },
    data: { isActive: false },
  });
}
