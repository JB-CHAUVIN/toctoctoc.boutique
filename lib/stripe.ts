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

// ─── Promo code prospect ───────────────────────────────────────────────────

export async function getOrCreateProspectCoupon(): Promise<string> {
  const existing = await stripe.coupons.list({ limit: 100 });
  const found = existing.data.find((c) => c.metadata?.type === "prospect_40");
  if (found) return found.id;

  const coupon = await stripe.coupons.create({
    percent_off: 40,
    duration: "once",
    name: "Prospect -40%",
    metadata: { type: "prospect_40" },
  });
  return coupon.id;
}

export async function createBusinessPromoCode(
  businessName: string,
  couponId: string
): Promise<{ code: string; stripePromoCodeId: string }> {
  const slug = businessName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 8);
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  const code = `${slug}-${rand}`;

  const promo = await stripe.promotionCodes.create({
    coupon: couponId,
    code,
    max_redemptions: 1,
    metadata: { businessName },
  });

  return { code, stripePromoCodeId: promo.id };
}

export async function togglePromoCode(stripePromoCodeId: string, active: boolean) {
  await stripe.promotionCodes.update(stripePromoCodeId, { active });
}

// ─── Downgrade ─────────────────────────────────────────────────────────────

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
