import type { ShowcaseBlock, ShowcaseBlockType } from "@prisma/client";
import { HeroBlock } from "./hero-block";
import { AboutBlock } from "./about-block";
import { ServicesBlock } from "./services-block";
import { BookingCtaBlock } from "./booking-cta-block";
import { LoyaltyCtaBlock } from "./loyalty-cta-block";
import { ReviewsCtaBlock } from "./reviews-cta-block";
import { ContactBlock } from "./contact-block";
import { HoursBlock } from "./hours-block";
import { BannerBlock } from "./banner-block";
import { SocialBlock } from "./social-block";
import { FaqBlock } from "./faq-block";
import type {
  HeroContent, AboutContent, ServicesContent, BookingCtaContent,
  LoyaltyCtaContent, ReviewsCtaContent, ContactContent, HoursContent,
  BannerContent, SocialContent, FaqContent,
} from "./types";

interface Service {
  id: string;
  name: string;
  description: string | null;
  duration: number | null;
  price: number | null;
  isActive: boolean;
}

interface Business {
  name: string;
  slug: string;
  shortDesc: string | null;
  description: string | null;
  coverUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  zipCode: string | null;
  website: string | null;
  facebookUrl: string | null;
  instagramUrl: string | null;
  googleMapsUrl: string | null;
}

interface BlockRendererProps {
  block: ShowcaseBlock;
  business: Business;
  hasBooking: boolean;
  hasLoyalty: boolean;
  hasReviews: boolean;
  services: Service[];
  bookingConfig?: { openTime: string; closeTime: string; workDays: unknown } | null;
  loyaltyConfig?: { stampIcon: string; rewardName: string } | null;
}

export function BlockRenderer({
  block,
  business,
  hasBooking,
  hasLoyalty,
  hasReviews,
  services,
  bookingConfig,
  loyaltyConfig,
}: BlockRendererProps) {
  const content = (block.content ?? {}) as Record<string, unknown>;

  switch (block.type as ShowcaseBlockType) {
    case "HERO":
      return (
        <HeroBlock
          content={content as HeroContent}
          business={business}
          hasBooking={hasBooking}
        />
      );
    case "ABOUT":
      return <AboutBlock content={content as AboutContent} business={business} />;
    case "SERVICES":
      return (
        <ServicesBlock
          content={content as ServicesContent}
          services={services}
          business={business}
        />
      );
    case "BOOKING_CTA":
      if (!hasBooking) return null;
      return <BookingCtaBlock content={content as BookingCtaContent} business={business} />;
    case "LOYALTY_CTA":
      if (!hasLoyalty) return null;
      return (
        <LoyaltyCtaBlock
          content={content as LoyaltyCtaContent}
          business={business}
          stampIcon={loyaltyConfig?.stampIcon}
          rewardName={loyaltyConfig?.rewardName}
        />
      );
    case "REVIEWS_CTA":
      if (!hasReviews) return null;
      return <ReviewsCtaBlock content={content as ReviewsCtaContent} business={business} />;
    case "CONTACT":
      return <ContactBlock content={content as ContactContent} business={business} />;
    case "HOURS":
      return (
        <HoursBlock
          content={content as HoursContent}
          business={business}
          bookingConfig={bookingConfig}
        />
      );
    case "BANNER":
      return <BannerBlock content={content as BannerContent} business={business} />;
    case "SOCIAL":
      return <SocialBlock content={content as SocialContent} business={business} />;
    case "FAQ":
      return <FaqBlock content={content as FaqContent} business={business} />;
    default:
      return null;
  }
}
