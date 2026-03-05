import type { PrintThemeId } from "@/lib/constants";

export interface BusinessModule {
  module: string;
  isActive: boolean;
}

export interface BusinessData {
  id: string;
  name: string;
  slug: string;
  businessType: string | null;
  address: string | null;
  city: string | null;
  zipCode: string | null;
  phone: string | null;
  email: string | null;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  logoUrl: string | null;
  logoBackground: string | null;
  claimToken: string | null;
  prospectedAt: string | null;
  brandStyle: Record<string, unknown> | null;
  modules: BusinessModule[];
}

export type CardVariant = "qr" | "nfc";

export interface BusinessConfig {
  tractTheme: PrintThemeId;
  supportTheme: PrintThemeId;
  showAvatar: boolean;
  cardVariant: CardVariant;
}
