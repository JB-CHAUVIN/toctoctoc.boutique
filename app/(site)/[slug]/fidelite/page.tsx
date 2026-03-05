import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { logAction } from "@/lib/log";
import { LoyaltyFlow } from "@/components/loyalty/loyalty-flow";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const b = await prisma.business.findUnique({ where: { slug: params.slug }, select: { name: true } });
  return { title: `Carte de fidélité — ${b?.name}` };
}

export default async function FidelitePage({ params }: { params: { slug: string } }) {
  const business = await prisma.business.findUnique({
    where: { slug: params.slug, isPublished: true },
    include: {
      modules: { where: { module: "LOYALTY", isActive: true } },
      loyaltyConfig: true,
      loyaltyStatuses: { orderBy: { minRewards: "asc" } },
    },
  });

  if (!business || !business.modules.length) notFound();

  // Fire-and-forget tracking
  logAction("page.loyalty", { meta: { businessId: business.id, slug: params.slug } });

  const config = business.loyaltyConfig ?? {
    id: "",
    businessId: business.id,
    cardColor: business.primaryColor,
    cardTextColor: "#ffffff",
    stampColor: business.accentColor,
    stampIcon: "⭐",
    stampsRequired: 10,
    rewardName: "Un produit offert",
    rewardDescription: null,
    stampExpiryDays: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  return (
    <div className="mx-auto max-w-md px-6 py-12">
      <LoyaltyFlow
        businessId={business.id}
        businessName={business.name}
        primaryColor={business.primaryColor}
        accentColor={business.accentColor}
        config={config}
        statuses={business.loyaltyStatuses}
        logoUrl={business.logoUrl}
        logoBackground={business.logoBackground}
      />
    </div>
  );
}
