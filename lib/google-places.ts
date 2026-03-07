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

export interface GoogleBusinessData {
  name: string | null;
  businessType: string | null;
  address: string | null;
  city: string | null;
  zipCode: string | null;
  phone: string | null;
  website: string | null;
  googleMapsUrl: string | null;
  reviewUrl: string | null;
  googleRating: number | null;
  googleReviewCount: number | null;
}

/** Extract search query, coordinates, and place_id from any Google URL */
export function extractSearchQuery(url: string): {
  query: string;
  lat?: number;
  lng?: number;
  placeId?: string;
} {
  let query = "";
  let lat: number | undefined;
  let lng: number | undefined;
  let placeId: string | undefined;

  try {
    const parsed = new URL(url);
    const q = parsed.searchParams.get("q") ?? parsed.searchParams.get("query");
    if (q) {
      const placeIdMatch = q.match(/^place_id:(.+)$/);
      if (placeIdMatch) {
        placeId = placeIdMatch[1].trim();
      } else {
        query = q.replace(/\+/g, " ").trim();
      }
    }
    if (parsed.pathname.includes("/place/")) {
      const segment = parsed.pathname.split("/place/")[1]?.split("/")?.[0] ?? "";
      if (segment && !query && !placeId)
        query = decodeURIComponent(segment.replace(/\+/g, " ")).trim();
    }
    const coordMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (coordMatch) {
      lat = parseFloat(coordMatch[1]);
      lng = parseFloat(coordMatch[2]);
    }
  } catch {
    /* URL invalide */
  }
  return { query, lat, lng, placeId };
}

/** Fetch business data via Google Places API */
export async function fetchViaPlacesAPI(
  query: string,
  originalUrl: string,
  coords?: { lat: number; lng: number },
  directPlaceId?: string,
): Promise<GoogleBusinessData | null> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) return null;

  let placeId: string;

  if (directPlaceId) {
    placeId = directPlaceId;
    console.log(`[Google/Places] place_id direct : ${placeId}`);
  } else {
    console.log(
      `[Google/Places] Recherche : "${query}"${coords ? ` (location bias: ${coords.lat},${coords.lng})` : ""}`,
    );

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

  const fields =
    "name,formatted_address,address_components,formatted_phone_number,website,url,types,place_id,rating,user_ratings_total";
  const detailResp = await fetch(
    `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&key=${apiKey}&language=fr`,
  );
  const detailData = await detailResp.json();

  if (detailData.status !== "OK") {
    console.warn(`[Google/Places] Details → status: ${detailData.status}`);
    return null;
  }

  const place = detailData.result;
  console.log(`[Google/Places] Données reçues pour : "${place.name}"`);

  const components: { types: string[]; long_name: string }[] =
    place.address_components ?? [];
  const getComp = (type: string) =>
    components.find((c) => c.types.includes(type))?.long_name ?? null;
  const streetNumber = getComp("street_number");
  const route = getComp("route");
  const address = [streetNumber, route].filter(Boolean).join(" ") || null;
  const city =
    getComp("locality") || getComp("administrative_area_level_2") || null;
  const zipCode = getComp("postal_code") || null;

  const types: string[] = place.types ?? [];
  let businessType: string | null = null;
  for (const t of types) {
    if (GOOGLE_TYPE_MAP[t]) {
      businessType = GOOGLE_TYPE_MAP[t];
      break;
    }
  }

  return {
    name: place.name ?? null,
    businessType,
    address,
    city,
    zipCode,
    phone: place.formatted_phone_number ?? null,
    website: place.website ?? null,
    googleMapsUrl:
      place.url ??
      `https://www.google.com/maps/place/?q=place_id:${placeId}`,
    reviewUrl: `https://search.google.com/local/writereview?placeid=${placeId}`,
    googleRating: place.rating ?? null,
    googleReviewCount: place.user_ratings_total ?? null,
  };
}

/** Clean address by removing zipCode/city duplicates */
export function cleanAddress(data: GoogleBusinessData): GoogleBusinessData {
  let addr = data.address;
  if (addr && data.zipCode) {
    addr = addr.replace(new RegExp(`,?\\s*${data.zipCode}\\s*`, "g"), " ").trim();
  }
  if (addr && data.city) {
    addr = addr.replace(new RegExp(`,?\\s*${data.city}\\s*$`, "i"), "").trim();
  }
  if (addr) {
    addr = addr.replace(/,\s*$/, "").trim();
  }
  return { ...data, address: addr };
}
