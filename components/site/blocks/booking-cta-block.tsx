import Link from "next/link";
import { contrastColor } from "@/lib/utils";
import type { BookingCtaContent } from "./types";

interface BookingCtaBlockProps {
  content: BookingCtaContent;
  business: {
    slug: string;
    primaryColor: string;
    accentColor: string;
  };
}

export function BookingCtaBlock({ content, business }: BookingCtaBlockProps) {
  const title = content.title || "Prenez rendez-vous";
  const subtitle = content.subtitle || "Réservez en ligne en quelques secondes, 24h/24.";
  const ctaText = content.ctaText || "Choisir un créneau";

  const textColor = contrastColor(business.primaryColor);

  return (
    <section
      className="relative overflow-hidden"
      style={{ backgroundColor: business.primaryColor }}
    >
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: "radial-gradient(circle at 70% 50%, white 0, transparent 60%)",
        }}
      />
      <div className="relative mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 px-6 py-16 md:flex-row md:items-center md:py-20">
        <div>
          <h2 className="text-3xl font-black tracking-tight md:text-4xl" style={{ color: textColor }}>
            {title}
          </h2>
          <p className="mt-3" style={{ color: textColor, opacity: 0.6 }}>{subtitle}</p>
        </div>
        <Link
          href={`/${business.slug}/booking`}
          className="flex-shrink-0 rounded-full bg-white px-8 py-4 text-sm font-semibold shadow-lg transition hover:opacity-90 active:scale-[0.98]"
          style={{ color: business.primaryColor }}
        >
          {ctaText}
        </Link>
      </div>
    </section>
  );
}
