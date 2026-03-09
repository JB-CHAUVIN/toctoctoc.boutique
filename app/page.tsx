import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CheckCircle } from "lucide-react";
import { LandingDemoSection } from "@/components/landing/demo-section";
import { HeroVideo } from "@/components/landing/hero-video";
import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: { canonical: "https://toctoctoc.boutique" },
};

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
  { value: "500+", label: "commerces nous font confiance" },
  { value: "+200%", label: "d\u2019avis Google en moyenne" },
  { value: "0\u20AC", label: "pour démarrer, sans engagement" },
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
    a: "Oui. Le plan Starter inclut 1 commerce. Le plan Pro (19€/mois) permet de gérer jusqu'à 3 commerces depuis un seul compte. Le plan Enterprise offre un nombre illimité de commerces.",
  },
  {
    q: "Comment fonctionne la carte de fidélité digitale ?",
    a: "Chaque client obtient une carte avec un QR code unique. Pour tamponner, vous scannez son QR code depuis votre smartphone. Le tampon apparaît instantanément sur l'écran du client. Quand il atteint le seuil, la récompense est débloquée automatiquement.",
  },
  {
    q: "Puis-je annuler à tout moment ?",
    a: "Oui, sans engagement. Vous pouvez résilier en un clic depuis votre espace. Votre abonnement reste actif jusqu'à la fin de la période payée.",
  },
  {
    q: "TocTocToc.boutique fonctionne-t-il pour les chaînes de commerces ?",
    a: "Oui. Les franchiseurs et multi-sites utilisent le plan Pro ou Enterprise pour gérer l'ensemble de leurs points de vente depuis une seule interface, avec un branding cohérent.",
  },
];

const plans = [
  {
    name: "Gratuit",
    price: "0€",
    originalPrice: null as string | null,
    desc: "Pour démarrer",
    features: ["1 commerce", "Site vitrine", "Avis Google (3 max)", "Fidélité (3 cartes)"],
    cta: "Commencer",
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
      "Avis + Roulette",
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
      "Avis + Roulette",
      "Fidélité illimitée",
    ],
    cta: "Essai gratuit 14 jours",
    highlight: false,
    promoBadge: "-50% à vie",
  },
];

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

      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="TocTocToc.boutique"
              width={32}
              height={32}
              priority
            />
            <span className="font-brand hidden text-xl font-bold text-indigo-600 sm:inline">
              TocTocToc.boutique
            </span>
          </Link>
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

      {/* Hero — vidéo en arrière-plan, texte centré par-dessus */}
      <section className="relative flex h-[calc(100vh-65px)] items-center justify-center overflow-hidden">
        {/* Vidéo background */}
        <HeroVideo />
        {/* Overlay gradient pour lisibilité du texte */}
        <div className="absolute inset-0 z-[1] bg-gradient-to-b from-white/80 via-white/50 to-white/80" />
        {/* Contenu texte */}
        <div className="relative z-10 px-6 text-center">
          <span className="mb-3 inline-block rounded-full bg-indigo-50/90 px-4 py-1.5 text-xs font-medium text-indigo-700 backdrop-blur-sm sm:text-sm">
            Rejoint par 500+ commerces locaux
          </span>
          <h1 className="mb-3 text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:mb-4 sm:text-4xl md:mb-6 md:text-5xl lg:text-6xl">
            Plus d&apos;avis Google,
            <br />
            <span className="text-indigo-600">plus de clients fidèles</span>
          </h1>
          <p className="mx-auto mb-4 max-w-2xl text-sm text-slate-600 sm:mb-6 sm:text-base md:mb-8 md:text-lg">
            Vos clients laissent un avis Google en 30 secondes, cumulent leurs points de fidélité sans application, et réservent en ligne 24h/24.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-105 hover:bg-indigo-700 sm:px-8 sm:py-4 sm:text-base"
          >
            Essayer gratuitement <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="mb-12 text-center text-3xl font-bold text-slate-900">
            Des résultats concrets pour votre commerce
          </h2>
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

      {/* Chiffres clés */}
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

      {/* Pour tous vos commerces */}
      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="mb-4 text-center text-3xl font-bold text-slate-900">
            Adapté à votre activité
          </h2>
          <p className="mb-10 text-center text-slate-500">
            Quel que soit votre commerce, TocTocToc.boutique s&apos;adapte à vos besoins spécifiques.
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {commerceTypes.map((c) => {
              const content = (
                <div className="flex flex-col items-center gap-2 rounded-2xl border border-slate-200 bg-white p-4 text-center transition-shadow hover:shadow-md">
                  <span className="text-3xl">{c.emoji}</span>
                  <span className="text-xs font-medium text-slate-700">{c.label}</span>
                </div>
              );
              return c.slug ? (
                <Link key={c.label} href={`/fonctionnalites/carte-de-fidelite/${c.slug}`}>
                  {content}
                </Link>
              ) : (
                <div key={c.label}>{content}</div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Demo interactive */}
      <LandingDemoSection />

      {/* Pricing */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="mb-4 text-center text-3xl font-bold text-slate-900">
            Tarifs simples
          </h2>
          <p className="mb-3 text-center text-slate-500">
            Sans engagement, résiliable à tout moment.
            <br />
            3 à 8x moins cher que la concurrence.
          </p>
          <div className="mx-auto mb-10 w-fit animate-pulse rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-2 text-center text-sm font-bold text-white shadow-lg">
            Offre de lancement -50% à vie — pour les 1000 premiers inscrits !
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
                    Populaire
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
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-slate-50 py-20">
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
                <summary className="flex cursor-pointer list-none items-center justify-between font-semibold text-slate-900 group-open:text-indigo-600">
                  {faq.q}
                  <span className="ml-3 flex-shrink-0 text-lg group-open:hidden">🗿</span>
                  <span className="ml-3 hidden flex-shrink-0 text-lg group-open:inline">💩</span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-slate-500">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-12">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-8 grid gap-8 sm:grid-cols-3">
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
              <div className="mb-3 font-semibold text-slate-900">Par type de commerce</div>
              <ul className="space-y-2 text-sm text-slate-500">
                <li>
                  <Link href="/fonctionnalites/carte-de-fidelite/boulangerie" className="hover:text-indigo-600">
                    Boulangerie
                  </Link>
                </li>
                <li>
                  <Link href="/fonctionnalites/carte-de-fidelite/restaurant" className="hover:text-indigo-600">
                    Restaurant
                  </Link>
                </li>
                <li>
                  <Link href="/fonctionnalites/avis-google/salon-de-coiffure" className="hover:text-indigo-600">
                    Salon de coiffure
                  </Link>
                </li>
                <li>
                  <Link href="/fonctionnalites/carte-de-fidelite/cafe" className="hover:text-indigo-600">
                    Café
                  </Link>
                </li>
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
            © {new Date().getFullYear()} TocTocToc.boutique. Fait avec ❤️ en France.
          </div>
        </div>
      </footer>
    </div>
  );
}
