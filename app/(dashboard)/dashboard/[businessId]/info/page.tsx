import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BusinessInfoEdit } from "@/components/dashboard/business-info-edit";

export async function generateMetadata({ params }: { params: { businessId: string } }) {
  const session = await auth();
  if (!session?.user?.id) return {};
  const business = await prisma.business.findFirst({
    where: { id: params.businessId },
    select: { name: true },
  });
  return { title: business ? `Informations — ${business.name}` : "Informations" };
}

export default async function BusinessInfoPage({ params }: { params: { businessId: string } }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const dbUser = await prisma.user.findUnique({ where: { id: session.user.id }, select: { role: true } });
  const isAdmin = dbUser?.role === "ADMIN";

  const business = await prisma.business.findFirst({
    where: isAdmin
      ? { id: params.businessId }
      : { id: params.businessId, userId: session.user.id },
    select: {
      name: true,
      slug: true,
      businessType: true,
      shortDesc: true,
      description: true,
      address: true,
      city: true,
      zipCode: true,
      phone: true,
      email: true,
      website: true,
      logoUrl: true,
      logoBackground: true,
      primaryColor: true,
      secondaryColor: true,
      accentColor: true,
      fontFamily: true,
      facebookUrl: true,
      instagramUrl: true,
      googleMapsUrl: true,
      isPublished: true,
    },
  });

  if (!business) notFound();

  return (
    <div className="p-4 sm:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Informations</h1>
        <p className="mt-1 text-sm text-slate-500">
          Gérez les informations, le branding et la visibilité de votre établissement
        </p>
      </div>

      <div className="max-w-3xl">
        <BusinessInfoEdit businessId={params.businessId} initialData={business} />
      </div>
    </div>
  );
}
