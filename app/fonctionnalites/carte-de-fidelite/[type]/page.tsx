import Link from "next/link";
import { ArrowRight, CheckCircle, ChevronDown, Lightbulb, QrCode, Smartphone, Star } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LOYALTY_TYPES, getLoyaltyTypeBySlug } from "@/lib/seo-data";
import { FeatureNav } from "@/components/landing/feature-nav";
import { FeatureFooter } from "@/components/landing/feature-footer";

type Params = { type: string };

export async function generateStaticParams(): Promise<Params[]> {
  return LOYALTY_TYPES.map((t) => ({ type: t.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { type } = await params;
  const data = getLoyaltyTypeBySlug(type);
  if (!data) return {};

  const title = `Carte de fidélité digitale pour ${data.label} | TocTocToc.boutique`;
  const description = `Programme de fidélité avec QR code pour ${data.label.toLowerCase()}. ${data.tagline}. Tampons numériques, statuts VIP, sans app à installer. Gratuit pour démarrer.`;

  return {
    title,
    description,
    keywords: [
      `carte de fidélité ${data.label.toLowerCase()}`,
      `programme fidélité ${data.label.toLowerCase()}`,
      `fidélité QR code ${data.label.toLowerCase()}`,
      `carte de tampon ${data.label.toLowerCase()}`,
      "carte de fidélité digitale",
      "fidélisation client commerce",
    ],
    alternates: {
      canonical: `https://toctoctoc.boutique/fonctionnalites/carte-de-fidelite/${type}`,
    },
  };
}

export default async function LoyaltyTypePage({ params }: { params: Promise<Params> }) {
  const { type } = await params;
  const data = getLoyaltyTypeBySlug(type);
  if (!data) notFound();

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil", item: "https://toctoctoc.boutique" },
      { "@type": "ListItem", position: 2, name: "Carte de fidélité digitale", item: "https://toctoctoc.boutique/fonctionnalites/carte-de-fidelite" },
      { "@type": "ListItem", position: 3, name: data.label, item: `https://toctoctoc.boutique/fonctionnalites/carte-de-fidelite/${type}` },
    ],
  };

  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: `Carte de fidélité digitale pour ${data.label}`,
    provider: { "@type": "Organization", name: "TocTocToc.boutique", url: "https://toctoctoc.boutique" },
    description: data.heroDesc,
    offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
  };

  const allFaqs = [
    {
      q: `Comment fonctionne la carte de fidélité pour une ${data.label.toLowerCase()} ?`,
      a: `Vos clients scannent un QR code sur votre comptoir et obtiennent leur carte instantanément. Vous tamponnez depuis votre smartphone ${data.stampTrigger}. Après ${data.rewardThreshold}, la récompense est débloquée automatiquement.`,
    },
    {
      q: "Mes clients doivent-ils télécharger une application ?",
      a: "Non. Un simple scan du QR code sur smartphone suffit. La carte s'ouvre dans le navigateur — aucune app à installer, aucun compte à créer.",
    },
    {
      q: "Combien de cartes puis-je gérer ?",
      a: "Le plan gratuit permet 3 cartes actives. Dès le plan Starter (9€/mois), vous gérez un nombre illimité de cartes de fidélité.",
    },
    {
      q: "Puis-je personnaliser les récompenses ?",
      a: `Oui. Vous choisissez librement le nombre de tampons requis et la récompense à offrir. Pour une ${data.label.toLowerCase()}, les récompenses les plus courantes sont : ${data.rewards.slice(0, 2).join(", ")}.`,
    },
    {
      q: "Comment mes clients retrouvent-ils leur carte ?",
      a: "En re-scannant le QR code sur votre comptoir, votre client retrouve instantanément sa carte avec tous ses tampons. Il peut aussi l'ajouter en favori sur son téléphone.",
    },
    ...(data.faqExtra ? [data.faqExtra] : []),
  ];

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: allFaqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const howToSteps = [
    { name: "Configurez et imprimez", text: `Configurez votre programme en quelques minutes (tampons requis, récompense), puis imprimez votre QR code. Posez-le sur votre comptoir dans votre ${data.label.toLowerCase()}.` },
    { name: "Vos clients scannent", text: "Un simple scan avec leur smartphone et votre client obtient sa carte de fidélité instantanément — sans app ni compte à créer." },
    { name: "Tamponnez et récompensez", text: `Scannez la carte de votre client depuis votre smartphone pour ajouter un tampon. Après ${data.rewardThreshold}, la récompense est débloquée automatiquement.` },
  ];

  const howToJsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: `Comment mettre en place une carte de fidélité digitale dans votre ${data.label.toLowerCase()}`,
    description: data.heroDesc,
    totalTime: "PT5M",
    step: howToSteps.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: s.name,
      text: s.text,
    })),
  };

  const otherTypes = LOYALTY_TYPES.filter((t) => t.slug !== type).slice(0, 6);

  return (
    <div className="min-h-screen bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }} />

      <FeatureNav />

      {/* Breadcrumb */}
      <div className="mx-auto max-w-6xl px-6 pt-4 text-sm text-slate-400">
        <Link href="/" className="hover:text-indigo-600">Accueil</Link>
        <span className="mx-2">/</span>
        <Link href="/fonctionnalites/carte-de-fidelite" className="hover:text-indigo-600">Carte de fidélité</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-700">{data.label}</span>
      </div>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 py-20 text-center">
        <div className="mb-4 text-5xl">{data.emoji}</div>
        <span className="mb-4 inline-block rounded-full bg-indigo-50 px-4 py-1.5 text-sm font-medium text-indigo-700">
          {data.tagline}
        </span>
        <h1 className="mb-6 text-4xl font-bold leading-tight tracking-tight text-slate-900 md:text-5xl">
          Carte de fidélité digitale
          <br />
          <span className="text-indigo-600">pour votre {data.label.toLowerCase()}</span>
        </h1>
        <p className="mx-auto mb-10 max-w-2xl text-lg text-slate-500">{data.heroDesc}</p>
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/register"
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-8 py-4 font-semibold text-white shadow-lg hover:bg-indigo-700"
          >
            Créer ma carte de fidélité <ArrowRight className="h-4 w-4" />
          </Link>
          <span className="text-sm text-slate-400">Gratuit · Sans engagement · En 5 minutes</span>
        </div>
      </section>

      {/* Pourquoi — SEO long text */}
      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="mb-8 text-center text-3xl font-bold text-slate-900">{data.whyTitle}</h2>
          <div className="space-y-5 text-base leading-relaxed text-slate-600">
            {data.whyParagraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>
      </section>

      {/* Récompenses types */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="mb-4 text-center text-3xl font-bold text-slate-900">
            Exemples de récompenses pour votre {data.label.toLowerCase()}
          </h2>
          <p className="mb-10 text-center text-slate-500">
            Tampons déclenchés {data.stampTrigger}. Récompense après {data.rewardThreshold}.
          </p>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            {data.rewards.map((reward) => (
              <div key={reward} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <Star className="h-5 w-5 flex-shrink-0 text-amber-500" />
                <span className="font-medium text-slate-900">{reward}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Avantages spécifiques */}
      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="mb-8 text-center text-3xl font-bold text-slate-900">
            Les avantages concrets pour votre {data.label.toLowerCase()}
          </h2>
          <ul className="space-y-4">
            {data.benefits.map((b) => (
              <li key={b} className="flex items-start gap-3">
                <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-indigo-500" />
                <span className="text-slate-600">{b}</span>
              </li>
            ))}
          </ul>
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
                title: "Configurez et imprimez",
                desc: `Configurez votre programme en quelques minutes (tampons requis, récompense), puis imprimez votre QR code. Posez-le sur votre comptoir.`,
              },
              {
                icon: Smartphone,
                title: "Vos clients scannent",
                desc: "Un simple scan avec leur smartphone et votre client obtient sa carte de fidélité instantanément — sans app ni compte à créer.",
              },
              {
                icon: Star,
                title: "Tamponnez et récompensez",
                desc: `Scannez la carte de votre client depuis votre smartphone pour ajouter un tampon. Après ${data.rewardThreshold}, la récompense est débloquée automatiquement.`,
              },
            ].map((step, i) => (
              <div key={step.title} className="flex flex-col gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white">
                  <step.icon className="h-6 w-6" />
                </div>
                <div className="text-xs font-bold text-indigo-600">ÉTAPE {i + 1}</div>
                <h3 className="text-xl font-semibold text-slate-900">{step.title}</h3>
                <p className="text-slate-500">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Conseils pro */}
      {data.proTips.length > 0 && (
        <section className="bg-amber-50 py-20">
          <div className="mx-auto max-w-3xl px-6">
            <h2 className="mb-8 text-center text-3xl font-bold text-slate-900">
              <Lightbulb className="mr-2 inline h-7 w-7 text-amber-500" />
              Conseils pour maximiser la fidélité en {data.label.toLowerCase()}
            </h2>
            <div className="space-y-6">
              {data.proTips.map((tip) => (
                <div key={tip.title} className="rounded-2xl border border-amber-200 bg-white p-6">
                  <h3 className="mb-2 font-bold text-slate-900">{tip.title}</h3>
                  <p className="text-sm leading-relaxed text-slate-600">{tip.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      <section className="py-20">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="mb-10 text-center text-3xl font-bold text-slate-900">
            Questions fréquentes — Fidélité {data.label}
          </h2>
          <div className="space-y-4">
            {allFaqs.map((faq, i) => (
              <details key={i} className="group rounded-2xl border border-slate-200 bg-white px-6 py-4">
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

      {/* Autres types */}
      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="mb-8 text-center text-2xl font-bold text-slate-900">
            Carte de fidélité pour d&apos;autres commerces
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
            {otherTypes.map((t) => (
              <Link
                key={t.slug}
                href={`/fonctionnalites/carte-de-fidelite/${t.slug}`}
                className="flex flex-col items-center gap-2 rounded-2xl border border-slate-200 bg-white p-4 text-center transition-shadow hover:shadow-md"
              >
                <span className="text-3xl">{t.emoji}</span>
                <span className="text-xs font-medium text-slate-700">{t.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="bg-indigo-600 py-20 text-center">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="mb-4 text-3xl font-bold text-white">
            Lancez la carte de fidélité de votre {data.label.toLowerCase()}
          </h2>
          <p className="mb-8 text-indigo-200">
            Configuration en 5 minutes · Gratuit pour démarrer · Sans engagement
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 font-semibold text-indigo-600 shadow-lg hover:bg-indigo-50"
          >
            Démarrer gratuitement <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <FeatureFooter />
    </div>
  );
}
