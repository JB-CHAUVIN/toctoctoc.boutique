import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatsCard } from "@/components/dashboard/stats-card";
import { LoyaltyCardPreview } from "@/components/loyalty/loyalty-card-preview";
import { QrScanner } from "@/components/loyalty/qr-scanner";
import { Settings, CreditCard } from "lucide-react";

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
        include: { stamps: { orderBy: { createdAt: "desc" }, take: 1 } },
        orderBy: { updatedAt: "desc" },
        take: 20,
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

  return (
    <div className="p-8">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Carte de fidélité</h1>
          <p className="mt-1 text-sm text-slate-500">Gérez votre programme de fidélité</p>
        </div>
        <div className="flex gap-3">
          <Link href={`/${business.slug}/fidelite`} target="_blank">
            <Button variant="outline" size="sm">Page client</Button>
          </Link>
          <Link href={`/dashboard/${params.businessId}/loyalty/settings`}>
            <Button variant="outline" size="sm" leftIcon={<Settings className="h-4 w-4" />}>
              Configurer
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        <StatsCard label="Cartes actives" value={business._count.loyaltyCards} icon="🃏" color="indigo" />
        <StatsCard label="Récompenses distribuées" value={totalRewards} icon="🏆" color="amber" />
        <StatsCard label="Tampons moyens/carte" value={avgStamps} icon="⭐" color="emerald" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Aperçu de la carte */}
        {business.loyaltyConfig && (
          <Card>
            <CardHeader>
              <CardTitle>Aperçu de la carte</CardTitle>
            </CardHeader>
            <LoyaltyCardPreview config={business.loyaltyConfig} businessName={business.name} />
          </Card>
        )}

        {/* Scanner QR code */}
        <Card>
          <CardHeader>
            <CardTitle>Scanner une carte</CardTitle>
          </CardHeader>
          <QrScanner businessId={params.businessId} />
        </Card>
      </div>

      {/* Liste des cartes */}
      <Card className="mt-6" padding="none">
        <CardHeader className="px-6 pt-6">
          <CardTitle>Cartes fidélité ({business._count.loyaltyCards})</CardTitle>
        </CardHeader>
        {business.loyaltyCards.length === 0 ? (
          <div className="px-6 pb-6 text-center text-sm text-slate-400">
            Aucune carte créée — vos clients peuvent en créer une depuis la page publique
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-medium text-slate-500">
                  <th className="px-6 py-3">Client</th>
                  <th className="px-6 py-3">Tampons</th>
                  <th className="px-6 py-3">Récompenses</th>
                  <th className="px-6 py-3">Dernière activité</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {business.loyaltyCards.map((card) => {
                  const stampsRequired = business.loyaltyConfig?.stampsRequired ?? 10;
                  const progress = (card.totalStamps % stampsRequired) || (card.totalStamps === 0 ? 0 : stampsRequired);
                  return (
                    <tr key={card.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-800">{card.customerName}</div>
                        <div className="text-xs text-slate-400">{card.customerEmail ?? card.customerPhone ?? "—"}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-24 rounded-full bg-slate-100">
                            <div
                              className="h-full rounded-full bg-indigo-500 transition-all"
                              style={{ width: `${(progress / stampsRequired) * 100}%` }}
                            />
                          </div>
                          <span className="text-xs text-slate-500">{progress}/{stampsRequired}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{card.totalRewards}</td>
                      <td className="px-6 py-4 text-slate-400 text-xs">
                        {card.stamps[0]
                          ? new Date(card.stamps[0].createdAt).toLocaleDateString("fr-FR")
                          : "Jamais"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
