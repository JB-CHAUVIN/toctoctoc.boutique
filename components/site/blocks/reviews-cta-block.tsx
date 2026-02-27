import Link from "next/link";
import type { ReviewsCtaContent } from "./types";

interface ReviewsCtaBlockProps {
  content: ReviewsCtaContent;
  business: {
    slug: string;
    primaryColor: string;
    accentColor: string;
  };
}

export function ReviewsCtaBlock({ content, business }: ReviewsCtaBlockProps) {
  const title = content.title || "Votre avis compte";
  const subtitle =
    content.subtitle ||
    "Partagez votre expérience et tentez de gagner une surprise en retour.";
  const ctaText = content.ctaText || "Laisser un avis";

  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
        <div className="flex flex-col gap-8 p-10 md:flex-row md:items-center md:justify-between md:p-14">
          <div className="flex items-start gap-5">
            <div
              className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl text-2xl"
              style={{ backgroundColor: business.accentColor + "20" }}
            >
              ⭐
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight text-slate-900">
                {title}
              </h2>
              <p className="mt-2 max-w-md text-slate-500">{subtitle}</p>
            </div>
          </div>
          <Link
            href={`/${business.slug}/avis`}
            className="flex-shrink-0 rounded-full px-8 py-3.5 text-sm font-semibold text-white shadow transition hover:opacity-90 active:scale-[0.98]"
            style={{ backgroundColor: business.accentColor }}
          >
            {ctaText}
          </Link>
        </div>
      </div>
    </section>
  );
}
