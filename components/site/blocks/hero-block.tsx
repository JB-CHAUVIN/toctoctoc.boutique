import Link from "next/link";
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
  };
  hasBooking: boolean;
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
        </div>
      </section>
    );
  }

  // No cover: typographic hero
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
            style={{ backgroundColor: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.9)" }}
          >
            {content.tagline}
          </p>
        )}
        <h1 className="text-5xl font-black leading-[1.05] tracking-tight text-white md:text-7xl lg:text-8xl">
          {title}
        </h1>
        {subtitle && (
          <p className={`mt-6 text-lg text-white/65 md:text-xl ${isLeft ? "max-w-xl" : "mx-auto max-w-2xl"}`}>
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
      </div>
    </section>
  );
}
