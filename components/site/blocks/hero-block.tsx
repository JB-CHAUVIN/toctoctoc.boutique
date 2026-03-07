import Link from "next/link";
import { contrastColor } from "@/lib/utils";
import type { HeroContent } from "./types";

interface HeroBlockProps {
  content: HeroContent;
  business: {
    name: string;
    shortDesc: string | null;
    coverUrl: string | null;
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    slug: string;
    googleRating: number | null;
    googleReviewCount: number | null;
  };
  hasBooking: boolean;
}

function GoogleRatingBadge({ rating, count, variant }: { rating: number; count: number; variant: "light" | "dark" }) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.3;
  const stars = Array.from({ length: 5 }, (_, i) => {
    if (i < fullStars) return "full";
    if (i === fullStars && hasHalf) return "half";
    return "empty";
  });

  const isDark = variant === "dark";

  return (
    <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium backdrop-blur-sm ${
      isDark ? "bg-white/15 text-white" : "bg-black/5 text-slate-700"
    }`}>
      <div className="flex items-center gap-0.5">
        {stars.map((type, i) => (
          <svg key={i} className="h-4 w-4" viewBox="0 0 20 20" fill={type === "empty" ? "none" : "#facc15"} stroke={type === "empty" ? (isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.2)") : "none"}>
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
      <span className="font-bold">{rating.toFixed(1)}</span>
      <span className={isDark ? "text-white/60" : "text-slate-400"}>({count} avis)</span>
    </div>
  );
}

export function HeroBlock({ content, business, hasBooking }: HeroBlockProps) {
  const title = content.title || business.name;
  const subtitle = content.subtitle || business.shortDesc;
  const ctaText = content.ctaText || (hasBooking ? "Réserver un créneau" : undefined);
  const ctaUrl = content.ctaUrl || (hasBooking ? `/${business.slug}/booking` : undefined);
  const isLeft = content.layout !== "centered";

  if (business.coverUrl) {
    return (
      <section className="relative isolate overflow-hidden min-h-[80vh] flex items-end">
        <img
          src={business.coverUrl}
          alt={business.name}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <div className={`relative z-10 mx-auto w-full max-w-6xl px-6 pb-16 md:pb-24 ${isLeft ? "" : "text-center"}`}>
          {content.tagline && (
            <p
              className="mb-4 inline-block rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-widest text-white"
              style={{ backgroundColor: business.accentColor + "cc" }}
            >
              {content.tagline}
            </p>
          )}
          <h1 className="text-5xl font-black leading-[1.05] tracking-tight text-white md:text-7xl">
            {title}
          </h1>
          {subtitle && (
            <p className={`mt-5 text-lg text-white/70 md:text-xl ${isLeft ? "max-w-xl" : "mx-auto max-w-2xl"}`}>
              {subtitle}
            </p>
          )}
          {ctaText && ctaUrl && (
            <div className={`mt-8 ${isLeft ? "" : "flex justify-center"}`}>
              <Link
                href={ctaUrl}
                className="inline-flex items-center gap-2 rounded-full px-8 py-4 text-base font-semibold text-white shadow-2xl transition hover:opacity-90 active:scale-[0.98]"
                style={{ backgroundColor: business.accentColor }}
              >
                {ctaText}
              </Link>
            </div>
          )}
          {business.googleRating && business.googleReviewCount ? (
            <div className={`mt-6 ${isLeft ? "" : "flex justify-center"}`}>
              <GoogleRatingBadge rating={business.googleRating} count={business.googleReviewCount} variant="dark" />
            </div>
          ) : null}
        </div>
      </section>
    );
  }

  // No cover: typographic hero
  const heroTextColor = contrastColor(business.primaryColor);

  return (
    <section
      className="relative isolate min-h-[70vh] flex items-center"
      style={{ backgroundColor: business.primaryColor }}
    >
      {/* Subtle texture pattern */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)",
          backgroundSize: "20px 20px",
        }}
      />
      <div className={`relative z-10 mx-auto w-full max-w-6xl px-6 py-20 ${!isLeft ? "text-center" : ""}`}>
        {content.tagline && (
          <p
            className="mb-5 inline-block rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-widest"
            style={{ backgroundColor: heroTextColor === "#ffffff" ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.08)", color: heroTextColor, opacity: 0.9 }}
          >
            {content.tagline}
          </p>
        )}
        <h1 className="text-5xl font-black leading-[1.05] tracking-tight md:text-7xl lg:text-8xl" style={{ color: heroTextColor }}>
          {title}
        </h1>
        {subtitle && (
          <p className={`mt-6 text-lg md:text-xl ${isLeft ? "max-w-xl" : "mx-auto max-w-2xl"}`} style={{ color: heroTextColor, opacity: 0.65 }}>
            {subtitle}
          </p>
        )}
        {ctaText && ctaUrl && (
          <div className={`mt-10 ${!isLeft ? "flex justify-center" : ""}`}>
            <Link
              href={ctaUrl}
              className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-base font-semibold shadow-xl transition hover:opacity-90 active:scale-[0.98]"
              style={{ color: business.primaryColor }}
            >
              {ctaText}
            </Link>
          </div>
        )}
        {business.googleRating && business.googleReviewCount ? (
          <div className={`mt-6 ${!isLeft ? "flex justify-center" : ""}`}>
            <GoogleRatingBadge
              rating={business.googleRating}
              count={business.googleReviewCount}
              variant={contrastColor(business.primaryColor) === "#ffffff" ? "dark" : "light"}
            />
          </div>
        ) : null}
      </div>
    </section>
  );
}
