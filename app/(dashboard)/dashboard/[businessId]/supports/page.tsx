import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PrintableCards } from "@/components/dashboard/printable-cards";
import { PremiumPrintSection } from "@/components/dashboard/premium-print-section";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:2203";

export async function generateMetadata({ params }: { params: { businessId: string } }) {
  const session = await auth();
  if (!session?.user?.id) return {};
  const business = await prisma.business.findFirst({
    where: { id: params.businessId },
    select: { name: true },
  });
  return { title: business ? `Supports terrain — ${business.name}` : "Supports terrain" };
}

export default async function SupportsPage({ params }: { params: { businessId: string } }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const dbUser = await prisma.user.findUnique({ where: { id: session.user.id }, select: { role: true } });
  const isAdmin = dbUser?.role === "ADMIN";

  const business = await prisma.business.findFirst({
    where: isAdmin
      ? { id: params.businessId }
      : { id: params.businessId, userId: session.user.id },
    include: { modules: true },
  });

  if (!business) notFound();

  const activeModules = business.modules.filter((m) => m.isActive);
  const hasReviews = activeModules.some((m) => m.module === "REVIEWS");
  const hasLoyalty = activeModules.some((m) => m.module === "LOYALTY");

  return (
    <div className="p-4 sm:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Supports terrain</h1>
        <p className="mt-1 text-sm text-slate-500">
          Tous vos supports QR code pour votre commerce : gratuits à imprimer ou premium à commander.
        </p>
      </div>

      {/* Supports gratuits */}
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Supports gratuits</h2>
          <p className="text-sm text-slate-500">Téléchargez en PNG ou imprimez directement à taille réelle</p>
        </div>
      </div>

      <PrintableCards
        businessName={business.name}
        businessId={params.businessId}
        primaryColor={business.primaryColor}
        secondaryColor={business.secondaryColor}
        accentColor={business.accentColor}
        logoUrl={business.logoUrl}
        logoBackground={business.logoBackground}
        appUrl={APP_URL}
        hasReviews={hasReviews}
        hasLoyalty={hasLoyalty}
        brandStyle={business.brandStyle as Record<string, string> | null}
      />

      {/* Séparateur */}
      <div className="my-8 border-t border-slate-200" />

      {/* Supports premium */}
      <PremiumPrintSection
        businessId={params.businessId}
        businessName={business.name}
        businessAddress={business.address}
        businessCity={business.city}
        businessZipCode={business.zipCode}
        businessPhone={business.phone}
        businessEmail={business.email}
      />
    </div>
  );
}
