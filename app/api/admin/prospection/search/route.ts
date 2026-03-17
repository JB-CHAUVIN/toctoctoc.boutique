import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { mapGoogleTypes } from "@/lib/google-types";
import { enrichLeadsWithDetails } from "@/lib/enrich-leads";

const schema = z.object({
  streetName: z.string().min(2).max(200),
  city: z.string().min(1).max(200).optional(),
  refresh: z.boolean().optional(),
});

const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY!;

/** Utilise Places Text Search (activée) à la place de Geocoding (désactivée) */
async function geocodeStreet(query: string, city: string): Promise<{
  canonicalName: string;
  lat: number;
  lng: number;
  viewport: { sw: { lat: number; lng: number }; ne: { lat: number; lng: number } };
} | null> {
  // Nettoyer : supprimer codes postaux, arrondissements
  const cleaned = query
    .replace(/\b75\d{3}\b/g, "")
    .replace(/\b\d+(e|er|ème|eme)?\b/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();

  const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?${new URLSearchParams({
    query: `${cleaned}, ${city}`,
    key: GOOGLE_API_KEY,
    language: "fr",
    region: "fr",
    type: "route",
  })}`;

  const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) return null;
  const data = await res.json();
  if (data.status !== "OK" || !data.results?.length) return null;

  // Préférer un résultat qui ressemble à une rue (name sans trop de mots)
  const result = data.results.find(
    (r: { name: string }) => r.name.toLowerCase().includes(cleaned.toLowerCase().split(" ").pop() ?? "")
  ) ?? data.results[0];

  const loc = result.geometry.location;
  const vp = result.geometry.viewport;

  // Nom canonique = premier segment de formatted_address (avant la première virgule)
  const canonicalName = result.name ?? result.formatted_address?.split(",")[0]?.trim() ?? cleaned;

  return {
    canonicalName,
    lat: loc.lat,
    lng: loc.lng,
    viewport: {
      sw: { lat: vp.southwest.lat, lng: vp.southwest.lng },
      ne: { lat: vp.northeast.lat, lng: vp.northeast.lng },
    },
  };
}

interface GooglePlace {
  name: string;
  place_id: string;
  vicinity?: string;
  formatted_address?: string;
  geometry: { location: { lat: number; lng: number } };
  types: string[];
  rating?: number;
  user_ratings_total?: number;
}

/** Text Search sur le nom de la rue — retourne les établissements que Google associe à cette adresse */
async function searchStreetEstablishments(canonicalName: string, city: string): Promise<GooglePlace[]> {
  const places: GooglePlace[] = [];
  let pageToken: string | undefined;

  // Jusqu'à 3 pages (60 résultats max)
  for (let page = 0; page < 3; page++) {
    const params: Record<string, string> = {
      query: `commerces ${canonicalName} ${city}`,
      key: GOOGLE_API_KEY,
      language: "fr",
      region: "fr",
    };
    if (pageToken) {
      params.pagetoken = pageToken;
      await new Promise((r) => setTimeout(r, 2000));
    }

    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?${new URLSearchParams(params)}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) break;

    const data = await res.json();
    if (data.status === "ZERO_RESULTS") break;
    if (data.status !== "OK") {
      console.warn("[PLACES_WARN]", data.status, data.error_message);
      break;
    }

    places.push(...(data.results ?? []));
    pageToken = data.next_page_token;
    if (!pageToken) break;
  }

  return places;
}

async function runOverpassWay(streetName: string, bboxFilter: string): Promise<Array<{
  type: string;
  geometry?: Array<{ lat: number; lon: number }>;
  tags?: Record<string, string>;
}> | null> {
  // Filtrer uniquement les ways avec tag highway (routes) pour éviter bâtiments, limites, etc.
  const query = `[out:json][timeout:15];way["name"="${streetName}"]["highway"]${bboxFilter};out geom;`;
  const ENDPOINTS = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
  ];
  for (const endpoint of ENDPOINTS) {
    try {
      const resp = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `data=${encodeURIComponent(query)}`,
        signal: AbortSignal.timeout(15000),
      });
      if (resp.headers.get("content-type")?.includes("text/html")) continue;
      if (!resp.ok) continue;
      const json = await resp.json();
      return json.elements ?? [];
    } catch {
      continue;
    }
  }
  return null;
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  if (dbUser?.role !== "ADMIN") return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });

  const rawInput = parsed.data.streetName.trim();
  const city = parsed.data.city?.trim() || "Paris, France";
  const isRefresh = parsed.data.refresh === true;

  // ── 1. Google Geocoding → nom canonique + centre + viewport ──
  const geo = await geocodeStreet(rawInput, city);
  if (!geo) {
    return NextResponse.json({ error: "Rue introuvable via Google Maps. Vérifiez le nom." }, { status: 404 });
  }

  const { canonicalName, viewport } = geo;

  // ── 2. Google Places Text Search → commerces associés à la rue ──
  // Text Search utilise le nom de la rue comme requête, ce qui retourne tous les
  // établissements que Google associe à cette adresse (pas de tri par popularité).
  const allPlaces = await searchStreetEstablishments(canonicalName, city);

  // Garder uniquement les établissements (pas les routes, zones admin, etc.)
  const SKIP_TYPES = new Set([
    "route", "street_address", "geocode", "political", "locality",
    "sublocality", "sublocality_level_1", "sublocality_level_2",
    "administrative_area_level_1", "administrative_area_level_2",
    "administrative_area_level_3", "country", "neighborhood",
    "postal_code", "natural_feature", "park",
  ]);

  // Mot(s) clé(s) du nom de rue (hors préfixe type + prépositions)
  const streetWords = canonicalName
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => !["rue", "avenue", "boulevard", "allée", "impasse", "villa",
      "passage", "square", "place", "de", "du", "des", "la", "le", "les"].includes(w) && w.length > 2);

  const relevantPlaces = allPlaces.filter((p) => {
    // Exclure non-établissements
    if (!p.types.includes("establishment") && !p.types.includes("point_of_interest")) return false;
    if (p.types.every((t) => SKIP_TYPES.has(t))) return false;
    // Garder si l'adresse contient un mot-clé de la rue (filtre souple)
    const addr = (p.formatted_address ?? p.vicinity ?? "").toLowerCase();
    return streetWords.some((w) => addr.includes(w));
  });

  // ── 3. Overpass → géométrie de la rue (polyline Leaflet) ──
  const PAD = 0.003;
  const bboxFilter = `(${viewport.sw.lat - PAD},${viewport.sw.lng - PAD},${viewport.ne.lat + PAD},${viewport.ne.lng + PAD})`;
  const wayElements = await runOverpassWay(canonicalName, bboxFilter) ?? [];

  // Extraire les segments individuels (chaque way = un segment)
  const segments: Array<Array<{ lat: number; lng: number }>> = [];
  for (const el of wayElements) {
    if (el.type === "way" && el.geometry && el.geometry.length >= 2) {
      segments.push(el.geometry.map((pt) => ({ lat: pt.lat, lng: pt.lon })));
    }
  }

  // Chaîner les segments bout-à-bout → tableau de chaînes indépendantes
  // Les segments proches sont fusionnés, les disjoints restent séparés (pas de trait parasite)
  function chainSegments(segs: Array<Array<{ lat: number; lng: number }>>): Array<Array<{ lat: number; lng: number }>> {
    if (segs.length === 0) return [];
    if (segs.length === 1) return [segs[0]];

    const THRESHOLD = 0.0001; // ~11m
    const close = (a: { lat: number; lng: number }, b: { lat: number; lng: number }) =>
      Math.abs(a.lat - b.lat) < THRESHOLD && Math.abs(a.lng - b.lng) < THRESHOLD;

    // Chaque chaîne est un tableau de points qu'on étend par les deux bouts
    const chains: Array<Array<{ lat: number; lng: number }>> = [segs[0].slice()];
    const pool = segs.slice(1).map((s) => ({ pts: s, used: false }));

    let changed = true;
    while (changed) {
      changed = false;
      for (const seg of pool) {
        if (seg.used) continue;
        const segStart = seg.pts[0];
        const segEnd = seg.pts[seg.pts.length - 1];

        for (const chain of chains) {
          const chainEnd = chain[chain.length - 1];
          const chainStart = chain[0];

          if (close(chainEnd, segStart)) {
            chain.push(...seg.pts.slice(1));
            seg.used = true; changed = true; break;
          } else if (close(chainEnd, segEnd)) {
            chain.push(...seg.pts.slice(0, -1).reverse());
            seg.used = true; changed = true; break;
          } else if (close(chainStart, segEnd)) {
            chain.unshift(...seg.pts.slice(0, -1));
            seg.used = true; changed = true; break;
          } else if (close(chainStart, segStart)) {
            chain.unshift(...seg.pts.slice(1).reverse());
            seg.used = true; changed = true; break;
          }
        }
      }
    }

    // Les segments orphelins deviennent des chaînes indépendantes
    for (const seg of pool) {
      if (!seg.used) chains.push(seg.pts);
    }

    return chains.filter((c) => c.length >= 2);
  }

  const chainedSegments = chainSegments(segments);
  // Stocker comme tableau de chaînes (multi-polyline)
  const geometry = chainedSegments.length > 0 ? chainedSegments : null;

  // ── 4. Upsert ProspectStreet ──
  // Extraire le nom de ville court (avant la première virgule)
  const cityLabel = city.split(",")[0].trim();
  const street = await prisma.prospectStreet.upsert({
    where: { name_city: { name: canonicalName, city: cityLabel } },
    update: { geometry: geometry ?? undefined, searchedAt: new Date() },
    create: { name: canonicalName, city: cityLabel, geometry: geometry ?? undefined },
  });

  // ── 4b. Refresh : sauvegarder associations existantes + supprimer les leads non associés ──
  // Map osmId → { businessId, status } pour ré-associer après re-fetch
  const previousAssociations = new Map<string, { businessId: string; status: string }>();

  if (isRefresh) {
    const existingLeads = await prisma.prospectLead.findMany({
      where: { streetId: street.id },
      select: { id: true, osmId: true, businessId: true, status: true },
    });

    // Sauvegarder les associations (leads convertis avec businessId)
    for (const lead of existingLeads) {
      if (lead.osmId && lead.businessId) {
        previousAssociations.set(lead.osmId, { businessId: lead.businessId, status: lead.status });
      }
    }

    // Supprimer tous les leads (on va tout recréer)
    await prisma.prospectLead.deleteMany({ where: { streetId: street.id } });
  }

  // ── 5. Créer les ProspectLeads ──
  const existingPlaceIds = isRefresh
    ? new Set<string>() // En refresh, on recrée tout
    : new Set(
        (
          await prisma.prospectLead.findMany({
            where: { streetId: street.id, osmId: { not: null } },
            select: { osmId: true },
          })
        ).map((l: { osmId: string | null }) => l.osmId)
      );

  const leadsToCreate = relevantPlaces
    .filter((p) => !existingPlaceIds.has(`g:${p.place_id}`))
    .map((p) => {
      const businessType = mapGoogleTypes(p.types);
      const address = p.vicinity ?? p.formatted_address ?? null;
      const googleMapsUrl = `https://www.google.com/maps/place/?q=place_id:${p.place_id}`;
      const osmId = `g:${p.place_id}`;

      // Ré-associer si le lead était précédemment converti
      const prev = previousAssociations.get(osmId);

      return {
        streetId: street.id,
        osmId,
        name: p.name,
        address,
        lat: p.geometry.location.lat,
        lng: p.geometry.location.lng,
        googleMapsUrl,
        businessType,
        rating: p.rating ?? null,
        reviewCount: p.user_ratings_total ?? null,
        phone: null,
        website: null,
        ...(prev ? { status: prev.status as "CONVERTED", businessId: prev.businessId, contactedAt: new Date() } : {}),
      };
    });

  if (leadsToCreate.length > 0) {
    await prisma.prospectLead.createMany({ data: leadsToCreate });
  }

  // Enrichir website + phone via Google Place Details
  const enrichedCount = await enrichLeadsWithDetails(street.id);

  const fullStreet = await prisma.prospectStreet.findUnique({
    where: { id: street.id },
    include: { leads: { orderBy: { createdAt: "asc" } } },
  });

  const reassociatedCount = leadsToCreate.filter((l) => l.businessId).length;

  return NextResponse.json({
    success: true,
    data: fullStreet,
    meta: {
      newLeadsCount: leadsToCreate.length,
      enrichedCount,
      ...(isRefresh ? { refreshed: true, reassociatedCount } : {}),
    },
  });
}
