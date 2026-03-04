"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Plus, Building2, ExternalLink, ChevronRight, Loader2, ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { CreateBusinessDialog } from "@/components/dashboard/create-business-dialog";
import { WalkthroughAutoShow } from "@/components/dashboard/walkthrough-modal";
import type { BusinessWithModules } from "@/types";

type BusinessWithCount = BusinessWithModules & {
  _count: { bookings: number; loyaltyCards: number };
  logoUrl?: string | null;
};

function BusinessLogo({
  logoUrl, logoBackground, name, primaryColor,
  size = 10, rounded = "xl", textSize = "lg",
}: {
  logoUrl?: string | null; logoBackground?: string | null; name: string;
  primaryColor: string; size?: number; rounded?: string; textSize?: string;
}) {
  const [errored, setErrored] = useState(false);
  const cls = `flex h-${size} w-${size} flex-shrink-0 items-center justify-center rounded-${rounded}`;
  if (logoUrl && !errored) {
    return (
      <div className={`${cls} overflow-hidden border border-slate-100`} style={{ backgroundColor: logoBackground ?? "white" }}>
        <Image
          src={logoUrl} alt={name}
          width={size * 4} height={size * 4}
          className={`h-${size} w-${size} object-contain p-0.5`}
          onError={() => setErrored(true)}
        />
      </div>
    );
  }
  return (
    <div className={`${cls} text-${textSize} font-bold text-white`} style={{ backgroundColor: primaryColor }}>
      {name[0].toUpperCase()}
    </div>
  );
}

interface PlanMeta {
  plan: string;
  planLabel: string;
  maxBusinesses: number;
  businessCount: number;
}

type AdminBusiness = {
  id: string; name: string; slug: string; primaryColor: string; businessType: string | null;
  isPublished: boolean; city: string | null; logoUrl: string | null;
  user: { name: string | null; email: string };
  modules: { module: string; isActive: boolean }[];
  _count: { bookings: number; loyaltyCards: number };
};

