"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import toast from "react-hot-toast";

interface Props {
  businessId: string;
  hasGoogleMapsUrl: boolean;
}

export function RefreshGoogleButton({ businessId, hasGoogleMapsUrl }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleRefresh() {
    if (!hasGoogleMapsUrl) {
      toast.error("Aucune URL Google Maps configurée");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/business/${businessId}/refresh-google`, {
        method: "POST",
      });
      const json = await res.json();

      if (res.ok && json.success) {
        const d = json.data;
        const parts: string[] = [];
        if (d.name) parts.push(d.name);
        if (d.googleRating != null) parts.push(`${d.googleRating.toFixed(1)}★`);
        if (d.googleReviewCount != null) parts.push(`${d.googleReviewCount} avis`);
        toast.success(`Mis à jour : ${parts.join(" · ") || "OK"}`);
        // Reload to reflect changes
        window.location.reload();
      } else {
        toast.error(json.error || "Erreur lors de la mise à jour");
      }
    } catch {
      toast.error("Erreur réseau");
    } finally {
      setLoading(false);
    }
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
