import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const OSM_TYPE_MAP: Record<string, string> = {
  bakery: "Boulangerie",
  pastry: "Pâtisserie",
  hairdresser: "Salon de coiffure",
  beauty: "Salon de beauté",
  clothes: "Boutique de vêtements",
  butcher: "Boucherie",
  seafood: "Poissonnerie",
  florist: "Fleuriste",
  books: "Librairie",
  jewelry: "Bijouterie",
  laundry: "Pressing",
  supermarket: "Épicerie",
  convenience: "Superette",
  deli: "Épicerie fine",
  chocolate: "Chocolaterie",
  cheese: "Fromagerie",
  restaurant: "Restaurant",
  cafe: "Café",
  bar: "Bar",
  fast_food: "Restaurant",
  ice_cream: "Glacier",
  pharmacy: "Pharmacie",
  optician: "Opticien",
  hardware: "Quincaillerie",
  electronics: "Électronique",
  mobile_phone: "Téléphonie",
  sports: "Sport",
  toys: "Jouets",
  gift: "Cadeaux",
  photo: "Photographie",
  dry_cleaning: "Pressing",
  travel_agency: "Agence de voyage",
  massage: "Massage",
  tattoo: "Tatouage",
  locksmith: "Serrurerie",
  copyshop: "Reprographie",
  stationery: "Papeterie",
  art: "Galerie d'art",
  wine: "Cave à vins",
  tobacco: "Tabac",
  lottery: "FDJ",
  greengrocer: "Primeur",
  pet: "Animalerie",
};

function getBusinessType(tags: Record<string, string>): string | null {
  const shopTag = tags["shop"];
  const amenityTag = tags["amenity"];

  if (shopTag && OSM_TYPE_MAP[shopTag]) return OSM_TYPE_MAP[shopTag];
  if (amenityTag && OSM_TYPE_MAP[amenityTag]) return OSM_TYPE_MAP[amenityTag];

  if (shopTag) return "Commerce";
  if (amenityTag) return "Autre";
  if (tags["office"]) return "Bureau";

  return null;
}

const schema = z.object({
  streetName: z.string().min(2).max(200),
});

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

  const { streetName } = parsed.data;

  // Requête Overpass
  const overpassQuery = `
[out:json][timeout:30];
area["name"="Paris"]["admin_level"="8"]->.paris;
(
  way["name"="${streetName}"](area.paris);
  node["shop"](area.paris)["addr:street"~"${streetName}",i];
  node["amenity"](area.paris)["addr:street"~"${streetName}",i];
  node["office"](area.paris)["addr:street"~"${streetName}",i];
);
out body;
>;
out skel qt;
`.trim();

  let overpassData: {
    elements: Array<{
      type: string;
      id: number;
      lat?: number;
      lon?: number;
      nodes?: number[];
      tags?: Record<string, string>;
    }>;
  };

  try {
    const resp = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `data=${encodeURIComponent(overpassQuery)}`,
      signal: AbortSignal.timeout(35000),
    });

    if (!resp.ok) throw new Error(`Overpass error ${resp.status}`);
    overpassData = await resp.json();
  } catch (err) {
    console.error("[OVERPASS_ERROR]", err);
    return NextResponse.json({ error: "Erreur Overpass API. Réessayez." }, { status: 502 });
  }

  const elements = overpassData.elements ?? [];

  // Construire un index des nœuds par id pour récupérer les coords des ways
  const nodeById = new Map<number, { lat: number; lon: number }>();
  for (const el of elements) {
    if (el.type === "node" && el.lat != null && el.lon != null) {
      nodeById.set(el.id, { lat: el.lat, lon: el.lon });
    }
  }

  // Extraire la géométrie de la rue (premier way correspondant)
  let geometry: Array<{ lat: number; lng: number }> | null = null;
  for (const el of elements) {
    if (el.type === "way" && el.tags?.["name"] === streetName && el.nodes) {
      const coords = el.nodes
        .map((nId) => nodeById.get(nId))
        .filter((n): n is { lat: number; lon: number } => n != null)
        .map((n) => ({ lat: n.lat, lng: n.lon }));
      if (coords.length > 0) {
        geometry = coords;
        break;
      }
    }
  }

  // Upsert ProspectStreet
  const street = await prisma.prospectStreet.upsert({
    where: { name_city: { name: streetName, city: "Paris" } },
    update: {
      geometry: geometry ?? undefined,
      searchedAt: new Date(),
    },
    create: {
      name: streetName,
      city: "Paris",
      geometry: geometry ?? undefined,
    },
  });

  // Extraire les POIs (nodes avec shop/amenity/office et addr:street)
  const pois = elements.filter(
    (el) =>
      el.type === "node" &&
      el.lat != null &&
      el.lon != null &&
      el.tags &&
      (el.tags["shop"] || el.tags["amenity"] || el.tags["office"]) &&
      el.tags["name"]
  );

  // Récupérer les osmIds déjà en DB pour éviter les doublons
  const existingOsmIds = new Set(
    (
      await prisma.prospectLead.findMany({
        where: { streetId: street.id, osmId: { not: null } },
        select: { osmId: true },
      })
    ).map((l: { osmId: string | null }) => l.osmId)
  );

  const leadsToCreate = pois
    .filter((poi) => !existingOsmIds.has(String(poi.id)))
    .map((poi) => {
      const tags = poi.tags!;
      const name = tags["name"] ?? "Commerce inconnu";
      const houseNumber = tags["addr:housenumber"] ?? "";
      const addressParts = [houseNumber, streetName, "Paris"].filter(Boolean);
      const address = addressParts.join(", ");
      const businessType = getBusinessType(tags);
      const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name + " " + address)}`;

      return {
        streetId: street.id,
        osmId: String(poi.id),
        name,
        address,
        lat: poi.lat!,
        lng: poi.lon!,
        googleMapsUrl,
        phone: tags["phone"] ?? tags["contact:phone"] ?? null,
        website: tags["website"] ?? tags["contact:website"] ?? null,
        businessType,
      };
    });

  let newLeads: typeof leadsToCreate = [];
  if (leadsToCreate.length > 0) {
    await prisma.prospectLead.createMany({ data: leadsToCreate });
    newLeads = leadsToCreate;
  }

  // Retourner la rue avec tous ses leads
  const fullStreet = await prisma.prospectStreet.findUnique({
    where: { id: street.id },
    include: { leads: { orderBy: { createdAt: "asc" } } },
  });

  return NextResponse.json({
    success: true,
    data: fullStreet,
    meta: { newLeadsCount: newLeads.length },
  });
}
