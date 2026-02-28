"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Settings,
  LogOut,
  Globe,
  ChevronRight,
  ChevronDown,
  Layers,
  Building2,
  ScanLine,
  Gift,
  CreditCard,
  Plus,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ModuleType } from "@prisma/client";

interface BusinessModule {
  module: ModuleType;
  isActive: boolean;
}

interface BusinessNav {
  id: string;
  name: string;
  slug: string;
  primaryColor: string;
  modules: BusinessModule[];
}

interface SidebarProps {
  businesses: BusinessNav[];
  maxBusinesses: number;
  businessCount: number;
  planLabel: string;
}

const VISIBLE_MODULES: ModuleType[] = ["SHOWCASE", "BOOKING", "REVIEWS", "LOYALTY"];

const MODULE_NAV: Record<
  string,
  {
    emoji: string;
    label: string;
    overviewHref?: (id: string) => string;
    settingsHref: (id: string) => string;
    extraLinks?: Array<{
      label: string;
      icon: React.ComponentType<{ className?: string }>;
      href: (id: string) => string;
    }>;
  }
> = {
  SHOWCASE: {
    emoji: "🌐",
    label: "Site vitrine",
    overviewHref: (id) => `/dashboard/${id}/showcase`,
    settingsHref: (id) => `/dashboard/${id}/settings`,
  },
  BOOKING: {
    emoji: "📅",
    label: "Réservations",
    overviewHref: (id) => `/dashboard/${id}/booking`,
    settingsHref: (id) => `/dashboard/${id}/booking/settings`,
  },
  REVIEWS: {
    emoji: "⭐",
    label: "Avis & Roulette",
    overviewHref: (id) => `/dashboard/${id}/reviews`,
    settingsHref: (id) => `/dashboard/${id}/reviews/settings`,
    extraLinks: [
      {
        label: "Valider un lot",
        icon: Gift,
        href: (id) => `/dashboard/${id}/reviews/validate`,
      },
    ],
  },
  LOYALTY: {
    emoji: "🎯",
    label: "Fidélité",
    overviewHref: (id) => `/dashboard/${id}/loyalty`,
    settingsHref: (id) => `/dashboard/${id}/loyalty/settings`,
    extraLinks: [
      {
        label: "Scanner",
        icon: ScanLine,
        href: (id) => `/dashboard/${id}/loyalty/stamp`,
      },
    ],
  },
};

