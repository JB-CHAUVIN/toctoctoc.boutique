import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatsCard } from "@/components/dashboard/stats-card";
import { LoyaltyCardPreview } from "@/components/loyalty/loyalty-card-preview";
import { LoyaltyCardsManager } from "@/components/loyalty/loyalty-cards-manager";
import { Settings, CreditCard, ScanLine } from "lucide-react";

export const metadata = { title: "Fidélité" };

export default async function LoyaltyDashboardPage({ params }: { params: { businessId: string } }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const business = await prisma.business.findFirst({
    where: { id: params.businessId, userId: session.user.id },
    include: {
      modules: true,
      loyaltyConfig: true,
      loyaltyCards: {
        include: { stamps: { orderBy: { createdAt: "desc" } } },
        orderBy: { updatedAt: "desc" },
      },
      _count: { select: { loyaltyCards: true } },
    },
  });

  if (!business) notFound();

  const loyaltyModule = business.modules.find((m) => m.module === "LOYALTY");
  if (!loyaltyModule?.isActive) {
    return (
      <div className="flex flex-col items-center justify-center py-20 p-8">
        <CreditCard className="mb-4 h-12 w-12 text-slate-300" />
        <h2 className="text-lg font-semibold text-slate-700">Module fidélité non activé</h2>
        <p className="mt-2 text-sm text-slate-400">Activez ce module depuis la page Modules.</p>
        <Link href={`/dashboard/${params.businessId}/modules`}>
          <Button className="mt-4">Activer le module</Button>
        </Link>
      </div>
    );
  }

  const totalRewards = business.loyaltyCards.reduce((sum, c) => sum + c.totalRewards, 0);
  const avgStamps =
    business.loyaltyCards.length > 0
      ? Math.round(
          business.loyaltyCards.reduce((sum, c) => sum + c.totalStamps, 0) /
            business.loyaltyCards.length
        )
      : 0;

  const stampsRequired = business.loyaltyConfig?.stampsRequired ?? 10;
  const stampIcon = business.loyaltyConfig?.stampIcon ?? "⭐";

  // Serialize for client component
  const serializedCards = business.loyaltyCards.map((c) => ({
    id: c.id,
    qrCode: c.qrCode,
    customerName: c.customerName,
    customerEmail: c.customerEmail,
    customerPhone: c.customerPhone,
    currentStamps: c.currentStamps,
    totalStamps: c.totalStamps,
    totalRewards: c.totalRewards,
    resetCount: c.resetCount,
    lastActivityAt: c.lastActivityAt?.toISOString() ?? null,
    stamps: c.stamps.map((s) => ({
      id: s.id,
      isReward: s.isReward,
      createdAt: s.createdAt.toISOString(),
    })),
  }));

  return (
    <div className="p-4 sm:p-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Carte de fidélité</h1>
          <p className="mt-1 text-sm text-slate-500">Gérez votre programme de fidélité</p>
        </div>
        <div className="flex gap-3">
          <Link href={`/${business.slug}/fidelite`} target="_blank">
            <Button variant="outline" size="sm">Page client</Button>
          </Link>
          <Link href={`/dashboard/${params.businessId}/loyalty/stamp`}>
            <Button variant="outline" size="sm" leftIcon={<ScanLine className="h-4 w-4" />}>
              Scanner
            </Button>
          </Link>
          <Link href={`/dashboard/${params.businessId}/loyalty/settings`}>
            <Button variant="outline" size="sm" leftIcon={<Settings className="h-4 w-4" />}>
              Configurer
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-3 gap-4">
        <StatsCard label="Cartes actives" value={business._count.loyaltyCards} icon="🃏" color="indigo" />
        <StatsCard label="Récompenses distribuées" value={totalRewards} icon="🏆" color="amber" />
        <StatsCard label="Tampons moyens/carte" value={avgStamps} icon={stampIcon} color="emerald" />
      </div>

      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        {/* Card preview */}
        {business.loyaltyConfig && (
          <Card>
            <CardHeader>
              <CardTitle>Aperçu de la carte</CardTitle>
            </CardHeader>
            <LoyaltyCardPreview config={business.loyaltyConfig} businessName={business.name} logoUrl={business.logoUrl} logoBackground={business.logoBackground} />
          </Card>
        )}

        {/* Scanner shortcut */}
        <Card>
          <CardHeader>
            <CardTitle>Scanner une carte</CardTitle>
          </CardHeader>
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <p className="text-sm text-slate-500">
              Utilisez le scanner mobile pour créditer des tampons
            </p>
            <Link href={`/dashboard/${params.businessId}/loyalty/stamp`}>
              <Button leftIcon={<ScanLine className="h-4 w-4" />}>
                Ouvrir le scanner
              </Button>
            </Link>
          </div>
        </Card>
      </div>

      {/* Cards manager */}
      <Card padding="none">
        <CardHeader className="px-6 pt-6">
          <CardTitle>
            Cartes fidélité ({business._count.loyaltyCards})
          </CardTitle>
        </CardHeader>
        <div className="p-6 pt-2">
          <LoyaltyCardsManager
            businessId={params.businessId}
            initialCards={serializedCards}
            stampsRequired={stampsRequired}
            stampIcon={stampIcon}
          />
        </div>
      </Card>
    </div>
  );
}
