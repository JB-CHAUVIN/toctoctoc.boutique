import { ModuleType, PlanType } from "@prisma/client";

// ─────────────────────────────────────────
// PLANS & LIMITES
// ─────────────────────────────────────────

export const PLAN_LIMITS: Record<
  PlanType,
  {
    maxBusinesses: number;
    modules: ModuleType[];
    label: string;
    priceMonthly: number;
    /** Prix "original" avant promo (x2) — null pour FREE/ENTERPRISE */
    originalPriceMonthly: number | null;
    /** -1 = illimité */
    maxReviews: number;
    /** -1 = illimité */
    maxLoyaltyCards: number;
  }
> = {
  FREE: {
    label: "Gratuit",
    priceMonthly: 0,
    originalPriceMonthly: null,
    maxBusinesses: 1,
    modules: ["SHOWCASE", "REVIEWS", "LOYALTY"],
    maxReviews: 3,
    maxLoyaltyCards: 3,
  },
  STARTER: {
    label: "Starter",
    priceMonthly: 9,
    originalPriceMonthly: 18,
    maxBusinesses: 1,
    modules: ["SHOWCASE", "BOOKING", "REVIEWS", "LOYALTY"],
    maxReviews: -1,
    maxLoyaltyCards: -1,
  },
  PRO: {
    label: "Pro",
    priceMonthly: 19,
    originalPriceMonthly: 38,
    maxBusinesses: 3,
    modules: ["SHOWCASE", "BOOKING", "REVIEWS", "LOYALTY", "SOCIAL"],
    maxReviews: -1,
    maxLoyaltyCards: -1,
  },
  ENTERPRISE: {
    label: "Enterprise",
    priceMonthly: 99,
    originalPriceMonthly: null,
    maxBusinesses: -1, // illimité
    modules: [
      "SHOWCASE",
      "BOOKING",
      "REVIEWS",
      "LOYALTY",
      "SOCIAL",
      "ECOMMERCE",
      "PHONE_AI",
      "STAFF",
      "INVOICING",
    ],
    maxReviews: -1,
    maxLoyaltyCards: -1,
  },
};

export const LAUNCH_PROMO = {
  discount: "-50%",
  message: "Offre de lancement -50% à vie — pour les 1000 premiers inscrits !",
  badge: "-50% à vie",
} as const;

// ─────────────────────────────────────────
// INFOS MODULES
// ─────────────────────────────────────────

export const MODULES_INFO: Record<
  ModuleType,
  { name: string; description: string; emoji: string; comingSoon?: boolean }
> = {
  SHOWCASE: {
    name: "Site Vitrine",
    description: "Votre site web personnalisé accessible en ligne",
    emoji: "🌐",
  },
  BOOKING: {
    name: "Réservations",
    description: "Gérez vos rendez-vous et prestations en ligne",
    emoji: "📅",
  },
  REVIEWS: {
    name: "Avis Google + Roulette",
    description: "Collectez des avis et récompensez vos clients",
    emoji: "⭐",
  },
  LOYALTY: {
    name: "Carte de Fidélité",
    description: "Programme de fidélité digital avec tampons",
    emoji: "🎯",
  },
  SOCIAL: {
    name: "Réseaux Sociaux",
    description: "Publiez automatiquement sur vos réseaux",
    emoji: "📱",
    comingSoon: true,
  },
  ECOMMERCE: {
    name: "E-Commerce",
    description: "Vendez vos produits et services en ligne",
    emoji: "🛒",
    comingSoon: true,
  },
  PHONE_AI: {
    name: "Standard IA",
    description: "Répondeur téléphonique intelligent 24h/24",
    emoji: "📞",
    comingSoon: true,
  },
  STAFF: {
    name: "Gestion Staff",
    description: "Planifiez et gérez vos équipes",
    emoji: "👥",
    comingSoon: true,
  },
  INVOICING: {
    name: "Facturation",
    description: "Facturation électronique conforme France",
    emoji: "🧾",
    comingSoon: true,
  },
};

// ─────────────────────────────────────────
// JOURS DE LA SEMAINE
// ─────────────────────────────────────────

export const WEEK_DAYS = [
  { value: 0, label: "Dimanche" },
  { value: 1, label: "Lundi" },
  { value: 2, label: "Mardi" },
  { value: 3, label: "Mercredi" },
  { value: 4, label: "Jeudi" },
  { value: 5, label: "Vendredi" },
  { value: 6, label: "Samedi" },
] as const;

// ─────────────────────────────────────────
// TYPES DE BUSINESS
// ─────────────────────────────────────────

