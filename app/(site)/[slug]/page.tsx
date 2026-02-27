import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { MapPin, Phone, Mail, Globe, Facebook, Instagram, Clock } from "lucide-react";
import type { ModuleType } from "@prisma/client";

async function getBusiness(slug: string) {
  return prisma.business.findUnique({
    where: { slug, isPublished: true },
    include: {
      modules: { where: { isActive: true } },
      bookingConfig: true,
    },
  });
}

const MODULE_CARDS = {
  BOOKING: { emoji: "📅", title: "Réserver", desc: "Prenez rendez-vous en ligne, 24h/24", href: (s: string) => `/${s}/booking` },
  REVIEWS: { emoji: "⭐", title: "Laisser un avis", desc: "Partagez votre expérience et gagnez une surprise", href: (s: string) => `/${s}/avis` },
  LOYALTY: { emoji: "🎯", title: "Ma carte fidélité", desc: "Cumulez des tampons et obtenez des récompenses", href: (s: string) => `/${s}/fidelite` },
} as Partial<Record<ModuleType, { emoji: string; title: string; desc: string; href: (s: string) => string }>>;

export default async function ShowcasePage({ params }: { params: { slug: string } }) {
  const business = await getBusiness(params.slug);
  if (!business) notFound();

  const activeModuleCards = business.modules
    .filter((m) => MODULE_CARDS[m.module as ModuleType])
    .map((m) => ({ ...MODULE_CARDS[m.module as ModuleType]!, module: m.module }));

  return (
    <div>
      {/* Hero */}
      <section
        className="relative flex min-h-[50vh] items-end"
        style={{
          background: business.coverUrl
            ? `url(${business.coverUrl}) center/cover`
            : `linear-gradient(135deg, ${business.primaryColor} 0%, ${business.secondaryColor} 100%)`,
        }}
      >
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-12">
          <span
            className="mb-3 inline-block rounded-full px-3 py-1 text-xs font-medium text-white"
            style={{ backgroundColor: business.accentColor }}
          >
            {business.businessType}
          </span>
          <h1 className="text-4xl font-bold text-white md:text-5xl">{business.name}</h1>
          {business.shortDesc && (
            <p className="mt-3 max-w-xl text-lg text-white/80">{business.shortDesc}</p>
          )}
          {activeModuleCards.find((m) => m.module === "BOOKING") && (
            <Link
              href={`/${business.slug}/booking`}
              className="mt-6 inline-flex items-center gap-2 rounded-xl px-6 py-3 font-semibold text-white shadow-lg transition hover:opacity-90"
              style={{ backgroundColor: business.accentColor }}
            >
              📅 Réserver maintenant
            </Link>
          )}
        </div>
      </section>

      {/* Modules cards */}
      {activeModuleCards.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 py-12">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {activeModuleCards.map((card) => (
              <Link
                key={card.module}
                href={card.href(business.slug)}
                className="group flex items-start gap-4 rounded-2xl border p-6 transition hover:shadow-md"
                style={{ borderColor: business.primaryColor + "30" }}
              >
                <span className="flex-shrink-0 text-3xl">{card.emoji}</span>
                <div>
                  <h3
                    className="font-semibold transition group-hover:underline"
                    style={{ color: business.primaryColor }}
                  >
                    {card.title}
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">{card.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* À propos */}
      {business.description && (
        <section className="py-12" style={{ backgroundColor: business.primaryColor + "08" }}>
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="mb-6 text-2xl font-bold" style={{ color: business.primaryColor }}>
              À propos
            </h2>
            <p className="max-w-3xl leading-relaxed text-slate-600">{business.description}</p>
          </div>
        </section>
      )}

      {/* Informations */}
      <section className="mx-auto max-w-6xl px-6 py-12">
        <h2 className="mb-6 text-2xl font-bold" style={{ color: business.primaryColor }}>
          Informations
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Adresse */}
          {(business.address || business.city) && (
            <div className="flex items-start gap-3">
              <div
                className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl"
                style={{ backgroundColor: business.primaryColor + "15" }}
              >
                <MapPin className="h-4 w-4" style={{ color: business.primaryColor }} />
              </div>
              <div>
                <div className="font-medium text-slate-800">Adresse</div>
                <div className="text-sm text-slate-500">
                  {business.address && <div>{business.address}</div>}
                  {business.city && <div>{business.zipCode} {business.city}</div>}
                </div>
              </div>
            </div>
          )}

          {/* Téléphone */}
          {business.phone && (
            <div className="flex items-start gap-3">
              <div
                className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl"
                style={{ backgroundColor: business.primaryColor + "15" }}
              >
                <Phone className="h-4 w-4" style={{ color: business.primaryColor }} />
              </div>
              <div>
                <div className="font-medium text-slate-800">Téléphone</div>
                <a href={`tel:${business.phone}`} className="text-sm text-slate-500 hover:underline">
                  {business.phone}
                </a>
              </div>
            </div>
          )}

          {/* Email */}
          {business.email && (
            <div className="flex items-start gap-3">
              <div
                className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl"
                style={{ backgroundColor: business.primaryColor + "15" }}
              >
                <Mail className="h-4 w-4" style={{ color: business.primaryColor }} />
              </div>
              <div>
                <div className="font-medium text-slate-800">Email</div>
                <a href={`mailto:${business.email}`} className="text-sm text-slate-500 hover:underline">
                  {business.email}
                </a>
              </div>
            </div>
          )}

          {/* Horaires */}
          {business.bookingConfig && (
            <div className="flex items-start gap-3">
              <div
                className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl"
                style={{ backgroundColor: business.primaryColor + "15" }}
              >
                <Clock className="h-4 w-4" style={{ color: business.primaryColor }} />
              </div>
              <div>
                <div className="font-medium text-slate-800">Horaires</div>
                <div className="text-sm text-slate-500">
                  {business.bookingConfig.openTime} – {business.bookingConfig.closeTime}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Réseaux sociaux */}
        {(business.facebookUrl || business.instagramUrl) && (
          <div className="mt-8 flex gap-3">
            {business.facebookUrl && (
              <a
                href={business.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition hover:bg-slate-50"
                style={{ borderColor: business.primaryColor + "40", color: business.primaryColor }}
              >
                <Facebook className="h-4 w-4" /> Facebook
              </a>
            )}
            {business.instagramUrl && (
              <a
                href={business.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition hover:bg-slate-50"
                style={{ borderColor: business.primaryColor + "40", color: business.primaryColor }}
              >
                <Instagram className="h-4 w-4" /> Instagram
              </a>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
