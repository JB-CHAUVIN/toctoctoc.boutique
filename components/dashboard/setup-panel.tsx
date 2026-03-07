"use client";

import { useState } from "react";
import { Copy, Check, Settings2, ChevronDown } from "lucide-react";
import toast from "react-hot-toast";
import { ProspectLetterButton } from "./prospect-letter";
import { ProspectStepper } from "./prospect-stepper";
import { RefreshGoogleButton } from "./refresh-google-button";

const PAPER_TYPES = ["A4 200g", "A4 Photo"] as const;
const PRINTABLE_SIZES = ["9.3 × 9.3 cm", "10 × 10 cm", "10 × 15 cm"] as const;

interface BusinessInfo {
  name: string;
  slug: string;
  businessType: string | null;
  address: string | null;
  city: string | null;
  zipCode: string | null;
  phone: string | null;
  email: string | null;
  primaryColor: string;
  accentColor: string;
  logoUrl?: string | null;
  logoBackground?: string | null;
  googleRating?: number | null;
  googleReviewCount?: number | null;
  googleMapsUrl?: string | null;
}

interface ProspectInfoData {
  paperType: string;
  printableSize: string;
}

interface Props {
  businessId: string;
  appUrl: string;
  prospectedAt: Date | null;
  business: BusinessInfo;
  claimToken: string | null;
  prospectInfo?: ProspectInfoData | null;
  promoCode?: string | null;
  stripePromoCodeId?: string | null;
  prospectStep?: number;
  brandStyle?: Record<string, string> | null;
}

function CopyButton({ url, label }: { url: string; label: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-2 rounded-xl border border-violet-200 bg-white px-4 py-2 text-sm font-medium text-violet-700 shadow-sm transition hover:border-violet-300 hover:bg-violet-50"
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-green-500" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
      {copied ? "Copié !" : label}
    </button>
  );
}

