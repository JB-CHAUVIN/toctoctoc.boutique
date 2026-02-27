import Link from "next/link";
import type { LoyaltyCtaContent } from "./types";

interface LoyaltyCtaBlockProps {
  content: LoyaltyCtaContent;
  business: {
    slug: string;
    primaryColor: string;
    accentColor: string;
  };
  stampIcon?: string;
  rewardName?: string;
}

export function LoyaltyCtaBlock({ content, business, stampIcon = "⭐", rewardName }: LoyaltyCtaBlockProps) {
  const title = content.title || "Carte de fidélité";
  const subtitle =
    content.subtitle ||
    (rewardName
      ? `Cumulez des tampons et gagnez : ${rewardName}`
      : "Cumulez des tampons et gagnez des récompenses.");
  const ctaText = content.ctaText || "Obtenir ma carte";

  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <div
        className="relative overflow-hidden rounded-3xl p-10 md:p-14"
        style={{ backgroundColor: business.primaryColor + "0d" }}
      >
        <div className="flex flex-col items-start gap-8 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-5">
            <span className="text-5xl leading-none">{stampIcon}</span>
            <div>
              <h2 className="text-2xl font-black tracking-tight text-slate-900 md:text-3xl">
                {title}
              </h2>
              <p className="mt-2 max-w-md text-slate-500">{subtitle}</p>
            </div>
          </div>
          <Link
            href={`/${business.slug}/fidelite`}
            className="flex-shrink-0 rounded-full px-8 py-3.5 text-sm font-semibold text-white shadow transition hover:opacity-90 active:scale-[0.98]"
            style={{ backgroundColor: business.primaryColor }}
          >
            {ctaText}
          </Link>
        </div>
      </div>
    </section>
  );
}
