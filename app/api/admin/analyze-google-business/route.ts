import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import OpenAI from "openai";
import {
  extractSearchQuery,
  fetchViaPlacesAPI,
  cleanAddress,
  type GoogleBusinessData,
} from "@/lib/google-places";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ── Méthode 2 : Fetch HTML + GPT-4o (fallback) ───────────────────────────────
const GPT_EXTRACT_PROMPT = `Tu reçois du contenu HTML/texte provenant d'une page Google (résultat de recherche, fiche Maps, etc.).
Extrais les informations du commerce et retourne UNIQUEMENT un JSON valide sans backticks ni markdown :
{
  "name": "Nom du commerce ou null",
  "businessType": "Type parmi : Restaurant, Café, Bar, Bar à jeux, Glacier, Boulangerie, Pâtisserie, Boulangerie / Pâtisserie, Chocolaterie, Traiteur, Fromagerie, Boucherie, Charcuterie, Poissonnerie, Épicerie fine, Salon de coiffure, Barbier, Salon de beauté, Institut d'esthétique, Nail art, Spa, Studio de yoga, Coach sportif, Salle de sport, Épicerie, Superette, Fleuriste, Librairie, Boutique de vêtements, Boutique cadeaux, Bijouterie, Pressing, Garage / Auto, Autre, ou null",
  "address": "UNIQUEMENT le numéro et nom de rue (ex: '22 Rue des Bois'), SANS le code postal ni la ville. null si non trouvé",
  "city": "UNIQUEMENT le nom de la ville (ex: 'Paris'), SANS le code postal. null si non trouvé",
  "zipCode": "UNIQUEMENT le code postal (ex: '75019'). null si non trouvé",
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
    console.log(`[Google/Scrape] ${Math.round(html.length / 1024)} Ko — URL finale : ${finalUrl}`);
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
    console.log(`[Google/Scrape] gpt-4o en ${Date.now() - t0}ms — tokens: ${resp.usage?.total_tokens ?? "?"}`);

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
    let data: GoogleBusinessData | Record<string, string | null> | null = null;

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
    if (!data.name && businessName && !businessName.startsWith("place_id:")) {
      data.name = businessName;
    }

    // Nettoyer l'adresse
    data = cleanAddress(data as GoogleBusinessData);

    // Générer reviewUrl si absente mais place_id disponible
    if (!data.reviewUrl) {
      const pid = placeId
        || data.googleMapsUrl?.match(/place_id[=:]([A-Za-z0-9_-]+)/)?.[1];
      if (pid) {
        data.reviewUrl = `https://search.google.com/local/writereview?placeid=${pid}`;
      }
    }

    console.log(`[Google] Résultat final :`, data);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error(`[Google] Erreur :`, error);
    return NextResponse.json({ error: "Erreur lors de l'analyse" }, { status: 500 });
  }
}
