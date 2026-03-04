import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { StatsCard } from "@/components/dashboard/stats-card";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MODULES_INFO } from "@/lib/constants";
import { formatDateTime } from "@/lib/utils";
import { ArrowRight, ExternalLink, ScanLine, Gift } from "lucide-react";
import { PublishToggle } from "@/components/dashboard/publish-toggle";
import { SetupPanel } from "@/components/dashboard/setup-panel";
import { WalkthroughAutoShow, WalkthroughButton } from "@/components/dashboard/walkthrough-modal";
import { computeProspectStep } from "@/lib/prospect-steps";
import type { ModuleType } from "@prisma/client";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:2203";

export async function generateMetadata({ params }: { params: { businessId: string } }) {
  const session = await auth();
  if (!session?.user?.id) return {};
  const business = await prisma.business.findFirst({ where: { id: params.businessId, userId: session.user.id } });
  return { title: business?.name ?? "Dashboard" };
}

export default async function BusinessOverviewPage({ params }: { params: { businessId: string } }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const dbUser = await prisma.user.findUnique({ where: { id: session.user.id }, select: { role: true } });
  const isAdmin = dbUser?.role === "ADMIN";

  const business = await prisma.business.findFirst({
    where: isAdmin
      ? { id: params.businessId }
      : { id: params.businessId, userId: session.user.id },
    include: {
      modules: true,
      bookings: { orderBy: { createdAt: "desc" }, take: 5, include: { service: true } },
      reviews: { orderBy: { createdAt: "desc" }, take: 5 },
      loyaltyCards: { orderBy: { updatedAt: "desc" }, take: 5 },
      loyaltyConfig: true,
      prospectInfo: true,
      _count: {
        select: {
          bookings: true,
          reviews: { where: { rewardCode: { not: null } } },
          loyaltyCards: true,
        },
      },
    },
  });

  if (!business) notFound();

  const activeModules = business.modules.filter((m) => m.isActive);
  const hasLoyalty = activeModules.some((m) => m.module === "LOYALTY");
  const hasReviews = activeModules.some((m) => m.module === "REVIEWS");

  // Compute prospect step for admin businesses with claimToken
  let prospectStep: number | undefined;
  if (isAdmin && business.claimToken) {
    const logActions = await prisma.$queryRawUnsafe<Array<{ action: string }>>(
      `SELECT DISTINCT action FROM Log WHERE JSON_EXTRACT(meta, '$.businessId') = ? AND action IN ('claim.page_viewed', 'walkthrough.completed', 'dashboard.configured')`,
      params.businessId,
    );
    const actionSet = new Set(logActions.map((r) => r.action));
    const hasProductUsed = business._count.reviews > 0 || business._count.loyaltyCards > 0;
    prospectStep = computeProspectStep({
      hasClaimToken: true,
      prospectedAt: business.prospectedAt,
      claimedAt: business.claimedAt,
      logActions: actionSet,
      hasProductUsed,
    });
  }

  const businessInfo = {
    name: business.name,
    slug: business.slug,
    businessType: business.businessType,
    address: business.address,
    city: business.city,
    zipCode: business.zipCode,
    phone: business.phone,
    email: business.email,
    primaryColor: business.primaryColor,
    accentColor: business.accentColor,
    logoUrl: business.logoUrl,
    logoBackground: business.logoBackground,
  };

  return (
    <div className="p-4 sm:p-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-3">
            {business.logoUrl ? (
              <div
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-100"
                style={{ backgroundColor: business.logoBackground ?? "white" }}
              >
                <Image src={business.logoUrl} alt={business.name} width={40} height={40} className="h-10 w-10 object-contain p-1" />
              </div>
            ) : (
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl text-base font-bold text-white"
                style={{ backgroundColor: business.primaryColor }}
              >
                {business.name[0].toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{business.name}</h1>
              <p className="text-sm text-slate-400">/{business.slug}</p>
            </div>
          </div>
          <Badge variant={business.isPublished ? "success" : "outline"}>
            {business.isPublished ? "En ligne" : "Brouillon — non visible"}
          </Badge>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <PublishToggle businessId={params.businessId} isPublished={business.isPublished} />
          <Link
            href={`/${business.slug}`}
            target="_blank"
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
          >
            Voir le site <ExternalLink className="h-3.5 w-3.5" />
          </Link>
          <WalkthroughButton
            businessId={params.businessId}
            businessName={business.name}
            primaryColor={business.primaryColor}
            accentColor={business.accentColor}
            loyaltyConfig={business.loyaltyConfig}
            logoUrl={business.logoUrl}
          />
        </div>
      </div>

      {/* Setup Panel (admin only) */}
      {isAdmin && (
        <SetupPanel
          businessId={params.businessId}
          appUrl={APP_URL}
          prospectedAt={business.prospectedAt}
          business={businessInfo}
          claimToken={business.claimToken}
          prospectInfo={business.prospectInfo}
          promoCode={business.promoCode}
          stripePromoCodeId={business.stripePromoCodeId}
          prospectStep={prospectStep}
        />
      )}

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatsCard
          label="Réservations"
          value={business._count.bookings}
          icon="📅"
          color="indigo"
        />
        <StatsCard
          label="Avis récoltés"
          value={business._count.reviews}
          icon="⭐"
          color="amber"
        />
        <StatsCard
          label="Cartes fidélité"
          value={business._count.loyaltyCards}
          icon="🎯"
          color="emerald"
        />
        <StatsCard
          label="Modules actifs"
          value={activeModules.length}
          icon="🔧"
          color="rose"
        />
      </div>

      {/* Accès rapide — outils admin terrain */}
      {(hasLoyalty || hasReviews) && (
        <div className="mb-8">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">
            Accès rapide
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {hasLoyalty && (
              <Link
                href={`/dashboard/${params.businessId}/loyalty/stamp`}
                className="group flex flex-col items-center gap-3 rounded-2xl border-2 border-slate-100 bg-white p-5 text-center transition hover:border-indigo-300 hover:shadow-md"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 transition group-hover:bg-indigo-100">
                  <ScanLine className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-800">Scanner fidélité</div>
                  <div className="mt-0.5 text-xs text-slate-400">Créditer des tampons</div>
                </div>
              </Link>
            )}
            {hasReviews && (
              <Link
                href={`/dashboard/${params.businessId}/reviews/validate`}
                className="group flex flex-col items-center gap-3 rounded-2xl border-2 border-slate-100 bg-white p-5 text-center transition hover:border-amber-300 hover:shadow-md"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600 transition group-hover:bg-amber-100">
                  <Gift className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-800">Valider un lot</div>
                  <div className="mt-0.5 text-xs text-slate-400">Consommer une récompense</div>
                </div>
              </Link>
            )}
          </div>
        </div>
      )}


      {/* Walkthrough — auto au 1er accès (non-admin uniquement) */}
      {!isAdmin && (
        <WalkthroughAutoShow
          businessId={params.businessId}
          businessName={business.name}
          primaryColor={business.primaryColor}
          accentColor={business.accentColor}
          loyaltyConfig={business.loyaltyConfig}
          logoUrl={business.logoUrl}
          promoCode={business.promoCode}
        />
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Modules actifs */}
        <Card>
          <CardHeader>
            <CardTitle>Modules actifs</CardTitle>
            <Link href={`/dashboard/${params.businessId}/modules`} className="flex items-center gap-1 text-sm text-indigo-600 hover:underline">
              Gérer <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </CardHeader>
          <div className="space-y-2">
            {activeModules.length === 0 ? (
              <p className="text-sm text-slate-400">Aucun module activé</p>
            ) : (
              activeModules.map((m) => {
                const info = MODULES_INFO[m.module as ModuleType];
                return (
                  <div key={m.id} className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                    <span className="text-xl">{info.emoji}</span>
                    <div>
                      <div className="text-sm font-medium text-slate-800">{info.name}</div>
                      <div className="text-xs text-slate-400">{info.description}</div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>

        {/* Dernières réservations */}
        <Card>
          <CardHeader>
            <CardTitle>Dernières réservations</CardTitle>
            <Link href={`/dashboard/${params.businessId}/booking`} className="flex items-center gap-1 text-sm text-indigo-600 hover:underline">
              Voir tout <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </CardHeader>
          <div className="space-y-2">
            {business.bookings.length === 0 ? (
              <p className="text-sm text-slate-400">Aucune réservation</p>
            ) : (
              business.bookings.map((b) => (
                <div key={b.id} className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                  <div>
                    <div className="text-sm font-medium text-slate-800">{b.customerName}</div>
                    <div className="text-xs text-slate-400">
                      {b.service?.name ?? "—"} · {formatDateTime(b.date)}
                    </div>
                  </div>
                  <Badge
                    variant={
                      b.status === "CONFIRMED"
                        ? "success"
                        : b.status === "CANCELLED"
                        ? "danger"
                        : b.status === "PENDING"
                        ? "warning"
                        : "default"
                    }
                  >
                    {b.status === "PENDING" ? "En attente" :
                     b.status === "CONFIRMED" ? "Confirmé" :
                     b.status === "CANCELLED" ? "Annulé" : "Terminé"}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
