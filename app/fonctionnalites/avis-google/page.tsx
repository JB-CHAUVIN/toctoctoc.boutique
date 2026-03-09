import Link from "next/link";
import { ArrowRight, CheckCircle, ChevronDown, QrCode, Star, Gift } from "lucide-react";
import type { Metadata } from "next";
import { REVIEWS_TYPES } from "@/lib/seo-data";
import { FeatureNav } from "@/components/landing/feature-nav";
import { FeatureFooter } from "@/components/landing/feature-footer";

export const metadata: Metadata = {
  title: "Boostez vos avis Google avec la gamification",
  description:
    "Collectez plus d'avis Google grâce à la gamification. QR code → avis Google → roulette de récompenses. Café offert, réductions, cadeaux. Pour restaurants, boulangeries, salons et plus.",
  keywords: [
    "avis google automatique",
    "roulette avis google",
    "plaque avis google qr code",
    "collecter avis google commerce",
    "gamification avis clients",
    "avis google restaurant",
  ],
  alternates: {
    canonical: "https://toctoctoc.boutique/fonctionnalites/avis-google",
  },
};

const steps = [
  {
    icon: QrCode,
    title: "Imprimez votre plaque QR code",
    desc: "Générez votre QR code depuis le tableau de bord et posez-le sur votre comptoir, vos tables ou à la caisse. Vos clients le scannent en partant.",
  },
  {
    icon: Star,
    title: "Vos clients laissent un avis",
    desc: "Le QR code redirige directement vers votre page Google Maps. En 10 secondes, votre client laisse son avis 5 étoiles.",
  },
  {
    icon: Gift,
    title: "La roulette récompense",
    desc: "Après son avis, votre client tente sa chance à la roulette. Café offert, réduction, cadeau mystère… Il repart avec une surprise et une raison de revenir.",
  },
];

const faqs = [
  {
    q: "Comment est détecté le fait qu'un client a bien laissé un avis ?",
    a: "Le client est redirigé vers Google Maps pour laisser son avis, puis revient sur la page de roulette. Le suivi se fait via un token unique par client — vous gardez un historique complet.",
  },
  {
    q: "Puis-je configurer plusieurs récompenses avec des probabilités différentes ?",
    a: "Oui. Vous configurez autant de récompenses que vous souhaitez, chacune avec sa propre probabilité. Café offert (30%), Réduction -10% (40%), Cadeau mystère (10%), Merci sans récompense (20%).",
  },
  {
    q: "Est-ce conforme aux conditions d'utilisation de Google ?",
    a: "Oui. Vous n'achetez pas de faux avis — vous incitez vos vrais clients à partager leur expérience. La récompense est offerte après l'avis, pas en échange d'un avis positif.",
  },
  {
    q: "Puis-je imprimer la plaque QR code avis Google ?",
    a: "Oui. Depuis votre tableau de bord, générez votre QR code imprimable en un clic. Format A5 ou autocollant. Posez-le sur votre comptoir, vos tables, ou sur l'emballage.",
  },
];

const serviceJsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Collecte d'avis Google avec gamification",
  provider: {
    "@type": "Organization",
    name: "TocTocToc.boutique",
    url: "https://toctoctoc.boutique",
  },
  description:
    "Système de collecte d'avis Google avec roulette de récompenses pour commerces locaux. QR code imprimable, suivi des avis, récompenses configurables.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "EUR",
    description: "Inclus dès le plan gratuit (3 avis) — illimité à partir de 9€/mois",
  },
};

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
  ],
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

const howToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "Comment collecter plus d'avis Google avec la gamification",
  description: "Mettez en place un QR code dans votre commerce pour collecter des avis Google automatiquement grâce à une roulette de récompenses.",
  totalTime: "PT5M",
  step: steps.map((s, i) => ({
    "@type": "HowToStep",
    position: i + 1,
    name: s.title,
    text: s.desc,
  })),
};

