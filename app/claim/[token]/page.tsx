import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ClaimForm } from "./claim-form";

export async function generateMetadata({ params }: { params: { token: string } }) {
  const business = await prisma.business.findUnique({
    where: { claimToken: params.token },
    select: { name: true },
  });
  if (!business) return {};
  return { title: `Prendre possession de ${business.name} — TocTocToc.boutique` };
}

export default async function ClaimPage({ params }: { params: { token: string } }) {
  const business = await prisma.business.findUnique({
    where: { claimToken: params.token },
    select: { id: true, name: true, businessType: true, city: true, claimedAt: true },
  });

  if (!business) notFound();

  if (business.claimedAt) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg text-center">
          <div className="mb-4 text-4xl">✅</div>
          <h1 className="text-xl font-bold text-slate-900 mb-2">Espace déjà activé</h1>
          <p className="text-slate-500 text-sm">
            Ce lien a déjà été utilisé pour activer un compte. Si vous êtes le propriétaire,
            connectez-vous directement.
          </p>
          <a
            href="/login"
            className="mt-6 inline-flex items-center justify-center rounded-xl bg-indigo-600 px-6 py-3 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Se connecter
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-2xl font-bold text-white shadow-lg">
            {business.name[0].toUpperCase()}
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Activez votre espace</h1>
          <p className="mt-1 text-slate-500 text-sm">
            <span className="font-semibold text-slate-700">{business.name}</span>
            {business.businessType && ` · ${business.businessType}`}
            {business.city && ` · ${business.city}`}
          </p>
        </div>

        <div className="rounded-2xl bg-white p-8 shadow-lg">
          <div className="mb-6 rounded-xl bg-indigo-50 border border-indigo-100 p-4 text-sm text-indigo-700">
            <p className="font-semibold mb-1">Votre espace TocTocToc.boutique est prêt !</p>
            <p className="text-indigo-600">
              Créez votre compte pour en prendre possession. Vous aurez accès à votre tableau de bord,
              vos QR codes, et vos outils de fidélité.
            </p>
          </div>

          <ClaimForm token={params.token} businessName={business.name} />
        </div>

        <p className="mt-4 text-center text-xs text-slate-400">
          Vous avez déjà un compte ?{" "}
          <a href="/login" className="text-indigo-500 hover:underline">
            Se connecter
          </a>
        </p>
      </div>
    </div>
  );
}
