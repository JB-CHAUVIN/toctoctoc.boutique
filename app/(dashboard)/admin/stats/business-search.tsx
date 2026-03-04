"use client";

import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";

type Business = {
  id: string;
  name: string;
  city: string | null;
  businessType: string | null;
  isPublished: boolean;
};

export function BusinessSearch({
  businesses,
  selectedId,
}: {
  businesses: Business[];
  selectedId?: string;
}) {
  const router = useRouter();
  const selected = businesses.find((b) => b.id === selectedId);
  const [query, setQuery] = useState(selected?.name ?? "");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const filtered = query.trim()
    ? businesses.filter((b) => {
        const q = query.toLowerCase();
        return (
          b.name.toLowerCase().includes(q) ||
          b.city?.toLowerCase().includes(q) ||
          b.businessType?.toLowerCase().includes(q)
        );
      })
    : businesses;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function pick(b: Business) {
    setQuery(b.name);
    setOpen(false);
    router.push(`/admin/stats?businessId=${b.id}`);
  }

  function clear() {
    setQuery("");
    router.push("/admin/stats");
  }

  return (
    <div ref={ref} className="relative flex items-end gap-3">
      <div className="flex-1">
        <label htmlFor="business-search" className="mb-1 block text-sm font-medium text-slate-600">
          Rechercher un commerce
        </label>
        <input
          id="business-search"
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Tapez un nom, ville ou type..."
          autoComplete="off"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />

        {open && filtered.length > 0 && (
          <div className="absolute left-0 right-12 z-20 mt-1 max-h-64 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg">
            {filtered.slice(0, 20).map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => pick(b)}
                className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-indigo-50 ${
                  b.id === selectedId ? "bg-indigo-50 font-medium text-indigo-700" : "text-slate-700"
                }`}
              >
                <span className="flex-1 truncate">
                  {b.name}
                  {b.city && <span className="text-slate-400"> — {b.city}</span>}
                </span>
                {b.businessType && (
                  <span className="text-xs text-slate-400">{b.businessType}</span>
                )}
                <span className="text-xs">{b.isPublished ? "🌐" : "🔒"}</span>
              </button>
            ))}
            {filtered.length > 20 && (
              <p className="px-3 py-2 text-xs text-slate-400">
                +{filtered.length - 20} autres résultats...
              </p>
            )}
          </div>
        )}

        {open && query.trim() && filtered.length === 0 && (
          <div className="absolute left-0 right-12 z-20 mt-1 rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
            <p className="text-sm text-slate-500">Aucun commerce trouvé</p>
          </div>
        )}
      </div>

      {selectedId && (
        <button
          type="button"
          onClick={clear}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          Reset
        </button>
      )}
    </div>
  );
}
