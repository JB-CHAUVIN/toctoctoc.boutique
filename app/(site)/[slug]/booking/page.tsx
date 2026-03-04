import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { BookingFlow } from "@/components/booking/booking-flow";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const business = await prisma.business.findUnique({ where: { slug: params.slug }, select: { name: true } });
  return { title: `Réserver — ${business?.name}` };
}

export default async function BookingPage({ params }: { params: { slug: string } }) {
  const business = await prisma.business.findUnique({
    where: { slug: params.slug, isPublished: true },
    include: {
      modules: { where: { module: "BOOKING", isActive: true } },
      bookingConfig: { include: { services: { where: { isActive: true } } } },
    },
  });

  if (!business || !business.modules.length || !business.bookingConfig) notFound();

  // Fire-and-forget tracking
  prisma.log.create({ data: { action: "page.booking", meta: { businessId: business.id, slug: params.slug } } }).catch(() => {});

  const subtitle =
    business.bookingConfig.mode === "TABLE"
      ? "Choisissez votre date, heure et nombre de couverts"
      : business.bookingConfig.mode === "CLASS"
      ? "Choisissez votre cours et votre créneau"
      : "Choisissez votre prestation et votre créneau";

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-slate-900">Réserver</h1>
        <p className="mt-2 text-slate-500">{subtitle}</p>
      </div>
      <BookingFlow
        businessId={business.id}
        businessName={business.name}
        primaryColor={business.primaryColor}
        accentColor={business.accentColor}
        services={business.bookingConfig.services}
        config={business.bookingConfig}
      />
    </div>
  );
}
