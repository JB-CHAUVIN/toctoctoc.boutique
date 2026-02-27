import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SiteNav } from "@/components/site/site-nav";
import type { Metadata } from "next";

async function getBusiness(slug: string) {
  return prisma.business.findUnique({
    where: { slug, isPublished: true },
    include: { modules: true },
  });
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const business = await getBusiness(params.slug);
  if (!business) return { title: "Page introuvable" };

  return {
    title: { default: business.name, template: `%s | ${business.name}` },
    description: business.shortDesc || business.description || `${business.name} — ${business.businessType || "Commerce local"}`,
    openGraph: {
      title: business.name,
      description: business.shortDesc ?? undefined,
      images: business.coverUrl ? [{ url: business.coverUrl }] : undefined,
    },
  };
}

export default async function SiteLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { slug: string };
}) {
  const business = await getBusiness(params.slug);
  if (!business) notFound();

  return (
    <div style={{ fontFamily: business.fontFamily }}>
      <SiteNav business={business} />
      <main>{children}</main>

      {/* Footer */}
      <footer
        className="mt-16 border-t py-8 text-center text-sm"
        style={{ borderColor: business.primaryColor + "20", color: "#94a3b8" }}
      >
        <p>© {new Date().getFullYear()} {business.name}. Propulsé par toctoctoc.boutique.</p>
      </footer>
    </div>
  );
}
