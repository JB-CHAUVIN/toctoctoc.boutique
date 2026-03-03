import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Mapping des types Google Places → nos BUSINESS_TYPES
const GOOGLE_TYPE_MAP: Record<string, string> = {
  restaurant: "Restaurant",
  cafe: "Café",
  bar: "Bar",
  bakery: "Boulangerie",
  hair_care: "Salon de coiffure",
  hair_salon: "Salon de coiffure",
  beauty_salon: "Salon de beauté",
  gym: "Salle de sport",
  spa: "Spa",
  florist: "Fleuriste",
  book_store: "Librairie",
  clothing_store: "Boutique de vêtements",
  jewelry_store: "Bijouterie",
  grocery_or_supermarket: "Épicerie",
  supermarket: "Superette",
  convenience_store: "Épicerie",
  laundry: "Pressing",
  car_repair: "Garage / Auto",
  car_dealer: "Garage / Auto",
  food: "Restaurant",
  meal_takeaway: "Traiteur",
  meal_delivery: "Traiteur",
  pastry_shop: "Pâtisserie",
  butcher_shop: "Boucherie",
};

// ── Extraction du nom + coordonnées + place_id depuis n'importe quelle URL Google ──
function extractSearchQuery(url: string): { query: string; lat?: number; lng?: number; placeId?: string } {
  let query = "";
  let lat: number | undefined;
  let lng: number | undefined;
  let placeId: string | undefined;

  try {
    const parsed = new URL(url);
    // google.com/search?q=... ou ?query=...
    const q = parsed.searchParams.get("q") ?? parsed.searchParams.get("query");
    if (q) {
      // Cas : ?q=place_id:ChIJ... → extraire directement le place_id
      const placeIdMatch = q.match(/^place_id:(.+)$/);
      if (placeIdMatch) {
        placeId = placeIdMatch[1].trim();
      } else {
        query = q.replace(/\+/g, " ").trim();
      }
    }
    // google.com/maps/place/Business+Name/@lat,lng,...
    if (parsed.pathname.includes("/place/")) {
      const segment = parsed.pathname.split("/place/")[1]?.split("/")?.[0] ?? "";
      if (segment && !query && !placeId) query = decodeURIComponent(segment.replace(/\+/g, " ")).trim();
    }
    // Extraire coordonnées @lat,lng depuis le path
    const coordMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (coordMatch) {
      lat = parseFloat(coordMatch[1]);
      lng = parseFloat(coordMatch[2]);
    }
  } catch { /* URL invalide */ }
  return { query, lat, lng, placeId };
}

