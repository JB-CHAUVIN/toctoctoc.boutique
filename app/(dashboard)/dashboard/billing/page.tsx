"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { PLAN_LIMITS, CANCEL_REASONS } from "@/lib/constants";
import {
  Loader2,
  CreditCard,
  AlertTriangle,
  RefreshCcw,
  X,
  CheckCircle2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { PlanType, Subscription } from "@prisma/client";

// ─── helpers ───────────────────────────────────────────────────────────────

function formatDate(d: string | Date | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// ─── Cancel Dialog ─────────────────────────────────────────────────────────

function CancelDialog({
  sub,
  onClose,
  onConfirm,
}: {
  sub: Subscription;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
}) {
  const [reason, setReason] = useState<string>(CANCEL_REASONS[0]);
  const [extra, setExtra] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const fullReason = extra.trim() ? `${reason} — ${extra.trim()}` : reason;
    await onConfirm(fullReason);
    setLoading(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-slate-900">Se désabonner</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Raison du désabonnement
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              {CANCEL_REASONS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Précisez (optionnel)
            </label>
            <textarea
              value={extra}
              onChange={(e) => setExtra(e.target.value)}
              rows={2}
              placeholder="Des détails supplémentaires..."
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
            />
          </div>

          {sub.currentPeriodEnd && (
            <p className="text-xs text-slate-500 rounded-lg bg-slate-50 px-3 py-2">
              Votre abonnement restera actif jusqu&apos;au{" "}
              <strong>{formatDate(sub.currentPeriodEnd)}</strong>.
            </p>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Confirmer l&apos;annulation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Billing page content ──────────────────────────────────────────────────

function BillingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [sub, setSub] = useState<Subscription | null>(null);
  const [plan, setPlan] = useState<PlanType>("FREE");
  const [redirecting, setRedirecting] = useState<string | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const returnPath = "/dashboard/billing";

  const load = useCallback(async () => {
    const res = await fetch("/api/billing/subscription");
    const data = await res.json();
    if (data.success) {
      const s = data.data as Subscription | null;
      setSub(s);
      setPlan(s?.plan ?? "FREE");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (searchParams.get("billing") === "success") {
      setShowSuccess(true);
      // Nettoyer le param de l'URL sans recharger
      router.replace("/dashboard/billing", { scroll: false });
    }
  }, [searchParams, router]);

  async function goToCheckout(targetPlan: "STARTER" | "PRO") {
    setRedirecting(targetPlan);
    const res = await fetch("/api/billing/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan: targetPlan, returnPath }),
    });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      toast.error(data.error ?? "Erreur lors de la redirection");
      setRedirecting(null);
    }
  }

  async function goToPortal() {
    setRedirecting("portal");
    const res = await fetch("/api/billing/portal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ returnPath }),
    });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      toast.error(data.error ?? "Erreur");
      setRedirecting(null);
    }
  }

  async function handleCancel(reason: string) {
    const res = await fetch("/api/billing/cancel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason }),
    });
    const data = await res.json();
    if (data.success) {
      toast.success("Désabonnement planifié");
      setShowCancelDialog(false);
      load();
    } else {
      toast.error(data.error ?? "Erreur");
    }
  }

  async function handleReactivate() {
    setRedirecting("reactivate");
    const res = await fetch("/api/billing/reactivate", { method: "POST" });
    const data = await res.json();
    if (data.success) {
      toast.success("Abonnement réactivé !");
      load();
    } else {
      toast.error(data.error ?? "Erreur");
    }
    setRedirecting(null);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  const status = sub?.status ?? "ACTIVE";

  return (
    <>
      {showCancelDialog && sub && (
        <CancelDialog
          sub={sub}
          onClose={() => setShowCancelDialog(false)}
          onConfirm={handleCancel}
        />
      )}

      {/* Bandeau de succès */}
      {showSuccess && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4">
          <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-emerald-800">
              Bienvenue ! Merci pour votre confiance 🎉
            </p>
            <p className="text-xs text-emerald-700 mt-0.5">
              Votre abonnement est activé. Profitez de tous vos modules dès maintenant.
            </p>
          </div>
          <button
            onClick={() => setShowSuccess(false)}
            className="ml-auto text-emerald-400 hover:text-emerald-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* FREE */}
      {plan === "FREE" && (
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <div className="mb-5">
            <p className="text-sm font-semibold text-slate-800">Plan Gratuit</p>
            <p className="text-xs text-slate-500 mt-0.5">
              Passez à un plan payant pour débloquer plus de modules et de fonctionnalités.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-indigo-900">Starter</p>
                <span className="text-lg font-bold text-indigo-700">9€<span className="text-xs font-normal">/mois</span></span>
              </div>
              <ul className="text-xs text-indigo-700 space-y-1 mb-4">
                <li>✓ Site vitrine</li>
                <li>✓ Réservations</li>
                <li>✓ Avis & Roulette</li>
                <li>✓ Carte de fidélité</li>
              </ul>
              <button
                onClick={() => goToCheckout("STARTER")}
                disabled={!!redirecting}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
              >
                {redirecting === "STARTER" && <Loader2 className="h-4 w-4 animate-spin" />}
                Essai gratuit 14 jours
              </button>
            </div>

            <div className="rounded-xl border border-violet-100 bg-violet-50 p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-violet-900">Pro</p>
                <span className="text-lg font-bold text-violet-700">19€<span className="text-xs font-normal">/mois</span></span>
              </div>
              <ul className="text-xs text-violet-700 space-y-1 mb-4">
                <li>✓ Tout le Starter</li>
                <li>✓ 3 commerces</li>
                <li>✓ Réseaux sociaux auto</li>
                <li>✓ Support prioritaire</li>
              </ul>
              <button
                onClick={() => goToCheckout("PRO")}
                disabled={!!redirecting}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-60"
              >
                {redirecting === "PRO" && <Loader2 className="h-4 w-4 animate-spin" />}
                Essai gratuit 14 jours
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PAST_DUE */}
      {status === "PAST_DUE" && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6">
          <div className="flex items-start gap-3 mb-4">
            <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-800">Paiement en échec</p>
              <p className="text-xs text-red-600 mt-0.5">
                Votre dernier paiement a échoué. Mettez à jour votre moyen de paiement pour éviter la suspension de votre abonnement.
              </p>
            </div>
          </div>
          <button
            onClick={goToPortal}
            disabled={!!redirecting}
            className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
          >
            {redirecting === "portal" ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
            Mettre à jour mon paiement
          </button>
        </div>
      )}

      {/* TRIALING */}
      {status === "TRIALING" && (
        <div className="rounded-xl border border-indigo-100 bg-white p-6">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <p className="text-base font-semibold text-slate-900">
                  Plan {PLAN_LIMITS[plan].label}
                </p>
                <Badge variant="info">Essai gratuit</Badge>
              </div>
              <p className="text-xs text-slate-500">
                Fin de l&apos;essai : <strong>{formatDate(sub?.trialEnd)}</strong>
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Puis {PLAN_LIMITS[plan].priceMonthly}€/mois — sans engagement
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 items-center">
            <button
              onClick={goToPortal}
              disabled={!!redirecting}
              className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {redirecting === "portal" ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
              Gérer ma carte
            </button>
            <button
              onClick={() => setShowCancelDialog(true)}
              className="text-xs text-slate-400 hover:text-slate-600 underline"
            >
              Annuler l&apos;abonnement
            </button>
          </div>
        </div>
      )}

      {/* ACTIVE + cancelAtPeriodEnd */}
      {status === "ACTIVE" && sub?.cancelAtPeriodEnd && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-6">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-base font-semibold text-amber-900">
              Plan {PLAN_LIMITS[plan].label}
            </p>
            <Badge variant="warning">Annulation prévue</Badge>
          </div>
          <p className="text-xs text-amber-700 mb-5">
            Votre abonnement se terminera le <strong>{formatDate(sub.currentPeriodEnd)}</strong>. Vous passerez ensuite en plan Gratuit.
          </p>
          <button
            onClick={handleReactivate}
            disabled={!!redirecting}
            className="flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-60"
          >
            {redirecting === "reactivate" ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
            Réactiver l&apos;abonnement
          </button>
        </div>
      )}

      {/* ACTIVE */}
      {status === "ACTIVE" && !sub?.cancelAtPeriodEnd && plan !== "FREE" && (
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-base font-semibold text-slate-900">
              Plan {PLAN_LIMITS[plan].label}
            </p>
            <Badge variant="success">Actif</Badge>
          </div>
          <p className="text-xs text-slate-500 mb-1">
            {PLAN_LIMITS[plan].priceMonthly}€/mois — prochain renouvellement le{" "}
            <strong>{formatDate(sub?.currentPeriodEnd)}</strong>
          </p>
          <p className="text-xs text-slate-500 mb-5">
            {PLAN_LIMITS[plan].maxBusinesses === -1
              ? "Commerces illimités"
              : `${PLAN_LIMITS[plan].maxBusinesses} commerce(s) inclus`}
            {" · "}{PLAN_LIMITS[plan].modules.length} modules disponibles
          </p>
          <div className="flex flex-wrap gap-3 items-center">
            <button
              onClick={goToPortal}
              disabled={!!redirecting}
              className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {redirecting === "portal" ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
              Gérer ma carte / Factures
            </button>
            <button
              onClick={() => setShowCancelDialog(true)}
              className="text-xs text-slate-400 hover:text-slate-600 underline"
            >
              Se désabonner
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────

export default function BillingPage() {
  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Abonnement</h1>
        <p className="mt-1 text-sm text-slate-500">
          Gérez votre abonnement, vos factures et votre moyen de paiement
        </p>
      </div>

      <Suspense fallback={
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      }>
        <BillingContent />
      </Suspense>
    </div>
  );
}
