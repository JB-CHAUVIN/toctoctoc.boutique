import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
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
    },
  });

  if (!business || !business.modules.length || !business.loyaltyConfig) notFound();

  return (
    <div className="mx-auto max-w-md px-6 py-12">
      <LoyaltyFlow
        businessId={business.id}
        businessName={business.name}
        primaryColor={business.primaryColor}
        accentColor={business.accentColor}
        config={business.loyaltyConfig}
      />
    </div>
  );
}
