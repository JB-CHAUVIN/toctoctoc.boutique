"use client";

import { useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Star, TrendingUp, ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import Link from "next/link";
import { LoyaltyCardPreview } from "@/components/loyalty/loyalty-card-preview";
import { RouletteWheel, IlluLoyaltyScan, IlluPricing as IlluPricingShared } from "@/components/dashboard/walkthrough-modal";

// ─── Palette par défaut ───────────────────────────────────────────────────────

const PRIMARY = "#4f46e5";
const ACCENT = "#f59e0b";

const DEMO_CONFIG = {
  id: "", businessId: "",
  cardColor: PRIMARY, cardTextColor: "#ffffff",
  stampColor: ACCENT, stampIcon: "⭐",
  stampsRequired: 6, rewardName: "Café offert",
  rewardDescription: null, stampExpiryDays: null,
  createdAt: new Date(), updatedAt: new Date(),
};

// ─── Boîte illustration commune ───────────────────────────────────────────────

function IBox({ children, gradient }: { children: React.ReactNode; gradient: string }) {
  return (
    <div
      className="relative flex h-full w-full items-center justify-center overflow-hidden"
      style={{ background: gradient }}
    >
      {children}
    </div>
  );
}

// ─── Illustration 1 — Scan QR / NFC (partagée avec le walkthrough) ───────────

function IlluScan() {
  return <IlluLoyaltyScan primaryColor={PRIMARY} className="h-full" />;
}

// ─── Illustration 2 — Tamponnage ──────────────────────────────────────────────

function IlluStamp() {
  const [stamps, setStamps] = useState(0);
  const [badge, setBadge] = useState(false);
  const target = DEMO_CONFIG.stampsRequired - 1;

  useEffect(() => {
    setStamps(0); setBadge(false);
    let c = 0;
    const iv = setInterval(() => {
      c++;
      setStamps(c);
      if (c >= target) { clearInterval(iv); setTimeout(() => setBadge(true), 400); }
    }, 550);
    return () => clearInterval(iv);
  }, []);

  return (
    <IBox gradient="linear-gradient(145deg, #0f172a 0%, #1e1b4b 100%)">
      <div className="relative flex w-full flex-col items-center py-4">
        <div className="scale-[0.72] origin-top">
          <LoyaltyCardPreview
            config={DEMO_CONFIG}
            businessName="Mon Commerce"
            customerName="Marie M."
            totalStamps={stamps}
          />
        </div>

        <motion.div
          className="absolute right-5 top-5 flex items-center gap-2 rounded-2xl bg-indigo-600/80 px-3 py-2 text-xs font-semibold text-white backdrop-blur-sm"
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          <span>📱</span> Commerçant
        </motion.div>

        <AnimatePresence>
          {badge && (
            <motion.div
              className="absolute bottom-4 flex items-center gap-2 rounded-2xl bg-emerald-500 px-5 py-2.5 shadow-2xl"
              initial={{ opacity: 0, scale: 0.5, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 450, damping: 22 }}
            >
              <span className="text-xl">{DEMO_CONFIG.stampIcon}</span>
              <span className="text-sm font-bold text-white">+1 tampon en temps réel !</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </IBox>
  );
}

// ─── Illustration 3 — Statuts VIP ────────────────────────────────────────────

function IlluStatus() {
  const levels = [
    { emoji: "🥉", name: "Bronze", color: "#cd7f32", req: "1 récomp.", h: 88 },
    { emoji: "🥈", name: "Silver", color: "#94a3b8", req: "5 récomp.", h: 108 },
    { emoji: "👑", name: "Gold", color: "#f59e0b", req: "10 récomp.", h: 132 },
  ];
  return (
    <IBox gradient="linear-gradient(145deg, #431407 0%, #9a3412 100%)">
      <div className="flex flex-col items-center gap-5">
        <div className="flex items-end justify-center gap-4">
          {levels.map((l, i) => (
            <motion.div
              key={l.name}
              className="flex flex-col items-center gap-2"
              initial={{ opacity: 0, y: 36 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.18, type: "spring", stiffness: 280 }}
            >
              <div
                className="flex flex-col items-center justify-center gap-1.5 rounded-3xl px-5"
                style={{
                  height: l.h,
                  backgroundColor: l.color + "1a",
                  border: `2px solid ${l.color}55`,
                  boxShadow: i === 2 ? `0 0 32px ${l.color}40` : undefined,
                }}
              >
                <span style={{ fontSize: i === 2 ? "2.5rem" : "2rem" }}>{l.emoji}</span>
                <span className="text-xs font-bold text-white">{l.name}</span>
              </div>
              <span className="text-white/50 text-[11px]">{l.req}</span>
            </motion.div>
          ))}
        </div>
        <motion.p
          className="text-white/50 text-xs text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          Paliers 100% personnalisables
        </motion.p>
      </div>
    </IBox>
  );
}

// ─── Illustration 4 — Avis Google ────────────────────────────────────────────

function IlluReviews() {
  return (
    <IBox gradient="linear-gradient(145deg, #0c1445 0%, #1d4ed8 100%)">
      <div className="flex flex-col items-center gap-5">
        <div className="flex gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0, rotate: -15 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ delay: 0.3 + i * 0.14, type: "spring", stiffness: 500 }}
            >
              <Star className="h-10 w-10 fill-yellow-400 text-yellow-400 drop-shadow-lg" />
            </motion.div>
          ))}
        </div>

        <motion.div
          className="flex items-center gap-2.5 rounded-full bg-white px-5 py-2.5 shadow-2xl"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
        >
          <span className="text-lg font-black">
            <span style={{ color: "#4285F4" }}>G</span>
            <span style={{ color: "#EA4335" }}>o</span>
            <span style={{ color: "#FBBC05" }}>o</span>
            <span style={{ color: "#4285F4" }}>g</span>
            <span style={{ color: "#34A853" }}>l</span>
            <span style={{ color: "#EA4335" }}>e</span>
          </span>
          <span className="font-semibold text-slate-500">Avis</span>
        </motion.div>

        <motion.div
          className="flex items-center gap-2 font-semibold text-emerald-300"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          <TrendingUp className="h-5 w-5" />
          Visibilité locale boostée
        </motion.div>
      </div>
    </IBox>
  );
}

