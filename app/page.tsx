import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CheckCircle } from "lucide-react";

const features = [
  {
    emoji: "⭐",
    title: "Avis Google + Roulette",
    desc: "Incitez vos clients à laisser des avis et récompensez-les.",
  },
  {
    emoji: "🎯",
    title: "Carte de fidélité digitale",
    desc: "Programme de tampons personnalisé, zéro papier.",
  },
  {
    emoji: "📅",
    title: "Réservations en ligne",
    desc: "Vos clients réservent directement depuis votre site, 24h/24.",
  },
  {
    emoji: "🌐",
    title: "Site vitrine personnalisé",
    desc: "Un site beau et rapide aux couleurs de votre enseigne.",
  },
];

const plans = [
  {
    name: "Gratuit",
    price: "0€",
    desc: "Pour démarrer",
    features: ["1 commerce", "Site vitrine"],
    cta: "Commencer",
    highlight: false,
  },
  {
    name: "Starter",
    price: "9€",
    desc: "/ mois",
    features: [
      "1 commerce",
      "Site vitrine",
      "Réservations",
      "Avis + Roulette",
      "Fidélité",
    ],
    cta: "S'abonner",
    highlight: true,
  },
  {
    name: "Pro",
    price: "19€",
    desc: "/ mois",
    features: [
      "3 commerce",
      "Site vitrine",
      "Réservations",
      "Avis + Roulette",
      "Fidélité",
    ],
    cta: "S'abonner",
    highlight: false,
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
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
            <span className="text-xl font-bold text-indigo-600">
              TocTocToc.boutique
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm text-slate-600 hover:text-slate-900"
            >
              Connexion
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Démarrer gratuitement
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 py-24 text-center">
        <span className="mb-4 inline-block rounded-full bg-indigo-50 px-4 py-1.5 text-sm font-medium text-indigo-700">
          Pour les commerces locaux
        </span>
        <h1 className="mb-6 text-5xl font-bold leading-tight tracking-tight text-slate-900 md:text-6xl">
          Digitalisez votre commerce
          <br />
          <span className="text-indigo-600">en 5 minutes</span>
        </h1>
        <p className="mx-auto mb-10 max-w-2xl text-lg text-slate-500">
          Réservations en ligne, avis Google, carte de fidélité et site vitrine
          — tout en un, personnalisé à votre image, sans aucune compétence
          technique.
        </p>
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/register"
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-8 py-4 font-semibold text-white shadow-lg hover:bg-indigo-700"
          >
            Commencer gratuitement <ArrowRight className="h-4 w-4" />
          </Link>
          {/*<Link*/}
          {/*  href="/cafe-de-la-paix"*/}
          {/*  className="rounded-xl border border-slate-200 px-8 py-4 font-medium text-slate-700 hover:border-slate-300 hover:bg-slate-50"*/}
          {/*>*/}
          {/*  Voir une démo*/}
          {/*</Link>*/}
        </div>
      </section>

      {/* Features */}
      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="mb-12 text-center text-3xl font-bold text-slate-900">
            Tout ce dont votre commerce a besoin
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mb-3 text-3xl">{f.emoji}</div>
                <h3 className="mb-2 font-semibold text-slate-900">{f.title}</h3>
                <p className="text-sm leading-relaxed text-slate-500">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="mb-4 text-center text-3xl font-bold text-slate-900">
            Tarifs simples
          </h2>
          <p className="mb-12 text-center text-slate-500">
            Sans engagement, résiliable à tout moment.
            <br />
            Retour sur investissement garantit !
          </p>
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
                <div className="mb-4">
                  <div
                    className={`text-xl font-bold ${plan.highlight ? "" : "text-slate-900"}`}
                  >
                    {plan.name}
                  </div>
                  <div className="mt-2">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span
                      className={`text-sm ${plan.highlight ? "text-indigo-200" : "text-slate-400"}`}
                    >
                      {plan.desc}
                    </span>
                  </div>
                </div>
                <ul className="mb-8 space-y-2">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <CheckCircle
                        className={`h-4 w-4 flex-shrink-0 ${plan.highlight ? "text-indigo-200" : "text-green-500"}`}
                      />
                      <span
                        className={
                          plan.highlight ? "text-indigo-100" : "text-slate-600"
                        }
                      >
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

      {/* Footer */}
      <footer className="border-t border-slate-100 py-8 text-center text-sm text-slate-400">
        <p>
          © {new Date().getFullYear()} TocTocToc.boutique. Fait avec ❤️ en
          France.
        </p>
      </footer>
    </div>
  );
}
