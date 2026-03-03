import Link from "next/link";
import { ArrowRight, CheckCircle, QrCode, Smartphone, Star, Trophy } from "lucide-react";
import type { Metadata } from "next";
import { LOYALTY_TYPES } from "@/lib/seo-data";

export const metadata: Metadata = {
  title: "Carte de fidélité digitale pour votre commerce",
  description:
    "Remplacez vos cartes papier par une carte de fidélité digitale avec QR code. Sans app, sans friction. Programme de tampons personnalisé pour boulangeries, restaurants, salons et plus.",
  keywords: [
    "carte de fidélité digitale",
    "programme fidélité QR code",
    "carte de tampon digitale",
    "fidélité sans application",
    "fidélisation client commerce local",
  ],
  alternates: {
    canonical: "https://toctoctoc.boutique/fonctionnalites/carte-de-fidelite",
  },
};

const steps = [
  {
    icon: QrCode,
    title: "Imprimez votre QR code",
    desc: "Depuis votre tableau de bord, générez et imprimez votre QR code en un clic. Posez-le sur votre comptoir ou sur vos tables.",
  },
  {
    icon: Smartphone,
    title: "Vos clients scannent",
    desc: "Un simple scan de smartphone et votre client obtient sa carte de fidélité instantanément — sans créer de compte, sans app à télécharger.",
  },
  {
    icon: Star,
    title: "Tamponnez en 1 clic",
    desc: "Depuis votre smartphone, scannez la carte de votre client. Le tampon apparaît en temps réel sur son écran. Historique complet disponible.",
  },
  {
    icon: Trophy,
    title: "Récompensez la fidélité",
    desc: "Quand votre client atteint son seuil de tampons, la récompense est débloquée. Statuts VIP Bronze, Silver, Gold pour vos meilleurs clients.",
  },
];

const faqs = [
  {
    q: "Mes clients ont-ils besoin de télécharger une application ?",
    a: "Non. Vos clients scannent simplement un QR code avec leur smartphone. Leur carte s'ouvre instantanément dans le navigateur — aucune app à installer, aucun compte à créer.",
  },
  {
    q: "Que se passe-t-il si un client perd son QR code ?",
    a: "Le client peut retrouver sa carte à tout moment en saisissant son email ou son numéro de téléphone. Aucune carte ne se perd.",
  },
  {
    q: "Puis-je configurer plusieurs types de récompenses ?",
    a: "Oui. Vous définissez les tampons requis et la récompense (café offert, réduction, produit…). Vous pouvez aussi configurer des statuts VIP avec des avantages par palier.",
  },
  {
    q: "Comment fonctionne le tamponnage depuis mon smartphone ?",
    a: "Depuis votre interface commerçant, appuyez sur 'Scanner'. Votre caméra s'ouvre, scannez le QR code du client — le tampon est ajouté instantanément et visible sur son téléphone.",
  },
];

const serviceJsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Carte de fidélité digitale",
  provider: {
    "@type": "Organization",
    name: "TocTocToc.boutique",
    url: "https://toctoctoc.boutique",
  },
  description:
    "Programme de fidélité digital avec QR code pour commerces locaux. Tampons numériques, statuts VIP, récompenses personnalisées.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "EUR",
    description: "Inclus dès le plan gratuit (3 cartes) — illimité à partir de 9€/mois",
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
      name: "Carte de fidélité digitale",
      item: "https://toctoctoc.boutique/fonctionnalites/carte-de-fidelite",
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

