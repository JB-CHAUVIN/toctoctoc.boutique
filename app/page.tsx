import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CheckCircle, ChevronDown, Star } from "lucide-react";
import { LandingDemoSection } from "@/components/landing/demo-section";
import { HeroVideo } from "@/components/landing/hero-video";
import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: { canonical: "https://toctoctoc.boutique" },
};

/* ───────────────────────── DATA ───────────────────────── */

const steps = [
  {
    num: "1",
    title: "Posez le QR code",
    desc: "Placez le support fourni sur votre comptoir. Aucune installation technique.",
    emoji: "📲",
  },
  {
    num: "2",
    title: "Vos clients scannent",
    desc: "Ils laissent un avis Google, tentent de gagner un cadeau ou cumulent leurs points de fidélité.",
    emoji: "⭐",
  },
  {
    num: "3",
    title: "Votre commerce décolle",
    desc: "Votre note Google monte, vos clients reviennent plus souvent, votre chiffre d'affaires suit.",
    emoji: "🚀",
  },
];

const features = [
  {
    emoji: "⭐",
    title: "Avis Google + Roulette",
    desc: "Vos clients scannent un QR code, laissent un avis Google et tentent de gagner une récompense. Résultat : votre note monte, votre visibilité explose.",
    href: "/fonctionnalites/avis-google",
  },
  {
    emoji: "🎯",
    title: "Carte de fidélité digitale",
    desc: "Fini les cartons perdus. Vos clients cumulent leurs points sur leur téléphone, reviennent plus souvent et dépensent plus.",
    href: "/fonctionnalites/carte-de-fidelite",
  },
  {
    emoji: "📅",
    title: "Réservations en ligne",
    desc: "Plus de temps perdu au téléphone. Vos clients réservent en autonomie, vous gérez tout depuis votre smartphone.",
    href: null,
  },
  {
    emoji: "🌐",
    title: "Site vitrine personnalisé",
    desc: "Une page professionnelle aux couleurs de votre enseigne, visible sur Google, prête en 5 minutes.",
    href: "/fonctionnalites/site-vitrine",
  },
];

const stats = [
  { value: "×3", label: "plus d\u2019avis Google en moyenne" },
  { value: "30s", label: "pour laisser un avis" },
  { value: "0\u20AC", label: "pour démarrer" },
];

const testimonials = [
  {
    quote: "On est passés de 12 à 67 avis en 6 semaines. Les clients adorent la roulette, ils en parlent autour d\u2019eux.",
    name: "Sophie M.",
    role: "Salon de coiffure · Lyon",
  },
  {
    quote: "La carte de fidélité digitale a remplacé nos cartons. Mes clients la montrent avec fierté à la caisse.",
    name: "Marc D.",
    role: "Boulangerie · Bordeaux",
  },
  {
    quote: "En 5 minutes c\u2019était en ligne. Même moi qui suis nul en informatique, j\u2019ai tout compris.",
    name: "Ahmed K.",
    role: "Restaurant · Marseille",
  },
];

const commerceTypes = [
  { label: "Boulangerie", emoji: "🥐", slug: "boulangerie" },
  { label: "Restaurant", emoji: "🍽️", slug: "restaurant" },
  { label: "Café", emoji: "☕", slug: "cafe" },
  { label: "Salon de coiffure", emoji: "✂️", slug: "salon-de-coiffure" },
  { label: "Salon de beauté", emoji: "💅", slug: "salon-de-beaute" },
  { label: "Salle de sport", emoji: "💪", slug: "salle-de-sport" },
  { label: "Fleuriste", emoji: "🌸", slug: "fleuriste" },
  { label: "Barbier", emoji: "💈", slug: "barbier" },
  { label: "Spa", emoji: "🧖", slug: "spa" },
  { label: "Pharmacie", emoji: "💊", slug: "pharmacie" },
  { label: "Traiteur", emoji: "🥗", slug: "traiteur" },
  { label: "Épicerie", emoji: "🛒", slug: null },
];

