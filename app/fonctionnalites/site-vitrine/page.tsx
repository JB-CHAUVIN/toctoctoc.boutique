import Link from "next/link";
import { ArrowRight, CheckCircle, ChevronDown, Layout, Palette, Globe } from "lucide-react";
import type { Metadata } from "next";
import { FeatureNav } from "@/components/landing/feature-nav";
import { FeatureFooter } from "@/components/landing/feature-footer";

export const metadata: Metadata = {
  title: "Site vitrine pour commerce local — prêt en 5 minutes",
  description:
    "Créez votre site vitrine professionnel en 5 minutes. Blocs configurables (horaires, services, photos, contact), URL personnalisée, design aux couleurs de votre commerce. Sans coder.",
  keywords: [
    "site vitrine commerce local",
    "site web boulangerie restaurant",
    "créer site web commerce",
    "site vitrine sans code",
    "site internet commerce local",
    "page web commerce local",
  ],
  alternates: {
    canonical: "https://toctoctoc.boutique/fonctionnalites/site-vitrine",
  },
};

const blocks = [
  { emoji: "🦸", name: "Hero", desc: "Titre, slogan et bouton d'appel à l'action" },
  { emoji: "ℹ️", name: "À propos", desc: "Présentation de votre histoire et valeurs" },
  { emoji: "💼", name: "Services", desc: "Vos prestations avec prix et descriptions" },
  { emoji: "🕐", name: "Horaires", desc: "Horaires d'ouverture jour par jour" },
  { emoji: "📞", name: "Contact", desc: "Formulaire, adresse, téléphone, carte" },
  { emoji: "❓", name: "FAQ", desc: "Réponses à vos questions fréquentes" },
  { emoji: "📣", name: "Bannière", desc: "Message promo ou annonce temporaire" },
  { emoji: "📱", name: "Réseaux sociaux", desc: "Liens vers vos profils sociaux" },
  { emoji: "📅", name: "CTA Réservation", desc: "Bouton de prise de rendez-vous en ligne" },
  { emoji: "🎯", name: "CTA Fidélité", desc: "Bouton d'accès à la carte de fidélité" },
  { emoji: "⭐", name: "CTA Avis", desc: "Redirection vers votre page Google Avis" },
];

const steps = [
  {
    icon: Layout,
    title: "Activez vos blocs",
    desc: "Choisissez les sections à afficher : héro, services, horaires, contact, FAQ... Activez ou désactivez chaque bloc en un clic.",
  },
  {
    icon: Palette,
    title: "Personnalisez votre design",
    desc: "Uploadez votre logo, choisissez vos couleurs (primaire, secondaire, accent) et votre police. Votre site reflète instantanément votre identité.",
  },
  {
    icon: Globe,
    title: "Publiez en 1 clic",
    desc: "Votre site est disponible à l'URL toctoctoc.boutique/{votre-nom}. Partagez ce lien sur vos réseaux, vos cartes de visite, vos devantures.",
  },
];

const faqs = [
  {
    q: "Ai-je besoin de compétences techniques pour créer mon site vitrine ?",
    a: "Non. Tout se configure depuis une interface visuelle en quelques clics. Vous saisissez votre contenu (texte, horaires, services), choisissez vos couleurs et publiez. Aucune ligne de code.",
  },
  {
    q: "Puis-je avoir mon propre nom de domaine ?",
    a: "Votre site est disponible à toctoctoc.boutique/votre-commerce. La personnalisation de domaine est disponible sur le plan Enterprise.",
  },
  {
    q: "Mon site vitrine est-il optimisé pour les mobiles ?",
    a: "Oui. Tous les sites vitrine TocTocToc.boutique sont 100% responsive — ils s'affichent parfaitement sur smartphone, tablette et ordinateur.",
  },
  {
    q: "Puis-je modifier mon site après publication ?",
    a: "Oui, à tout moment. Modifiez vos horaires, vos prix, ajoutez une bannière promo, changez votre photo de couverture — les changements sont en ligne immédiatement.",
  },
];

const serviceJsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Site vitrine pour commerce local",
  provider: {
    "@type": "Organization",
    name: "TocTocToc.boutique",
    url: "https://toctoctoc.boutique",
  },
  description:
    "Création de site vitrine professionnel pour commerces locaux. Blocs configurables, design personnalisé, URL dédiée. Prêt en 5 minutes sans code.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "EUR",
    description: "Inclus dès le plan gratuit",
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
      name: "Site vitrine commerce local",
      item: "https://toctoctoc.boutique/fonctionnalites/site-vitrine",
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

