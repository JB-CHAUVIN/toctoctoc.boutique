import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { MODULES_INFO, LAUNCH_PROMO } from "@/lib/constants";
import { ClaimForm } from "./claim-form";

const CLAIM_FEATURES = (["REVIEWS", "LOYALTY", "BOOKING", "SHOWCASE"] as const).map((key) => ({
  emoji: MODULES_INFO[key].emoji,
  name: MODULES_INFO[key].name,
  description: MODULES_INFO[key].description,
}));

const TRUST_BADGES = [
  "Gratuit, sans engagement",
  "Prêt en 2 minutes",
  "Aucune compétence technique",
];

export async function generateMetadata({ params }: { params: { token: string } }) {
  const business = await prisma.business.findUnique({
    where: { claimToken: params.token },
    select: { name: true },
  });
  if (!business) return {};
  return { title: `Activez ${business.name} — TocTocToc.boutique` };
}

export default async function ClaimPage({ params }: { params: { token: string } }) {
  const business = await prisma.business.findUnique({
    where: { claimToken: params.token },
    select: {
      id: true,
      name: true,
      businessType: true,
      city: true,
      claimedAt: true,
      promoCode: true,
    },
  });

  if (!business) notFound();

  // Fire-and-forget: log page view
  prisma.log.create({
    data: {
      action: "claim.page_viewed",
      meta: { businessId: business.id, businessName: business.name, token: params.token },
    },
  }).catch(() => {});

  if (business.claimedAt) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-indigo-50 via-white to-slate-50 p-4">
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
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-slate-50">
      <div className="mx-auto max-w-lg px-4 py-8 sm:py-12">
        {/* Logo */}
        <div className="mb-8 text-center">
          <p className="text-sm font-semibold text-indigo-600 tracking-wide">
            TocTocToc.boutique
          </p>
        </div>

        {/* Business identity */}
        <div className="mb-6 text-center">
          <div className="mb-3 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600 text-2xl font-bold text-white shadow-lg">
            {business.name[0].toUpperCase()}
          </div>
          <h2 className="text-lg font-semibold text-slate-900">
            {business.name}
          </h2>
          <p className="text-sm text-slate-500">
            {[business.businessType, business.city].filter(Boolean).join(" · ")}
          </p>
        </div>

        {/* Hero text */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            Votre espace digital est prêt
          </h1>
          <p className="mt-2 text-slate-500">
            Activez-le en 2 minutes, c{"'"}est gratuit.
          </p>
        </div>

        {/* Feature cards — 2x2 grid */}
        <div className="mb-8 grid grid-cols-2 gap-3">
          {CLAIM_FEATURES.map((feature) => (
            <div
              key={feature.name}
              className="rounded-xl border border-slate-100 bg-white p-4 text-center transition hover:shadow-md"
            >
              <div className="mb-2 text-3xl">{feature.emoji}</div>
              <p className="text-sm font-semibold text-slate-900">
                {feature.name}
              </p>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Promo banner */}
        {business.promoCode && (
          <div className="mb-6 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 p-4 text-center text-white shadow-md">
            <div className="text-sm font-semibold">
              <span>
                {LAUNCH_PROMO.discount} code de bienvenue rien que pour vous !
              </span>
              <div className="rounded bg-white/20 px-2 py-0.5 font-mono font-bold mt-2">
                {business.promoCode}
              </div>
            </div>
          </div>
        )}

        {/* Trust badges */}
        <div className="mb-8 flex flex-col items-center gap-2 sm:flex-row sm:justify-center sm:gap-6">
          {TRUST_BADGES.map((badge) => (
            <div
              key={badge}
              className="flex items-center gap-1.5 text-sm text-slate-600"
            >
              <svg
                className="h-4 w-4 flex-shrink-0 text-emerald-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              {badge}
            </div>
          ))}
        </div>

        {/* Claim form card */}
        <div className="rounded-2xl bg-white p-6 shadow-lg sm:p-8">
          <h3 className="mb-5 text-center text-lg font-bold text-slate-900">
            Créez votre compte
          </h3>
          <ClaimForm token={params.token} businessName={business.name} />
        </div>

        {/* Login link */}
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