// ── Méthode 1 : Google Places API (fiable) ───────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function fetchViaPlacesAPI(query: string, originalUrl: string, coords?: { lat: number; lng: number }, directPlaceId?: string) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY!;

  let placeId: string;

  if (directPlaceId) {
    // Cas où l'URL contient directement ?q=place_id:ChIJ... → skip Text Search
    placeId = directPlaceId;
    console.log(`[Google/Places] place_id direct depuis URL : ${placeId}`);
  } else {
    console.log(`[Google/Places] Recherche : "${query}"${coords ? ` (location bias: ${coords.lat},${coords.lng})` : ""}`);

    // Text Search → place_id (avec biais de localisation si coordonnées disponibles)
    const searchParams: Record<string, string> = {
      query,
      key: apiKey,
      language: "fr",
    };
    if (coords) {
      searchParams.location = `${coords.lat},${coords.lng}`;
      searchParams.radius = "500";
    }
    const searchResp = await fetch(
      `https://maps.googleapis.com/maps/api/place/textsearch/json?${new URLSearchParams(searchParams)}`,
    );
    const searchData = await searchResp.json();

    if (searchData.status !== "OK" || !searchData.results?.length) {
      console.warn(`[Google/Places] Text Search → status: ${searchData.status}`);
      return null;
    }

    placeId = searchData.results[0].place_id;
    console.log(`[Google/Places] place_id trouvé : ${placeId}`);
  }

  // Place Details → champs utiles
  const fields = "name,formatted_address,address_components,formatted_phone_number,website,url,types,place_id";
  const detailResp = await fetch(
    `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&key=${apiKey}&language=fr`,
  );
  const detailData = await detailResp.json();

  if (detailData.status !== "OK") {
    console.warn(`[Google/Places] Details → status: ${detailData.status}`);
    return null;
  }

  const place = detailData.result;
  console.log(`[Google/Places] ✓ Données reçues pour : "${place.name}"`);

  // Décompose address_components
  const components: { types: string[]; long_name: string }[] = place.address_components ?? [];
  const getComp = (type: string) => components.find((c) => c.types.includes(type))?.long_name ?? null;
  const streetNumber = getComp("street_number");
  const route       = getComp("route");
  const address     = [streetNumber, route].filter(Boolean).join(" ") || null;
  const city        = getComp("locality") || getComp("administrative_area_level_2") || null;
  const zipCode     = getComp("postal_code") || null;

  // Type de commerce
  const types: string[] = place.types ?? [];
  let businessType: string | null = null;
  for (const t of types) {
    if (GOOGLE_TYPE_MAP[t]) { businessType = GOOGLE_TYPE_MAP[t]; break; }
  }
  console.log(`[Google/Places]   types Google : ${types.slice(0, 5).join(", ")} → businessType : ${businessType}`);

  return {
    name:          place.name ?? null,
    businessType,
    address,
    city,
    zipCode,
    phone:         place.formatted_phone_number ?? null,
    website:       place.website ?? null,
    googleMapsUrl: place.url ?? `https://www.google.com/maps/place/?q=place_id:${placeId}`,
    reviewUrl:     `https://search.google.com/local/writereview?placeid=${placeId}`,
  };
}

// ── Méthode 2 : Fetch HTML + GPT-4o (fallback) ───────────────────────────────
const GPT_EXTRACT_PROMPT = `Tu reçois du contenu HTML/texte provenant d'une page Google (résultat de recherche, fiche Maps, etc.).
Extrais les informations du commerce et retourne UNIQUEMENT un JSON valide sans backticks ni markdown :
{
  "name": "Nom du commerce ou null",
  "businessType": "Type parmi : Restaurant, Café, Bar, Bar à jeux, Glacier, Boulangerie, Pâtisserie, Boulangerie / Pâtisserie, Chocolaterie, Traiteur, Fromagerie, Boucherie, Charcuterie, Poissonnerie, Épicerie fine, Salon de coiffure, Barbier, Salon de beauté, Institut d'esthétique, Nail art, Spa, Studio de yoga, Coach sportif, Salle de sport, Épicerie, Superette, Fleuriste, Librairie, Boutique de vêtements, Boutique cadeaux, Bijouterie, Pressing, Garage / Auto, Autre, ou null",
  "address": "Numéro et nom de rue ou null",
  "city": "Ville ou null",
  "zipCode": "Code postal ou null",
  "phone": "Numéro de téléphone ou null",
  "website": "URL du site web officiel ou null",
  "googleMapsUrl": "URL Google Maps de la fiche ou null"
}
Si une information n'est pas trouvée dans le contenu, mets null. Ne devine pas.`;

