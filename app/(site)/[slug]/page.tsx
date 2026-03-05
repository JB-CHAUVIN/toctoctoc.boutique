import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { logAction } from "@/lib/log";
import { BlockRenderer } from "@/components/site/blocks/block-renderer";
import type { ModuleType } from "@prisma/client";

async function getBusiness(slug: string) {
  return prisma.business.findUnique({
    where: { slug, isPublished: true },
    include: {
      modules: { where: { isActive: true }, select: { module: true } },
      bookingConfig: { include: { services: { where: { isActive: true } } } },
      loyaltyConfig: true,
      showcaseBlocks: {
        where: { isActive: true },
        orderBy: { order: "asc" },
      },
    },
  });
}

// Default blocks created when no blocks exist for this business
const DEFAULT_BLOCKS = [
  { type: "HERO" as const, order: 0 },
  { type: "BOOKING_CTA" as const, order: 10 },
  { type: "ABOUT" as const, order: 20 },
  { type: "SERVICES" as const, order: 30 },
  { type: "LOYALTY_CTA" as const, order: 40 },
  { type: "REVIEWS_CTA" as const, order: 50 },
  { type: "HOURS" as const, order: 60 },
  { type: "CONTACT" as const, order: 70 },
  { type: "SOCIAL" as const, order: 80 },
];

export default async function ShowcasePage({ params }: { params: { slug: string } }) {
  const business = await getBusiness(params.slug);
  if (!business) notFound();

  // Fire-and-forget tracking
  logAction("page.home", { meta: { businessId: business.id, slug: params.slug } });

  const activeModules = new Set(business.modules.map((m) => m.module as ModuleType));
  const hasBooking = activeModules.has("BOOKING");
  const hasLoyalty = activeModules.has("LOYALTY");
  const hasReviews = activeModules.has("REVIEWS");

  const services = business.bookingConfig?.services ?? [];

  // If no blocks configured yet, use the default block list
  const blocks =
    business.showcaseBlocks.length > 0
      ? business.showcaseBlocks
      : DEFAULT_BLOCKS.map((b, i) => ({
          id: `default-${i}`,
          businessId: business.id,
          type: b.type,
          isActive: true,
          order: b.order,
          content: {},
          createdAt: new Date(),
          updatedAt: new Date(),
        }));

  return (
    <div>
      {blocks.map((block) => (
        <BlockRenderer
          key={block.id}
          block={block as Parameters<typeof BlockRenderer>[0]["block"]}
          business={business}
          hasBooking={hasBooking}
          hasLoyalty={hasLoyalty}
          hasReviews={hasReviews}
          services={services}
          bookingConfig={business.bookingConfig}
          loyaltyConfig={business.loyaltyConfig}
        />
      ))}
    </div>
  );
}