export default function CarteDeFidelitePage() {
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
        <span className="text-slate-700">Carte de fidélité digitale</span>
      </div>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 py-20 text-center">
        <span className="mb-4 inline-block rounded-full bg-indigo-50 px-4 py-1.5 text-sm font-medium text-indigo-700">
          🎯 Module Fidélité
        </span>
        <h1 className="mb-6 text-5xl font-bold leading-tight tracking-tight text-slate-900 md:text-6xl">
          Carte de fidélité digitale
          <br />
          <span className="text-indigo-600">pour votre commerce</span>
        </h1>
        <p className="mx-auto mb-10 max-w-2xl text-lg text-slate-500">
          Remplacez vos cartes papier par un programme de tampons digital avec QR code.
          Vos clients scannent, accumulent, et gagnent — sans aucune app à installer.
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
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, i) => (
              <div key={step.title} className="relative flex flex-col gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white">
                  <step.icon className="h-6 w-6" />
                </div>
                <span className="absolute -left-1 -top-2 text-6xl font-black text-slate-100 select-none">
                  {i + 1}
                </span>
                <h3 className="font-semibold text-slate-900">{step.title}</h3>
                <p className="text-sm leading-relaxed text-slate-500">{step.desc}</p>
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
                Tout ce qui fait une bonne carte de fidélité digitale
              </h2>
              <ul className="space-y-4">
                {[
                  "QR code et NFC compatibles — tous les smartphones",
                  "Tamponnage instantané visible côté client",
                  "Statuts VIP configurables (Bronze, Silver, Gold…)",
                  "Historique complet des tampons et récompenses",
                  "Carte retrouvable par email si le QR est perdu",
                  "Design personnalisé aux couleurs de votre enseigne",
                  "Tableau de bord commerçant pour suivre les cartes actives",
                  "Récompenses débloquées automatiquement au seuil atteint",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-slate-600">
                    <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-indigo-600" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-3xl bg-gradient-to-br from-indigo-950 to-indigo-800 p-10 text-center">
              <div className="mb-6 text-6xl">🎯</div>
              <div className="text-2xl font-black text-white">Programme de fidélité</div>
              <div className="mt-2 text-indigo-300">100% digital, zéro papier</div>
              <div className="mt-8 grid grid-cols-3 gap-4">
                {["⭐⭐⭐⭐⭐", "⭐⭐⭐⭐⭐", "⭐⭐⭐"].map((s, i) => (
                  <div key={i} className="rounded-xl bg-white/10 p-3 text-xs text-white">
                    {s}
                  </div>
                ))}
              </div>
              <div className="mt-4 text-sm text-indigo-300">
                Tampons · Statuts VIP · Récompenses
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
            La carte de fidélité digitale s'adapte à tous les commerces locaux.
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {LOYALTY_TYPES.map((type) => (
              <Link
                key={type.slug}
                href={`/fonctionnalites/carte-de-fidelite/${type.slug}`}
                className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 transition-shadow hover:shadow-md hover:border-indigo-200"
              >
                <span className="text-2xl">{type.emoji}</span>
                <div>
                  <div className="text-sm font-semibold text-slate-900">{type.label}</div>
                  <div className="text-xs text-slate-400">{type.tagline}</div>
                </div>
              </Link>
            ))}
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
            La carte de fidélité digitale est disponible dès le plan gratuit.
            Passez au Starter pour un nombre de cartes illimité.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 p-6 text-left">
              <div className="mb-3 font-bold text-slate-900">Gratuit — 0€/mois</div>
              <ul className="space-y-2 text-sm text-slate-500">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Module fidélité inclus
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Jusqu'à 3 cartes actives
                </li>
              </ul>
            </div>
            <div className="rounded-2xl border border-indigo-500 bg-indigo-600 p-6 text-left text-white">
              <div className="mb-3 font-bold">Starter — 9€/mois</div>
              <ul className="space-y-2 text-sm text-indigo-100">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-indigo-300" />
                  Cartes illimitées
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-indigo-300" />
                  Réservations + Avis Google inclus
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
                <summary className="cursor-pointer list-none font-semibold text-slate-900 group-open:text-indigo-600">
                  {faq.q}
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
            Prêt à lancer votre carte de fidélité digitale ?
          </h2>
          <p className="mb-8 text-indigo-200">
            Configuration en 5 minutes. Aucune compétence technique requise.
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
        <p>© {new Date().getFullYear()} TocTocToc.boutique.</p>
        <div className="mt-2 flex justify-center gap-4">
          <Link href="/" className="hover:text-indigo-600">Accueil</Link>
          <Link href="/fonctionnalites/avis-google" className="hover:text-indigo-600">Avis Google</Link>
          <Link href="/fonctionnalites/site-vitrine" className="hover:text-indigo-600">Site vitrine</Link>
          <Link href="/register" className="hover:text-indigo-600">Inscription</Link>
        </div>
      </footer>
    </div>
  );
}
