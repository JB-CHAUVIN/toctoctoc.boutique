"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { MapPin, Search, Loader2, TrendingUp, Route, Users, Star, RefreshCw, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";
import { StreetPanel } from "./street-panel";

export interface ProspectLead {
  id: string;
  streetId: string;
  name: string;
  address: string | null;
  osmId: string | null;
  lat: number | null;
  lng: number | null;
  googleMapsUrl: string | null;
  phone: string | null;
  website: string | null;
  businessType: string | null;
  rating: number | null;
  reviewCount: number | null;
  status: "DISCOVERED" | "CONTACTED" | "CONVERTED" | "DECLINED";
  businessId: string | null;
  notes: string | null;
  contactedAt: string | null;
  createdAt: string;
}

export interface ProspectStreet {
  id: string;
  name: string;
  city: string;
  geometry: unknown;
  leads: ProspectLead[];
  searchedAt: string;
  updatedAt: string;
}

function getConversionRatio(leads: ProspectLead[]): number {
  if (leads.length === 0) return 0;
  return leads.filter((l) => l.status === "CONVERTED").length / leads.length;
}

function ratioToColor(ratio: number): string {
  if (ratio === 0) return "#ef4444";
  if (ratio < 0.33) return "#f97316";
  if (ratio < 0.67) return "#eab308";
  if (ratio < 1) return "#84cc16";
  return "#22c55e";
}

function statusColor(status: ProspectLead["status"]): string {
  switch (status) {
    case "DISCOVERED": return "#64748b";
    case "CONTACTED":  return "#f97316";
    case "CONVERTED":  return "#22c55e";
    case "DECLINED":   return "#ef4444";
  }
}

/** Parse la geometry : supporte l'ancien format (tableau plat) et le nouveau (tableau de chaînes) */
function parseGeometry(geometry: unknown): Array<Array<{ lat: number; lng: number }>> | null {
  if (!Array.isArray(geometry) || geometry.length === 0) return null;
  // Nouveau format : tableau de chaînes [[{lat,lng}, ...], ...]
  if (Array.isArray(geometry[0]) && geometry[0].length >= 2) {
    return geometry as Array<Array<{ lat: number; lng: number }>>;
  }
  // Ancien format : tableau plat [{lat,lng}, ...]
  if (typeof geometry[0] === "object" && "lat" in geometry[0] && geometry.length >= 2) {
    return [geometry as Array<{ lat: number; lng: number }>];
  }
  return null;
}

