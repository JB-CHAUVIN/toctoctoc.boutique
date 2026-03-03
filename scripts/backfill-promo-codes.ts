/**
 * Backfill promo codes for existing businesses that don't have one.
 * Run via: npx tsx scripts/backfill-promo-codes.ts
 */

import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import Stripe from "stripe";

const adapter = new PrismaMariaDb(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter });
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2025-02-24.acacia" as any });

async function main() {
  // Get or create coupon
  const coupons = await stripe.coupons.list({ limit: 100 });
  const found = coupons.data.find((c) => c.metadata?.type === "prospect_40");
  const couponId = found ? found.id : (await stripe.coupons.create({
    percent_off: 40,
    duration: "once",
    name: "Prospect -40%",
    metadata: { type: "prospect_40" },
  })).id;
  console.log("Using coupon:", couponId);

  // Find businesses without promo code
  const businesses = await prisma.business.findMany({
    where: { promoCode: null, deletedAt: null },
    select: { id: true, name: true },
  });
  console.log(`Found ${businesses.length} businesses without promo code`);

  for (const b of businesses) {
    const slug = b.name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 8);
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    const code = `${slug}-${rand}`;

    try {
      const promo = await stripe.promotionCodes.create({
        coupon: couponId,
        code,
        max_redemptions: 1,
        metadata: { businessName: b.name },
      });
      await prisma.business.update({
        where: { id: b.id },
        data: { promoCode: code, stripePromoCodeId: promo.id },
      });
      console.log(`  ${b.name} -> ${code}`);
    } catch (e: any) {
      console.error(`  ERROR for ${b.name}:`, e.message);
    }
  }

  await prisma.$disconnect();
  console.log("Done!");
}

main().catch(console.error);
