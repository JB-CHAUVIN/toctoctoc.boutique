import { ModuleType, PlanType } from "@prisma/client";

// ─────────────────────────────────────────
// PLANS & LIMITES
// ─────────────────────────────────────────

export const PLAN_LIMITS: Record<
  PlanType,
  { maxBusinesses: number; modules: ModuleType[]; label: string; priceMonthly: number }
> = {
  FREE: {
    label: "Gratuit",
    priceMonthly: 0,
    maxBusinesses: 1,
    modules: ["SHOWCASE"],
  },
  STARTER: {
    label: "Starter",
    priceMonthly: 9,
    maxBusinesses: 1,
    modules: ["SHOWCASE", "BOOKING", "REVIEWS", "LOYALTY"],
  },
  PRO: {
    label: "Pro",
    priceMonthly: 19,
    maxBusinesses: 3,
    modules: ["SHOWCASE", "BOOKING", "REVIEWS", "LOYALTY", "SOCIAL"],
  },
  ENTERPRISE: {
    label: "Enterprise",
    priceMonthly: 99,
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
  },
};

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
  "Restaurant",
  "Salon de coiffure",
  "Boulangerie / Pâtisserie",
  "Salon de beauté",
  "Barbier",
  "Café",
  "Épicerie",
  "Pressing",
  "Pharmacie",
  "Cabinet médical",
  "Cabinet dentaire",
  "Kinésithérapeute",
  "Ostéopathe",
  "Coach sportif",
  "Studio de yoga",
  "Autre",
] as const;

// ─────────────────────────────────────────
// POLICES DISPONIBLES
// ─────────────────────────────────────────

export const FONT_FAMILIES = [
  { value: "Inter", label: "Inter (moderne)" },
  { value: "Georgia", label: "Georgia (classique)" },
  { value: "Playfair Display", label: "Playfair Display (élégant)" },
  { value: "Montserrat", label: "Montserrat (corporate)" },
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
