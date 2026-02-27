// Content shape per block type — stored as JSON in ShowcaseBlock.content

export type HeroContent = {
  tagline?: string;
  title?: string;
  subtitle?: string;
  ctaText?: string;
  ctaUrl?: string;
  layout?: "centered" | "left";
};

export type AboutContent = {
  title?: string;
  text?: string;
  highlight?: string;
};

export type ServicesContent = {
  title?: string;
  subtitle?: string;
};

export type BookingCtaContent = {
  title?: string;
  subtitle?: string;
  ctaText?: string;
};

export type LoyaltyCtaContent = {
  title?: string;
  subtitle?: string;
  ctaText?: string;
};

export type ReviewsCtaContent = {
  title?: string;
  subtitle?: string;
  ctaText?: string;
};

export type ContactContent = {
  title?: string;
  showAddress?: boolean;
  showPhone?: boolean;
  showEmail?: boolean;
  showWebsite?: boolean;
};

export type HoursContent = {
  title?: string;
  schedule?: Array<{ label: string; hours: string }>;
};

export type BannerContent = {
  text: string;
  ctaText?: string;
  ctaUrl?: string;
};

export type SocialContent = {
  title?: string;
  showFacebook?: boolean;
  showInstagram?: boolean;
  showWebsite?: boolean;
  showGoogleMaps?: boolean;
};

export type FaqContent = {
  title?: string;
  items?: Array<{ q: string; a: string }>;
};

export type BlockContent =
  | HeroContent
  | AboutContent
  | ServicesContent
  | BookingCtaContent
  | LoyaltyCtaContent
  | ReviewsCtaContent
  | ContactContent
  | HoursContent
  | BannerContent
  | SocialContent
  | FaqContent;
