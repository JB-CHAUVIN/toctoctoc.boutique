import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { BusinessStatsSection } from "./business-stats";
import { BusinessSearch } from "./business-search";
import { ProspectStepperGlobal } from "@/components/dashboard/prospect-stepper";
import { batchGetProspectData, computeProspectStep, PROSPECT_STEPS } from "@/lib/prospect-steps";
import { VISITOR_TYPE_LABELS, type VisitorType } from "@/lib/visitor-type";

// Force dynamic rendering
export const dynamic = "force-dynamic";

const ACTION_ICONS: Record<string, string> = {
  "claim.page_viewed": "👀",
  "claim.form_submitted": "📝",
  "claim.success": "✅",
  "claim.already_claimed": "🔒",
  "business.published": "🌐",
  "business.created": "🏪",
  "page.home": "🏠",
  "page.booking": "📅",
  "page.reviews": "⭐",
  "page.loyalty": "💳",
  "review.created": "✍️",
  "review.google_clicked": "🔗",
  "review.spin": "🎰",
  "booking.created": "📆",
  "loyalty.card_created": "🃏",
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export default async function AdminStatsPage({
  searchParams,
}: {
  searchParams: { businessId?: string };
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  if (user?.role !== "ADMIN") redirect("/dashboard");

  // Fetch all businesses for the selector
  const allBusinesses = await prisma.business.findMany({
    where: { deletedAt: null },
    select: { id: true, name: true, city: true, businessType: true, isPublished: true },
    orderBy: { name: "asc" },
  });

  const selectedBusinessId = searchParams.businessId;

  // ── Per-business stats ──
  let businessStats = null;
  if (selectedBusinessId) {
    const business = await prisma.business.findUnique({
      where: { id: selectedBusinessId },
      include: {
        user: { select: { email: true, name: true } },
        modules: true,
      },
    });

    if (business) {
      const [
        showcaseBlocksCount,
        reviewConfig,
        rewardsCount,
        loyaltyConfig,
        loyaltyStatusesCount,
        bookingConfig,
        servicesCount,
        totalBookings,
        totalReviews,
        totalLoyaltyCards,
        logs,
        logCounts,
      ] = await Promise.all([
        prisma.showcaseBlock.count({ where: { businessId: selectedBusinessId, isActive: true } }),
        prisma.reviewConfig.findUnique({ where: { businessId: selectedBusinessId }, select: { googleUrl: true } }),
        prisma.reward.count({ where: { reviewConfig: { businessId: selectedBusinessId }, isActive: true } }),
        prisma.loyaltyConfig.findUnique({ where: { businessId: selectedBusinessId }, select: { rewardName: true } }),
        prisma.loyaltyStatus.count({ where: { businessId: selectedBusinessId } }),
        prisma.bookingConfig.findUnique({ where: { businessId: selectedBusinessId }, select: { id: true } }),
        prisma.service.count({ where: { bookingConfig: { businessId: selectedBusinessId }, isActive: true } }),
        prisma.booking.count({ where: { businessId: selectedBusinessId } }),
        prisma.review.count({ where: { businessId: selectedBusinessId } }),
        prisma.loyaltyCard.count({ where: { businessId: selectedBusinessId } }),
        prisma.$queryRawUnsafe<Array<{ id: string; action: string; meta: string; createdAt: Date }>>(
          `SELECT id, action, meta, createdAt FROM Log WHERE JSON_EXTRACT(meta, '$.businessId') = ? ORDER BY createdAt DESC LIMIT 30`,
          selectedBusinessId
        ),
        prisma.$queryRawUnsafe<Array<{ action: string; count: bigint }>>(
          `SELECT action, COUNT(*) as count FROM Log WHERE JSON_EXTRACT(meta, '$.businessId') = ? GROUP BY action`,
          selectedBusinessId
        ),
      ]);

      const actionCounts: Record<string, number> = {};
      for (const row of logCounts) {
        actionCounts[row.action] = Number(row.count);
      }

      businessStats = {
        business: {
          id: business.id,
          name: business.name,
          businessType: business.businessType,
          city: business.city,
          createdAt: business.createdAt,
          isPublished: business.isPublished,
          claimToken: business.claimToken,
          claimedAt: business.claimedAt,
          owner: business.user,
          modules: business.modules,
        },
        config: {
          showcaseBlocksActive: showcaseBlocksCount,
          reviewConfigExists: !!reviewConfig,
          googleUrlSet: !!reviewConfig?.googleUrl,
          rewardsCount,
          loyaltyConfigExists: !!loyaltyConfig,
          loyaltyRewardCustom: loyaltyConfig ? loyaltyConfig.rewardName !== "Un produit offert" : false,
          loyaltyStatusesCount,
          bookingConfigExists: !!bookingConfig,
          servicesCount,
        },
        activity: {
          pageHome: actionCounts["page.home"] ?? 0,
          pageBooking: actionCounts["page.booking"] ?? 0,
          pageReviews: actionCounts["page.reviews"] ?? 0,
          pageLoyalty: actionCounts["page.loyalty"] ?? 0,
          reviewCreated: actionCounts["review.created"] ?? 0,
          reviewGoogleClicked: actionCounts["review.google_clicked"] ?? 0,
          reviewSpin: actionCounts["review.spin"] ?? 0,
          bookingCreated: actionCounts["booking.created"] ?? 0,
          loyaltyCardCreated: actionCounts["loyalty.card_created"] ?? 0,
        },
        totals: {
          bookings: totalBookings,
          reviews: totalReviews,
          loyaltyCards: totalLoyaltyCards,
        },
        recentLogs: logs.map((l) => ({
          ...l,
          meta: typeof l.meta === "string" ? JSON.parse(l.meta) : l.meta,
        })),
      };
    }
  }

  // ── Global stats ──
  // ── Page view stats ──
  const [pageviewsByPath, recentPageviews, totalPageviews, visitorTypeCounts] = await Promise.all([
    prisma.$queryRaw<Array<{ pathname: string; count: bigint }>>`
      SELECT CAST(JSON_UNQUOTE(JSON_EXTRACT(meta, '$.pathname')) AS CHAR) AS pathname, COUNT(*) AS count
      FROM Log WHERE action = 'pageview'
      GROUP BY pathname ORDER BY count DESC LIMIT 20
    `,
    prisma.log.findMany({
      where: { action: "pageview" },
      orderBy: { createdAt: "desc" },
      take: 30,
      select: { id: true, meta: true, createdAt: true },
    }),
    prisma.log.count({ where: { action: "pageview" } }),
    prisma.$queryRaw<Array<{ visitorType: string; count: bigint }>>`
      SELECT COALESCE(CAST(JSON_UNQUOTE(JSON_EXTRACT(meta, '$.visitorType')) AS CHAR), 'human') AS visitorType,
             COUNT(*) AS count
      FROM Log WHERE action = 'pageview'
      GROUP BY visitorType ORDER BY count DESC
    `,
  ]);

  const topPages = pageviewsByPath.map((r) => ({
    pathname: r.pathname,
    count: Number(r.count),
  }));

  const visitorBreakdown = visitorTypeCounts.map((r) => ({
    type: r.visitorType as VisitorType,
    count: Number(r.count),
  }));

  // ── Global stats ──
  const [
    totalBusinesses,
    prospectedBusinesses,
    claimedBusinesses,
    totalUsers,
    claimPageViews,
    claimFormSubmitted,
    claimSuccessCount,
    prospects,
    recentLogs,
  ] = await Promise.all([
    prisma.business.count({ where: { deletedAt: null } }),
    prisma.business.count({ where: { claimToken: { not: null }, deletedAt: null } }),
    prisma.business.count({ where: { claimedAt: { not: null }, deletedAt: null } }),
    prisma.user.count(),
    prisma.log.count({ where: { action: "claim.page_viewed" } }),
    prisma.log.count({ where: { action: "claim.form_submitted" } }),
    prisma.log.count({ where: { action: "claim.success" } }),
    prisma.business.findMany({
      where: { claimToken: { not: null }, deletedAt: null },
      select: {
        id: true,
        name: true,
        businessType: true,
        city: true,
        claimToken: true,
        claimedAt: true,
        prospectedAt: true,
        createdAt: true,
        user: { select: { email: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.log.findMany({
      where: { action: { not: "pageview" } },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ]);

  // Build prospect status map from logs
  const prospectIds = prospects.map((p) => p.id);
  const prospectLogs = await prisma.log.findMany({
    where: {
      action: { in: ["claim.page_viewed", "claim.form_submitted", "claim.success"] },
    },
    select: { action: true, meta: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  const prospectStatusMap: Record<string, { status: string; date: Date; email?: string }> = {};
  const priority: Record<string, number> = {
    "claim.success": 3,
    "claim.form_submitted": 2,
    "claim.page_viewed": 1,
  };

  for (const log of prospectLogs) {
    const meta = log.meta as Record<string, unknown> | null;
    const businessId = meta?.businessId as string | undefined;
    if (!businessId || !prospectIds.includes(businessId)) continue;

    const existing = prospectStatusMap[businessId];
    if (!existing || (priority[log.action] ?? 0) > (priority[existing.status] ?? 0)) {
      prospectStatusMap[businessId] = {
        status: log.action,
        date: log.createdAt,
        email: (meta?.email as string) || existing?.email,
      };
    }
  }

  // Compute prospect pipeline step counts
  const prospectIdsForSteps = prospects.map((p) => p.id);
  const prospectDataMap = await batchGetProspectData(prospectIdsForSteps, prisma);
  const stepCounts = new Array(PROSPECT_STEPS.length).fill(0);
  for (const p of prospects) {
    const data = prospectDataMap[p.id];
    const step = computeProspectStep({
      hasClaimToken: !!p.claimToken,
      prospectedAt: p.prospectedAt,
      claimedAt: p.claimedAt,
      logActions: data?.logActions ?? new Set(),
      hasProductUsed: data?.hasProductUsed ?? false,
    });
    stepCounts[step]++;
  }

  const conversionRate = prospectedBusinesses > 0
    ? Math.round((claimedBusinesses / prospectedBusinesses) * 100)
    : 0;

  // Funnel data
  const funnelSteps = [
    { label: "Prospectés", value: prospectedBusinesses, color: "bg-slate-500" },
    { label: "Page vue", value: claimPageViews, color: "bg-blue-500" },
    { label: "Formulaire soumis", value: claimFormSubmitted, color: "bg-amber-500" },
    { label: "Compte créé", value: claimSuccessCount, color: "bg-emerald-500" },
  ];
  const maxFunnel = Math.max(...funnelSteps.map((s) => s.value), 1);

  return (
    <div className="mx-auto max-w-6xl p-6 sm:p-8">
      <h1 className="mb-8 text-2xl font-bold text-slate-900">Stats & Pilotage</h1>

      {/* ── Business Selector ── */}
      <div className="mb-8 rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Stats par commerce</h2>
        <BusinessSearch businesses={allBusinesses} selectedId={selectedBusinessId} />
      </div>

      {/* ── Per-business stats ── */}
      {businessStats && (
        <BusinessStatsSection stats={businessStats} actionIcons={ACTION_ICONS} />
      )}

      {/* ── Trafic pages ── */}
      <div className="mb-8 rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">
          Trafic pages
          <span className="ml-2 text-sm font-normal text-slate-400">
            ({totalPageviews} vues totales)
          </span>
        </h2>

        {/* Visitor type breakdown */}
        {visitorBreakdown.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-3">
            {visitorBreakdown.map((v) => {
              const info = VISITOR_TYPE_LABELS[v.type] ?? VISITOR_TYPE_LABELS.other_bot;
              const pct = totalPageviews > 0 ? Math.round((v.count / totalPageviews) * 100) : 0;
              return (
                <div
                  key={v.type}
                  className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50 px-4 py-2"
                >
                  <span className="text-lg">{info.emoji}</span>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {v.count} <span className="text-xs font-normal text-slate-400">({pct}%)</span>
                    </p>
                    <p className="text-xs text-slate-500">{info.label}</p>
                  </div>
                  <div className={`h-2 w-2 rounded-full ${info.color}`} />
                </div>
              );
            })}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Top pages */}
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
              Pages les plus visitées
            </h3>
            {topPages.length === 0 ? (
              <p className="text-sm text-slate-500">Aucune donnée.</p>
            ) : (
              <div className="space-y-2">
                {topPages.map((p, i) => {
                  const pct = Math.round((p.count / topPages[0].count) * 100);
                  return (
                    <div key={p.pathname} className="flex items-center gap-3">
                      <span className="w-6 text-right text-xs font-medium text-slate-400">
                        {i + 1}.
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between text-sm">
                          <span className="truncate font-mono text-slate-700">
                            {p.pathname}
                          </span>
                          <span className="ml-2 font-bold text-slate-900">
                            {p.count}
                          </span>
                        </div>
                        <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-indigo-500 transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent page views */}
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
              Visites récentes
            </h3>
            {recentPageviews.length === 0 ? (
              <p className="text-sm text-slate-500">Aucune visite enregistrée.</p>
            ) : (
              <div className="space-y-1 max-h-[400px] overflow-y-auto">
                {recentPageviews.map((pv) => {
                  const meta = pv.meta as Record<string, unknown> | null;
                  const pathname = meta?.pathname as string;
                  const ip = meta?.ip as string | undefined;
                  const vType = (meta?.visitorType as VisitorType) ?? "human";
                  const vInfo = VISITOR_TYPE_LABELS[vType] ?? VISITOR_TYPE_LABELS.other_bot;
                  return (
                    <div
                      key={pv.id}
                      className="flex items-center gap-3 rounded-lg px-3 py-1.5 hover:bg-slate-50"
                    >
                      <span className="text-base">{vInfo.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="truncate font-mono text-xs font-medium text-slate-700">
                            {pathname}
                          </span>
                          <span
                            className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium text-white ${vInfo.color}`}
                          >
                            {vInfo.label}
                          </span>
                          <span className="text-xs text-slate-400">
                            {formatDate(pv.createdAt)}
                          </span>
                        </div>
                        {ip && (
                          <div className="text-xs text-slate-400">
                            <a
                              href={`https://whatismyipaddress.com/ip/${ip}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-indigo-600 underline hover:text-indigo-800"
                            >
                              {ip}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Global KPIs ── */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {[
          { label: "Businesses", value: totalBusinesses },
          { label: "Prospectés", value: prospectedBusinesses },
          { label: "Claimés", value: claimedBusinesses },
          { label: "Taux conversion", value: `${conversionRate}%` },
          { label: "Utilisateurs", value: totalUsers },
          { label: "Pages claim vues", value: claimPageViews },
        ].map((kpi) => (
          <div key={kpi.label} className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-medium text-slate-500">{kpi.label}</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Pipeline prospects */}
      <div className="mb-8 rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Pipeline prospects</h2>
        <ProspectStepperGlobal stepCounts={stepCounts} />
      </div>

      {/* Activity feed */}
      <div className="mb-8 rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Derniers événements</h2>
        {recentLogs.length === 0 ? (
          <p className="text-sm text-slate-500">Aucun événement enregistré.</p>
        ) : (
          <div className="space-y-2">
            {recentLogs.map((log) => {
              const meta = log.meta as Record<string, unknown> | null;
              const icon = ACTION_ICONS[log.action] ?? "📋";
              return (
                <div
                  key={log.id}
                  className="flex items-start gap-3 rounded-lg px-3 py-2 hover:bg-slate-50"
                >
                  <span className="mt-0.5 text-base">{icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-medium text-slate-700">
                        {log.action}
                      </span>
                      <span className="text-xs text-slate-400">
                        {formatDate(log.createdAt)}
                      </span>
                    </div>
                    {meta && (
                      <div className="mt-0.5 truncate text-xs text-slate-500">
                        {Object.entries(meta)
                          .filter(([k]) => k !== "businessId")
                          .map(([k, v]) => {
                            const strVal = String(v);
                            const isIp = k === "ip" || /^(\d{1,3}\.){3}\d{1,3}$/.test(strVal);
                            if (isIp) {
                              return (
                                <span key={k}>
                                  {k}:{" "}
                                  <a
                                    href={`https://whatismyipaddress.com/ip/${strVal}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-indigo-600 underline hover:text-indigo-800"
                                  >
                                    {strVal}
                                  </a>
                                </span>
                              );
                            }
                            return <span key={k}>{k}: {strVal}</span>;
                          })
                          .reduce<React.ReactNode[]>((acc, el, i) => {
                            if (i > 0) acc.push(<span key={`sep-${i}`}> · </span>);
                            acc.push(el);
                            return acc;
                          }, [])}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Funnel */}
      <div className="mb-8 rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Funnel de conversion</h2>
        <div className="space-y-3">
          {funnelSteps.map((step, i) => {
            const pct = Math.round((step.value / maxFunnel) * 100);
            const dropPct = i > 0 && funnelSteps[i - 1].value > 0
              ? Math.round(((funnelSteps[i - 1].value - step.value) / funnelSteps[i - 1].value) * 100)
              : null;
            return (
              <div key={step.label}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-700">{step.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{step.value}</span>
                    {dropPct !== null && dropPct > 0 && (
                      <span className="text-xs text-red-500">-{dropPct}%</span>
                    )}
                  </div>
                </div>
                <div className="h-6 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full ${step.color} transition-all`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Prospects table */}
      <div className="mb-8 rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Prospects récents</h2>
        {prospects.length === 0 ? (
          <p className="text-sm text-slate-500">Aucun prospect pour le moment.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs font-medium uppercase text-slate-500">
                  <th className="pb-2 pr-4">Commerce</th>
                  <th className="pb-2 pr-4">Ville</th>
                  <th className="pb-2 pr-4">Statut</th>
                  <th className="pb-2 pr-4">Créé le</th>
                  <th className="pb-2 pr-4">Claimé le</th>
                  <th className="pb-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {prospects.map((p) => {
                  const logStatus = prospectStatusMap[p.id];
                  let statusLabel: string;
                  let statusClass: string;

                  if (p.claimedAt || logStatus?.status === "claim.success") {
                    statusLabel = "✅ Activé";
                    statusClass = "text-emerald-600";
                  } else if (logStatus?.status === "claim.form_submitted") {
                    statusLabel = "📝 Formulaire soumis";
                    statusClass = "text-amber-600";
                  } else if (logStatus?.status === "claim.page_viewed") {
                    statusLabel = "👀 Page vue";
                    statusClass = "text-blue-600";
                  } else {
                    statusLabel = "📨 Envoyé";
                    statusClass = "text-slate-500";
                  }

                  return (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="py-2 pr-4">
                        <div className="font-medium text-slate-900">{p.name}</div>
                        {p.businessType && (
                          <div className="text-xs text-slate-400">{p.businessType}</div>
                        )}
                      </td>
                      <td className="py-2 pr-4 text-slate-600">{p.city ?? "—"}</td>
                      <td className={`py-2 pr-4 font-medium ${statusClass}`}>
                        {statusLabel}
                        {logStatus?.email && (
                          <div className="text-xs font-normal text-slate-400">{logStatus.email}</div>
                        )}
                      </td>
                      <td className="py-2 pr-4 text-slate-500">{formatDate(p.createdAt)}</td>
                      <td className="py-2 pr-4 text-slate-500">
                        {p.claimedAt ? formatDate(p.claimedAt) : "—"}
                      </td>
                      <td className="py-2">
                        {p.claimedAt && (
                          <Link
                            href={`/dashboard/${p.id}`}
                            className="text-xs font-medium text-indigo-600 hover:text-indigo-800"
                          >
                            Voir →
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
