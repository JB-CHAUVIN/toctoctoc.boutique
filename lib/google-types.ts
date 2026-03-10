/**
 * Mapping complet Google Place types → businessType lisible.
 * Partagé entre les routes de prospection (search + scan-area).
 */
export const GOOGLE_TYPE_MAP: Record<string, string | null> = {
  // Restauration & boissons
  bakery: "Boulangerie",
  restaurant: "Restaurant",
  cafe: "Café",
  bar: "Bar",
  night_club: "Bar",
  liquor_store: "Cave à vins",
  meal_takeaway: "Restaurant",
  meal_delivery: "Restaurant",

  // Beauté & bien-être
  beauty_salon: "Salon de beauté",
  hair_care: "Salon de coiffure",
  barber_shop: "Barbier",
  spa: "Spa",
  gym: "Salle de sport",

  // Santé
  dentist: "Dentiste",
  doctor: "Médecin",
  hospital: "Hôpital",
  physiotherapist: "Kiné",
  pharmacy: "Pharmacie",
  drugstore: "Pharmacie",
  optician: "Opticien",
  veterinary_care: "Vétérinaire",

  // Commerce de détail
  florist: "Fleuriste",
  book_store: "Librairie",
  jewelry_store: "Bijouterie",
  clothing_store: "Boutique de vêtements",
  shoe_store: "Boutique de chaussures",
  pet_store: "Animalerie",
  laundry: "Pressing",
  dry_cleaning: "Pressing",
  bicycle_store: "Vélo",
  electronics_store: "Électronique",
  hardware_store: "Quincaillerie",
  furniture_store: "Mobilier",
  home_goods_store: "Décoration",

  // Alimentation (grandes surfaces)
  supermarket: "Supermarché",
  grocery_or_supermarket: "Supermarché",
  convenience_store: "Superette",
  department_store: "Grande surface",
  food: "Alimentation",

  // Auto
  car_repair: "Garage",
  car_dealer: "Concessionnaire",
  gas_station: "Station service",

  // Services
  travel_agency: "Agence de voyage",
  real_estate_agency: "Immobilier",
  insurance_agency: "Assurances",
  lawyer: "Avocat",
  accounting: "Comptable",
  bank: "Banque",
  atm: "Banque",

  // Génériques — en dernier pour ne pas écraser les types spécifiques
  store: "Commerce",
  shopping_mall: "Centre commercial",
  establishment: null,
  point_of_interest: null,
  health: null,
  finance: null,
};

/**
 * Types "englobants" : si un lieu a un de ces types, il prend priorité
 * sur les types "rayon" (ex: Leclerc a bakery + supermarket → c'est un Supermarché,
 * pas une Boulangerie). On les checke en premier.
 */
const PRIORITY_TYPES = [
  "supermarket",
  "grocery_or_supermarket",
  "department_store",
  "shopping_mall",
  "convenience_store",
  "hospital",
] as const;

/**
 * Résout le businessType lisible depuis le tableau de types Google d'un lieu.
 * Priorise les types "englobants" (supermarché, hôpital…) pour éviter qu'un
 * Leclerc avec rayon boulangerie soit taggé "Boulangerie".
 */
export function mapGoogleTypes(types: string[]): string | null {
  // 1. Vérifier d'abord les types prioritaires (grandes surfaces, hôpitaux…)
  for (const pt of PRIORITY_TYPES) {
    if (types.includes(pt)) {
      const mapped = GOOGLE_TYPE_MAP[pt];
      if (mapped) return mapped;
    }
  }

  // 2. Sinon, premier match classique
  for (const t of types) {
    const mapped = GOOGLE_TYPE_MAP[t];
    if (mapped) return mapped;
  }
  return null;
}
