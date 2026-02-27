import type { AboutContent } from "./types";

interface AboutBlockProps {
  content: AboutContent;
  business: {
    description: string | null;
    primaryColor: string;
  };
}

export function AboutBlock({ content, business }: AboutBlockProps) {
  const title = content.title || "À propos";
  const text = content.text || business.description;
  if (!text) return null;

  return (
    <section className="mx-auto max-w-6xl px-6 py-20 md:py-28">
      <div className="grid gap-12 md:grid-cols-[1fr_2fr] md:gap-20">
        {/* Label column */}
        <div>
          <span
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: business.primaryColor }}
          >
            {title}
          </span>
          <div
            className="mt-4 h-px w-12"
            style={{ backgroundColor: business.primaryColor }}
          />
        </div>

        {/* Content column */}
        <div>
          {content.highlight && (
            <p className="mb-6 text-2xl font-semibold leading-snug text-slate-900 md:text-3xl">
              {content.highlight}
            </p>
          )}
          <p className="text-lg leading-relaxed text-slate-500">{text}</p>
        </div>
      </div>
    </section>
  );
}
