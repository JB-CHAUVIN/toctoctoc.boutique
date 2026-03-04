import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ReviewFlow } from "@/components/reviews/review-flow";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const b = await prisma.business.findUnique({ where: { slug: params.slug }, select: { name: true } });
  return { title: `Laisser un avis — ${b?.name}` };
}

export default async function AvisPage({ params }: { params: { slug: string } }) {
  const business = await prisma.business.findUnique({
    where: { slug: params.slug, isPublished: true },
    include: {
      modules: { where: { module: "REVIEWS", isActive: true } },
      reviewConfig: {
        include: { rewards: { where: { isActive: true }, orderBy: { probability: "desc" } } },
      },
    },
  });

  if (!business || !business.modules.length) notFound();

  // Fire-and-forget tracking
  prisma.log.create({ data: { action: "page.reviews", meta: { businessId: business.id, slug: params.slug } } }).catch(() => {});

  const reviewConfig = business.reviewConfig ?? { googleUrl: null, instructions: null, rewards: [] };

  return (
    <div className="mx-auto max-w-xl px-6 py-12">
      <ReviewFlow
        businessId={business.id}
        businessName={business.name}
        primaryColor={business.primaryColor}
        accentColor={business.accentColor}
        googleUrl={reviewConfig.googleUrl}
        instructions={reviewConfig.instructions}
        rewards={reviewConfig.rewards}
      />
    </div>
  );
}
