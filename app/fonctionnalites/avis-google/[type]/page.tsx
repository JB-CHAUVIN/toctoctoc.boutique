import Link from "next/link";
import { ArrowRight, CheckCircle, QrCode, Star, Gift } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { REVIEWS_TYPES, getReviewsTypeBySlug } from "@/lib/seo-data";

type Params = { type: string };

export async function generateStaticParams(): Promise<Params[]> {
  return REVIEWS_TYPES.map((t) => ({ type: t.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { type } = await params;
  const data = getReviewsTypeBySlug(type);
  if (!data) return {};

  const description = `${data.heroDesc} QR code, roulette de récompenses, sans application.`;

  return {
    title: data.h1,
    description,
    keywords: [
      `avis google ${data.label.toLowerCase()}`,
      `plaque avis google ${data.label.toLowerCase()}`,
      `qr code avis ${data.label.toLowerCase()}`,
      "gamification avis google",
      "roulette récompenses avis",
    ],
    alternates: {
      canonical: `https://toctoctoc.boutique/fonctionnalites/avis-google/${type}`,
    },
  };
}

export default async function ReviewsTypePage({ params }: { params: Promise<Params> }) {
  const { type } = await params;
  const data = getReviewsTypeBySlug(type);
  if (!data) notFound();

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil", item: "https://toctoctoc.boutique" },
      {
        "@type": "ListItem",
        position: 2,
        name: "Avis Google gamifiés",
        item: "https://toctoctoc.boutique/fonctionnalites/avis-google",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: data.label,
        item: `https://toctoctoc.boutique/fonctionnalites/avis-google/${type}`,
      },
    ],
  };

  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: `Avis Google gamifiés pour ${data.label}`,
    provider: {
      "@type": "Organization",
      name: "TocTocToc.boutique",
      url: "https://toctoctoc.boutique",
    },
    description: data.heroDesc,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "EUR",
    },
  };

  const faqItems = [
    {
      q: `Comment collecter plus d'avis Google pour mon ${data.label.toLowerCase()} ?`,
      a: `Avec TocTocToc.boutique, imprimez un QR code et posez-le sur votre comptoir. Vos clients scannent en partant, laissent leur avis sur Google en 10 secondes et tentent de gagner ${data.rewardExamples[0].toLowerCase()}. Simple, rapide, efficace.`,
    },
    {
      q: "La gamification améliore-t-elle vraiment le nombre d'avis ?",
      a: "Oui. La perspective d'une récompense (même modeste) multiplie le taux de conversion. Vos clients passent à l'action là où ils auraient procrastiné.",
    },
    {
      q: "Comment fonctionne la validation des récompenses ?",
      a: "Après la roulette, votre client reçoit un code unique à 6 chiffres. Il vous le présente pour obtenir sa récompense. Vous validez le code depuis votre dashboard.",
    },
    ...(data.faqExtra ? [data.faqExtra] : []),
  ];

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const otherTypes = REVIEWS_TYPES.filter((t) => t.slug !== type).slice(0, 5);

  return (
    <div className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-1.5">
            <span className="text-xl font-bold text-indigo-600">TocTocToc</span>
            <span className="text-xl font-bold text-slate-400">.boutique</span>
          </Link>
          <Link
            href="/register"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Essai gratuit
          </Link>
        </div>
      </nav>

      {/* Breadcrumb */}
      <div className="mx-auto max-w-6xl px-6 pt-4 text-sm text-slate-400">
        <Link href="/" className="hover:text-indigo-600">Accueil</Link>
        <span className="mx-2">/</span>
        <Link href="/fonctionnalites/avis-google" className="hover:text-indigo-600">
          Avis Google
        </Link>
        <span className="mx-2">/</span>
        <span className="text-slate-700">{data.label}</span>
      </div>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 py-20 text-center">
        <div className="mb-4 text-5xl">{data.emoji}</div>
        <span className="mb-4 inline-block rounded-full bg-amber-50 px-4 py-1.5 text-sm font-medium text-amber-700">
          {data.tagline}
        </span>
        <h1 className="mb-6 text-5xl font-bold leading-tight tracking-tight text-slate-900 md:text-5xl">
          {data.h1}
        </h1>
        <p className="mx-auto mb-10 max-w-2xl text-lg text-slate-500">{data.heroDesc}</p>
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/register"
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-8 py-4 font-semibold text-white shadow-lg hover:bg-indigo-700"
          >
            Créer mon QR code avis <ArrowRight className="h-4 w-4" />
          </Link>
          <span className="text-sm text-slate-400">Gratuit pour démarrer</span>
        </div>
      </section>

      {/* Exemples de récompenses */}
      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="mb-4 text-center text-3xl font-bold text-slate-900">
            Exemples de récompenses pour votre {data.label.toLowerCase()}
          </h2>
          <p className="mb-10 text-center text-slate-500">
            Vos clients laissent un avis et tentent leur chance à la roulette.
          </p>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            {data.rewardExamples.map((reward) => (
              <div
                key={reward}
                className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-5"
              >
                <Gift className="h-5 w-5 flex-shrink-0 text-amber-500" />
                <span className="font-medium text-slate-900">{reward}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comment ça marche */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="mb-12 text-center text-3xl font-bold text-slate-900">
            Mise en place en 3 étapes
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                icon: QrCode,
                title: "Imprimez votre plaque QR code",
                desc: `Configurez vos récompenses depuis le tableau de bord, générez votre QR code et posez-le bien en vue dans votre ${data.label.toLowerCase()}.`,
              },
              {
                icon: Star,
                title: "Vos clients laissent leur avis",
                desc: "Le scan redirige directement vers votre fiche Google Maps. En 10 secondes, votre client laisse son avis.",
              },
              {
                icon: Gift,
                title: "La roulette récompense",
                desc: `Après son avis, votre client tourne la roulette et peut gagner ${data.rewardExamples[0].toLowerCase()}. Il repart avec une bonne raison de revenir.`,
              },
            ].map((step, i) => (
              <div key={step.title} className="flex flex-col gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500 text-white">
                  <step.icon className="h-6 w-6" />
                </div>
                <div className="text-xs font-bold text-amber-600">ÉTAPE {i + 1}</div>
                <h3 className="text-xl font-semibold text-slate-900">{step.title}</h3>
                <p className="text-slate-500">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Avantages */}
      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="mb-8 text-center text-3xl font-bold text-slate-900">
            Tout ce qui fait la différence
          </h2>
          <ul className="mx-auto max-w-2xl space-y-4">
            {[
              "QR code imprimable en un clic depuis votre tableau de bord",
              "Lien direct vers votre fiche Google — zéro friction pour vos clients",
              "Roulette personnalisable : récompenses, probabilités, date d'expiration",
              "Code unique généré par avis — anti-abus",
              "Historique complet des avis collectés et des récompenses distribuées",
              "Compatible iOS et Android — aucune app à installer",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 text-slate-600">
                <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-500" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="mb-10 text-center text-3xl font-bold text-slate-900">
            Questions fréquentes
          </h2>
          <div className="space-y-4">
            {faqItems.map((faq, i) => (
              <details
                key={i}
                className="group rounded-2xl border border-slate-200 bg-white px-6 py-4"
              >
                <summary className="cursor-pointer list-none font-semibold text-slate-900 group-open:text-indigo-600">
                  {faq.q}
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-slate-500">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Autres types */}
      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="mb-8 text-center text-2xl font-bold text-slate-900">
            Avis Google pour d'autres types de commerces
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
            {otherTypes.map((t) => (
              <Link
                key={t.slug}
                href={`/fonctionnalites/avis-google/${t.slug}`}
                className="flex flex-col items-center gap-2 rounded-2xl border border-slate-200 bg-white p-4 text-center transition-shadow hover:shadow-md"
              >
                <span className="text-3xl">{t.emoji}</span>
                <span className="text-xs font-medium text-slate-700">{t.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-indigo-600 py-20 text-center">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="mb-4 text-3xl font-bold text-white">
            Commencez à collecter vos avis Google
          </h2>
          <p className="mb-8 text-indigo-200">
            Votre QR code est prêt en 5 minutes. Configuration simple, résultats immédiats.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 font-semibold text-indigo-600 hover:bg-indigo-50"
          >
            Démarrer gratuitement <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-8 text-center text-sm text-slate-400">
        <div className="flex justify-center gap-4">
          <Link href="/" className="hover:text-indigo-600">Accueil</Link>
          <Link href="/fonctionnalites/avis-google" className="hover:text-indigo-600">Avis Google</Link>
          <Link href="/fonctionnalites/carte-de-fidelite" className="hover:text-indigo-600">Fidélité</Link>
          <Link href="/fonctionnalites/site-vitrine" className="hover:text-indigo-600">Site vitrine</Link>
        </div>
      </footer>
    </div>
  );
}
