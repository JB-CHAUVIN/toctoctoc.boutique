"use client";

import { Facebook, Instagram, Globe, MapPin } from "lucide-react";
import type { SocialContent } from "./types";

interface SocialBlockProps {
  content: SocialContent;
  business: {
    facebookUrl: string | null;
    instagramUrl: string | null;
    website: string | null;
    googleMapsUrl: string | null;
    primaryColor: string;
  };
}

export function SocialBlock({ content, business }: SocialBlockProps) {
  const show = {
    facebook: content.showFacebook !== false && !!business.facebookUrl,
    instagram: content.showInstagram !== false && !!business.instagramUrl,
    website: content.showWebsite !== false && !!business.website,
    maps: content.showGoogleMaps !== false && !!business.googleMapsUrl,
  };

  const links = [
    show.facebook && { href: business.facebookUrl!, label: "Facebook", Icon: Facebook },
    show.instagram && { href: business.instagramUrl!, label: "Instagram", Icon: Instagram },
    show.website && { href: business.website!, label: "Site web", Icon: Globe },
    show.maps && { href: business.googleMapsUrl!, label: "Google Maps", Icon: MapPin },
  ].filter(Boolean) as Array<{ href: string; label: string; Icon: React.ElementType }>;

  if (links.length === 0) return null;

  const title = content.title || "Suivez-nous";

  return (
    <section className="border-t border-slate-100 py-12">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col items-center gap-6 md:flex-row md:items-center md:justify-between">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            {title}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {links.map(({ href, label, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-full border border-slate-200 px-5 py-2 text-sm font-medium text-slate-600 transition hover:border-transparent hover:text-white"
                style={
                  {
                    "--hover-bg": business.primaryColor,
                  } as React.CSSProperties
                }
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLElement).style.backgroundColor = business.primaryColor)
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLElement).style.backgroundColor = "")
                }
              >
                <Icon className="h-4 w-4" />
                {label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
