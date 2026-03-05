"use client";

import { useState } from "react";
import { Check, Search } from "lucide-react";
import { hasModule } from "./helpers";
import type { BusinessData } from "./types";

interface BusinessSelectorProps {
  businesses: BusinessData[];
  selected: Set<string>;
  onToggle: (id: string) => void;
  onSelectAll: () => void;
  onContinue: () => void;
}

function BusinessAvatar({ business }: { business: BusinessData }) {
  if (business.logoUrl) {
    return (
      <img
        src={business.logoUrl}
        alt=""
        className="h-8 w-8 flex-shrink-0 rounded object-contain p-0.5"
        style={{ backgroundColor: business.logoBackground || business.primaryColor }}
      />
    );
  }
  return (
    <div
      className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded text-xs font-bold text-white"
      style={{ backgroundColor: business.primaryColor }}
    >
      {business.name[0]?.toUpperCase()}
    </div>
  );
}

function ModuleBadges({ business }: { business: BusinessData }) {
  return (
    <div className="flex flex-shrink-0 items-center gap-1.5">
      {hasModule(business, "REVIEWS") && (
        <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">
          Avis
        </span>
      )}
      {hasModule(business, "LOYALTY") && (
        <span className="rounded bg-indigo-100 px-1.5 py-0.5 text-[10px] font-medium text-indigo-700">
          Fidelite
        </span>
      )}
      {business.prospectedAt ? (
        <span className="rounded bg-green-100 px-1.5 py-0.5 text-[10px] font-medium text-green-700">
          Prospecte
        </span>
      ) : (
        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">
          A prospecter
        </span>
      )}
    </div>
  );
}

export function BusinessSelector({
  businesses,
  selected,
  onToggle,
  onSelectAll,
  onContinue,
}: BusinessSelectorProps) {
  const [search, setSearch] = useState("");

  const filtered = businesses.filter((b) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      b.name.toLowerCase().includes(q) ||
      (b.city ?? "").toLowerCase().includes(q) ||
      (b.businessType ?? "").toLowerCase().includes(q)
    );
  });

  const notProspected = businesses.filter((b) => !b.prospectedAt);

  return (
    <div className="p-4 sm:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">
          Prospection en lot
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Selectionnez les entreprises a prospecter, puis configurez et imprimez
          tous les tracts et supports terrain d&apos;un coup.
        </p>
      </div>

      {/* Actions bar */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher..."
            className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
          />
        </div>
        <button
          onClick={onSelectAll}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
        >
          {selected.size === businesses.length
            ? "Tout deselectionner"
            : "Tout selectionner"}
        </button>
        {notProspected.length > 0 && (
          <button
            onClick={() => {
              notProspected.forEach((b) => {
                if (!selected.has(b.id)) onToggle(b.id);
              });
            }}
            className="rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-sm font-medium text-orange-700 transition hover:bg-orange-100"
          >
            Non prospectes ({notProspected.length})
          </button>
        )}
        <span className="text-sm text-slate-400">
          {selected.size} selectionne{selected.size > 1 ? "s" : ""}
        </span>
      </div>

      {/* Business list */}
      <div className="grid gap-2">
        {filtered.map((b) => {
          const isSelected = selected.has(b.id);
          return (
            <button
              key={b.id}
              onClick={() => onToggle(b.id)}
              className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${
                isSelected
                  ? "border-indigo-300 bg-indigo-50"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <div
                className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border transition ${
                  isSelected
                    ? "border-indigo-600 bg-indigo-600"
                    : "border-slate-300 bg-white"
                }`}
              >
                {isSelected && <Check className="h-3 w-3 text-white" />}
              </div>

              <BusinessAvatar business={b} />

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate text-sm font-semibold text-slate-900">
                    {b.name}
                  </span>
                  {b.businessType && (
                    <span className="truncate text-xs text-slate-400">
                      {b.businessType}
                    </span>
                  )}
                </div>
                <span className="text-xs text-slate-400">
                  {[b.address, b.city].filter(Boolean).join(", ")}
                </span>
              </div>

              <ModuleBadges business={b} />
            </button>
          );
        })}
      </div>

      {/* Footer */}
      {selected.size > 0 && (
        <div className="sticky bottom-0 mt-6 flex items-center justify-between rounded-xl border border-indigo-200 bg-indigo-50 p-4">
          <span className="text-sm font-medium text-indigo-700">
            {selected.size} entreprise{selected.size > 1 ? "s" : ""}{" "}
            selectionnee{selected.size > 1 ? "s" : ""}
          </span>
          <button
            onClick={onContinue}
            className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
          >
            Configurer & Imprimer
          </button>
        </div>
      )}
    </div>
  );
}
