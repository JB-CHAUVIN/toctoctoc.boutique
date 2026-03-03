import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const BASE_URL = "https://toctoctoc.boutique";

const LOYALTY_TYPES = [
  "boulangerie",
  "restaurant",
  "cafe",
  "salon-de-coiffure",
  "salon-de-beaute",
  "salle-de-sport",
  "fleuriste",
  "boulangerie-patisserie",
  "barbier",
  "spa",
  "pharmacie",
  "traiteur",
];

const REVIEWS_TYPES = [
  "restaurant",
  "boulangerie",
  "salon-de-coiffure",
  "cafe",
  "salon-de-beaute",
  "spa",
  "salle-de-sport",
  "barbier",
  "fleuriste",
  "traiteur",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Pages statiques
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${BASE_URL}/fonctionnalites/carte-de-fidelite`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE_URL}/fonctionnalites/avis-google`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE_URL}/fonctionnalites/site-vitrine`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
  ];

  // Pages dynamiques — fidélité par type
  const loyaltyTypePages: MetadataRoute.Sitemap = LOYALTY_TYPES.map((type) => ({
    url: `${BASE_URL}/fonctionnalites/carte-de-fidelite/${type}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  // Pages dynamiques — avis par type
  const reviewsTypePages: MetadataRoute.Sitemap = REVIEWS_TYPES.map((type) => ({
    url: `${BASE_URL}/fonctionnalites/avis-google/${type}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  // Pages business publiées
  let businessPages: MetadataRoute.Sitemap = [];
  try {
    const businesses = await prisma.business.findMany({
      where: { isPublished: true, deletedAt: null },
      select: { slug: true, updatedAt: true },
    });
    businessPages = businesses.map((b) => ({
      url: `${BASE_URL}/${b.slug}`,
      lastModified: b.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));
  } catch {
    // En cas d'erreur DB, on continue sans les pages business
  }

  return [...staticPages, ...loyaltyTypePages, ...reviewsTypePages, ...businessPages];
}
