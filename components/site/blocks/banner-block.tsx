import Link from "next/link";
import { contrastColor } from "@/lib/utils";
import type { BannerContent } from "./types";

interface BannerBlockProps {
  content: BannerContent;
  business: {
    accentColor: string;
    primaryColor: string;
  };
}

export function BannerBlock({ content, business }: BannerBlockProps) {
  if (!content.text) return null;

  const textColor = contrastColor(business.accentColor);

  return (
    <section style={{ backgroundColor: business.accentColor }}>
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 text-center md:flex-row md:text-left">
        <p className="text-base font-semibold md:text-lg" style={{ color: textColor }}>{content.text}</p>
        {content.ctaText && content.ctaUrl && (
          <Link
            href={content.ctaUrl}
            className="flex-shrink-0 rounded-full border-2 px-6 py-2.5 text-sm font-semibold transition hover:opacity-80"
            style={{ borderColor: textColor, color: textColor }}
          >
            {content.ctaText}
          </Link>
        )}
      </div>
    </section>
  );
}