async function fetchViaHtmlScraping(url: string, businessName: string) {
  console.log(`[Google/Scrape] Fetch HTML : ${url}`);

  let html = "";
  let finalUrl = url;
  try {
    const resp = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml",
        "Accept-Language": "fr-FR,fr;q=0.9",
      },
      redirect: "follow",
    });
    finalUrl = resp.url;
    html = await resp.text();
    console.log(`[Google/Scrape] ✓ ${Math.round(html.length / 1024)} Ko — URL finale : ${finalUrl}`);
  } catch (err) {
    console.error(`[Google/Scrape] Fetch échoué :`, err);
    return null;
  }

  // Extraire JSON-LD
  const jsonLdRegex = /<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi;
  const jsonLdParts: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = jsonLdRegex.exec(html)) !== null) jsonLdParts.push(m[1].trim());

  // Extraire meta tags
  const metaRegex = /<meta[^>]+>/gi;
  const metaParts: string[] = [];
  while ((m = metaRegex.exec(html)) !== null) {
    if (/name=|property=|content=/i.test(m[0])) metaParts.push(m[0]);
  }

  // Texte visible tronqué
  const visibleText = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 4000);

  const content = [
    businessName ? `Nom recherché : ${businessName}` : "",
    `URL finale : ${finalUrl}`,
    jsonLdParts.length ? `\n--- JSON-LD ---\n${jsonLdParts.join("\n")}` : "",
    metaParts.length ? `\n--- Meta tags ---\n${metaParts.join("\n").slice(0, 2000)}` : "",
    visibleText ? `\n--- Texte visible ---\n${visibleText}` : "",
  ].filter(Boolean).join("\n");

  console.log(`[Google/Scrape] Contenu extrait : ${Math.round(content.length / 1024)} Ko — appel gpt-4o…`);

  try {
    const t0 = Date.now();
    const resp = await openai.chat.completions.create({
      model: "gpt-4o",
      max_tokens: 800,
      messages: [
        { role: "system", content: GPT_EXTRACT_PROMPT },
        { role: "user", content: content.slice(0, 12000) },
      ],
    });
    console.log(`[Google/Scrape] ✓ gpt-4o en ${Date.now() - t0}ms — tokens: ${resp.usage?.total_tokens ?? "?"}`);

    const rawJson = resp.choices[0]?.message?.content ?? "{}";
    console.log(`[Google/Scrape]   Réponse brute :`, rawJson);

    let parsed: Record<string, string | null> = {};
    try { parsed = JSON.parse(rawJson.trim()); }
    catch { const match = rawJson.match(/\{[\s\S]*\}/); if (match) parsed = JSON.parse(match[0]); }

    if (!parsed.googleMapsUrl && finalUrl.includes("google.com/maps")) parsed.googleMapsUrl = finalUrl;
    return parsed;
  } catch (err) {
    console.error(`[Google/Scrape] Erreur GPT :`, err);
    return null;
  }
}

// ── Handler principal ─────────────────────────────────────────────────────────
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  if (dbUser?.role !== "ADMIN") {
    return NextResponse.json({ error: "Accès réservé aux admins" }, { status: 403 });
  }

  const body = await req.json();
  const { url } = body as { url: string };
  if (!url?.trim()) return NextResponse.json({ error: "URL requise" }, { status: 400 });

  const { query: businessName, lat, lng, placeId } = extractSearchQuery(url);
  const coords = lat !== undefined && lng !== undefined ? { lat, lng } : undefined;
  console.log(`[Google] URL : ${url}`);
  if (placeId) {
    console.log(`[Google] place_id extrait directement : ${placeId}`);
  } else {
    console.log(`[Google] Nom extrait de l'URL : "${businessName}"${coords ? ` — coords: ${coords.lat},${coords.lng}` : ""}`);
  }

  try {
    let data: Record<string, string | null> | null = null;

    if (process.env.GOOGLE_PLACES_API_KEY) {
      const query = businessName || url;
      data = await fetchViaPlacesAPI(query, url, coords, placeId);
    } else {
      console.log(`[Google] Pas de GOOGLE_PLACES_API_KEY — fallback scraping HTML`);
    }

    // Fallback scraping si Places API non dispo ou sans résultat
    if (!data) {
      data = await fetchViaHtmlScraping(url, businessName);
    }

    if (!data) {
      return NextResponse.json(
        { error: "Impossible d'extraire les données. Ajoutez GOOGLE_PLACES_API_KEY dans .env.local pour un résultat fiable." },
        { status: 422 },
      );
    }

    // Pré-remplir le nom depuis l'URL si GPT n'a rien trouvé
    // (ne pas utiliser une chaîne "place_id:..." comme nom)
    if (!data.name && businessName && !businessName.startsWith("place_id:")) {
      data.name = businessName;
    }

    console.log(`[Google] ✓ Résultat final :`, data);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error(`[Google] ✗ Erreur :`, error);
    return NextResponse.json({ error: "Erreur lors de l'analyse" }, { status: 500 });
  }
}
