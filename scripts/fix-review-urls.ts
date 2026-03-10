/**
 * Fix ReviewConfig.googleUrl for businesses where the URL is a Google Maps URL
 * instead of the correct Google review URL.
 *
 * Run via: npx tsx scripts/fix-review-urls.ts
 */

import { prisma } from "../lib/prisma";

async function main() {
  // Find all ReviewConfigs with a Maps URL instead of a review URL
  const configs = await prisma.reviewConfig.findMany({
    where: {
      googleUrl: { contains: "google.com/maps/place" },
    },
    select: { id: true, businessId: true, googleUrl: true },
  });

  console.log(`Found ${configs.length} ReviewConfig(s) with incorrect Google Maps URL`);

  let fixed = 0;
  for (const config of configs) {
    const match = config.googleUrl?.match(/place_id:([A-Za-z0-9_-]+)/);
    if (!match) {
      console.warn(`  [SKIP] ${config.id} — no place_id found in: ${config.googleUrl}`);
      continue;
    }

    const placeId = match[1];
    const correctUrl = `https://search.google.com/local/writereview?placeid=${placeId}`;

    await prisma.reviewConfig.update({
      where: { id: config.id },
      data: { googleUrl: correctUrl },
    });

    console.log(`  [FIXED] ${config.id} → ${correctUrl}`);
    fixed++;
  }

  console.log(`\nDone: ${fixed}/${configs.length} fixed`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