export function SetupPanel({
  businessId,
  appUrl,
  prospectedAt: initialProspectedAt,
  business,
  claimToken,
  prospectInfo: initialProspectInfo,
  promoCode,
  stripePromoCodeId,
  prospectStep,
  brandStyle,
}: Props) {
  const [prospectedAt, setProspectedAt] = useState<Date | null>(
    initialProspectedAt,
  );
  const [loading, setLoading] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [paperType, setPaperType] = useState(initialProspectInfo?.paperType ?? "A4 200g");
  const [printableSize, setPrintableSize] = useState(initialProspectInfo?.printableSize ?? "9.3 × 9.3 cm");
  const [saving, setSaving] = useState(false);
  const [promoActive, setPromoActive] = useState(true);
  const [promoToggling, setPromoToggling] = useState(false);

  async function handleToggleProspected() {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/businesses/${businessId}/prospect`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prospected: !prospectedAt }),
        },
      );
      if (res.ok) {
        setProspectedAt(prospectedAt ? null : new Date());
      }
    } finally {
      setLoading(false);
    }
  }

  async function saveProspectInfo(field: string, value: string) {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/businesses/${businessId}/prospect-info`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      });
      if (res.ok) {
        toast.success("Info prospection sauvegardée");
      } else {
        toast.error("Erreur lors de la sauvegarde");
      }
    } catch {
      toast.error("Erreur réseau");
    } finally {
      setSaving(false);
    }
  }

  async function handleTogglePromo() {
    if (!stripePromoCodeId) return;
    setPromoToggling(true);
    try {
      const res = await fetch(`/api/admin/businesses/${businessId}/promo-code`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !promoActive }),
      });
      if (res.ok) {
        setPromoActive(!promoActive);
        toast.success(promoActive ? "Code promo désactivé" : "Code promo réactivé");
      } else {
        toast.error("Erreur lors du toggle");
      }
    } catch {
      toast.error("Erreur réseau");
    } finally {
      setPromoToggling(false);
    }
  }

  const reviewsUrl = `${appUrl}/${businessId}/avis`;
  const loyaltyUrl = `${appUrl}/${businessId}/fidelite`;

  return (
    <div className="mb-6 rounded-2xl border border-violet-200 bg-violet-50 p-5">
      <div className="mb-4 flex items-center gap-2">
        <Settings2 className="h-4 w-4 text-violet-600" />
        <h2 className="text-sm font-semibold text-violet-800">Prospection</h2>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <ProspectLetterButton
          business={business}
          businessId={businessId}
          claimToken={claimToken}
          appUrl={appUrl}
          brandStyle={brandStyle}
        />

        <CopyButton url={reviewsUrl} label="Copier lien avis" />
        <CopyButton url={loyaltyUrl} label="Copier lien fidélité" />

        <RefreshGoogleButton
          businessId={businessId}
          hasGoogleMapsUrl={!!business.googleMapsUrl}
        />

        <button
          onClick={handleToggleProspected}
          disabled={loading}
          className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium shadow-sm transition disabled:opacity-60 ${
            prospectedAt
              ? "border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
              : "border-violet-200 bg-white text-violet-700 hover:border-violet-300 hover:bg-violet-50"
          }`}
        >
          {prospectedAt ? (
            <>
              <Check className="h-3.5 w-3.5" />
              Prospecté le{" "}
              {new Date(prospectedAt).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </>
          ) : (
            <>Prospecté OK</>
          )}
        </button>

        <button
          onClick={() => setDetailsOpen(!detailsOpen)}
          className="flex items-center gap-1.5 rounded-xl border border-violet-200 bg-white px-3 py-2 text-xs font-medium text-violet-600 shadow-sm transition hover:border-violet-300 hover:bg-violet-50"
        >
          Détails
          <ChevronDown className={`h-3 w-3 transition-transform ${detailsOpen ? "rotate-180" : ""}`} />
        </button>
      </div>

      {claimToken && (
        <div className="mt-2">
          <a
            href={`${appUrl}/claim/${claimToken}`}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-violet-400 underline decoration-violet-300 hover:text-violet-600"
          >
            Voir la page revendiquer
          </a>
        </div>
      )}

      {/* Code promo Stripe */}
      {promoCode && (
        <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5">
          <span className="text-xs font-medium text-amber-700">Code promo -40% :</span>
          <code className="rounded bg-white px-2 py-0.5 text-sm font-bold text-amber-900 border border-amber-200">{promoCode}</code>
          <CopyButton url={promoCode} label="Copier" />
          {stripePromoCodeId && (
            <button
              onClick={handleTogglePromo}
              disabled={promoToggling}
              className={`ml-auto rounded-lg px-3 py-1 text-xs font-medium transition disabled:opacity-60 ${
                promoActive
                  ? "bg-green-100 text-green-700 hover:bg-green-200"
                  : "bg-slate-100 text-slate-500 hover:bg-slate-200"
              }`}
            >
              {promoActive ? "Actif" : "Désactivé"}
            </button>
          )}
        </div>
      )}

      {detailsOpen && (
        <div className="mt-4 flex flex-wrap items-end gap-4 rounded-xl border border-violet-100 bg-white p-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-violet-600">
              Type de papier
            </label>
            <select
              value={paperType}
              onChange={(e) => {
                setPaperType(e.target.value);
                saveProspectInfo("paperType", e.target.value);
              }}
              disabled={saving}
              className="rounded-lg border border-violet-200 bg-white px-3 py-1.5 text-sm text-slate-700 shadow-sm focus:border-violet-400 focus:outline-none focus:ring-1 focus:ring-violet-400"
            >
              {PAPER_TYPES.map((pt) => (
                <option key={pt} value={pt}>{pt}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-violet-600">
              Taille printables
            </label>
            <select
              value={printableSize}
              onChange={(e) => {
                setPrintableSize(e.target.value);
                saveProspectInfo("printableSize", e.target.value);
              }}
              disabled={saving}
              className="rounded-lg border border-violet-200 bg-white px-3 py-1.5 text-sm text-slate-700 shadow-sm focus:border-violet-400 focus:outline-none focus:ring-1 focus:ring-violet-400"
            >
              {PRINTABLE_SIZES.map((ps) => (
                <option key={ps} value={ps}>{ps}</option>
              ))}
            </select>
          </div>

        </div>
      )}

      {prospectStep !== undefined && (
        <div className="mt-4 rounded-xl border border-violet-100 bg-white p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-violet-400">
            Avancement prospect
          </p>
          <ProspectStepper currentStep={prospectStep} />
        </div>
      )}
    </div>
  );
}