const faqs = [
  {
    q: "Est-ce que ça marche vraiment pour avoir plus d\u2019avis Google ?",
    a: "Oui. Nos commerçants constatent en moyenne 3 à 5 fois plus d\u2019avis Google dans les 30 premiers jours. Le système de roulette de récompenses motive vos clients à laisser un avis — c\u2019est ludique et ça prend moins d\u2019une minute.",
  },
  {
    q: "Faut-il des compétences techniques pour utiliser TocTocToc.boutique ?",
    a: "Non, aucune. L'interface est conçue pour les commerçants, pas les développeurs. Vous configurez votre commerce en quelques clics et votre site est en ligne en moins de 5 minutes.",
  },
  {
    q: "Mes clients doivent-ils télécharger une application ?",
    a: "Non. Vos clients utilisent la carte de fidélité ou laissent un avis en scannant simplement un QR code avec leur smartphone. Aucune application à installer.",
  },
  {
    q: "Qu'est-ce que la roulette de récompenses pour les avis Google ?",
    a: "Après avoir laissé un avis sur Google, vos clients tentent leur chance à une roulette personnalisée. Café offert, réduction, cadeau mystère… Vous configurez les récompenses et leurs probabilités. Résultat : plus d'avis, plus engageants.",
  },
  {
    q: "Puis-je gérer plusieurs commerces ?",
    a: "Oui. Le plan Starter inclut 1 commerce. Le plan Pro (19\u20AC/mois) permet de gérer jusqu\u2019à 3 commerces depuis un seul compte. Le plan Enterprise offre un nombre illimité de commerces.",
  },
  {
    q: "Comment fonctionne la carte de fidélité digitale ?",
    a: "Chaque client obtient une carte avec un QR code unique. Pour tamponner, vous scannez son QR code depuis votre smartphone. Le tampon apparaît instantanément sur l\u2019écran du client. Quand il atteint le seuil, la récompense est débloquée automatiquement.",
  },
  {
    q: "Puis-je annuler à tout moment ?",
    a: "Oui, sans engagement. Vous pouvez résilier en un clic depuis votre espace. Votre abonnement reste actif jusqu\u2019à la fin de la période payée.",
  },
  {
    q: "TocTocToc.boutique fonctionne-t-il pour les chaînes de commerces ?",
    a: "Oui. Les franchiseurs et multi-sites utilisent le plan Pro ou Enterprise pour gérer l\u2019ensemble de leurs points de vente depuis une seule interface, avec un branding cohérent.",
  },
];

const plans = [
  {
    name: "Gratuit",
    price: "0€",
    originalPrice: null as string | null,
    desc: "Pour démarrer",
    features: ["1 commerce", "Site vitrine", "Avis Google (3 max)", "Fidélité (3 cartes)"],
    cta: "Commencer gratuitement",
    highlight: false,
    promoBadge: null as string | null,
  },
  {
    name: "Starter",
    price: "9€",
    originalPrice: "18€",
    desc: "/ mois",
    features: [
      "1 commerce",
      "Site vitrine",
      "Réservations",
      "Avis + Roulette illimités",
      "Fidélité illimitée",
    ],
    cta: "Essai gratuit 14 jours",
    highlight: true,
    promoBadge: "-50% à vie",
  },
  {
    name: "Pro",
    price: "19€",
    originalPrice: "38€",
    desc: "/ mois",
    features: [
      "3 commerces",
      "Site vitrine",
      "Réservations",
      "Avis + Roulette illimités",
      "Fidélité illimitée",
    ],
    cta: "Essai gratuit 14 jours",
    highlight: false,
    promoBadge: "-50% à vie",
  },
];

/* ───────────────────── JSON-LD (SEO) ───────────────────── */

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "TocTocToc.boutique",
  url: "https://toctoctoc.boutique",
  logo: "https://toctoctoc.boutique/logo.png",
  description:
    "Plateforme SaaS pour digitaliser les commerces locaux : site vitrine, réservations, avis Google gamifiés, carte de fidélité digitale.",
  foundingLocation: { "@type": "Place", addressCountry: "FR" },
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer support",
    availableLanguage: "French",
    url: "https://toctoctoc.boutique/contact",
  },
};

const softwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "TocTocToc.boutique",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  offers: {
    "@type": "AggregateOffer",
    lowPrice: "0",
    highPrice: "99",
    priceCurrency: "EUR",
  },
  description:
    "Plateforme SaaS tout-en-un pour digitaliser les commerces locaux en 5 minutes : site vitrine, réservations en ligne, avis Google gamifiés, carte de fidélité digitale.",
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.q,
    acceptedAnswer: { "@type": "Answer", text: faq.a },
  })),
};