// ── Composant principal ───────────────────────────────────────────────────────
function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminBusinesses, setAdminBusinesses] = useState<AdminBusiness[]>([]);
  const [adminLoading, setAdminLoading] = useState(false);
  const [businesses, setBusinesses] = useState<BusinessWithCount[]>([]);
  const [meta, setMeta] = useState<PlanMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    fetchBusinesses();
    fetch("/api/user/me")
      .then((r) => r.json())
      .then((d) => { if (d.success && d.data.role === "ADMIN") setIsAdmin(true); });
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    setAdminLoading(true);
    fetch("/api/admin/businesses")
      .then((r) => r.json())
      .then((d) => { if (d.success) setAdminBusinesses(d.data); })
      .finally(() => setAdminLoading(false));
  }, [isAdmin]);

  useEffect(() => {
    if (searchParams.get("new") === "1") {
      setShowCreate(true);
      router.replace("/dashboard", { scroll: false });
    }
  }, [searchParams, router]);

  async function fetchBusinesses() {
    setLoading(true);
    const res = await fetch("/api/business");
    const data = await res.json();
    if (data.success) {
      setBusinesses(data.data);
      setMeta(data.meta ?? null);
    }
    setLoading(false);
  }

  const canCreate = !meta || meta.maxBusinesses === -1 || meta.businessCount < meta.maxBusinesses;
  const upgradePlan = meta?.plan === "FREE" || meta?.plan === "STARTER" ? "Pro" : null;
  const activeModulesCount = (b: BusinessWithCount) => b.modules.filter((m) => m.isActive).length;

  return (
    <div className="p-4 sm:p-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900">Mes commerces</h1>
            {meta && (
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                {meta.planLabel} · {meta.businessCount}/{meta.maxBusinesses === -1 ? "∞" : meta.maxBusinesses}
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-slate-500">Gérez vos établissements et configurez vos modules</p>
        </div>

        <div className="relative group/btn">
          <Button
            onClick={() => canCreate && setShowCreate(true)}
            leftIcon={<Plus className="h-4 w-4" />}
            disabled={!canCreate}
            className={!canCreate ? "cursor-not-allowed opacity-50" : ""}
          >
            Nouveau commerce
          </Button>
          {!canCreate && (
            <div className="pointer-events-none absolute right-0 top-full z-10 mt-1.5 hidden w-64 rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-600 shadow-lg group-hover/btn:block">
              Vous avez atteint la limite de votre offre {meta?.planLabel}.
              {upgradePlan && (
                <span className="ml-1 font-medium text-indigo-600">
                  Passez à l&apos;offre {upgradePlan} pour ajouter plus de commerces.
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Liste */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      ) : businesses.length === 0 ? (
        <Card className="flex flex-col items-center py-16 text-center">
          <Building2 className="mb-4 h-12 w-12 text-slate-300" />
          <h2 className="text-lg font-semibold text-slate-700">Aucun commerce</h2>
          <p className="mt-2 max-w-sm text-sm text-slate-400">
            Créez votre premier commerce pour commencer à configurer vos modules.
          </p>
          <Button className="mt-6" onClick={() => setShowCreate(true)}>Créer mon premier commerce</Button>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {businesses.map((business) => (
            <Link
              key={business.id}
              href={`/dashboard/${business.id}`}
              className="group relative flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-indigo-300 hover:shadow-md"
            >
              <div className="mb-4 h-2 w-full rounded-full" style={{ background: `linear-gradient(90deg, ${business.primaryColor}, ${business.accentColor})` }} />
              <div className="mb-3 flex items-start justify-between">
                <BusinessLogo
                  logoUrl={business.logoUrl}
                  logoBackground={(business as Record<string, unknown>).logoBackground as string}
                  name={business.name}
                  primaryColor={business.primaryColor}
                />
                <Badge variant={business.isPublished ? "success" : "outline"}>
                  {business.isPublished ? "En ligne" : "Brouillon"}
                </Badge>
              </div>
              <h2 className="text-base font-semibold text-slate-900">{business.name}</h2>
              {business.businessType && <p className="mt-0.5 text-sm text-slate-400">{business.businessType}</p>}
              <div className="mt-4 flex items-center gap-4 text-xs text-slate-500">
                <span>{activeModulesCount(business)} module(s) actif(s)</span>
                <span>·</span>
                <span>{business._count.bookings} réservation(s)</span>
              </div>
              <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-4">
                <span className="flex-1 text-xs text-slate-400">/{business.slug}</span>
                <Link href={`/${business.slug}`} target="_blank" onClick={(e) => e.stopPropagation()} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
                <ChevronRight className="h-4 w-4 text-slate-400 transition group-hover:text-indigo-500" />
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Modal création */}
      <CreateBusinessDialog
        open={showCreate}
        onClose={() => setShowCreate(false)}
        isAdmin={isAdmin}
        onSuccess={() => {
          setShowCreate(false);
          fetchBusinesses();
          router.refresh();
        }}
      />

      {/* Walkthrough — auto au 1er accès (non-admin uniquement) */}
      {!isAdmin && !loading && businesses.length > 0 && (() => {
        const b = businesses[0];
        return (
          <WalkthroughAutoShow
            businessId={b.id}
            businessName={b.name}
            primaryColor={b.primaryColor}
            accentColor={b.accentColor}
            logoUrl={b.logoUrl}
          />
        );
      })()}

      {/* ── Vue Admin ── */}
      {isAdmin && (
        <div className="mt-12">
          <div className="mb-4 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-violet-500" />
            <h2 className="text-lg font-bold text-slate-900">Vue Admin — tous les commerces</h2>
            <span className="rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-medium text-violet-700">
              {adminBusinesses.length}
            </span>
          </div>

          {adminLoading ? (
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Loader2 className="h-4 w-4 animate-spin" /> Chargement...
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {adminBusinesses.map((b) => (
                <Link
                  key={b.id}
                  href={`/dashboard/${b.id}`}
                  className="group flex flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-violet-300 hover:shadow-md"
                >
                  <div className="mb-3 flex items-start gap-3">
                    <BusinessLogo
                      logoUrl={b.logoUrl}
                      logoBackground={(b as Record<string, unknown>).logoBackground as string}
                      name={b.name}
                      primaryColor={b.primaryColor}
                      size={9} rounded="lg" textSize="sm"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold text-slate-900">{b.name}</div>
                      <div className="text-xs text-slate-400">
                        {b.businessType ?? "—"}{b.city ? ` · ${b.city}` : ""}
                      </div>
                    </div>
                    <ExternalLink className="h-3.5 w-3.5 flex-shrink-0 text-slate-300 group-hover:text-violet-400" />
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>{b.user.name ?? b.user.email}</span>
                    <span>{b.modules.filter((m) => m.isActive).length} modules</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense>
      <DashboardContent />
    </Suspense>
  );
}
