"use client";

import { useState, useRef, useEffect } from "react";
import { Radar, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import toast from "react-hot-toast";
import { PROSPECT_TARGET_TYPES } from "@/lib/constants";
import type { ProspectStreet } from "./prospect-map";

interface Bounds {
  sw: { lat: number; lng: number };
  ne: { lat: number; lng: number };
}

interface Props {
  getBounds: () => Bounds | null;
  city: string;
  onResults: (street: ProspectStreet) => void;
  onScanningChange?: (scanning: boolean) => void;
  disabled?: boolean;
}

const HIGH_TYPES = PROSPECT_TARGET_TYPES.filter((t) => t.priority === "high");
const MEDIUM_TYPES = PROSPECT_TARGET_TYPES.filter((t) => t.priority === "medium");

export function ScanAreaButton({ getBounds, city, onResults, onScanningChange, disabled }: Props) {
  const [open, setOpen] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(
    () => new Set(HIGH_TYPES.map((t) => t.googleType))
  );
  const [showMedium, setShowMedium] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Fermer au clic en dehors
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  function toggleType(googleType: string) {
    setSelectedTypes((prev) => {
      const next = new Set(prev);
      if (next.has(googleType)) next.delete(googleType);
      else next.add(googleType);
      return next;
    });
  }

  function toggleAll(types: typeof PROSPECT_TARGET_TYPES, checked: boolean) {
    setSelectedTypes((prev) => {
      const next = new Set(prev);
      for (const t of types) {
        if (checked) next.add(t.googleType);
        else next.delete(t.googleType);
      }
      return next;
    });
  }

  async function handleScan() {
    const bounds = getBounds();
    if (!bounds) { toast.error("Carte non prête"); return; }
    if (selectedTypes.size === 0) { toast.error("Sélectionnez au moins un type"); return; }

    setScanning(true);
    onScanningChange?.(true);
    try {
      const res = await fetch("/api/admin/prospection/scan-area", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bounds,
          types: Array.from(selectedTypes),
          city,
        }),
      });
      const json = await res.json();
      if (!res.ok) { toast.error(json.error ?? "Erreur"); return; }

      const street: ProspectStreet = json.data;
      onResults(street);

      const { newLeadsCount, skippedCount, typesSearched } = json.meta;
      toast.success(
        `${newLeadsCount} lead${newLeadsCount !== 1 ? "s" : ""} trouvé${newLeadsCount !== 1 ? "s" : ""}` +
        (skippedCount > 0 ? ` (${skippedCount} déjà connu${skippedCount !== 1 ? "s" : ""})` : "") +
        ` — ${typesSearched} type${typesSearched !== 1 ? "s" : ""} scannés`
      );
      setOpen(false);
    } catch {
      toast.error("Erreur réseau");
    } finally {
      setScanning(false);
      onScanningChange?.(false);
    }
  }

  const allHighSelected = HIGH_TYPES.every((t) => selectedTypes.has(t.googleType));
  const allMediumSelected = MEDIUM_TYPES.every((t) => selectedTypes.has(t.googleType));

  return (
    <div ref={panelRef} className="absolute right-4 top-4 z-[1000]">
      {/* Toggle button */}
      <button
        onClick={() => setOpen((p) => !p)}
        disabled={disabled || scanning}
        className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-md transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {scanning ? <Loader2 className="h-4 w-4 animate-spin text-indigo-500" /> : <Radar className="h-4 w-4 text-indigo-500" />}
        Scanner cette zone
      </button>

      {/* Panel */}
      {open && (
        <div className="mt-2 w-72 rounded-xl border border-slate-200 bg-white p-4 shadow-xl">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Types à scanner ({selectedTypes.size})
          </p>

          {/* Haute valeur */}
          <div className="mb-2">
            <label className="mb-1.5 flex items-center gap-2 text-xs font-medium text-green-700">
              <input
                type="checkbox"
                checked={allHighSelected}
                onChange={(e) => toggleAll(HIGH_TYPES, e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              Haute valeur ({HIGH_TYPES.length})
            </label>
            <div className="ml-5 grid grid-cols-2 gap-x-3 gap-y-1">
              {HIGH_TYPES.map((t) => (
                <label key={t.googleType} className="flex items-center gap-1.5 text-xs text-slate-600">
                  <input
                    type="checkbox"
                    checked={selectedTypes.has(t.googleType)}
                    onChange={() => toggleType(t.googleType)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  {t.label}
                </label>
              ))}
            </div>
          </div>

          {/* Valeur moyenne (collapsible) */}
          <div className="mb-3">
            <button
              onClick={() => setShowMedium((p) => !p)}
              className="mb-1.5 flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-700"
            >
              {showMedium ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              Valeur moyenne ({MEDIUM_TYPES.length})
            </button>
            {showMedium && (
              <>
                <label className="mb-1.5 ml-3 flex items-center gap-2 text-xs text-slate-500">
                  <input
                    type="checkbox"
                    checked={allMediumSelected}
                    onChange={(e) => toggleAll(MEDIUM_TYPES, e.target.checked)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  Tout cocher
                </label>
                <div className="ml-5 grid grid-cols-2 gap-x-3 gap-y-1">
                  {MEDIUM_TYPES.map((t) => (
                    <label key={t.googleType} className="flex items-center gap-1.5 text-xs text-slate-600">
                      <input
                        type="checkbox"
                        checked={selectedTypes.has(t.googleType)}
                        onChange={() => toggleType(t.googleType)}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      {t.label}
                    </label>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Scan button */}
          <button
            onClick={handleScan}
            disabled={scanning || selectedTypes.size === 0}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {scanning ? (
              <><Loader2 className="h-4 w-4 animate-spin" />Scan en cours…</>
            ) : (
              <><Radar className="h-4 w-4" />Scanner ({selectedTypes.size} types)</>
            )}
          </button>

          <p className="mt-2 text-center text-[10px] text-slate-400">
            ~{selectedTypes.size * 0.032 < 0.1 ? "<0.10" : (selectedTypes.size * 0.032).toFixed(2)}$ Google API
          </p>
        </div>
      )}
    </div>
  );
}
