import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { StampScanner } from "@/components/loyalty/stamp-scanner";
import { ArrowLeft, QrCode } from "lucide-react";

export const metadata = { title: "Scanner une carte fidélité" };

export default async function LoyaltyStampPage({
  params,
}: {
  params: { businessId: string };
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const business = await prisma.business.findFirst({
    where: { id: params.businessId, userId: session.user.id },
    include: { modules: true },
  });

  if (!business) notFound();

  const loyaltyModule = business.modules.find((m) => m.module === "LOYALTY");
  if (!loyaltyModule?.isActive) {
    redirect(`/dashboard/${params.businessId}/modules`);
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header mobile-friendly */}
      <div className="sticky top-0 z-10 border-b border-slate-200 bg-white px-4 py-3">
        <div className="flex items-center gap-3">
          <Link
            href={`/dashboard/${params.businessId}/loyalty`}
            className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-indigo-600" />
            <div>
              <h1 className="text-base font-bold text-slate-900 leading-tight">Scanner une carte</h1>
              <p className="text-xs text-slate-400">{business.name}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-md p-4 pt-6">
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <StampScanner businessId={params.businessId} />
        </div>
      </div>
    </div>
  );
}
