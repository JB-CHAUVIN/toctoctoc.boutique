import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BatchProspectClient } from "@/components/dashboard/batch-prospect-client";

export const metadata = { title: "Prospection en lot - TocTocToc.boutique" };

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:2203";

export default async function BatchProspectPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  if (dbUser?.role !== "ADMIN") redirect("/dashboard");

  const businesses = await prisma.business.findMany({
    where: { deletedAt: null, claimToken: { not: null } },
    select: {
      id: true,
      name: true,
      slug: true,
      businessType: true,
      address: true,
      city: true,
      zipCode: true,
      phone: true,
      email: true,
      primaryColor: true,
      secondaryColor: true,
      accentColor: true,
      logoUrl: true,
      logoBackground: true,
      claimToken: true,
      prospectedAt: true,
      brandStyle: true,
      modules: { select: { module: true, isActive: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <BatchProspectClient
      businesses={JSON.parse(JSON.stringify(businesses))}
      appUrl={APP_URL}
    />
  );
}