export default function AvisGooglePage() {
  return (
    <div className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }}
      />

      <FeatureNav />

      {/* Breadcrumb */}
      <div className="mx-auto max-w-6xl px-6 pt-4 text-sm text-slate-400">
        <Link href="/" className="hover:text-indigo-600">Accueil</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-700">Avis Google gamifiés</span>
      </div>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 py-20 text-center">
        <span className="mb-4 inline-block rounded-full bg-amber-50 px-4 py-1.5 text-sm font-medium text-amber-700">
          ⭐ Module Avis Google
        </span>
        <h1 className="mb-6 text-5xl font-bold leading-tight tracking-tight text-slate-900 md:text-6xl">
          Boostez vos avis Google
          <br />
          <span className="text-indigo-600">avec la gamification</span>
        </h1>
        <p className="mx-auto mb-10 max-w-2xl text-lg text-slate-500">
          QR code sur votre comptoir → votre client laisse un avis Google → il tente sa chance
          à la roulette de récompenses. Plus d&apos;avis 5 étoiles, plus de visibilité locale.
        </p>
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/register"
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-8 py-4 font-semibold text-white shadow-lg hover:bg-indigo-700"
          >
            Démarrer gratuitement <ArrowRight className="h-4 w-4" />
          </Link>
          <span className="text-sm text-slate-400">Inclus dans tous les plans</span>
        </div>
      </section>

      {/* Comment ça marche */}
      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="mb-12 text-center text-3xl font-bold text-slate-900">
            Comment ça marche
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            {steps.map((step, i) => (
              <div key={step.title} className="relative flex flex-col gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500 text-white">
                  <step.icon className="h-6 w-6" />
                </div>
                <span className="absolute -left-1 -top-2 text-6xl font-black text-slate-100 select-none">
                  {i + 1}
                </span>
                <h3 className="text-xl font-semibold text-slate-900">{step.title}</h3>
                <p className="leading-relaxed text-slate-500">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Avantages */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="mb-6 text-3xl font-bold text-slate-900">
                Tout ce qui fait exploser vos avis Google
              </h2>
              <ul className="space-y-4">
                {[
                  "QR code imprimable généré en 1 clic (format A5, autocollant)",
                  "Lien direct vers votre fiche Google Maps",
                  "Roulette de récompenses personnalisable (probabilités, cadeaux)",
                  "Code de récompense unique à valider en caisse",
                  "Historique de chaque avis collecté",
                  "Tableau de bord avec statistiques des récompenses",
                  "Token unique par client — anti-triche",
                  "Compatible mobile — vos clients scannent en 10 secondes",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-slate-600">
                    <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-500" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-3xl bg-gradient-to-br from-slate-950 to-blue-950 p-10 text-center">
              <div className="mb-4 flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="h-8 w-8 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <div className="mb-2 text-2xl font-black text-white">
                <span style={{ color: "#4285F4" }}>G</span>
                <span style={{ color: "#EA4335" }}>o</span>
                <span style={{ color: "#FBBC05" }}>o</span>
                <span style={{ color: "#4285F4" }}>g</span>
                <span style={{ color: "#34A853" }}>l</span>
                <span style={{ color: "#EA4335" }}>e</span>
                <span className="text-white"> Avis</span>
              </div>
              <div className="mt-6 rounded-2xl bg-amber-500 px-6 py-4">
                <div className="text-2xl">🎰</div>
                <div className="font-black text-white">Roulette de récompenses</div>
                <div className="text-sm text-amber-100">Café · Réduction · Cadeau</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pour qui */}
      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="mb-4 text-center text-3xl font-bold text-slate-900">
            Pour quel type de commerce ?
          </h2>
          <p className="mb-10 text-center text-slate-500">
            Découvrez comment la gamification des avis Google fonctionne pour votre secteur.
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
            {REVIEWS_TYPES.map((type) => (
              <Link
                key={type.slug}
                href={`/fonctionnalites/avis-google/${type.slug}`}
                className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 transition-shadow hover:shadow-md hover:border-amber-200"
              >
                <span className="text-2xl">{type.emoji}</span>
                <div>
                  <div className="text-sm font-semibold text-slate-900">{type.label}</div>
                  <div className="text-xs text-slate-400 leading-tight">{type.tagline}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing mini */}
      <section className="py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="mb-4 text-3xl font-bold text-slate-900">Inclus dans tous les plans</h2>
          <p className="mb-8 text-slate-500">
            Le module avis Google est disponible dès le plan gratuit.
            Passez au Starter pour un nombre d&apos;avis illimité.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 p-6 text-left">
              <div className="mb-3 font-bold text-slate-900">Gratuit — 0€/mois</div>
              <ul className="space-y-2 text-sm text-slate-500">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Module avis Google inclus
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Jusqu&apos;à 3 avis collectés
                </li>
              </ul>
            </div>
            <div className="rounded-2xl border border-indigo-500 bg-indigo-600 p-6 text-left text-white">
              <div className="mb-3 font-bold">Starter — 9€/mois</div>
              <ul className="space-y-2 text-sm text-indigo-100">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-indigo-300" />
                  Avis illimités
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-indigo-300" />
                  Fidélité + Réservations inclus
                </li>
              </ul>
            </div>
          </div>
          <Link
            href="/register"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-8 py-4 font-semibold text-white hover:bg-indigo-700"
          >
            Essai gratuit 14 jours <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="mb-10 text-center text-3xl font-bold text-slate-900">
            Questions fréquentes
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <details
                key={i}
                className="group rounded-2xl border border-slate-200 bg-white px-6 py-4"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between font-semibold text-slate-900 group-open:text-indigo-600 [&::-webkit-details-marker]:hidden">
                  {faq.q}
                  <ChevronDown className="ml-3 h-5 w-5 flex-shrink-0 text-slate-400 transition-transform group-open:rotate-180 group-open:text-indigo-500" />
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-slate-500">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-indigo-600 py-20 text-center">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="mb-4 text-3xl font-bold text-white">
            Prêt à booster vos avis Google ?
          </h2>
          <p className="mb-8 text-indigo-200">
            Votre QR code avis est prêt en 5 minutes. Vos premiers avis arrivent dès aujourd&apos;hui.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 font-semibold text-indigo-600 hover:bg-indigo-50"
          >
            Démarrer gratuitement <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <FeatureFooter />
    </div>
  );
}
