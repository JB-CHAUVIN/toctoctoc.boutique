import type { ContactContent } from "./types";

interface ContactBlockProps {
  content: ContactContent;
  business: {
    name: string;
    address: string | null;
    city: string | null;
    zipCode: string | null;
    phone: string | null;
    email: string | null;
    website: string | null;
    googleMapsUrl: string | null;
    primaryColor: string;
  };
}

export function ContactBlock({ content, business }: ContactBlockProps) {
  const title = content.title || "Nous trouver";
  const showAddress = content.showAddress !== false;
  const showPhone = content.showPhone !== false;
  const showEmail = content.showEmail !== false;
  const showWebsite = content.showWebsite !== false;

  const hasAny =
    (showAddress && (business.address || business.city)) ||
    (showPhone && business.phone) ||
    (showEmail && business.email) ||
    (showWebsite && business.website);

  if (!hasAny) return null;

  return (
    <section className="mx-auto max-w-6xl px-6 py-20 md:py-28">
      <div className="grid gap-12 md:grid-cols-[1fr_2fr] md:gap-20">
        <div>
          <span
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: business.primaryColor }}
          >
            {title}
          </span>
          <div className="mt-4 h-px w-12" style={{ backgroundColor: business.primaryColor }} />
        </div>

        <div className="grid gap-8 sm:grid-cols-2">
          {showAddress && (business.address || business.city) && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Adresse
              </p>
              <div className="mt-2 space-y-0.5 text-slate-700">
                {business.address && <p>{business.address}</p>}
                {business.city && (
                  <p>
                    {business.zipCode} {business.city}
                  </p>
                )}
                {business.googleMapsUrl && (
                  <a
                    href={business.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-block text-sm font-medium underline-offset-2 hover:underline"
                    style={{ color: business.primaryColor }}
                  >
                    Voir sur la carte →
                  </a>
                )}
              </div>
            </div>
          )}

          {showPhone && business.phone && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Téléphone
              </p>
              <a
                href={`tel:${business.phone}`}
                className="mt-2 block text-slate-700 hover:underline"
              >
                {business.phone}
              </a>
            </div>
          )}

          {showEmail && business.email && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Email
              </p>
              <a
                href={`mailto:${business.email}`}
                className="mt-2 block break-all text-slate-700 hover:underline"
              >
                {business.email}
              </a>
            </div>
          )}

          {showWebsite && business.website && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Site web
              </p>
              <a
                href={business.website}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 block break-all text-slate-700 hover:underline"
              >
                {business.website.replace(/^https?:\/\//, "")}
              </a>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