export const BUSINESS_TYPES = [
  // Restauration & boissons
  "Restaurant",
  "Café",
  "Bar",
  "Bar à jeux",
  "Glacier",
  // Boulangerie & artisanat alimentaire
  "Boulangerie",
  "Pâtisserie",
  "Boulangerie / Pâtisserie",
  "Chocolaterie",
  "Traiteur",
  "Fromagerie",
  "Boucherie",
  "Charcuterie",
  "Poissonnerie",
  "Épicerie fine",
  // Beauté & bien-être
  "Salon de coiffure",
  "Barbier",
  "Salon de beauté",
  "Institut d'esthétique",
  "Nail art",
  "Spa",
  "Studio de yoga",
  "Coach sportif",
  "Salle de sport",
  // Commerce de détail
  "Épicerie",
  "Superette",
  "Fleuriste",
  "Librairie",
  "Boutique de vêtements",
  "Boutique cadeaux",
  "Bijouterie",
  "Pressing",
  // Services
  "Garage / Auto",
  "Autre",
] as const;

// ─────────────────────────────────────────
// POLICES DISPONIBLES
// ─────────────────────────────────────────

export const FONT_FAMILIES = [
  { value: "Plus Jakarta Sans", label: "Plus Jakarta Sans (défaut)" },
  { value: "Inter", label: "Inter (moderne)" },
  { value: "Georgia", label: "Georgia (classique)" },
  { value: "Playfair Display", label: "Playfair Display (élégant)" },
  { value: "Montserrat", label: "Montserrat (corporate)" },
] as const;

/** Polices Google à charger dynamiquement (Georgia est une police système, pas besoin) */
export const GOOGLE_FONTS: Record<string, string> = {
  "Plus Jakarta Sans": "Plus+Jakarta+Sans:wght@400;500;600;700",
  "Inter": "Inter:wght@400;500;600;700",
  "Playfair Display": "Playfair+Display:wght@400;500;600;700",
  "Montserrat": "Montserrat:wght@400;500;600;700",
};

// ─────────────────────────────────────────
// RAISONS DE DÉSABONNEMENT
// ─────────────────────────────────────────

export const CANCEL_REASONS = [
  "Trop cher",
  "Je n'utilise plus le service",
  "J'ai trouvé une alternative",
  "Fonctionnalités insuffisantes",
  "Problèmes techniques",
  "Autre raison",
] as const;

// ─────────────────────────────────────────
// STATUTS RÉSERVATIONS
// ─────────────────────────────────────────

export const BOOKING_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  PENDING: { label: "En attente", color: "yellow" },
  CONFIRMED: { label: "Confirmé", color: "green" },
  CANCELLED: { label: "Annulé", color: "red" },
  COMPLETED: { label: "Terminé", color: "blue" },
  NO_SHOW: { label: "Absent", color: "gray" },
};

// ─────────────────────────────────────────
// SUPPORTS PREMIUM (print orders)
// ─────────────────────────────────────────

export interface PrintProduct {
  id: string;
  name: string;
  price: number; // en euros
  priceCents: number; // en centimes
  description: string;
  emoji: string;
  badge?: string;
}

export const PRINT_PRODUCTS: PrintProduct[] = [
  {
    id: "plexi-display",
    name: "Chevalet Plexi QR Code",
    price: 15,
    priceCents: 1500,
    description: "Support comptoir acrylique transparent, élégant et durable",
    emoji: "💎",
  },
  {
    id: "pvc-card",
    name: "Carte PVC rigide",
    price: 8,
    priceCents: 800,
    description: "Format CB, imperméable, pro",
    emoji: "💳",
  },
  {
    id: "pack-comptoir",
    name: "Pack Comptoir",
    price: 25,
    priceCents: 2500,
    description: "1 chevalet plexi + 2 cartes PVC (économie 6€)",
    emoji: "📦",
    badge: "Économisez 6€",
  },
  {
    id: "nfc-card",
    name: "Carte NFC + QR Code",
    price: 12,
    priceCents: 1200,
    description: "PVC avec puce NFC intégrée",
    emoji: "📡",
  },
];

export const PRINT_PRODUCTS_MAP: Record<string, PrintProduct> = Object.fromEntries(
  PRINT_PRODUCTS.map((p) => [p.id, p])
);

export const PRINT_ORDER_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  PENDING: { label: "En attente de paiement", color: "yellow" },
  PAID: { label: "Payé", color: "green" },
  SHIPPED: { label: "Expédié", color: "blue" },
  DELIVERED: { label: "Livré", color: "green" },
  CANCELLED: { label: "Annulé", color: "red" },
};
