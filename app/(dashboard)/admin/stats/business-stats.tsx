"use client";

type BusinessStats = {
  business: {
    id: string;
    name: string;
    businessType: string | null;
    city: string | null;
    createdAt: Date;
    isPublished: boolean;
    claimToken: string | null;
    claimedAt: Date | null;
    owner: { email: string; name: string | null } | null;
    modules: Array<{ module: string; isActive: boolean }>;
  };
  config: {
    showcaseBlocksActive: number;
    reviewConfigExists: boolean;
    googleUrlSet: boolean;
    rewardsCount: number;
    loyaltyConfigExists: boolean;
    loyaltyRewardCustom: boolean;
    loyaltyStatusesCount: number;
    bookingConfigExists: boolean;
    servicesCount: number;
  };
  activity: {
    pageHome: number;
    pageBooking: number;
    pageReviews: number;
    pageLoyalty: number;
    reviewCreated: number;
    reviewGoogleClicked: number;
    reviewSpin: number;
    bookingCreated: number;
    loyaltyCardCreated: number;
  };
  totals: {
    bookings: number;
    reviews: number;
    loyaltyCards: number;
  };
  recentLogs: Array<{
    id: string;
    action: string;
    meta: unknown;
    createdAt: Date;
  }>;
};

function Check({ ok }: { ok: boolean }) {
  return ok ? (
    <span className="text-emerald-500">✓</span>
  ) : (
    <span className="text-red-400">✗</span>
  );
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function BusinessStatsSection({
  stats,
  actionIcons,
}: {
  stats: BusinessStats;
  actionIcons: Record<string, string>;
}) {
  const { business, config, activity, totals, recentLogs } = stats;

  return (
    <div className="mb-8 space-y-6">
      {/* A. Header card */}
      <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">{business.name}</h2>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-600">
              {business.businessType && <span>{business.businessType}</span>}
              {business.city && <span>· {business.city}</span>}
              <span>· Créé le {formatDate(business.createdAt)}</span>
            </div>
            {business.owner && (
              <p className="mt-1 text-sm text-slate-500">
                Owner : {business.owner.name ?? business.owner.email}
                {business.owner.name && (
                  <span className="text-slate-400"> ({business.owner.email})</span>
                )}
              </p>
            )}
          </div>
          <div className="flex flex-col items-end gap-1">
            <span
              className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                business.isPublished
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {business.isPublished ? "Publié" : "Brouillon"}
            </span>
            {business.claimToken && (
              <span
                className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  business.claimedAt
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-amber-100 text-amber-700"
                }`}
              >
                {business.claimedAt ? "Claimé" : "Prospect"}
              </span>
            )}
          </div>
        </div>
        {/* Active modules */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {business.modules
            .filter((m) => m.isActive)
            .map((m) => (
              <span
                key={m.module}
                className="rounded-md bg-white px-2 py-0.5 text-xs font-medium text-indigo-600 shadow-sm"
              >
                {m.module}
              </span>
            ))}
        </div>
      </div>

      {/* B. Config status */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold text-slate-900">Configuration</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Showcase */}
          <div className="rounded-lg border border-slate-100 p-4">
            <h4 className="mb-2 text-sm font-semibold text-slate-700">🏠 Showcase</h4>
            <ul className="space-y-1 text-sm text-slate-600">
              <li>
                <Check ok={config.showcaseBlocksActive > 0} />{" "}
                {config.showcaseBlocksActive} bloc{config.showcaseBlocksActive > 1 ? "s" : ""} actif{config.showcaseBlocksActive > 1 ? "s" : ""}
              </li>
            </ul>
          </div>
          {/* Reviews */}
          <div className="rounded-lg border border-slate-100 p-4">
            <h4 className="mb-2 text-sm font-semibold text-slate-700">⭐ Reviews</h4>
            <ul className="space-y-1 text-sm text-slate-600">
              <li><Check ok={config.reviewConfigExists} /> Config créée</li>
              <li><Check ok={config.googleUrlSet} /> URL Google renseignée</li>
              <li><Check ok={config.rewardsCount > 0} /> {config.rewardsCount} récompense{config.rewardsCount > 1 ? "s" : ""}</li>
            </ul>
          </div>
          {/* Loyalty */}
          <div className="rounded-lg border border-slate-100 p-4">
            <h4 className="mb-2 text-sm font-semibold text-slate-700">💳 Fidélité</h4>
            <ul className="space-y-1 text-sm text-slate-600">
              <li><Check ok={config.loyaltyConfigExists} /> Config créée</li>
              <li><Check ok={config.loyaltyRewardCustom} /> Récompense personnalisée</li>
              <li><Check ok={config.loyaltyStatusesCount > 0} /> {config.loyaltyStatusesCount} statut{config.loyaltyStatusesCount > 1 ? "s" : ""} VIP</li>
            </ul>
          </div>
          {/* Booking */}
          <div className="rounded-lg border border-slate-100 p-4">
            <h4 className="mb-2 text-sm font-semibold text-slate-700">📅 Booking</h4>
            <ul className="space-y-1 text-sm text-slate-600">
              <li><Check ok={config.bookingConfigExists} /> Config créée</li>
              <li><Check ok={config.servicesCount > 0} /> {config.servicesCount} service{config.servicesCount > 1 ? "s" : ""}</li>
            </ul>
          </div>
        </div>
      </div>

      {/* C. Activity counters */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold text-slate-900">Activité</h3>

        {/* Page views */}
        <div className="mb-4">
          <h4 className="mb-2 text-sm font-semibold text-slate-500 uppercase tracking-wide">Pages vues</h4>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Accueil", value: activity.pageHome },
              { label: "Réservation", value: activity.pageBooking },
              { label: "Avis", value: activity.pageReviews },
              { label: "Fidélité", value: activity.pageLoyalty },
            ].map((item) => (
              <div key={item.label} className="rounded-lg bg-slate-50 p-3 text-center">
                <p className="text-2xl font-bold text-slate-900">{item.value}</p>
                <p className="text-xs text-slate-500">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Funnel reviews */}
        <div className="mb-4">
          <h4 className="mb-2 text-sm font-semibold text-slate-500 uppercase tracking-wide">Funnel avis</h4>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Avis créés", value: activity.reviewCreated, color: "bg-blue-50" },
              { label: "Clic Google", value: activity.reviewGoogleClicked, color: "bg-amber-50" },
              { label: "Spin roulette", value: activity.reviewSpin, color: "bg-emerald-50" },
            ].map((item) => (
              <div key={item.label} className={`rounded-lg ${item.color} p-3 text-center`}>
                <p className="text-2xl font-bold text-slate-900">{item.value}</p>
                <p className="text-xs text-slate-500">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Other actions + DB totals */}
        <div className="mb-2">
          <h4 className="mb-2 text-sm font-semibold text-slate-500 uppercase tracking-wide">Compteurs</h4>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {[
              { label: "Résa (logs)", value: activity.bookingCreated },
              { label: "Cartes (logs)", value: activity.loyaltyCardCreated },
              { label: "Résa (DB)", value: totals.bookings },
              { label: "Avis (DB)", value: totals.reviews },
              { label: "Cartes (DB)", value: totals.loyaltyCards },
            ].map((item) => (
              <div key={item.label} className="rounded-lg bg-slate-50 p-3 text-center">
                <p className="text-xl font-bold text-slate-900">{item.value}</p>
                <p className="text-xs text-slate-500">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* D. Timeline */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold text-slate-900">
          Timeline ({recentLogs.length} derniers événements)
        </h3>
        {recentLogs.length === 0 ? (
          <p className="text-sm text-slate-500">Aucune activité enregistrée pour ce commerce.</p>
        ) : (
          <div className="space-y-2">
            {recentLogs.map((log) => {
              const meta = log.meta as Record<string, unknown> | null;
              const icon = actionIcons[log.action] ?? "📋";
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
                      <p className="mt-0.5 truncate text-xs text-slate-500">
                        {Object.entries(meta)
                          .filter(([k]) => k !== "businessId")
                          .map(([k, v]) => `${k}: ${v}`)
                          .join(" · ")}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