export default function SiteVitrinePage() {
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

      <FeatureNav />

      {/* Breadcrumb */}
      <div className="mx-auto max-w-6xl px-6 pt-4 text-sm text-slate-400">
        <Link href="/" className="hover:text-indigo-600">Accueil</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-700">Site vitrine commerce local</span>
      </div>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 py-20 text-center">
        <span className="mb-4 inline-block rounded-full bg-emerald-50 px-4 py-1.5 text-sm font-medium text-emerald-700">
          🌐 Module Site Vitrine
        </span>
        <h1 className="mb-6 text-5xl font-bold leading-tight tracking-tight text-slate-900 md:text-6xl">
          Site vitrine pour commerce local
          <br />
          <span className="text-indigo-600">prêt en 5 minutes</span>
        </h1>
        <p className="mx-auto mb-10 max-w-2xl text-lg text-slate-500">
          Créez votre site web professionnel aux couleurs de votre enseigne, avec vos horaires,
          vos services et vos coordonnées — sans coder, sans designer.
        </p>
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/register"
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-8 py-4 font-semibold text-white shadow-lg hover:bg-indigo-700"
          >
            Créer mon site gratuitement <ArrowRight className="h-4 w-4" />
          </Link>
          <span className="text-sm text-slate-400">Inclus dans tous les plans</span>
        </div>
      </section>

      {/* Blocs disponibles */}
      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="mb-4 text-center text-3xl font-bold text-slate-900">
            11 blocs configurables à votre image
          </h2>
          <p className="mb-10 text-center text-slate-500">
            Activez les sections dont vous avez besoin, masquez les autres. Réorganisez par glisser-déposer.
          </p>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {blocks.map((block) => (
              <div
                key={block.name}
                className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4"
              >
                <span className="text-2xl">{block.emoji}</span>
                <div>
                  <div className="font-semibold text-slate-900">{block.name}</div>
                  <div className="text-xs text-slate-500">{block.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comment ça marche */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="mb-12 text-center text-3xl font-bold text-slate-900">
            3 étapes pour votre site vitrine
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            {steps.map((step, i) => (
              <div key={step.title} className="flex flex-col gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white">
                  <step.icon className="h-6 w-6" />
                </div>
                <div className="text-xs font-bold text-emerald-600">ÉTAPE {i + 1}</div>
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
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="mb-6 text-3xl font-bold text-slate-900">
                Un site professionnel sans les contraintes
              </h2>
              <ul className="space-y-4">
                {[
                  "URL dédiée : toctoctoc.boutique/votre-commerce",
                  "Design responsive — parfait sur mobile, tablette, ordinateur",
                  "Logo, image de couverture, couleurs personnalisables",
                  "5 polices disponibles : moderne, classique, élégante…",
                  "Horaires d'ouverture jour par jour, exceptions gérées",
                  "Formulaire de contact intégré",
                  "Intégration directe avec réservations, fidélité et avis",
                  "Mise en ligne immédiate — modifiable à tout moment",
                  "Indexé par Google pour votre référencement local",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-slate-600">
                    <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
              <div className="border-b border-slate-100 bg-slate-50 px-4 py-3 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-red-400" />
                  <div className="h-3 w-3 rounded-full bg-amber-400" />
                  <div className="h-3 w-3 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 rounded-md bg-slate-200 px-3 py-1 text-xs text-slate-500 text-center">
                  toctoctoc.boutique/votre-commerce
                </div>
              </div>
              <div className="p-6 space-y-3">
                <div className="h-32 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
                  Votre nom de commerce
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="h-12 rounded-lg bg-slate-100" />
                  <div className="h-12 rounded-lg bg-slate-100" />
                </div>
                <div className="h-8 rounded-lg bg-indigo-100" />
                <div className="space-y-1">
                  <div className="h-3 w-3/4 rounded bg-slate-100" />
                  <div className="h-3 w-1/2 rounded bg-slate-100" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing mini */}
      <section className="py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="mb-4 text-3xl font-bold text-slate-900">
            Inclus dans tous les plans
          </h2>
          <p className="mb-8 text-slate-500">
            Le site vitrine est disponible dès le plan gratuit.
            Enrichissez-le avec réservations, avis et fidélité en passant au Starter.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 p-6 text-left">
              <div className="mb-3 font-bold text-slate-900">Gratuit — 0€/mois</div>
              <ul className="space-y-2 text-sm text-slate-500">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Site vitrine inclus
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Tous les blocs disponibles
                </li>
              </ul>
            </div>
            <div className="rounded-2xl border border-indigo-500 bg-indigo-600 p-6 text-left text-white">
              <div className="mb-3 font-bold">Starter — 9€/mois</div>
              <ul className="space-y-2 text-sm text-indigo-100">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-indigo-300" />
                  Site vitrine + Réservations
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-indigo-300" />
                  Fidélité + Avis Google inclus
                </li>
              </ul>
            </div>
          </div>
          <Link
            href="/register"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-8 py-4 font-semibold text-white hover:bg-indigo-700"
          >
            Créer mon site gratuitement <ArrowRight className="h-4 w-4" />
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
            Votre site vitrine en 5 minutes, c&apos;est maintenant
          </h2>
          <p className="mb-8 text-indigo-200">
            Gratuit pour démarrer. Sans engagement. En ligne en moins de 5 minutes.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 font-semibold text-indigo-600 hover:bg-indigo-50"
          >
            Créer mon site gratuitement <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Liens vers autres fonctionnalités */}
      <section className="py-14">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <p className="mb-6 text-slate-500">Complétez votre présence digitale avec</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/fonctionnalites/carte-de-fidelite"
              className="flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-medium text-slate-700 hover:border-indigo-200 hover:text-indigo-600"
            >
              🎯 Carte de fidélité digitale
            </Link>
            <Link
              href="/fonctionnalites/avis-google"
              className="flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-medium text-slate-700 hover:border-indigo-200 hover:text-indigo-600"
            >
              ⭐ Avis Google gamifiés
            </Link>
          </div>
        </div>
      </section>

      <FeatureFooter />
    </div>
  );
}
