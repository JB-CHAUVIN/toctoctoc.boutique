import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { RewardValidator } from "@/components/reviews/reward-validator";
import { ArrowLeft, Gift } from "lucide-react";

export const metadata = { title: "Valider un lot" };

export default async function RewardValidatePage({ params }: { params: { businessId: string } }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const dbUser = await prisma.user.findUnique({ where: { id: session.user.id }, select: { role: true } });
  const isAdmin = dbUser?.role === "ADMIN";

  const business = await prisma.business.findFirst({
    where: isAdmin ? { id: params.businessId } : { id: params.businessId, userId: session.user.id },
    include: { modules: true },
  });

  if (!business) notFound();

  const reviewModule = business.modules.find((m) => m.module === "REVIEWS");
  if (!reviewModule?.isActive) {
    redirect(`/dashboard/${params.businessId}/modules`);
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="sticky top-0 z-10 border-b border-slate-200 bg-white px-4 py-3">
        <div className="flex items-center gap-3">
          <Link
            href={`/dashboard/${params.businessId}/reviews`}
            className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-amber-500" />
            <div>
              <h1 className="text-base font-bold leading-tight text-slate-900">Valider un lot</h1>
              <p className="text-xs text-slate-400">{business.name}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-md p-4 pt-6">
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <RewardValidator businessId={params.businessId} />
        </div>
      </div>
    </div>
  );
}