export function ProspectMap({ initialStreets }: { initialStreets: ProspectStreet[] }) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);
  const polylinesRef = useRef<Map<string, import("leaflet").Polyline[]>>(new Map());
  const markersRef = useRef<Map<string, import("leaflet").CircleMarker[]>>(new Map());

  const [streets, setStreets] = useState<ProspectStreet[]>(initialStreets);
  const [selectedStreet, setSelectedStreet] = useState<ProspectStreet | null>(null);
  // Objet pour que l'effet se re-déclenche même si on clique deux fois le même marker
  const [highlightLead, setHighlightLead] = useState<{ id: string; tick: number } | null>(null);
  const [searchValue, setSearchValue] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [maxRating, setMaxRating] = useState<number | null>(null);

  const RATING_OPTIONS = [
    { value: null, label: "Toutes" },
    { value: 4.5, label: "< 4.5 ★" },
    { value: 4, label: "< 4 ★" },
    { value: 3.5, label: "< 3.5 ★" },
    { value: 3, label: "< 3 ★" },
    { value: 0.1, label: "Sans note" },
  ];

  // Filtrer les leads par note
  function filterLeads(leads: ProspectLead[]): ProspectLead[] {
    if (maxRating === null) return leads;
    if (maxRating === 0.1) return leads.filter((l) => l.rating == null);
    return leads.filter((l) => l.rating != null && l.rating < maxRating);
  }

  const filteredStreets = streets.map((s) => ({ ...s, leads: filterLeads(s.leads) }));
  const totalLeads = filteredStreets.reduce((acc, s) => acc + s.leads.length, 0);
  const totalConverted = filteredStreets.reduce(
    (acc, s) => acc + s.leads.filter((l) => l.status === "CONVERTED").length,
    0
  );

  // Init Leaflet (client only)
  useEffect(() => {
    let cancelled = false;

    import("leaflet").then((L) => {
      if (cancelled || !mapContainerRef.current) return;

      // En StrictMode, le conteneur peut déjà avoir un _leaflet_id
      const container = mapContainerRef.current as HTMLDivElement & { _leaflet_id?: number };
      if (container._leaflet_id) return;

      // Fix icon paths
      delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = L.map(container, { center: [48.8566, 2.3522], zoom: 13 });

      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 20,
      }).addTo(map);

      mapRef.current = map;
      if (!cancelled) setMapReady(true);
    });

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        setMapReady(false);
      }
    };
  }, []);

  const drawStreet = useCallback(async (street: ProspectStreet) => {
    if (!mapRef.current) return;
    const L = (await import("leaflet")).default;

    // Supprimer anciens tracés
    polylinesRef.current.get(street.id)?.forEach((p) => p.remove());
    markersRef.current.get(street.id)?.forEach((m) => m.remove());

    const ratio = getConversionRatio(street.leads);
    const color = ratioToColor(ratio);

    const chains = parseGeometry(street.geometry);
    if (chains && chains.length > 0) {
      const polylines: import("leaflet").Polyline[] = [];
      for (const chain of chains) {
        const latlngs = chain.map((p) => [p.lat, p.lng] as [number, number]);
        const polyline = L.polyline(latlngs, { color, weight: 5, opacity: 0.85 }).addTo(mapRef.current!);
        polyline.bindTooltip(street.name, { sticky: true });
        polyline.on("click", () => setSelectedStreet(street));
        polylines.push(polyline);
      }
      polylinesRef.current.set(street.id, polylines);
    }

    const streetMarkers: import("leaflet").CircleMarker[] = [];
    for (const lead of street.leads) {
      if (lead.lat == null || lead.lng == null) continue;
      const marker = L.circleMarker([lead.lat, lead.lng], {
        radius: 6,
        fillColor: statusColor(lead.status),
        color: "#fff",
        weight: 1.5,
        opacity: 1,
        fillOpacity: 0.9,
      }).addTo(mapRef.current!);
      marker.bindTooltip(`<strong>${lead.name}</strong><br/>${lead.businessType ?? ""}`, { direction: "top" });
      marker.on("click", () => { setSelectedStreet(street); setHighlightLead({ id: lead.id, tick: Date.now() }); });
      streetMarkers.push(marker);
    }
    markersRef.current.set(street.id, streetMarkers);
  }, []);

  useEffect(() => {
    if (!mapReady) return;
    filteredStreets.forEach(drawStreet);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapReady, streets, maxRating, drawStreet]);

  // Refresh modal state
  const [refreshModal, setRefreshModal] = useState<{ streetName: string; existing: ProspectStreet } | null>(null);

  async function doSearch(streetName: string, refresh = false) {
    setIsSearching(true);
    try {
      const res = await fetch("/api/admin/prospection/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ streetName, refresh }),
      });
      const json = await res.json();
      if (!res.ok) { toast.error(json.error ?? "Erreur"); return; }

      const newStreet: ProspectStreet = json.data;

      setStreets((prev) => {
        const idx = prev.findIndex((s) => s.id === newStreet.id);
        if (idx >= 0) { const next = [...prev]; next[idx] = newStreet; return next; }
        return [newStreet, ...prev];
      });
      setSelectedStreet(newStreet);

      const chains = parseGeometry(newStreet.geometry);
      const allPts = chains?.flat() ?? [];
      if (mapRef.current && allPts.length > 0) {
        const lats = allPts.map((p) => p.lat);
        const lngs = allPts.map((p) => p.lng);
        mapRef.current.fitBounds(
          [[Math.min(...lats), Math.min(...lngs)], [Math.max(...lats), Math.max(...lngs)]],
          { padding: [40, 40] }
        );
      }

      if (refresh) {
        const reassoc = json.meta?.reassociatedCount ?? 0;
        const total = json.meta?.newLeadsCount ?? 0;
        toast.success(`${newStreet.name} rafraîchie : ${total} lead${total !== 1 ? "s" : ""}${reassoc > 0 ? `, ${reassoc} ré-associé${reassoc !== 1 ? "s" : ""}` : ""}`);
      } else {
        const count = json.meta?.newLeadsCount ?? 0;
        toast.success(`${newStreet.name} : ${count} nouveau${count !== 1 ? "x" : ""} lead${count !== 1 ? "s" : ""} trouvé${count !== 1 ? "s" : ""}`);
      }
    } catch {
      toast.error("Erreur réseau");
    } finally {
      setIsSearching(false);
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const name = searchValue.trim();
    if (!name) return;

    // Vérifier si la rue existe déjà (comparaison souple)
    const nameLower = name.toLowerCase();
    const existing = streets.find((s) => s.name.toLowerCase().includes(nameLower) || nameLower.includes(s.name.toLowerCase()));

    if (existing) {
      setRefreshModal({ streetName: name, existing });
    } else {
      doSearch(name);
    }
  }

  function handleLeadUpdate(leadId: string, updates: Partial<ProspectLead>) {
    setStreets((prev) =>
      prev.map((s) => ({ ...s, leads: s.leads.map((l) => (l.id === leadId ? { ...l, ...updates } : l)) }))
    );
    setSelectedStreet((prev) =>
      prev ? { ...prev, leads: prev.leads.map((l) => (l.id === leadId ? { ...l, ...updates } : l)) } : prev
    );
    const street = streets.find((s) => s.leads.some((l) => l.id === leadId));
    if (street) {
      drawStreet({ ...street, leads: street.leads.map((l) => (l.id === leadId ? { ...l, ...updates } : l)) });
    }
  }

  return (
    <div className="flex h-full flex-col bg-slate-50">
      {/* CSS Leaflet */}
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" crossOrigin="" />

      {/* Header */}
      <div className="flex flex-col gap-3 border-b border-slate-200 bg-white px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white">
            <MapPin className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">Conquête de Paris</h1>
            <p className="text-xs text-slate-500">Prospection rue par rue</p>
          </div>
        </div>
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-1.5 text-slate-600">
            <Route className="h-4 w-4 text-indigo-500" />
            <span className="font-semibold text-slate-900">{streets.length}</span>
            <span>rue{streets.length > 1 ? "s" : ""}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-600">
            <Users className="h-4 w-4 text-orange-500" />
            <span className="font-semibold text-slate-900">{totalLeads}</span>
            <span>leads</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-600">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <span className="font-semibold text-slate-900">{totalConverted}</span>
            <span>convertis</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-600">
            <Star className="h-4 w-4 text-yellow-500" />
            <select
              value={maxRating === null ? "" : String(maxRating)}
              onChange={(e) => setMaxRating(e.target.value === "" ? null : Number(e.target.value))}
              className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {RATING_OPTIONS.map((opt) => (
                <option key={String(opt.value)} value={opt.value === null ? "" : String(opt.value)}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="border-b border-slate-200 bg-white px-6 py-3">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Rechercher une rue à Paris (ex: Rue de Rivoli)…"
              className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              disabled={isSearching}
            />
          </div>
          <button
            type="submit"
            disabled={isSearching || !searchValue.trim()}
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSearching ? <><Loader2 className="h-4 w-4 animate-spin" />Recherche…</> : <><Search className="h-4 w-4" />Chercher</>}
          </button>
        </form>
      </div>

      {/* Map + Panel */}
      <div className="flex flex-1 overflow-hidden">
        <div className="relative flex-1">
          <div ref={mapContainerRef} className="h-full w-full" />
          {!mapReady && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
            </div>
          )}

          {/* Légende */}
          <div className="absolute bottom-4 left-4 z-[1000] rounded-lg border border-slate-200 bg-white p-3 shadow-md">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Conversion</p>
            {[
              { color: "#ef4444", label: "0% — vierge" },
              { color: "#f97316", label: "1–33%" },
              { color: "#eab308", label: "34–66%" },
              { color: "#84cc16", label: "67–99%" },
              { color: "#22c55e", label: "100% — conquise" },
            ].map(({ color, label }) => (
              <div key={color} className="flex items-center gap-2 text-xs text-slate-600">
                <div className="h-2.5 w-5 rounded-full" style={{ backgroundColor: color }} />
                {label}
              </div>
            ))}
          </div>
        </div>

        <StreetPanel
          street={selectedStreet ? { ...selectedStreet, leads: filterLeads(selectedStreet.leads) } : null}
          highlightLead={highlightLead}
          onClose={() => { setSelectedStreet(null); setHighlightLead(null); }}
          onLeadUpdate={handleLeadUpdate}
          onStreetUpdate={(updated) => {
            setStreets((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
            setSelectedStreet(updated);
            drawStreet(updated);
          }}
        />
      </div>

      {/* Modal de confirmation refresh */}
      {refreshModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
              </div>
              <h3 className="text-base font-semibold text-slate-900">Rue déjà prospectée</h3>
            </div>
            <p className="mb-1 text-sm text-slate-600">
              <span className="font-medium">{refreshModal.existing.name}</span> contient{" "}
              {refreshModal.existing.leads.length} lead{refreshModal.existing.leads.length !== 1 ? "s" : ""}.
            </p>
            <p className="mb-5 text-sm text-slate-500">
              Rafraîchir va supprimer le tracé et tous les leads non associés à un commerce, puis re-chercher sur Google.
              Les leads déjà convertis seront ré-associés automatiquement.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setRefreshModal(null)}
                className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  const name = refreshModal.streetName;
                  setRefreshModal(null);
                  doSearch(name, true);
                }}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-700"
              >
                <RefreshCw className="h-4 w-4" />
                Rafraîchir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
