import type {
  Business,
  BusinessModule,
  BookingConfig,
  Service,
  Booking,
  ReviewConfig,
  Reward,
  Review,
  LoyaltyConfig,
  LoyaltyCard,
  LoyaltyStamp,
  Subscription,
  User,
} from "@prisma/client";

// ─────────────────────────────────────────
// Types étendus (avec relations)
// ─────────────────────────────────────────

export type BusinessWithModules = Business & {
  modules: BusinessModule[];
};

export type BusinessFull = Business & {
  modules: BusinessModule[];
  bookingConfig: (BookingConfig & { services: Service[] }) | null;
  reviewConfig: (ReviewConfig & { rewards: Reward[] }) | null;
  loyaltyConfig: LoyaltyConfig | null;
};

export type BookingWithService = Booking & {
  service: Service | null;
};

export type ReviewWithReward = Review & {
  reward: Reward | null;
};

export type LoyaltyCardWithStamps = LoyaltyCard & {
  stamps: LoyaltyStamp[];
};

export type UserWithSubscription = User & {
  subscription: Subscription | null;
};

// ─────────────────────────────────────────
// Réponses API génériques
// ─────────────────────────────────────────

export type ApiSuccess<T> = {
  success: true;
  data: T;
};

export type ApiError = {
  success: false;
  error: string;
};

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

// ─────────────────────────────────────────
// Formulaires
// ─────────────────────────────────────────

export type BusinessFormData = {
  name: string;
  slug: string;
  description?: string;
  shortDesc?: string;
  businessType?: string;
  address?: string;
  city?: string;
  zipCode?: string;
  phone?: string;
  email?: string;
  website?: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  facebookUrl?: string;
  instagramUrl?: string;
  googleMapsUrl?: string;
};

export type BookingFormData = {
  serviceId: string;
  date: string; // ISO string
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  notes?: string;
};

export type TimeSlot = {
  time: string; // "HH:mm"
  available: boolean;
};

export type PublicBusiness = Pick<
  Business,
  | "id"
  | "name"
  | "slug"
  | "description"
  | "shortDesc"
  | "businessType"
  | "address"
  | "city"
  | "zipCode"
  | "phone"
  | "email"
  | "website"
  | "logoUrl"
  | "coverUrl"
  | "primaryColor"
  | "secondaryColor"
  | "accentColor"
  | "fontFamily"
  | "facebookUrl"
  | "instagramUrl"
  | "googleMapsUrl"
  | "isPublished"
> & {
  modules: BusinessModule[];
};