// ─── Illustration 5 — Roulette ────────────────────────────────────────────────

function IlluRoulette() {
  const [won, setWon] = useState(false);
  useEffect(() => {
    setWon(false);
    const t = setTimeout(() => setWon(true), 3000);
    return () => clearTimeout(t);
  }, []);

  return (
    <IBox gradient="linear-gradient(145deg, #4a0020 0%, #881337 100%)">
      <div className="flex items-center gap-8 px-8">
        <RouletteWheel />
        <div className="flex flex-col items-center gap-4">
          <motion.span
            className="text-5xl"
            animate={won ? { scale: [1, 1.4, 1], rotate: [0, 12, -8, 0] } : {}}
            transition={{ duration: 0.7 }}
          >
            {won ? "🥳" : "😊"}
          </motion.span>
          <AnimatePresence>
            {won && (
              <motion.div
                className="rounded-3xl px-5 py-3 text-center shadow-2xl"
                style={{ backgroundColor: ACCENT }}
                initial={{ opacity: 0, scale: 0.3, rotate: -12 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 18 }}
              >
                <div className="text-2xl">☕</div>
                <div className="text-sm font-black text-white">Café offert !</div>
              </motion.div>
            )}
          </AnimatePresence>
          {!won && (
            <span className="animate-pulse text-sm text-white/40">En cours…</span>
          )}
        </div>
      </div>
    </IBox>
  );
}

// ─── Illustration 6 — Pricing (partagée avec le walkthrough) ─────────────────

function IlluPricing() {
  return <IlluPricingShared className="h-full" />;
}

// ─── Données des slides ───────────────────────────────────────────────────────

