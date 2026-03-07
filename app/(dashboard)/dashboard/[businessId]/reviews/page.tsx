import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatsCard } from "@/components/dashboard/stats-card";
import { formatDateTime } from "@/lib/utils";
import { Settings, Star } from "lucide-react";
import { CopyLinkButton } from "@/components/reviews/copy-link-button";

export const metadata = { title: "Avis & Roulette" };

export default async function ReviewsDashboardPage({ params }: { params: { businessId: string } }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const dbUser = await prisma.user.findUnique({ where: { id: session.user.id }, select: { role: true } });
  const isAdmin = dbUser?.role === "ADMIN";

  const business = await prisma.business.findFirst({
    where: isAdmin ? { id: params.businessId } : { id: params.businessId, userId: session.user.id },
    include: {
      modules: true,
      reviewConfig: {
        include: {
          rewards: { orderBy: { probability: "desc" } },
        },
      },
      reviews: {
        include: { reward: true },
        orderBy: { createdAt: "desc" },
        take: 30,
      },
      _count: {
        select: {
          reviews: true,
        },
      },
    },
  });

  if (!business) notFound();

  const reviewModule = business.modules.find((m) => m.module === "REVIEWS");
  if (!reviewModule?.isActive) {
    return (
      <div className="flex flex-col items-center justify-center py-20 p-8">
        <Star className="mb-4 h-12 w-12 text-slate-300" />
        <h2 className="text-lg font-semibold text-slate-700">Module Avis non activé</h2>
        <p className="mt-2 text-sm text-slate-400">Activez ce module depuis la page Modules.</p>
        <Link href={`/dashboard/${params.businessId}/modules`}>
          <Button className="mt-4">Activer le module</Button>
        </Link>
      </div>
    );
  }

  const reviewsWithReward = business.reviews.filter((r) => r.rewardCode !== null);
  const reviewsClaimed = business.reviews.filter((r) => r.rewardClaimed);
  const publicUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/${business.slug}/avis`;

  return (
    <div className="p-4 sm:p-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Avis Google & Roulette</h1>
          <p className="mt-1 text-sm text-slate-500">
            Collectez des avis et récompensez vos clients
          </p>
        </div>
        <Link href={`/dashboard/${params.businessId}/reviews/settings`}>
          <Button variant="outline" size="sm" leftIcon={<Settings className="h-4 w-4" />}>
            Configurer
          </Button>
        </Link>
      </div>

      {/* Note Google actuelle */}
      {business.googleRating != null && business.googleReviewCount != null && (
        <div className="mb-6 rounded-2xl border border-amber-100 bg-gradient-to-r from-amber-50 to-yellow-50 p-5">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }, (_, i) => {
                const full = i < Math.floor(business.googleRating!);
                const half = !full && i === Math.floor(business.googleRating!) && business.googleRating! - Math.floor(business.googleRating!) >= 0.3;
                return (
                  <Star
                    key={i}
                    className={`h-6 w-6 ${full || half ? "fill-amber-400 text-amber-400" : "text-slate-200"}`}
                  />
                );
              })}
            </div>
            <div>
              <p className="text-lg font-bold text-slate-900">
                {business.googleRating.toFixed(1)}<span className="text-sm font-normal text-slate-400">/5</span>
              </p>
              <p className="text-sm text-slate-500">
                Votre note Google aujourd&apos;hui ({business.googleReviewCount} avis)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
        <StatsCard label="Avis initiés" value={business._count.reviews} icon="📝" color="indigo" />
        <StatsCard label="Récompenses gagnées" value={reviewsWithReward.length} icon="🎁" color="amber" />
        <StatsCard label="Récompenses utilisées" value={reviewsClaimed.length} icon="✅" color="emerald" />
      </div>

      {/* Lien QR */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Lien de la page avis</CardTitle>
        </CardHeader>
        <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-3 sm:gap-3 sm:p-4">
          <code className="min-w-0 flex-1 truncate text-xs text-indigo-700 sm:text-sm">{publicUrl}</code>
          <CopyLinkButton url={publicUrl} />
          <Link href={publicUrl} target="_blank" className="hidden sm:block">
            <Button size="sm" variant="outline">Tester</Button>
          </Link>
        </div>
        <p className="mt-3 text-xs text-slate-400">
          Affichez ce lien ou un QR code en caisse pour que vos clients puissent laisser un avis.
        </p>
      </Card>

      {/* Récompenses configurées */}
      {business.reviewConfig?.rewards && business.reviewConfig.rewards.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Récompenses de la roulette</CardTitle>
          </CardHeader>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {business.reviewConfig.rewards.map((reward) => (
              <div
                key={reward.id}
                className="flex items-center gap-3 rounded-xl border border-slate-100 p-4"
                style={{ borderLeftColor: reward.color, borderLeftWidth: 4 }}
              >
                <span className="text-2xl">{reward.emoji}</span>
                <div>
                  <div className="text-sm font-medium text-slate-800">{reward.name}</div>
                  <div className="text-xs text-slate-400">{Math.round(reward.probability * 100)}% de probabilité</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Historique */}
      <Card padding="none" className="overflow-hidden">
        <CardHeader className="px-6 pt-6">
          <CardTitle>Historique des avis</CardTitle>
        </CardHeader>
        {business.reviews.length === 0 ? (
          <div className="px-6 pb-6 text-center text-sm text-slate-400">
            Aucun avis pour le moment
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-medium text-slate-500">
                  <th className="px-6 py-3">Client</th>
                  <th className="px-6 py-3">Avis initié</th>
                  <th className="px-6 py-3">Récompense</th>
                  <th className="px-6 py-3">Code</th>
                  <th className="px-6 py-3">Utilisé</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {business.reviews.map((review) => (
                  <tr key={review.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-800">{review.customerName ?? "Anonyme"}</div>
                      <div className="text-xs text-slate-400">{formatDateTime(review.createdAt)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={review.googleReviewInitiated ? "success" : "outline"}>
                        {review.googleReviewInitiated ? "Oui" : "Non"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {review.reward ? (
                        <span>{review.reward.emoji} {review.reward.name}</span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {review.rewardCode ? (
                        <code className="rounded bg-slate-100 px-2 py-0.5 text-xs font-mono">
                          {review.rewardCode}
                        </code>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <RewardClaimToggle
                        reviewId={review.id}
                        businessId={params.businessId}
                        claimed={review.rewardClaimed}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

// Petit composant inline pour le toggle de réclamation
function RewardClaimToggle({ reviewId, businessId, claimed }: { reviewId: string; businessId: string; claimed: boolean }) {
  if (!claimed) {
    return (
      <form
        action={async () => {
          "use server";
          const { prisma: db } = await import("@/lib/prisma");
          const { revalidatePath } = await import("next/cache");
          await db.review.update({
            where: { id: reviewId },
            data: { rewardClaimed: true, rewardClaimedAt: new Date() },
          });
          revalidatePath(`/dashboard/${businessId}/reviews`);
        }}
      >
        <button type="submit" className="text-xs text-indigo-600 hover:underline">
          Marquer utilisé
        </button>
      </form>
    );
  }
  return <Badge variant="success">Utilisé</Badge>;
}
