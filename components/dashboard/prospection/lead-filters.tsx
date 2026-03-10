"use client";

import { useMemo } from "react";
import { Search, ArrowUpDown, Globe, Filter } from "lucide-react";
import type { ProspectLead } from "./prospect-map";

export type SortMode = "default" | "rating-desc" | "rating-asc" | "reviews-desc" | "reviews-asc";

export interface LeadFilters {
  search: string;
  sort: SortMode;
  websiteFirst: boolean;
  typeFilter: string | null;
}

interface Props {
  leads: ProspectLead[];
  filters: LeadFilters;
  onChange: (filters: LeadFilters) => void;
}

const SORT_OPTIONS: { value: SortMode; label: string }[] = [
  { value: "rating-asc", label: "Note ↑" },
  { value: "default", label: "Par défaut" },
  { value: "rating-desc", label: "Note ↓" },
  { value: "reviews-desc", label: "Avis ↓" },
  { value: "reviews-asc", label: "Avis ↑" },
];

export function LeadFilterBar({ leads, filters, onChange }: Props) {
  // Types uniques présents dans les leads
  const availableTypes = useMemo(() => {
    const types = new Set<string>();
    for (const l of leads) {
      if (l.businessType) types.add(l.businessType);
    }
    return Array.from(types).sort();
  }, [leads]);

  function set<K extends keyof LeadFilters>(key: K, value: LeadFilters[K]) {
    onChange({ ...filters, [key]: value });
  }

  return (
    <div className="space-y-2 border-b border-slate-100 px-4 py-3">
      {/* Recherche par nom */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={filters.search}
          onChange={(e) => set("search", e.target.value)}
          placeholder="Rechercher un lead…"
          className="w-full rounded-md border border-slate-200 bg-white py-1.5 pl-8 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
        />
      </div>

      <div className="flex flex-wrap gap-1.5">
        {/* Tri */}
        <div className="relative flex items-center">
          <ArrowUpDown className="pointer-events-none absolute left-2 h-3 w-3 text-slate-400" />
          <select
            value={filters.sort}
            onChange={(e) => set("sort", e.target.value as SortMode)}
            className="appearance-none rounded-md border border-slate-200 bg-white py-1 pl-7 pr-6 text-[11px] font-medium text-slate-600 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* Filtre type */}
        {availableTypes.length > 1 && (
          <div className="relative flex items-center">
            <Filter className="pointer-events-none absolute left-2 h-3 w-3 text-slate-400" />
            <select
              value={filters.typeFilter ?? ""}
              onChange={(e) => set("typeFilter", e.target.value || null)}
              className="appearance-none rounded-md border border-slate-200 bg-white py-1 pl-7 pr-6 text-[11px] font-medium text-slate-600 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
            >
              <option value="">Tous types</option>
              {availableTypes.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        )}

        {/* Website first */}
        <button
          onClick={() => set("websiteFirst", !filters.websiteFirst)}
          className={`flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] font-medium transition ${
            filters.websiteFirst
              ? "border-indigo-300 bg-indigo-50 text-indigo-700"
              : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
          }`}
        >
          <Globe className="h-3 w-3" />
          Site web
        </button>
      </div>
    </div>
  );
}

/** Applique les filtres et tris sur une liste de leads */
export function applyLeadFilters(leads: ProspectLead[], filters: LeadFilters): ProspectLead[] {
  let result = leads;

  // Filtre recherche
  if (filters.search.trim()) {
    const q = filters.search.toLowerCase();
    result = result.filter((l) =>
      l.name.toLowerCase().includes(q) ||
      (l.businessType ?? "").toLowerCase().includes(q) ||
      (l.address ?? "").toLowerCase().includes(q)
    );
  }

  // Filtre type
  if (filters.typeFilter) {
    result = result.filter((l) => l.businessType === filters.typeFilter);
  }

  // Tri
  result = [...result];

  if (filters.websiteFirst) {
    result.sort((a, b) => {
      const aHas = a.website ? 1 : 0;
      const bHas = b.website ? 1 : 0;
      return bHas - aHas;
    });
  }

  if (filters.sort !== "default") {
    const [field, dir] = filters.sort.split("-") as ["rating" | "reviews", "asc" | "desc"];
    const mult = dir === "desc" ? -1 : 1;

    result.sort((a, b) => {
      const aVal = field === "rating" ? (a.rating ?? -1) : (a.reviewCount ?? -1);
      const bVal = field === "rating" ? (b.rating ?? -1) : (b.reviewCount ?? -1);
      return (aVal - bVal) * mult;
    });
  }

  return result;
}
