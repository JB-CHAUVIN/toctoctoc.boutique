"use client";

import { useState, useEffect } from "react";
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
  ShieldCheck,
  CalendarDays,
  Activity,
  Wallet,
  Menu,
  X,
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
  user: { name: string | null; email: string };
}

interface SidebarProps {
  businesses: BusinessNav[];
  maxBusinesses: number;
  businessCount: number;
  planLabel: string;
  isAdmin?: boolean;
}

const VISIBLE_MODULES: ModuleType[] = ["SHOWCASE", "BOOKING", "REVIEWS", "LOYALTY"];

interface SubLink {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: (id: string) => string;
}

interface ModuleNavDef {
  emoji: string;
  label: string;
  overviewLabel: string;
  overviewIcon: React.ComponentType<{ className?: string }>;
  overviewHref: (id: string) => string;
  settingsHref: (id: string) => string;
  extraLinks?: SubLink[];
}

const MODULE_NAV: Record<string, ModuleNavDef> = {
  SHOWCASE: {
    emoji: "🌐",
    label: "Site vitrine",
    overviewLabel: "Blocs & contenu",
    overviewIcon: Layers,
    overviewHref: (id) => `/dashboard/${id}/showcase`,
    settingsHref: (id) => `/dashboard/${id}/settings`,
  },
  BOOKING: {
    emoji: "📅",
    label: "Réservations",
    overviewLabel: "Agenda",
    overviewIcon: CalendarDays,
    overviewHref: (id) => `/dashboard/${id}/booking`,
    settingsHref: (id) => `/dashboard/${id}/booking/settings`,
  },
  REVIEWS: {
    emoji: "⭐",
    label: "Avis & Roulette",
    overviewLabel: "Activité",
    overviewIcon: Activity,
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
    overviewLabel: "Cartes",
    overviewIcon: Wallet,
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

export function Sidebar({ businesses, maxBusinesses, businessCount, planLabel, isAdmin }: SidebarProps) {
  const pathname = usePathname();
  const currentBusinessId = pathname.match(/^\/dashboard\/([^/]+)/)?.[1];
  const [collapsedModules, setCollapsedModules] = useState<Set<string>>(new Set());
  const [mobileOpen, setMobileOpen] = useState(false);

  // Fermer le drawer à chaque navigation
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  function toggleModule(moduleKey: string) {
    setCollapsedModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleKey)) next.delete(moduleKey);
      else next.add(moduleKey);
      return next;
    });
  }

  return (
    <>
      {/* Bouton hamburger mobile */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-3.5 z-40 flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white shadow-md md:hidden"
        aria-label="Ouvrir le menu"
      >
        <Menu className="h-4 w-4" />
      </button>

      {/* Backdrop mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

    <aside className={cn(
      "flex h-full w-64 flex-shrink-0 flex-col border-r border-slate-800 bg-slate-900 transition-transform duration-300",
      // Desktop : toujours visible dans le flux
      "md:relative md:translate-x-0",
      // Mobile : drawer fixe depuis la gauche
      "fixed inset-y-0 left-0 z-50 md:static",
      mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
    )}>
      {/* Logo */}
      <div className="flex h-14 items-center border-b border-slate-800 px-5">
        <Link href="/dashboard" className="flex min-w-0 flex-1 items-center gap-2.5">
          <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-white">
            <Image src="/logo.png" alt="TocTocToc.boutique" width={20} height={20} priority />
          </div>
          <span className="font-brand truncate text-sm font-bold text-white">TocTocToc.boutique</span>
          {isAdmin && (
            <span className="ml-auto flex flex-shrink-0 items-center gap-0.5 rounded-full bg-violet-700 px-2 py-0.5 text-[10px] font-bold text-white">
              <ShieldCheck className="h-2.5 w-2.5" />
              ADMIN
            </span>
          )}
        </Link>
        <button
          onClick={() => setMobileOpen(false)}
          className="ml-2 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-800 hover:text-white md:hidden"
          aria-label="Fermer le menu"
        >
          <X className="h-4 w-4" />
        </button>
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
                  <div className="flex-1 min-w-0">
                    <span className="block truncate text-sm font-semibold">{business.name}</span>
                    {isAdmin && (
                      <span className="block truncate text-[10px] text-slate-500">
                        {business.user.name ?? business.user.email}
                      </span>
                    )}
                  </div>
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

                          const overviewHref = nav.overviewHref(business.id);
                          const settingsHref = nav.settingsHref(business.id);
                          const extraHrefs = nav.extraLinks?.map((e) => e.href(business.id)) ?? [];

                          const onSettings = pathname.startsWith(settingsHref);
                          const onExtra = extraHrefs.some((h) => pathname.startsWith(h));
                          const onOverview = pathname.startsWith(overviewHref) && !onSettings && !onExtra;
                          const onAny = onOverview || onSettings || onExtra;
                          const isExpanded = onAny && !collapsedModules.has(moduleKey);

                          return (
                            <div key={moduleKey} className="mt-0.5">
                              {/* En-tête module — Link si inactif, bouton toggle si actif */}
                              {onAny ? (
                                <button
                                  onClick={() => toggleModule(moduleKey)}
                                  className="flex w-full items-center gap-2 rounded-lg bg-slate-800 px-3 py-1.5 text-sm text-slate-200 transition-colors hover:bg-slate-700"
                                >
                                  <span className="text-sm leading-none">{nav.emoji}</span>
                                  <span className="flex-1 text-left">{nav.label}</span>
                                  {isExpanded
                                    ? <ChevronDown className="h-3 w-3 flex-shrink-0 text-slate-500" />
                                    : <ChevronRight className="h-3 w-3 flex-shrink-0 text-slate-500" />
                                  }
                                </button>
                              ) : (
                                <Link
                                  href={overviewHref}
                                  className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
                                >
                                  <span className="text-sm leading-none">{nav.emoji}</span>
                                  <span className="flex-1">{nav.label}</span>
                                </Link>
                              )}

                              {/* Sous-liens */}
                              {isExpanded && (
                                <div className="ml-3 mt-0.5 border-l border-slate-700 pl-2">
                                  {/* Aperçu */}
                                  <Link
                                    href={overviewHref}
                                    className={cn(
                                      "flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs transition-colors",
                                      onOverview
                                        ? "font-semibold text-indigo-400"
                                        : "text-slate-500 hover:text-slate-300"
                                    )}
                                  >
                                    <nav.overviewIcon className="h-3 w-3 flex-shrink-0" />
                                    {nav.overviewLabel}
                                  </Link>

                                  {/* Liens supplémentaires */}
                                  {nav.extraLinks?.map((extra) => {
                                    const extraHref = extra.href(business.id);
                                    return (
                                      <Link
                                        key={extra.label}
                                        href={extraHref}
                                        className={cn(
                                          "flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs transition-colors",
                                          pathname.startsWith(extraHref)
                                            ? "font-semibold text-indigo-400"
                                            : "text-slate-500 hover:text-slate-300"
                                        )}
                                      >
                                        <extra.icon className="h-3 w-3 flex-shrink-0" />
                                        {extra.label}
                                      </Link>
                                    );
                                  })}

                                  {/* Configurer — toujours en dernier */}
                                  <Link
                                    href={settingsHref}
                                    className={cn(
                                      "flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs transition-colors",
                                      onSettings
                                        ? "font-semibold text-indigo-400"
                                        : "text-slate-500 hover:text-slate-300"
                                    )}
                                  >
                                    <Settings className="h-3 w-3 flex-shrink-0" />
                                    Configurer
                                  </Link>
                                </div>
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
    </>
  );
}