const SLIDES = [
  {
    category: "Fidélité",
    categoryColor: "#6366f1",
    title: "Carte de fidélité 100% digitale",
    description: "Imprimez votre QR code, posez-le sur votre comptoir. Vos clients scannent et obtiennent leur carte instantanément — sans app à installer.",
    bullets: [
      "Compatible tous les smartphones",
      "QR Code et NFC disponibles",
      "Carte retrouvable par email",
    ],
    illu: IlluScan,
    bg: "linear-gradient(145deg, #1e1b4b 0%, #3730a3 100%)",
  },
  {
    category: "Fidélité",
    categoryColor: "#6366f1",
    title: "Tamponnez en 1 clic ✓",
    description: "Depuis votre smartphone, scannez la carte de votre client. Le tampon s'affiche en temps réel sur son téléphone. Fini les cartes papier perdues !",
    bullets: [
      "Interface ultra-rapide pour le commerçant",
      "Notification instantanée côté client",
      "Historique complet des tampons",
    ],
    illu: IlluStamp,
    bg: "linear-gradient(145deg, #0f172a 0%, #1e1b4b 100%)",
  },
  {
    category: "Fidélité",
    categoryColor: "#6366f1",
    title: "Créez des clients VIP 👑",
    description: "Définissez des paliers de fidélité sur-mesure. Vos meilleurs clients montent en statut, débloquent des avantages exclusifs et... reviennent encore.",
    bullets: [
      "Paliers et couleurs personnalisables",
      "Avantages par niveau configurables",
      "Statut recalculé en temps réel",
    ],
    illu: IlluStatus,
    bg: "linear-gradient(145deg, #431407 0%, #9a3412 100%)",
  },
  {
    category: "Avis Google",
    categoryColor: "#f59e0b",
    title: "Dopez vos avis Google ⭐",
    description: "Un QR code sur votre comptoir suffit. Vos clients laissent un avis Google en 10 secondes. Plus d'avis = meilleure position dans les recherches locales.",
    bullets: [
      "Lien direct vers votre page Google",
      "QR code imprimable en 1 clic",
      "Tableau de bord des avis reçus",
    ],
    illu: IlluReviews,
    bg: "linear-gradient(145deg, #0c1445 0%, #1d4ed8 100%)",
  },
  {
    category: "Avis Google",
    categoryColor: "#f59e0b",
    title: "La roulette qui récompense 🎰",
    description: "Après leur avis, vos clients tentent leur chance. Café offert, réduction, cadeau mystère… La gamification transforme un avis en expérience mémorable.",
    bullets: [
      "Récompenses et probabilités configurables",
      "Code de récompense unique à valider",
      "Vos clients partagent leur gain 🎉",
    ],
    illu: IlluRoulette,
    bg: "linear-gradient(145deg, #4a0020 0%, #881337 100%)",
  },
  {
    category: "Tarifs",
    categoryColor: "#10b981",
    title: "Moins cher que votre café du matin ☕",
    description: "Site vitrine + Réservations + Avis gamifiés + Fidélité VIP. Tout inclus à partir de 9€/mois. Vos concurrents facturent 50€+ pour bien moins.",
    bullets: [
      "Sans engagement, résiliable en 1 clic",
      "14 jours d'essai gratuit",
      "Configuration en 5 minutes chrono",
    ],
    illu: IlluPricing,
    bg: "linear-gradient(145deg, #052e16 0%, #065f46 100%)",
  },
];

const AUTOPLAY_DURATION = 5000;

// ─── Composant principal ──────────────────────────────────────────────────────

