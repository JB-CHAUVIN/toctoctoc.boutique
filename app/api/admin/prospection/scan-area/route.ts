import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PROSPECT_TARGET_TYPES } from "@/lib/constants";
import { mapGoogleTypes } from "@/lib/google-types";

const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY!;

const schema = z.object({
  bounds: z.object({
    sw: z.object({ lat: z.number(), lng: z.number() }),
    ne: z.object({ lat: z.number(), lng: z.number() }),
  }),
  types: z.array(z.string()).min(1).max(30),
  city: z.string().min(1).max(200),
});

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

/** Calcule le centre et le rayon (en mètres) à partir des bounds de la carte */
function boundsToCircle(sw: { lat: number; lng: number }, ne: { lat: number; lng: number }) {
  const centerLat = (sw.lat + ne.lat) / 2;
  const centerLng = (sw.lng + ne.lng) / 2;

  // Approximation : 1° lat ≈ 111320m, 1° lng ≈ 111320m × cos(lat)
  const dLat = ((ne.lat - sw.lat) / 2) * 111320;
  const dLng = ((ne.lng - sw.lng) / 2) * 111320 * Math.cos((centerLat * Math.PI) / 180);
  const radius = Math.min(Math.sqrt(dLat * dLat + dLng * dLng), 50000); // Google max: 50km

  return { lat: centerLat, lng: centerLng, radius: Math.round(radius) };
}

/** Google Nearby Search pour un type donné — 1 page (20 résultats max) */
async function nearbySearch(
  center: { lat: number; lng: number },
  radius: number,
  type: string
): Promise<GooglePlace[]> {
  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?${new URLSearchParams({
    location: `${center.lat},${center.lng}`,
    radius: String(radius),
    type,
    key: GOOGLE_API_KEY,
    language: "fr",
  })}`;

  const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
  if (!res.ok) return [];

  const data = await res.json();
  if (data.status !== "OK") return [];

  return data.results ?? [];
}

/** Vérifie qu'un lieu a effectivement le type recherché dans ses types Google */
function placeMatchesType(place: GooglePlace, searchedType: string): boolean {
  return place.types.includes(searchedType);
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

  const { bounds, types, city } = parsed.data;

  // Valider que les types demandés sont dans la config
  const validTypes = new Set(PROSPECT_TARGET_TYPES.map((t) => t.googleType));
  const requestedTypes = types.filter((t) => validTypes.has(t));
  if (requestedTypes.length === 0) {
    return NextResponse.json({ error: "Aucun type valide sélectionné" }, { status: 400 });
  }

  const { lat, lng, radius } = boundsToCircle(bounds.sw, bounds.ne);

  // ── 1. Nearby Search pour chaque type (en parallèle, max 6 simultanés) ──
  const allPlaces = new Map<string, { place: GooglePlace; businessType: string | null }>();

  // Batch par groupes de 6 pour ne pas surcharger Google
  const BATCH_SIZE = 6;
  for (let i = 0; i < requestedTypes.length; i += BATCH_SIZE) {
    const batch = requestedTypes.slice(i, i + BATCH_SIZE);
    const results = await Promise.all(
      batch.map((type) => nearbySearch({ lat, lng }, radius, type))
    );

    for (let j = 0; j < batch.length; j++) {
      const searchedType = batch[j];
      for (const place of results[j]) {
        // Filtrer : ne garder que les lieux qui ont RÉELLEMENT le type recherché
        if (!placeMatchesType(place, searchedType)) continue;
        if (!allPlaces.has(place.place_id)) {
          allPlaces.set(place.place_id, {
            place,
            businessType: mapGoogleTypes(place.types),
          });
        }
      }
    }
  }

  if (allPlaces.size === 0) {
    return NextResponse.json({ error: "Aucun commerce trouvé dans cette zone." }, { status: 404 });
  }

  // ── 2. Créer le ProspectStreet ──
  const cityLabel = city.split(",")[0].trim();
  const now = new Date();
  const timeLabel = now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  const dateLabel = now.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" });
  const streetName = `Scan ${dateLabel} ${timeLabel}`;

  // Stocker les bounds comme geometry (rectangle)
  const boundsGeometry = [[
    { lat: bounds.sw.lat, lng: bounds.sw.lng },
    { lat: bounds.ne.lat, lng: bounds.sw.lng },
    { lat: bounds.ne.lat, lng: bounds.ne.lng },
    { lat: bounds.sw.lat, lng: bounds.ne.lng },
    { lat: bounds.sw.lat, lng: bounds.sw.lng },
  ]];

  const street = await prisma.prospectStreet.create({
    data: {
      name: streetName,
      city: cityLabel,
      geometry: boundsGeometry,
    },
  });

  // ── 3. Créer les ProspectLeads (dédupliqués contre les leads existants) ──
  const existingOsmIds = new Set(
    (
      await prisma.prospectLead.findMany({
        where: { osmId: { in: Array.from(allPlaces.keys()).map((id) => `g:${id}`) } },
        select: { osmId: true },
      })
    ).map((l) => l.osmId)
  );

  const leadsToCreate = Array.from(allPlaces.entries())
    .filter(([placeId]) => !existingOsmIds.has(`g:${placeId}`))
    .map(([placeId, { place, businessType }]) => ({
      streetId: street.id,
      osmId: `g:${placeId}`,
      name: place.name,
      address: place.vicinity ?? place.formatted_address ?? null,
      lat: place.geometry.location.lat,
      lng: place.geometry.location.lng,
      googleMapsUrl: `https://www.google.com/maps/place/?q=place_id:${placeId}`,
      businessType,
      rating: place.rating ?? null,
      reviewCount: place.user_ratings_total ?? null,
      phone: null,
      website: null,
    }));

  const skippedCount = allPlaces.size - leadsToCreate.length;

  if (leadsToCreate.length > 0) {
    await prisma.prospectLead.createMany({ data: leadsToCreate });
  }

  const fullStreet = await prisma.prospectStreet.findUnique({
    where: { id: street.id },
    include: { leads: { orderBy: { createdAt: "asc" } } },
  });

  return NextResponse.json({
    success: true,
    data: fullStreet,
    meta: {
      totalFound: allPlaces.size,
      newLeadsCount: leadsToCreate.length,
      skippedCount,
      typesSearched: requestedTypes.length,
    },
  });
}
