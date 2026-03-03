"use client";

import { useState } from "react";
import { X, Loader2, ExternalLink } from "lucide-react";
import toast from "react-hot-toast";
import type { ProspectLead } from "./prospect-map";

interface Props {
  lead: ProspectLead;
  onClose: () => void;
  onConverted: (businessId: string) => void;
}

const COLOR_PRESETS = [
  { primary: "#4f46e5", secondary: "#312e81", accent: "#f59e0b" },
  { primary: "#0ea5e9", secondary: "#0369a1", accent: "#f97316" },
  { primary: "#10b981", secondary: "#047857", accent: "#fbbf24" },
  { primary: "#8b5cf6", secondary: "#5b21b6", accent: "#f43f5e" },
  { primary: "#ef4444", secondary: "#991b1b", accent: "#fbbf24" },
  { primary: "#f97316", secondary: "#c2410c", accent: "#22c55e" },
];

export function CreateFromLeadDialog({ lead, onClose, onConverted }: Props) {
  const [name, setName] = useState(lead.name);
  const [businessType, setBusinessType] = useState(lead.businessType ?? "");
  const [address, setAddress] = useState(lead.address ?? "");
  const [phone, setPhone] = useState(lead.phone ?? "");
  const [website, setWebsite] = useState(lead.website ?? "");
  const [reviewUrl, setReviewUrl] = useState(lead.googleMapsUrl ?? "");
  const [selectedPreset, setSelectedPreset] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdBusinessId, setCreatedBusinessId] = useState<string | null>(null);

  const preset = COLOR_PRESETS[selectedPreset];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { toast.error("Le nom est requis"); return; }

    setIsSubmitting(true);
    try {
      // Créer le business
      const res = await fetch("/api/business", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          businessType: businessType.trim() || undefined,
          address: address.trim() || undefined,
          phone: phone.trim() || undefined,
          website: website.trim() || undefined,
          reviewUrl: reviewUrl.trim() || undefined,
          googleMapsUrl: reviewUrl.trim() || undefined,
          primaryColor: preset.primary,
          secondaryColor: preset.secondary,
          accentColor: preset.accent,
        }),
      });

      const json = await res.json();
      if (!res.ok) { toast.error(json.error ?? "Erreur lors de la création"); return; }

      const businessId: string = json.data.id;
      setCreatedBusinessId(businessId);

      // Marquer le lead comme converti
      await fetch(`/api/admin/prospection/leads/${lead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CONVERTED", businessId }),
      });

      onConverted(businessId);
    } catch {
      toast.error("Erreur réseau");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md rounded-xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Créer le commerce</h2>
            <p className="text-xs text-slate-500">Depuis le lead OSM</p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {createdBusinessId ? (
          // Succès
          <div className="px-6 py-8 text-center">
            <div className="mb-4 text-5xl">🎉</div>
            <h3 className="mb-2 text-lg font-bold text-slate-900">Commerce créé !</h3>
            <p className="mb-6 text-sm text-slate-500">Le lead a été marqué comme converti.</p>
            <div className="flex flex-col gap-2">
              <a
                href={`/dashboard/${createdBusinessId}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700"
              >
                <ExternalLink className="h-4 w-4" />
                Voir le dashboard du commerce
              </a>
              <button
                onClick={onClose}
                className="rounded-lg px-4 py-2 text-sm text-slate-600 transition hover:bg-slate-100"
              >
                Fermer
              </button>
            </div>
          </div>
        ) : (
          // Formulaire
          <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">Nom du commerce *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">Type de commerce</label>
              <input
                type="text"
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
                placeholder="Restaurant, Salon de coiffure…"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">Adresse</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700">Téléphone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700">Site web</label>
                <input
                  type="text"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">Lien Google Maps (avis)</label>
              <input
                type="text"
                value={reviewUrl}
                onChange={(e) => setReviewUrl(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Couleurs */}
            <div>
              <label className="mb-2 block text-xs font-medium text-slate-700">Palette de couleurs</label>
              <div className="flex gap-2">
                {COLOR_PRESETS.map((p, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSelectedPreset(i)}
                    className={`relative h-8 w-8 rounded-full transition-transform ${selectedPreset === i ? "scale-110 ring-2 ring-offset-1 ring-slate-400" : "hover:scale-105"}`}
                    style={{ background: `linear-gradient(135deg, ${p.primary} 50%, ${p.accent} 50%)` }}
                    title={`Palette ${i + 1}`}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-600 transition hover:bg-slate-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-green-700 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Création…
                  </>
                ) : (
                  "Créer le commerce"
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