export function LandingDemoSection() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [dir, setDir] = useState(1);
  const [progress, setProgress] = useState(0);

  const goTo = useCallback((next: number) => {
    setDir(next > current ? 1 : -1);
    setCurrent(next);
    setProgress(0);
  }, [current]);

  // Auto-advance + progress bar
  useEffect(() => {
    if (paused) return;
    const startTime = Date.now();
    const frame = () => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min((elapsed / AUTOPLAY_DURATION) * 100, 100);
      setProgress(pct);
      if (pct < 100) {
        raf = requestAnimationFrame(frame);
      } else {
        setCurrent((c) => (c + 1) % SLIDES.length);
        setDir(1);
        setProgress(0);
      }
    };
    let raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [current, paused]);

  const slide = SLIDES[current];
  const IlluComponent = slide.illu;

  const slideVariants = {
    enter: (d: number) => ({ x: d > 0 ? "40%" : "-40%", opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? "-40%" : "40%", opacity: 0 }),
  };

  return (
    <section className="bg-slate-950 py-24">
      <div className="mx-auto max-w-6xl px-6">
        {/* Header */}
        <div className="mb-14 text-center">
          <span className="mb-4 inline-block rounded-full bg-indigo-500/15 px-4 py-1.5 text-sm font-semibold text-indigo-300">
            Comment ça marche
          </span>
          <h2 className="text-4xl font-black text-white md:text-5xl">
            Voyez la magie en action
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-slate-400">
            Fidélité digitale, avis Google gamifiés, site vitrine — découvrez pourquoi
            plus de 500 commerçants nous font confiance.
          </p>
        </div>

        {/* Demo player */}
        <div
          className="overflow-hidden rounded-3xl border border-white/5 shadow-2xl"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div className="grid lg:grid-cols-[1fr_1fr]">

            {/* Panneau illustration */}
            <div className="relative h-72 lg:h-auto lg:min-h-[420px] overflow-hidden">
              <AnimatePresence mode="wait" custom={dir}>
                <motion.div
                  key={current}
                  custom={dir}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.32, ease: [0.4, 0, 0.2, 1] }}
                  className="absolute inset-0"
                >
                  <IlluComponent />
                </motion.div>
              </AnimatePresence>

              {/* Barre de progression */}
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10">
                <motion.div
                  className="h-full bg-white/50"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Panneau texte */}
            <div className="flex flex-col justify-between bg-slate-900 p-8 lg:p-10">
              <AnimatePresence mode="wait">
                <motion.div
                  key={current + "-text"}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.24 }}
                  className="flex flex-col gap-5"
                >
                  {/* Catégorie + numéro */}
                  <div className="flex items-center justify-between">
                    <span
                      className="rounded-full px-3 py-1 text-xs font-bold"
                      style={{
                        backgroundColor: slide.categoryColor + "22",
                        color: slide.categoryColor,
                      }}
                    >
                      {slide.category}
                    </span>
                    <span className="text-xs font-mono text-slate-600">
                      {String(current + 1).padStart(2, "0")} / {String(SLIDES.length).padStart(2, "0")}
                    </span>
                  </div>

                  {/* Titre */}
                  <h3 className="text-2xl font-black leading-tight text-white lg:text-3xl">
                    {slide.title}
                  </h3>

                  {/* Description */}
                  <p className="leading-relaxed text-slate-400">
                    {slide.description}
                  </p>

                  {/* Bullets */}
                  <ul className="space-y-2.5">
                    {slide.bullets.map((b, i) => (
                      <motion.li
                        key={b}
                        className="flex items-start gap-2.5 text-sm text-slate-300"
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + i * 0.08 }}
                      >
                        <span
                          className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-black"
                          style={{ backgroundColor: slide.categoryColor + "30", color: slide.categoryColor }}
                        >
                          ✓
                        </span>
                        {b}
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              </AnimatePresence>

              {/* Navigation */}
              <div className="mt-8 flex items-center justify-between">
                {/* Dots */}
                <div className="flex gap-2">
                  {SLIDES.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => goTo(i)}
                      className="rounded-full transition-all duration-300"
                      style={{
                        width: i === current ? 20 : 8,
                        height: 8,
                        backgroundColor: i === current
                          ? SLIDES[i].categoryColor
                          : i < current ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.1)",
                      }}
                    />
                  ))}
                </div>

                {/* Prev / Next */}
                <div className="flex gap-2">
                  <button
                    onClick={() => goTo((current - 1 + SLIDES.length) % SLIDES.length)}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 text-slate-400 transition hover:border-white/30 hover:text-white"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => goTo((current + 1) % SLIDES.length)}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 text-slate-400 transition hover:border-white/30 hover:text-white"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA sous la démo */}
        <div className="mt-10 text-center">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-8 py-4 font-bold text-white shadow-lg shadow-indigo-900/40 transition hover:bg-indigo-500"
          >
            Essayer gratuitement — 14 jours <ArrowRight className="h-4 w-4" />
          </Link>
          <p className="mt-3 text-sm text-slate-600">Sans CB, sans engagement</p>
        </div>
      </div>
    </section>
  );
}
