"use client";

import { useState } from "react";
import { RefreshCw, Check, X } from "lucide-react";
import toast from "react-hot-toast";

interface Props {
  businessId: string;
  hasGoogleMapsUrl: boolean;
}

interface RefreshResult {
  name?: string;
  businessType?: string;
  googleRating?: number;
  googleReviewCount?: number;
  address?: string;
  city?: string;
  zipCode?: string;
  phone?: string;
  website?: string;
}

const FIELD_LABELS: Record<string, string> = {
  name: "Nom",
  businessType: "Type",
  googleRating: "Note Google",
  googleReviewCount: "Nombre d'avis",
  address: "Adresse",
  city: "Ville",
  zipCode: "Code postal",
  phone: "Téléphone",
  website: "Site web",
};

function formatValue(key: string, value: unknown): string {
  if (key === "googleRating" && typeof value === "number") return `${value.toFixed(1)} ★`;
  if (key === "googleReviewCount" && typeof value === "number") return `${value} avis`;
  return String(value);
}

export function RefreshGoogleButton({ businessId, hasGoogleMapsUrl }: Props) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RefreshResult | null>(null);

  async function handleRefresh() {
    if (!hasGoogleMapsUrl) {
      toast.error("Aucune URL Google Maps configurée");
      return;
    }

    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`/api/business/${businessId}/refresh-google`, {
        method: "POST",
      });
      const json = await res.json();

      if (res.ok && json.success) {
        setResult(json.data);
      } else {
        toast.error(json.error || "Erreur lors de la mise à jour");
      }
    } catch {
      toast.error("Erreur réseau");
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    setResult(null);
    window.location.reload();
  }

  if (result) {
    const entries = Object.entries(result).filter(([, v]) => v != null && v !== "");
    return (
      <div className="w-full mt-3 rounded-xl border border-green-200 bg-green-50 p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-600" />
            <span className="text-sm font-semibold text-green-800">
              Infos Google mises à jour
            </span>
          </div>
          <button
            onClick={handleClose}
            className="rounded-lg p-1 text-green-400 transition hover:bg-green-100 hover:text-green-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
          {entries.map(([key, value]) => (
            <div key={key} className="flex items-baseline gap-2 text-sm">
              <span className="font-medium text-green-700">
                {FIELD_LABELS[key] ?? key}
              </span>
              <span className="text-green-900">{formatValue(key, value)}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={handleRefresh}
      disabled={loading || !hasGoogleMapsUrl}
      title={hasGoogleMapsUrl ? "Mettre à jour depuis Google" : "URL Google Maps requise"}
      className="flex items-center gap-2 rounded-xl border border-violet-200 bg-white px-4 py-2 text-sm font-medium text-violet-700 shadow-sm transition hover:border-violet-300 hover:bg-violet-50 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
      {loading ? "Mise à jour…" : "MAJ Google"}
    </button>
  );
}
