import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import dynamic from "next/dynamic";

const ProspectMap = dynamic(
  () => import("@/components/dashboard/prospection/prospect-map").then((m) => m.ProspectMap),
  { ssr: false, loading: () => <div className="flex h-full items-center justify-center text-slate-400">Chargement de la carte…</div> }
);

export const metadata = { title: "Prospection — TocTocToc.boutique" };

export default async function ProspectionPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (dbUser?.role !== "ADMIN") redirect("/dashboard");

  const streetsData = await prisma.prospectStreet.findMany({
    include: {
      leads: {
        select: {
          id: true,
          name: true,
          address: true,
          businessType: true,
          rating: true,
          reviewCount: true,
          status: true,
          lat: true,
          lng: true,
          googleMapsUrl: true,
          phone: true,
          website: true,
          businessId: true,
          notes: true,
          osmId: true,
          contactedAt: true,
          createdAt: true,
        },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { searchedAt: "desc" },
  });

  return (
    <div className="flex h-full flex-col">
      <ProspectMap initialStreets={JSON.parse(JSON.stringify(streetsData))} />
    </div>
  );
}
