import { notFound, redirect } from "next/navigation";
import { headers } from "next/headers";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { SiteNav } from "@/components/site/site-nav";
import { FreeDemoBadge } from "@/components/site/free-demo-badge";
import type { Metadata } from "next";
import Link from "next/link";

async function getBusiness(slug: string) {
  return prisma.business.findUnique({
    where: { slug, isPublished: true },
    include: {
      modules: true,
      user: { include: { subscription: true } },
    },
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
  if (!business) {
    // Fallback: params.slug might be a businessId (CUID) from a printed QR code
    const byId = await prisma.business.findUnique({
      where: { id: params.slug },
      select: { slug: true },
    });
    if (byId) {
      const pathname = headers().get("x-pathname") ?? `/${params.slug}`;
      redirect(pathname.replace(`/${params.slug}`, `/${byId.slug}`));
    }
    notFound();
  }

  const isFree = !business.user.subscription || business.user.subscription.plan === "FREE";

  return (
    <div style={{ fontFamily: business.fontFamily }}>
      <SiteNav business={business} />
      {isFree && <FreeDemoBadge />}
      <main>{children}</main>

      {/* Footer */}
      <footer
        className="mt-16 border-t py-8 text-center text-sm"
        style={{ borderColor: business.primaryColor + "20", color: "#94a3b8" }}
      >
        <span className="inline-flex items-center gap-1.5">
          © {new Date().getFullYear()} {business.name}. Propulsé par
          <Image src="/logo.png" alt="" width={14} height={14} className="inline rounded-sm opacity-70" />
          <Link href={"https://toctoctoc.boutique"} title={"Visiter TocTocToc.boutique"}>TocTocToc.boutique</Link>.
        </span>
      </footer>
    </div>
  );
}
