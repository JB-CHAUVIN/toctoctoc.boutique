"use client";

import { useState, useEffect, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  X, ChevronLeft, ChevronRight, Sparkles, Star, Trophy,
  TrendingUp, ExternalLink, Copy, Check, Gift,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { LoyaltyCardPreview } from "@/components/loyalty/loyalty-card-preview";

// ─── Types ───────────────────────────────────────────────────────────────────

interface WalkthroughProps {
  businessId: string;
  businessName: string;
  primaryColor?: string;
  accentColor?: string;
  logoUrl?: string | null;
  promoCode?: string | null;
  loyaltyConfig?: {
    cardColor: string;
    cardTextColor: string;
    stampColor: string;
    stampIcon: string;
    stampsRequired: number;
    rewardName: string;
    rewardDescription: string | null;
    stampExpiryDays: number | null;
  } | null;
}

// ─── Roulette SVG helpers ─────────────────────────────────────────────────────

function polarToCartesian(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function sectorPath(cx: number, cy: number, r: number, start: number, end: number) {
  const s = polarToCartesian(cx, cy, r, start);
  const e = polarToCartesian(cx, cy, r, end);
  const large = end - start > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${s.x.toFixed(2)} ${s.y.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${e.x.toFixed(2)} ${e.y.toFixed(2)} Z`;
}

const WHEEL_SECTORS = [
  { color: "#4f46e5", emoji: "☕", label: "Café" },
  { color: "#f59e0b", emoji: "🎁", label: "Cadeau" },
  { color: "#10b981", emoji: "10%", label: "Réduction" },
  { color: "#ec4899", emoji: "🌟", label: "Bonus" },
  { color: "#6366f1", emoji: "🍰", label: "Dessert" },
  { color: "#f97316", emoji: "💎", label: "VIP" },
];

export function RouletteWheel() {
  const n = WHEEL_SECTORS.length;
  const step = 360 / n;
  return (
    <motion.svg
      width="150"
      height="150"
      viewBox="0 0 200 200"
      animate={{ rotate: 360 }}
      transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
      style={{ filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.4))" }}
    >
      <circle cx="100" cy="100" r="99" fill="#0f172a" />
      {WHEEL_SECTORS.map((s, i) => {
        const start = i * step;
        const end = (i + 1) * step;
        const mid = polarToCartesian(100, 100, 68, start + step / 2);
        return (
          <g key={i}>
            <path d={sectorPath(100, 100, 95, start, end)} fill={s.color} stroke="#0f172a" strokeWidth="2" />
            <text
              x={mid.x}
              y={mid.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="17"
              className="select-none"
            >
              {s.emoji}
            </text>
          </g>
        );
      })}
      {/* Centre */}
      <circle cx="100" cy="100" r="16" fill="white" stroke="#0f172a" strokeWidth="3" />
      <circle cx="100" cy="100" r="6" fill="#94a3b8" />
      {/* Curseur en haut */}
      <polygon points="100,1 93,18 107,18" fill="#ef4444" />
      <polygon points="100,1 93,18 107,18" fill="#ef4444" stroke="white" strokeWidth="1" />
    </motion.svg>
  );
}

// ─── Wrapper illustration commun ──────────────────────────────────────────────

function IlluBox({ children, gradient, className }: { children: React.ReactNode; gradient: string; className?: string }) {
  return (
    <div
      className={`relative flex w-full items-center justify-center overflow-hidden ${className ?? "h-52"}`}
      style={{ background: gradient }}
    >
      {children}
    </div>
  );
}

// ─── Illustrations ────────────────────────────────────────────────────────────

function IlluWelcome({ businessName, primaryColor, logoUrl }: { businessName: string; primaryColor: string; logoUrl?: string | null }) {
  const dots = Array.from({ length: 10 });
  return (
    <IlluBox gradient={`linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}99 100%)`}>
      {dots.map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-white/20"
          style={{
            width: i % 3 === 0 ? 8 : 5,
            height: i % 3 === 0 ? 8 : 5,
            top: `${8 + (i * 9) % 84}%`,
            left: `${4 + (i * 11) % 92}%`,
          }}
          animate={{ opacity: [0.15, 0.6, 0.15], scale: [0.7, 1.3, 0.7] }}
          transition={{ duration: 2 + i * 0.25, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
      <div className="relative z-10 flex flex-col items-center gap-3">
        <motion.div
          className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white/20 shadow-2xl backdrop-blur-sm overflow-hidden"
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        >
          {logoUrl ? (
            <img src={logoUrl} alt={businessName} className="h-full w-full object-contain p-2" />
          ) : (
            <span className="text-5xl">🏪</span>
          )}
        </motion.div>
        <div className="text-center">
          <p className="text-xl font-black text-white drop-shadow-md">{businessName}</p>
          <div className="mt-1 flex items-center justify-center gap-1.5">
            <Sparkles className="h-3 w-3 text-white/70" />
            <span className="text-xs font-semibold text-white/70">TocTocToc.boutique</span>
          </div>
        </div>
      </div>
    </IlluBox>
  );
}

export function IlluLoyaltyScan({ primaryColor, className }: { primaryColor: string; className?: string }) {
  return (
    <IlluBox gradient="linear-gradient(135deg, #1e1b4b 0%, #3730a3 100%)" className={className}>
      <div className="relative flex w-full items-center justify-center gap-2 px-3">

        {/* 1. Comptoir avec QR code */}
        <motion.div
          className="flex flex-shrink-0 flex-col items-center gap-0.5"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        >
          {/* Support QR */}
          <div
            className="flex flex-col items-center justify-center gap-1 rounded-xl p-2 shadow-xl"
            style={{ width: 52, background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.22)" }}
          >
            {/* Mini QR */}
            <div className="grid grid-cols-4 gap-[2px]">
              {Array.from({ length: 16 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: 7, height: 7,
                    borderRadius: 1,
                    backgroundColor: `rgba(255,255,255,${[0,3,5,7,10,12,15].includes(i) ? 0.88 : 0.18})`,
                  }}
                />
              ))}
            </div>
            <p className="text-[6px] font-bold uppercase tracking-wide text-white/50">Scan ici</p>
          </div>
          {/* Base comptoir */}
          <div className="h-2 w-14 rounded-sm" style={{ background: "rgba(255,255,255,0.18)" }} />
          <div className="h-1.5 w-20 rounded-sm" style={{ background: "rgba(255,255,255,0.10)" }} />
          <p className="mt-0.5 text-[7px] text-white/35">Comptoir</p>
        </motion.div>

        {/* Flèche 1 */}
        <motion.div
          className="flex-shrink-0 text-base font-bold text-white/50"
          animate={{ x: [-2, 2, -2] }}
          transition={{ duration: 1.2, repeat: Infinity }}
        >→</motion.div>

        {/* 2. Téléphone client qui scan */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
          className="relative flex-shrink-0"
          style={{ width: 42, height: 76 }}
        >
          <div className="absolute inset-0 rounded-[13px] border-2 border-white/30 bg-white/10 backdrop-blur-sm">
            <div className="absolute left-1/2 top-1.5 h-1 w-5 -translate-x-1/2 rounded-full bg-white/30" />
            {/* Écran: viewfinder scan */}
            <div className="absolute inset-x-1 bottom-2 top-4 overflow-hidden rounded-lg bg-white/8 flex flex-col items-center justify-center gap-0.5">
              <div className="relative flex items-center justify-center" style={{ width: 26, height: 26 }}>
                {/* Coins viseur */}
                <div className="absolute top-0 left-0 h-2 w-2 border-t-2 border-l-2 border-white/70 rounded-tl" />
                <div className="absolute top-0 right-0 h-2 w-2 border-t-2 border-r-2 border-white/70 rounded-tr" />
                <div className="absolute bottom-0 left-0 h-2 w-2 border-b-2 border-l-2 border-white/70 rounded-bl" />
                <div className="absolute bottom-0 right-0 h-2 w-2 border-b-2 border-r-2 border-white/70 rounded-br" />
                {/* Ligne de scan animée */}
                <motion.div
                  className="absolute inset-x-0.5 h-px"
                  style={{ background: primaryColor, boxShadow: `0 0 6px ${primaryColor}` }}
                  animate={{ top: ["20%", "80%", "20%"] }}
                  transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
                />
              </div>
              <span className="text-[5px] text-white/40">Scanner</span>
            </div>
          </div>
        </motion.div>

        {/* Flèche 2 */}
        <motion.div
          className="flex-shrink-0 text-base font-bold text-white/50"
          animate={{ x: [-2, 2, -2] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: 0.5 }}
        >→</motion.div>

        {/* 3. Téléphone avec carte fidélité */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
          className="relative flex-shrink-0"
          style={{ width: 42, height: 76 }}
        >
          <div className="absolute inset-0 rounded-[13px] border-2 border-white/30 bg-white/10 backdrop-blur-sm">
            <div className="absolute left-1/2 top-1.5 h-1 w-5 -translate-x-1/2 rounded-full bg-white/30" />
            {/* Écran: carte fidélité — cercles fixes, pas d'overflow */}
            <div
              className="absolute inset-x-1 bottom-2 top-4 overflow-hidden rounded-lg flex flex-col items-center justify-center gap-1"
              style={{ background: `linear-gradient(145deg, ${primaryColor}cc, ${primaryColor}66)` }}
            >
              <div className="flex flex-wrap justify-center gap-[3px] px-1" style={{ maxWidth: 34 }}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    style={{
                      width: 8, height: 8,
                      borderRadius: "50%",
                      flexShrink: 0,
                      backgroundColor: i < 3 ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.2)",
                    }}
                  />
                ))}
              </div>
              <div style={{ fontSize: 5, fontWeight: 700, color: "rgba(255,255,255,0.75)", letterSpacing: "0.05em" }}>
                FIDÉLITÉ
              </div>
            </div>
          </div>
        </motion.div>

      </div>

      {/* Badge bas */}
      <motion.div
        className="absolute bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-white/70 backdrop-blur-sm"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
      >
        QR Code · NFC · Sans app à installer
      </motion.div>
    </IlluBox>
  );
}

function IlluLoyaltyStamp({ config }: { config: NonNullable<WalkthroughProps["loyaltyConfig"]> }) {
  const [stamps, setStamps] = useState(0);
  const [showBadge, setShowBadge] = useState(false);
  const target = Math.min(config.stampsRequired - 1, 5);

  useEffect(() => {
    let count = 0;
    const iv = setInterval(() => {
      count++;
      setStamps(count);
      if (count >= target) {
        clearInterval(iv);
        setTimeout(() => setShowBadge(true), 300);
      }
    }, 500);
    return () => clearInterval(iv);
  }, [target]);

  const fakeConfig = {
    ...config,
    id: "",
    businessId: "",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  return (
    <IlluBox gradient="linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)">
      <div className="relative flex w-full flex-col items-center">
        <div className="scale-[0.6] origin-top">
          <LoyaltyCardPreview
            config={fakeConfig}
            businessName="Mon Commerce"
            customerName="Marie M."
            totalStamps={stamps}
          />
        </div>

        {/* Merchant scanning */}
        <motion.div
          className="absolute right-6 top-6 flex items-center gap-2 rounded-2xl bg-indigo-600/80 px-3 py-2 text-xs font-semibold text-white backdrop-blur-sm"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          <span className="text-base">📱</span> Scan commerçant
        </motion.div>

        {/* Stamp credited badge */}
        <AnimatePresence>
          {showBadge && (
            <motion.div
              className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-2xl bg-emerald-500 px-4 py-2 shadow-xl"
              initial={{ opacity: 0, scale: 0.5, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
            >
              <span className="text-lg">{config.stampIcon}</span>
              <span className="text-sm font-bold text-white">+1 tampon crédité en temps réel !</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </IlluBox>
  );
}

function IlluLoyaltyStatus() {
  const levels = [
    { emoji: "🥉", name: "Bronze", color: "#cd7f32", req: "1", h: 72 },
    { emoji: "🥈", name: "Silver", color: "#94a3b8", req: "5", h: 88 },
    { emoji: "👑", name: "Gold", color: "#f59e0b", req: "10", h: 108 },
  ];
  return (
    <IlluBox gradient="linear-gradient(135deg, #431407 0%, #9a3412 100%)">
      <div className="flex flex-col items-center gap-4 px-6">
        <div className="flex items-end justify-center gap-3">
          {levels.map((l, i) => (
            <motion.div
              key={l.name}
              className="flex flex-col items-center gap-1.5"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.2, type: "spring", stiffness: 300 }}
            >
              <div
                className="flex flex-col items-center justify-center gap-1 rounded-2xl px-4"
                style={{
                  height: l.h,
                  backgroundColor: l.color + "22",
                  border: `2px solid ${l.color}60`,
                  boxShadow: i === 2 ? `0 0 24px ${l.color}50` : undefined,
                }}
              >
                <span style={{ fontSize: i === 2 ? "2rem" : "1.6rem" }}>{l.emoji}</span>
                <span className="text-xs font-bold text-white">{l.name}</span>
              </div>
              <span className="text-white/50 text-[10px]">≥ {l.req} récomp.</span>
            </motion.div>
          ))}
        </div>

        {/* Arrow progression */}
        <motion.div
          className="flex items-center gap-1 text-white/50 text-xs"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          <span>Créez vos paliers sur-mesure</span>
          <Trophy className="h-3 w-3 text-yellow-400" />
        </motion.div>
      </div>
    </IlluBox>
  );
}

function IlluReviews() {
  return (
    <IlluBox gradient="linear-gradient(135deg, #0c1445 0%, #1d4ed8 100%)">
      <div className="flex flex-col items-center gap-4">
        {/* Stars */}
        <div className="flex gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0, rotate: -20 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ delay: 0.3 + i * 0.15, type: "spring", stiffness: 500 }}
            >
              <Star className="h-9 w-9 fill-yellow-400 text-yellow-400 drop-shadow-lg" />
            </motion.div>
          ))}
        </div>

        {/* Google badge */}
        <motion.div
          className="flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-xl"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
        >
          <span className="text-base font-black tracking-tight">
            <span style={{ color: "#4285F4" }}>G</span>
            <span style={{ color: "#EA4335" }}>o</span>
            <span style={{ color: "#FBBC05" }}>o</span>
            <span style={{ color: "#4285F4" }}>g</span>
            <span style={{ color: "#34A853" }}>l</span>
            <span style={{ color: "#EA4335" }}>e</span>
          </span>
          <span className="text-sm font-semibold text-slate-600">Avis</span>
        </motion.div>

        {/* Trending */}
        <motion.div
          className="flex items-center gap-1.5 text-emerald-300 text-sm font-semibold"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6 }}
        >
          <TrendingUp className="h-4 w-4" />
          Visibilité locale boostée
        </motion.div>
      </div>
    </IlluBox>
  );
}

function IlluRoulette({ accentColor }: { accentColor: string }) {
  const [won, setWon] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setWon(true), 2800);
    return () => clearTimeout(t);
  }, []);

  return (
    <IlluBox gradient="linear-gradient(135deg, #4a0020 0%, #881337 100%)">
      <div className="flex items-center gap-6 px-8">
        <RouletteWheel />

        <div className="flex flex-col items-center gap-3">
          {/* Happy customer */}
          <motion.div
            className="flex flex-col items-center gap-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <motion.span
              className="text-4xl"
              animate={won ? { scale: [1, 1.3, 1], rotate: [0, 10, -10, 0] } : {}}
              transition={{ duration: 0.6 }}
            >
              {won ? "🥳" : "😊"}
            </motion.span>
            <span className="text-xs text-white/60">client</span>
          </motion.div>

          {/* Win badge */}
          <AnimatePresence>
            {won && (
              <motion.div
                className="rounded-2xl px-4 py-2.5 text-center shadow-2xl"
                style={{ backgroundColor: accentColor }}
                initial={{ opacity: 0, scale: 0.4, rotate: -15 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 18 }}
              >
                <div className="text-2xl">☕</div>
                <div className="text-xs font-black text-white">Café offert !</div>
              </motion.div>
            )}
          </AnimatePresence>

          {!won && (
            <div className="text-white/40 text-sm animate-pulse">En cours…</div>
          )}
        </div>
      </div>
    </IlluBox>
  );
}

export function IlluPricing({ className }: { className?: string } = {}) {
  return (
    <IlluBox gradient="linear-gradient(135deg, #052e16 0%, #065f46 100%)" className={className}>
      <div className="flex items-stretch gap-4 px-6">
        {/* Concurrents */}
        <motion.div
          className="flex flex-1 flex-col items-center rounded-2xl border border-white/10 bg-white/5 p-4 text-center"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <span className="text-3xl">😩</span>
          <p className="mt-1 text-xs font-semibold text-white/50">Concurrents</p>
          <p className="mt-1 text-2xl font-black text-white">50€+</p>
          <p className="text-[10px] text-white/30">/mois</p>
          <div className="mt-2 space-y-0.5 text-[11px] text-red-400/80">
            <p>❌ Compliqué</p>
            <p>❌ Cher</p>
            <p>❌ Limité</p>
          </div>
        </motion.div>

        {/* VS */}
        <div className="flex items-center text-xs font-black text-white/30">VS</div>

        {/* TocTocToc */}
        <motion.div
          className="flex flex-1 flex-col items-center rounded-2xl border-2 border-emerald-400/60 bg-emerald-900/30 p-4 text-center"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          style={{ boxShadow: "0 0 32px rgba(52,211,153,0.25)" }}
        >
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <img src="/logo.png" alt="TocTocToc" className="h-8 w-8 object-contain" />
          </motion.div>
          <p className="mt-1 text-xs font-bold text-emerald-300">TocTocToc</p>
          <p className="mt-0.5 text-sm line-through text-white/40">18€</p>
          <p className="text-2xl font-black text-white">9€</p>
          <p className="text-[10px] text-white/30">/mois</p>
          <p className="text-[9px] font-bold text-amber-400">-50% à vie</p>
          <div className="mt-1 space-y-0.5 text-[11px] text-emerald-300">
            <p>✅ Simple</p>
            <p>✅ Complet</p>
            <p>✅ 5 min</p>
          </div>
        </motion.div>
      </div>
    </IlluBox>
  );
}

function IlluCta({ primaryColor }: { primaryColor: string }) {
  return (
    <IlluBox gradient={`linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}88 100%)`}>
      <div className="flex flex-col items-center gap-4">
        <motion.div
          className="text-7xl"
          animate={{ y: [0, -12, 0], rotate: [0, 8, -4, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        >
          🚀
        </motion.div>
        <div className="flex gap-3">
          {["🎯 Fidélité", "⭐ Avis", "🌐 Vitrine"].map((label, i) => (
            <motion.div
              key={label}
              className="rounded-xl bg-white/20 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-sm"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.15 }}
            >
              {label}
            </motion.div>
          ))}
        </div>
      </div>
    </IlluBox>
  );
}

// ─── Définition des slides ────────────────────────────────────────────────────

interface Slide {
  id: string;
  title: string;
  subtitle: string;
  illu: () => React.ReactNode;
}

function buildSlides(props: WalkthroughProps): Slide[] {
  const { businessName, primaryColor = "#4f46e5", accentColor = "#f59e0b", loyaltyConfig, logoUrl } = props;

  const config = loyaltyConfig ?? {
    cardColor: primaryColor,
    cardTextColor: "#ffffff",
    stampColor: accentColor,
    stampIcon: "⭐",
    stampsRequired: 8,
    rewardName: "Un produit offert",
    rewardDescription: null,
    stampExpiryDays: null,
  };

  return [
    {
      id: "welcome",
      title: `Bienvenue, ${businessName} ! 🎉`,
      subtitle:
        "Votre commerce local entre dans l'ère digitale. Carte de fidélité, avis Google gamifiés, site vitrine — tout en 5 minutes.",
      illu: () => <IlluWelcome businessName={businessName} primaryColor={primaryColor} logoUrl={logoUrl} />,
    },
    {
      id: "loyalty-scan",
      title: "Carte de fidélité digitale",
      subtitle:
        "Imprimez votre QR code (ou utilisez le NFC) et posez-le sur votre comptoir. Vos clients scannent avec leur téléphone — sans app à installer.",
      illu: () => <IlluLoyaltyScan primaryColor={primaryColor} />,
    },
    {
      id: "loyalty-stamp",
      title: "Tamponnez en 1 clic ✓",
      subtitle:
        "Depuis votre smartphone, scannez la carte du client. Le tampon s'affiche instantanément sur son téléphone. Fini les cartes papier perdues ou oubliées !",
      illu: () => <IlluLoyaltyStamp config={config} />,
    },
    {
      id: "loyalty-status",
      title: "Créez des clients VIP 👑",
      subtitle:
        "Définissez des paliers de fidélité sur-mesure. Plus vos clients cumulent de récompenses, plus ils montent en statut et débloquent des avantages exclusifs.",
      illu: () => <IlluLoyaltyStatus />,
    },
    {
      id: "reviews-collect",
      title: "Dopez vos avis Google ⭐",
      subtitle:
        "Un QR code posé sur le comptoir suffit. Vos clients laissent un avis Google en 10 secondes. Plus d'avis = meilleure position dans les recherches locales.",
      illu: () => <IlluReviews />,
    },
    {
      id: "reviews-roulette",
      title: "La roulette qui récompense 🎰",
      subtitle:
        "Après leur avis, vos clients tentent leur chance avec votre roulette personnalisée. Café offert, réduction, cadeau mystère… Un client récompensé revient !",
      illu: () => <IlluRoulette accentColor={accentColor} />,
    },
    {
      id: "pricing",
      title: "Simple, complet et pas cher 💸",
      subtitle:
        "Site vitrine + Réservations + Avis gamifiés + Fidélité VIP. Tout inclus à partir de 9€/mois au lieu de 18€ (-50% offre de lancement à vie) — là où vos concurrents facturent 50€+ pour moins de fonctionnalités.",
      illu: () => <IlluPricing />,
    },
    {
      id: "cta",
      title: "C'est parti, lancez-vous ! 🚀",
      subtitle:
        "Configurez vos modules en quelques clics. Vos premiers QR codes seront prêts à l'impression dans la minute.",
      illu: () => <IlluCta primaryColor={primaryColor} />,
    },
  ];
}

// ─── Variants framer-motion ───────────────────────────────────────────────────

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? "55%" : "-55%", opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? "-55%" : "55%", opacity: 0 }),
};

// ─── Contenu du modal ─────────────────────────────────────────────────────────

function WalkthroughContent({
  onClose,
  ...props
}: WalkthroughProps & { onClose: (finished: boolean) => void }) {
  const [slide, setSlide] = useState(0);
  const [dir, setDir] = useState(1);
  const slides = useMemo(() => buildSlides(props), [props.businessId]); // eslint-disable-line
  const current = slides[slide];
  const isLast = slide === slides.length - 1;

  function goTo(next: number) {
    setDir(next > slide ? 1 : -1);
    setSlide(next);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(15,23,42,0.80)", backdropFilter: "blur(6px)" }}
    >
      <motion.div
        className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl"
        initial={{ opacity: 0, scale: 0.94, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 8 }}
        transition={{ type: "spring", stiffness: 320, damping: 26 }}
      >
        {/* Bouton fermer */}
        <button
          onClick={() => onClose(false)}
          className="absolute right-3 top-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-black/25 text-white backdrop-blur-sm transition hover:bg-black/45"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Illustration (transition horizontale) */}
        <div className="overflow-hidden">
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={slide + "-illu"}
              custom={dir}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
            >
              {current.illu()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Texte */}
        <div className="px-6 pb-6 pt-5">
          <AnimatePresence mode="wait">
            <motion.div
              key={slide + "-text"}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22 }}
            >
              <h2 className="text-xl font-black leading-tight text-slate-900">{current.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">{current.subtitle}</p>

              {/* CTA sur le dernier slide */}
              {isLast && (
                <div className="mt-5 flex flex-col gap-2">
                  <Link
                    href={`/dashboard/${props.businessId}/loyalty/settings`}
                    onClick={() => onClose(true)}
                    className="flex items-center justify-between rounded-2xl bg-indigo-50 px-4 py-3 text-sm font-bold text-indigo-700 transition hover:bg-indigo-100"
                  >
                    <span>🎯 Configurer ma carte de fidélité</span>
                    <ExternalLink className="h-3.5 w-3.5 opacity-50" />
                  </Link>
                  <Link
                    href={`/dashboard/${props.businessId}/reviews/settings`}
                    onClick={() => onClose(true)}
                    className="flex items-center justify-between rounded-2xl bg-amber-50 px-4 py-3 text-sm font-bold text-amber-700 transition hover:bg-amber-100"
                  >
                    <span>⭐ Configurer mes avis & roulette</span>
                    <ExternalLink className="h-3.5 w-3.5 opacity-50" />
                  </Link>
                  <Link
                    href={`/dashboard/${props.businessId}/showcase`}
                    onClick={() => onClose(true)}
                    className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-100"
                  >
                    <span>🌐 Personnaliser mon site vitrine</span>
                    <ExternalLink className="h-3.5 w-3.5 opacity-50" />
                  </Link>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="mt-5 flex items-center justify-between">
            {/* Dots */}
            <div className="flex gap-1.5">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className={`rounded-full transition-all duration-300 ${
                    i === slide
                      ? "w-5 h-2 bg-indigo-500"
                      : i < slide
                      ? "w-2 h-2 bg-indigo-200"
                      : "w-2 h-2 bg-slate-200"
                  }`}
                />
              ))}
            </div>

            {/* Prev / Next */}
            <div className="flex items-center gap-2">
              {slide > 0 && (
                <button
                  onClick={() => goTo(slide - 1)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-400 transition hover:bg-slate-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
              )}
              {isLast ? (
                <button
                  onClick={() => onClose(true)}
                  className="rounded-xl bg-slate-900 px-5 py-2 text-sm font-bold text-white transition hover:bg-slate-700"
                >
                  Fermer
                </button>
              ) : (
                <button
                  onClick={() => goTo(slide + 1)}
                  className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white transition hover:bg-slate-700"
                >
                  Suivant <ChevronRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Modal promo post-walkthrough ─────────────────────────────────────────────

function PromoCodeModal({
  promoCode,
  businessName,
  onClose,
}: {
  promoCode: string;
  businessName: string;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(promoCode);
    setCopied(true);
    toast.success("Code copié !");
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(15,23,42,0.80)", backdropFilter: "blur(6px)" }}
    >
      <motion.div
        className="relative w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-2xl"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 10 }}
        transition={{ type: "spring", stiffness: 320, damping: 26 }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-3 top-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-black/10 text-slate-400 transition hover:bg-black/20"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header gradient */}
        <div className="flex flex-col items-center bg-gradient-to-br from-violet-600 to-indigo-600 px-6 pb-8 pt-10">
          <motion.div
            animate={{ y: [0, -6, 0], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <Gift className="h-14 w-14 text-white drop-shadow-lg" />
          </motion.div>
          <h2 className="mt-4 text-xl font-black text-white">
            Un cadeau rien que pour vous !
          </h2>
        </div>

        {/* Body */}
        <div className="px-6 pb-6 pt-5">
          <p className="text-center text-sm text-slate-500">
            Ce code a été créé spécialement pour{" "}
            <strong className="text-slate-700">{businessName}</strong>.
            Il n&apos;est valable qu&apos;une seule fois.
          </p>

          {/* Code box */}
          <button
            onClick={handleCopy}
            className="group mt-4 flex w-full items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-violet-300 bg-violet-50 px-4 py-4 transition hover:border-violet-400 hover:bg-violet-100"
          >
            <span className="text-2xl font-black tracking-widest text-violet-700">
              {promoCode}
            </span>
            {copied ? (
              <Check className="h-5 w-5 text-emerald-500" />
            ) : (
              <Copy className="h-5 w-5 text-violet-400 transition group-hover:text-violet-600" />
            )}
          </button>

          <p className="mt-3 text-center text-sm font-bold text-amber-600">
            -40% sur votre premier abonnement
          </p>

          {/* CTA */}
          <Link
            href="/dashboard/billing"
            onClick={onClose}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-violet-700"
          >
            Découvrir les plans →
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Auto-affichage (1ère visite) ─────────────────────────────────────────────

export function WalkthroughAutoShow(props: WalkthroughProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showPromo, setShowPromo] = useState(false);

  useEffect(() => {
    const key = `ttt_wt_${props.businessId}`;
    if (!localStorage.getItem(key)) {
      const t = setTimeout(() => setIsOpen(true), 700);
      return () => clearTimeout(t);
    }
  }, [props.businessId]);

  function handleClose(finished: boolean) {
    localStorage.setItem(`ttt_wt_${props.businessId}`, "1");
    setIsOpen(false);
    if (props.promoCode) {
      setTimeout(() => setShowPromo(true), 400);
    } else if (!finished) {
      toast("Retrouvez ce guide avec le bouton « Revoir la démo »", {
        icon: "💡",
        duration: 5000,
      });
    }
  }

  return (
    <>
      <AnimatePresence>
        {isOpen && <WalkthroughContent {...props} onClose={handleClose} />}
      </AnimatePresence>
      <AnimatePresence>
        {showPromo && props.promoCode && (
          <PromoCodeModal
            promoCode={props.promoCode}
            businessName={props.businessName}
            onClose={() => setShowPromo(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Bouton "Revoir la démo" ──────────────────────────────────────────────────

export function WalkthroughButton(props: WalkthroughProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"
      >
        <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
        Revoir la démo
      </button>
      <AnimatePresence>
        {isOpen && (
          <WalkthroughContent {...props} onClose={() => setIsOpen(false)} />
        )}
      </AnimatePresence>
    </>
  );
}