export function Sidebar({ businesses, maxBusinesses, businessCount, planLabel }: SidebarProps) {
  const pathname = usePathname();
  // Dérive le businessId courant depuis l'URL (/dashboard/[businessId]/...)
  const currentBusinessId = pathname.match(/^\/dashboard\/([^/]+)/)?.[1];

  return (
    <aside className="flex h-full w-64 flex-shrink-0 flex-col border-r border-slate-800 bg-slate-900">
      {/* Logo */}
      <div className="flex h-14 items-center border-b border-slate-800 px-5">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-white">
            <Image src="/logo.png" alt="TocTocToc.boutique" width={20} height={20} priority />
          </div>
          <span className="text-sm font-bold text-white">TocTocToc.boutique</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3">
        {businesses.length === 0 ? (
          <div className="px-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              <Building2 className="h-4 w-4" />
              Dashboard
            </Link>
          </div>
        ) : (
          businesses.map((business) => {
            const isCurrent = business.id === currentBusinessId;
            const activeModules = VISIBLE_MODULES.filter((m) =>
              business.modules.some((bm) => bm.module === m && bm.isActive)
            );

            return (
              <div key={business.id} className="mb-1">
                {/* Business header */}
                <Link
                  href={`/dashboard/${business.id}`}
                  className={cn(
                    "flex items-center gap-2.5 px-4 py-2 transition-colors",
                    isCurrent ? "text-white" : "text-slate-400 hover:text-white"
                  )}
                >
                  <div
                    className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded text-xs font-bold text-white"
                    style={{ backgroundColor: business.primaryColor }}
                  >
                    {business.name[0].toUpperCase()}
                  </div>
                  <span className="flex-1 truncate text-sm font-semibold">{business.name}</span>
                  {isCurrent ? (
                    <ChevronDown className="h-3.5 w-3.5 flex-shrink-0 text-slate-400" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5 flex-shrink-0 text-slate-600" />
                  )}
                </Link>

                {/* Expanded: current business nav */}
                {isCurrent && (
                  <div className="pl-4 pr-2">
                    {/* Vue d'ensemble */}
                    <Link
                      href={`/dashboard/${business.id}`}
                      className={cn(
                        "flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors",
                        pathname === `/dashboard/${business.id}`
                          ? "bg-indigo-600 text-white"
                          : "text-slate-400 hover:bg-slate-800 hover:text-white"
                      )}
                    >
                      <LayoutDashboard className="h-3.5 w-3.5" />
                      {"Vue d'ensemble"}
                    </Link>

                    {/* Modules */}
                    <div className="border-slate-800 pt-1">
                      <Link
                          href={`/dashboard/${business.id}/modules`}
                          className={cn(
                              "flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors",
                              pathname.startsWith(`/dashboard/${business.id}/modules`)
                                  ? "bg-indigo-600 text-white"
                                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
                          )}
                      >
                        <Layers className="h-3.5 w-3.5" />
                        Modules
                      </Link>
                    </div>

                    {/* Voir le site public */}
                    <div className="pt-1">
                      <Link
                        href={`/${business.slug}`}
                        target="_blank"
                        className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-slate-400 transition hover:bg-slate-800 hover:text-white"
                      >
                        <Globe className="h-3.5 w-3.5" />
                        Voir le site public
                      </Link>
                    </div>

                    {/* Modules */}
                    {activeModules.length > 0 && (
                      <div className="mt-3">
                        <p className="mb-1.5 px-3 text-xs font-medium uppercase tracking-wider text-slate-500">
                          Modules
                        </p>

                        {activeModules.map((moduleKey) => {
                          const nav = MODULE_NAV[moduleKey];
                          if (!nav) return null;

                          const hasOverview = !!nav.overviewHref;
                          const settingsHref = nav.settingsHref(business.id);
                          const overviewHref = nav.overviewHref?.(business.id) ?? settingsHref;

                          const onSettings = pathname.startsWith(settingsHref);
                          const onOverview = hasOverview && pathname.startsWith(overviewHref) && !onSettings;

                          return (
                            <div key={moduleKey} className="mt-0.5">
                              {/* Module link → overview (or settings for SHOWCASE) */}
                              <Link
                                href={hasOverview ? overviewHref : settingsHref}
                                className={cn(
                                  "flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors",
                                  onOverview
                                    ? "bg-slate-700 text-white"
                                    : !hasOverview && onSettings
                                    ? "bg-indigo-600 text-white"
                                    : hasOverview && onSettings
                                    ? "bg-slate-800 text-slate-300"
                                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                                )}
                              >
                                <span className="text-sm leading-none">{nav.emoji}</span>
                                <span className="flex-1">{nav.label}</span>
                              </Link>

                              {/* Sub-links: Configurer + éventuels extras */}
                              {hasOverview && (
                                <>
                                  <Link
                                    href={settingsHref}
                                    className={cn(
                                      "ml-5 flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs transition-colors",
                                      onSettings
                                        ? "font-medium text-indigo-400"
                                        : "text-slate-500 hover:text-slate-300"
                                    )}
                                  >
                                    <Settings className="h-3 w-3" />
                                    Configurer
                                  </Link>
                                  {nav.extraLinks?.map((extra) => {
                                    const extraHref = extra.href(business.id);
                                    return (
                                      <Link
                                        key={extra.label}
                                        href={extraHref}
                                        className={cn(
                                          "ml-5 flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs transition-colors",
                                          pathname.startsWith(extraHref)
                                            ? "font-medium text-indigo-400"
                                            : "text-slate-500 hover:text-slate-300"
                                        )}
                                      >
                                        <extra.icon className="h-3 w-3" />
                                        {extra.label}
                                      </Link>
                                    );
                                  })}
                                </>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Bouton ajouter un commerce */}
        {(() => {
          const canAdd = maxBusinesses === -1 || businessCount < maxBusinesses;
          if (canAdd) {
            return (
              <div className="px-4 pt-1 pb-3">
                <Link
                  href="/dashboard?new=1"
                  className="flex w-full items-center gap-2 rounded-lg border border-dashed border-slate-700 px-3 py-2 text-sm text-slate-400 transition hover:border-indigo-500 hover:bg-slate-800 hover:text-indigo-300"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Ajouter un commerce
                </Link>
              </div>
            );
          }
          return (
            <div className="px-4 pt-1 pb-3 space-y-1.5">
              <div className="flex w-full cursor-not-allowed items-center gap-2 rounded-lg border border-dashed border-slate-800 px-3 py-2 text-sm text-slate-600">
                <Lock className="h-3.5 w-3.5 flex-shrink-0" />
                Ajouter un commerce
              </div>
              <p className="px-1 text-xs text-slate-600">
                Offre <span className="text-slate-500">{planLabel}</span> : limité à {maxBusinesses} commerce{maxBusinesses > 1 ? "s" : ""}.{" "}
                <Link href="/dashboard/billing" className="text-indigo-400 hover:text-indigo-300 underline">
                  Upgrader
                </Link>
              </p>
            </div>
          );
        })()}
      </nav>

      {/* Footer */}
      <div className="border-t border-slate-800 p-3 space-y-0.5">
        <Link
          href="/dashboard/billing"
          className={cn(
            "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition",
            pathname === "/dashboard/billing"
              ? "bg-indigo-600 text-white"
              : "text-slate-400 hover:bg-slate-800 hover:text-white"
          )}
        >
          <CreditCard className="h-4 w-4" />
          Abonnement
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-400 transition hover:bg-slate-800 hover:text-red-400"
        >
          <LogOut className="h-4 w-4" />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