/* ─────────────────── HELPER COMPONENTS ─────────────────── */

function Stars({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <span className="inline-flex gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={i < rating ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200"}
          style={{ width: size, height: size }}
        />
      ))}
    </span>
  );
}

function GoogleMock({
  name,
  rating,
  reviews,
  variant,
}: {
  name: string;
  rating: number;
  reviews: number;
  variant: "before" | "after";
}) {
  const isBefore = variant === "before";
  return (
    <div className={`rounded-xl border bg-white p-4 shadow-sm ${isBefore ? "border-slate-200" : "border-emerald-200 ring-2 ring-emerald-100"}`}>
      <div className="mb-1 font-semibold text-slate-900">{name}</div>
      <div className="mb-1 flex items-center gap-2">
        <span className="text-lg font-bold text-slate-900">{rating.toFixed(1)}</span>
        <Stars rating={Math.round(rating)} size={16} />
        <span className="text-sm text-slate-500">({reviews} avis)</span>
      </div>
      <div className="text-xs text-slate-500">
        Commerce local · <span className="font-medium text-emerald-600">Ouvert</span>
      </div>
    </div>
  );
}

/* ──────────────────────── PAGE ──────────────────────── */

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* ── Nav ── */}
      <nav className="sticky top-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="TocTocToc.boutique" width={32} height={32} priority />
            <span className="font-brand hidden text-xl font-bold text-indigo-600 sm:inline">
              TocTocToc.boutique
            </span>
          </Link>
          <div className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
            <a href="#fonctionnalites" className="hover:text-indigo-600">Fonctionnalités</a>
            <a href="#demo" className="hover:text-indigo-600">Démo</a>
            <a href="#tarifs" className="hover:text-indigo-600">Tarifs</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-slate-600 hover:text-slate-900">
              Connexion
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              <span className="hidden sm:inline">Démarrer gratuitement</span>
              <span className="sm:hidden">Démarrer</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative flex h-[calc(100vh-65px)] items-center justify-center overflow-hidden">
        <HeroVideo />
        <div className="absolute inset-0 z-[1] bg-gradient-to-b from-white/80 via-white/50 to-white/80" />
        <div className="relative z-10 px-6 text-center">
          <span className="mb-3 inline-block rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-1.5 text-xs font-bold text-white shadow-md sm:text-sm">
            Offre de lancement : -50% à vie
          </span>
          <h1 className="mb-3 text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:mb-4 sm:text-4xl md:mb-6 md:text-5xl lg:text-6xl">
            Remplissez votre commerce
            <br />
            <span className="text-indigo-600">grâce à vos clients satisfaits</span>
          </h1>
          <p className="mx-auto mb-4 max-w-2xl text-sm text-slate-600 sm:mb-6 sm:text-base md:mb-8 md:text-lg">
            Vos clients laissent un avis Google en 30 secondes, votre note monte, votre visibilité explose.
            <br className="hidden sm:block" />
            Carte de fidélité digitale et réservations en ligne incluses.
          </p>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-4">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-105 hover:bg-indigo-700 sm:px-8 sm:py-4 sm:text-base"
            >
              Essayer gratuitement <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#demo"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white/80 px-6 py-3 text-sm font-semibold text-slate-700 backdrop-blur-sm transition hover:border-indigo-300 hover:text-indigo-600 sm:px-8 sm:py-4 sm:text-base"
            >
              Voir la démo <ChevronDown className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      {/* ── Comment ça marche ── */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="mb-4 text-center text-3xl font-bold text-slate-900">
            Comment ça marche ?
          </h2>
          <p className="mb-12 text-center text-slate-500">
            3 étapes, 5 minutes, zéro compétence technique.
          </p>
          <div className="grid gap-8 md:grid-cols-3">
            {steps.map((s) => (
              <div key={s.num} className="relative text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-3xl">
                  {s.emoji}
                </div>
                <div className="mb-1 inline-block rounded-full bg-indigo-600 px-2.5 py-0.5 text-xs font-bold text-white">
                  Étape {s.num}
                </div>
                <h3 className="mb-2 mt-2 text-lg font-bold text-slate-900">{s.title}</h3>
                <p className="text-sm leading-relaxed text-slate-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Avant / Après Google ── */}
      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="mb-4 text-center text-3xl font-bold text-slate-900">
            Votre fiche Google avant / après
          </h2>
          <p className="mb-10 text-center text-slate-500">
            Voici ce que vivent nos commerçants dans les premières semaines.
          </p>
          <div className="flex flex-col items-center gap-4 md:flex-row md:gap-6">
            <div className="w-full flex-1">
              <div className="mb-2 text-center text-sm font-bold uppercase tracking-wide text-slate-400">
                Aujourd&apos;hui
              </div>
              <GoogleMock name="Votre commerce" rating={3.2} reviews={12} variant="before" />
              <p className="mt-2 text-center text-xs text-slate-400">
                Peu d&apos;avis, peu de visibilité
              </p>
            </div>
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xl font-bold text-indigo-600">
              →
            </div>
            <div className="w-full flex-1">
              <div className="mb-2 text-center text-sm font-bold uppercase tracking-wide text-emerald-600">
                Avec TocTocToc
              </div>
              <GoogleMock name="Votre commerce" rating={4.8} reviews={142} variant="after" />
              <p className="mt-2 text-center text-xs font-medium text-emerald-600">
                Vous dominez la recherche locale
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Fonctionnalités ── */}
      <section id="fonctionnalites" className="scroll-mt-20 bg-white py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="mb-4 text-center text-3xl font-bold text-slate-900">
            Tout ce qu&apos;il faut pour développer votre commerce
          </h2>
          <p className="mb-12 text-center text-slate-500">
            Adapté à tous les commerces : restaurants, salons de coiffure, boulangeries, spas, pharmacies…
          </p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => {
              const card = (
                <div
                  className={`h-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md ${f.href ? "cursor-pointer" : ""}`}
                >
                  <div className="mb-3 text-3xl">{f.emoji}</div>
                  <h3 className="mb-2 font-semibold text-slate-900">{f.title}</h3>
                  <p className="text-sm leading-relaxed text-slate-500">{f.desc}</p>
                  {f.href && (
                    <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-indigo-600">
                      En savoir plus <ArrowRight className="h-3 w-3" />
                    </span>
                  )}
                </div>
              );
              return f.href ? (
                <Link key={f.title} href={f.href}>
                  {card}
                </Link>
              ) : (
                <div key={f.title}>{card}</div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Demo interactive ── */}
      <div id="demo" className="scroll-mt-20">
        <LandingDemoSection />
      </div>

      {/* ── Chiffres clés ── */}
      <section className="bg-indigo-600 py-14">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-3 gap-8 text-center">
            {stats.map((s) => (
              <div key={s.label}>
                <div className="text-4xl font-black text-white md:text-5xl">{s.value}</div>
                <div className="mt-1 text-sm font-medium text-indigo-200">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Témoignages ── */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="mb-12 text-center text-3xl font-bold text-slate-900">
            Ils ont boosté leur commerce
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <blockquote
                key={t.name}
                className="flex flex-col rounded-2xl border border-slate-200 bg-slate-50 p-6"
              >
                <Stars rating={5} size={16} />
                <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-700">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <footer className="mt-4 border-t border-slate-200 pt-3">
                  <div className="text-sm font-semibold text-slate-900">{t.name}</div>
                  <div className="text-xs text-slate-500">{t.role}</div>
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="tarifs" className="scroll-mt-20 bg-slate-50 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="mb-4 text-center text-3xl font-bold text-slate-900">
            Tarifs simples, sans surprise
          </h2>
          <p className="mb-3 text-center text-slate-500">
            Sans engagement · Résiliable à tout moment · 3 à 8× moins cher que la concurrence
          </p>
          <div className="mx-auto mb-10 w-fit rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-2 text-center text-sm font-bold text-white shadow-md">
            Offre de lancement : -50% à vie pour les premiers inscrits
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl border p-8 ${
                  plan.highlight
                    ? "border-indigo-500 bg-indigo-600 text-white shadow-xl"
                    : "border-slate-200 bg-white"
                }`}
              >
                {plan.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-amber-400 px-3 py-1 text-xs font-bold text-amber-900">
                    Le plus populaire
                  </span>
                )}
                {plan.promoBadge && !plan.highlight && (
                  <span className="absolute -top-3 right-4 rounded-full bg-orange-500 px-2.5 py-0.5 text-xs font-bold text-white">
                    {plan.promoBadge}
                  </span>
                )}
                <div className="mb-4">
                  <div className={`text-xl font-bold ${plan.highlight ? "" : "text-slate-900"}`}>
                    {plan.name}
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    {plan.originalPrice && (
                      <span className={`text-lg line-through ${plan.highlight ? "text-indigo-300" : "text-slate-400"}`}>
                        {plan.originalPrice}
                      </span>
                    )}
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className={`text-sm ${plan.highlight ? "text-indigo-200" : "text-slate-400"}`}>
                      {plan.desc}
                    </span>
                  </div>
                  {plan.promoBadge && plan.highlight && (
                    <span className="mt-2 inline-block rounded-full bg-amber-400 px-2.5 py-0.5 text-xs font-bold text-amber-900">
                      {plan.promoBadge}
                    </span>
                  )}
                </div>
                <ul className="mb-8 space-y-2">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <CheckCircle
                        className={`h-4 w-4 flex-shrink-0 ${plan.highlight ? "text-indigo-200" : "text-green-500"}`}
                      />
                      <span className={plan.highlight ? "text-indigo-100" : "text-slate-600"}>
                        {f}
                      </span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/register"
                  className={`block rounded-xl px-4 py-3 text-center text-sm font-semibold transition-colors ${
                    plan.highlight
                      ? "bg-white text-indigo-600 hover:bg-indigo-50"
                      : "bg-indigo-600 text-white hover:bg-indigo-700"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
          {/* Reassurance */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-slate-500">
            <span>🇫🇷 Hébergé en France</span>
            <span>🔒 Conforme RGPD</span>
            <span>💬 Support humain en français</span>
            <span>✅ 14 jours d&apos;essai gratuit</span>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="mb-12 text-center text-3xl font-bold text-slate-900">
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

      {/* ── CTA final ── */}
      <section className="bg-indigo-600 py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="mb-4 text-3xl font-bold text-white">
            Prêt à booster votre commerce ?
          </h2>
          <p className="mb-8 text-lg text-indigo-200">
            Rejoignez les commerçants qui ont choisi de reprendre le contrôle de leur visibilité en ligne.
            <br />
            Gratuit, sans engagement, en 5 minutes.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-semibold text-indigo-600 shadow-lg transition-transform hover:scale-105 hover:bg-indigo-50"
          >
            Créer mon espace gratuitement <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-100 py-12">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-8 grid gap-8 sm:grid-cols-4">
            <div>
              <div className="mb-3 font-semibold text-slate-900">Fonctionnalités</div>
              <ul className="space-y-2 text-sm text-slate-500">
                <li>
                  <Link href="/fonctionnalites/carte-de-fidelite" className="hover:text-indigo-600">
                    Carte de fidélité digitale
                  </Link>
                </li>
                <li>
                  <Link href="/fonctionnalites/avis-google" className="hover:text-indigo-600">
                    Avis Google gamifiés
                  </Link>
                </li>
                <li>
                  <Link href="/fonctionnalites/site-vitrine" className="hover:text-indigo-600">
                    Site vitrine commerce
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <div className="mb-3 font-semibold text-slate-900">Avis Google par métier</div>
              <ul className="space-y-2 text-sm text-slate-500">
                {commerceTypes.filter((c) => c.slug).slice(0, 5).map((c) => (
                  <li key={c.label}>
                    <Link href={`/fonctionnalites/avis-google/${c.slug}`} className="hover:text-indigo-600">
                      {c.emoji} {c.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="mb-3 font-semibold text-slate-900">Fidélité par métier</div>
              <ul className="space-y-2 text-sm text-slate-500">
                {commerceTypes.filter((c) => c.slug).slice(0, 5).map((c) => (
                  <li key={c.label}>
                    <Link href={`/fonctionnalites/carte-de-fidelite/${c.slug}`} className="hover:text-indigo-600">
                      {c.emoji} {c.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="mb-3 font-semibold text-slate-900">TocTocToc.boutique</div>
              <ul className="space-y-2 text-sm text-slate-500">
                <li>
                  <Link href="/register" className="hover:text-indigo-600">
                    Créer un compte gratuit
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="hover:text-indigo-600">
                    Connexion
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-indigo-600">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-100 pt-6 text-center text-sm text-slate-400">
            © {new Date().getFullYear()} TocTocToc.boutique · Fait avec soin en France 🇫🇷
          </div>
        </div>
      </footer>
    </div>
  );
}
