import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PrintableCards } from "@/components/dashboard/printable-cards";

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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Supports terrain</h1>
        <p className="mt-1 text-sm text-slate-500">
          Cartes à imprimer et poser en caisse. Téléchargez en PNG haute résolution ou imprimez directement à taille réelle.
        </p>
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
      />
    </div>
  );
}
