"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { RotateCcw } from "lucide-react";

export function LoyaltyCardActions({
  qrCode,
  customerName,
}: {
  qrCode: string;
  customerName: string;
}) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleReset() {
    const confirmed = window.confirm(
      `Réinitialiser la carte de ${customerName} ?\n\nLes tampons du cycle actuel seront remis à zéro. Les récompenses obtenues et l'historique global sont conservés.`
    );
    if (!confirmed) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/loyalty/cards/${encodeURIComponent(qrCode)}/reset`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Erreur lors du reset");
      } else {
        toast.success(`Carte de ${customerName} réinitialisée`);
        setDone(true);
      }
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return <span className="text-xs text-slate-400">Réinitialisée</span>;
  }

  return (
    <button
      onClick={handleReset}
      disabled={loading}
      className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-slate-400 transition hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
      title="Réinitialiser le cycle actuel"
    >
      <RotateCcw className="h-3.5 w-3.5" />
      Reset
    </button>
  );
}
