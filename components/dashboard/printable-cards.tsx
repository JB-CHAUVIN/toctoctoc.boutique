"use client";

import { useRef, useState, useCallback } from "react";
import QRCode from "qrcode";
import { toPng } from "html-to-image";
import { Download, ChevronLeft, ChevronRight, Wifi, QrCode, Gift, Star } from "lucide-react";
import { useEffect } from "react";

interface Props {
  businessName: string;
  slug: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  appUrl: string;
  hasReviews: boolean;
  hasLoyalty: boolean;
}

interface CardDef {
  id: string;
  type: "reviews" | "loyalty";
  hasNFC: boolean;
  hasReward: boolean;
}

const REVIEW_CARDS: CardDef[] = [
  { id: "r-nfc-reward", type: "reviews", hasNFC: true,  hasReward: true  },
  { id: "r-qr-reward",  type: "reviews", hasNFC: false, hasReward: true  },
  { id: "r-nfc",        type: "reviews", hasNFC: true,  hasReward: false },
  { id: "r-qr",         type: "reviews", hasNFC: false, hasReward: false },
];

const LOYALTY_CARDS: CardDef[] = [
  { id: "l-nfc", type: "loyalty", hasNFC: true,  hasReward: true },
  { id: "l-qr",  type: "loyalty", hasNFC: false, hasReward: true },
];

// ── Card renderer (pure, capturable) ──────────────────────────────────────────
function PrintCard({
  card, businessName, primaryColor, secondaryColor, accentColor, qrDataUrl,
  style, className,
}: {
  card: CardDef;
  businessName: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  qrDataUrl: string;
  style?: React.CSSProperties;
  className?: string;
}) {
  const isReviews = card.type === "reviews";
  const initial = businessName[0]?.toUpperCase() ?? "?";

  // Gradient background
  const bg = `linear-gradient(145deg, ${primaryColor} 0%, ${secondaryColor} 100%)`;

  return (
    <div
      className={className}
      style={{
        // 10×15cm at 96dpi ≈ 378×567px. We display at 220×330 and scale for download
        width: 220, height: 330,
        background: bg,
        borderRadius: 16,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "20px 16px 16px",
        overflow: "hidden",
        position: "relative",
        fontFamily: "Inter, system-ui, sans-serif",
        ...style,
      }}
    >
      {/* Decorative blobs */}
      <div style={{
        position: "absolute", width: 180, height: 180, borderRadius: "50%",
        background: "rgba(255,255,255,0.06)", top: -60, right: -60,
      }} />
      <div style={{
        position: "absolute", width: 120, height: 120, borderRadius: "50%",
        background: "rgba(255,255,255,0.04)", bottom: 80, left: -40,
      }} />

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", zIndex: 1 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: accentColor,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 16, fontWeight: 800, color: "#fff",
        }}>
          {initial}
        </div>
        <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.8)", letterSpacing: 0.3 }}>
          {businessName}
        </span>
      </div>

      {/* Main content */}
      <div style={{ textAlign: "center", zIndex: 1, flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
        {/* Icon */}
        <div style={{
          fontSize: 32, lineHeight: 1,
          filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.2))",
        }}>
          {isReviews ? "⭐" : "🎯"}
        </div>

        {/* Title */}
        <div style={{ fontSize: 20, fontWeight: 800, color: "#fff", lineHeight: 1.2, textAlign: "center", letterSpacing: -0.3 }}>
          {isReviews ? (
            <>Laissez-nous<br />un avis Google</>
          ) : (
            <>Votre carte<br />de fidélité</>
          )}
        </div>

        {/* Reward badge */}
        {card.hasReward && (
          <div style={{
            display: "flex", alignItems: "center", gap: 5,
            background: accentColor,
            borderRadius: 20, padding: "5px 12px",
            fontSize: 10, fontWeight: 700, color: "#fff",
            boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
          }}>
            🎁 {isReviews ? "Récompense à la clé !" : "Cadeaux à gagner !"}
          </div>
        )}

        {/* Instruction */}
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.7)", textAlign: "center", lineHeight: 1.4 }}>
          {card.hasNFC
            ? isReviews
              ? "Scannez le QR code ou approchez\nvotre téléphone pour laisser un avis"
              : "Scannez le QR code ou approchez\nvotre téléphone pour ouvrir votre carte"
            : isReviews
              ? "Scannez le QR code pour\nnous laisser un avis"
              : "Scannez le QR code pour\nouvrir votre carte de fidélité"}
        </div>
      </div>

      {/* QR + NFC row */}
      <div style={{ display: "flex", alignItems: "flex-end", gap: 10, zIndex: 1, width: "100%" }}>
        {/* QR code */}
        <div style={{
          flex: 1,
          background: "#fff",
          borderRadius: 12,
          padding: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 4,
          boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
        }}>
          {qrDataUrl ? (
            <img src={qrDataUrl} alt="QR" style={{ width: 72, height: 72, borderRadius: 4 }} />
          ) : (
            <div style={{ width: 72, height: 72, background: "#f1f5f9", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 20 }}>⬛</span>
            </div>
          )}
          <span style={{ fontSize: 8, fontWeight: 600, color: "#64748b", letterSpacing: 0.5, textTransform: "uppercase" }}>
            Scanner
          </span>
        </div>

        {/* NFC badge */}
        {card.hasNFC && (
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
            background: "rgba(255,255,255,0.15)",
            borderRadius: 12, padding: "10px 12px",
            backdropFilter: "blur(4px)",
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 12C20 16.4183 16.4183 20 12 20M17 12C17 14.7614 14.7614 17 12 17M14 12C14 13.1046 13.1046 14 12 14" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
              <circle cx="12" cy="12" r="2" fill="white"/>
            </svg>
            <span style={{ fontSize: 7, fontWeight: 700, color: "rgba(255,255,255,0.9)", letterSpacing: 0.5, textTransform: "uppercase", textAlign: "center", lineHeight: 1.2 }}>
              NFC<br/>Tap
            </span>
          </div>
        )}
      </div>

      {/* Powered by */}
      <div style={{ fontSize: 7, color: "rgba(255,255,255,0.35)", marginTop: 8, zIndex: 1 }}>
        toctoctoc.boutique
      </div>
    </div>
  );
}

// ── Card Stack ─────────────────────────────────────────────────────────────────
function CardStack({
  cards, businessName, primaryColor, secondaryColor, accentColor,
  reviewsUrl, loyaltyUrl,
}: {
  cards: CardDef[];
  businessName: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  reviewsUrl: string;
  loyaltyUrl: string;
}) {
  const [index, setIndex] = useState(0);
  const [downloading, setDownloading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const [qrUrls, setQrUrls] = useState<Record<string, string>>({});

  // Pre-generate QR codes
  useEffect(() => {
    const generate = async () => {
      const urls: Record<string, string> = {};
      for (const card of cards) {
        const url = card.type === "reviews" ? reviewsUrl : loyaltyUrl;
        urls[card.id] = await QRCode.toDataURL(url, {
          width: 200, margin: 1,
          color: { dark: "#1e293b", light: "#ffffff" },
        });
      }
      setQrUrls(urls);
    };
    generate();
  }, [cards, reviewsUrl, loyaltyUrl]);

  const current = cards[index];
  const prev = () => setIndex((i) => (i - 1 + cards.length) % cards.length);
  const next = () => setIndex((i) => (i + 1) % cards.length);

  const handleDownload = useCallback(async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      // Scale up 4× for print quality
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 4,
        backgroundColor: undefined,
      });
      const link = document.createElement("a");
      link.download = `carte-${current.type}-${current.id}.png`;
      link.href = dataUrl;
      link.click();
    } catch (e) {
      console.error(e);
    } finally {
      setDownloading(false);
    }
  }, [current]);

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Stack visual */}
      <div style={{ position: "relative", width: 220, height: 340 }}>
        {/* Cards behind */}
        {cards.length > 1 && (
          <div style={{
            position: "absolute", top: 8, left: 8, opacity: 0.35,
            transform: "rotate(3deg)", pointerEvents: "none",
          }}>
            <PrintCard
              card={cards[(index + 1) % cards.length]}
              businessName={businessName}
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
              accentColor={accentColor}
              qrDataUrl={qrUrls[cards[(index + 1) % cards.length].id] ?? ""}
            />
          </div>
        )}
        {cards.length > 2 && (
          <div style={{
            position: "absolute", top: 4, left: 4, opacity: 0.2,
            transform: "rotate(6deg)", pointerEvents: "none",
          }}>
            <PrintCard
              card={cards[(index + 2) % cards.length]}
              businessName={businessName}
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
              accentColor={accentColor}
              qrDataUrl={qrUrls[cards[(index + 2) % cards.length].id] ?? ""}
            />
          </div>
        )}

        {/* Active card */}
        <div ref={cardRef} style={{ position: "absolute", top: 0, left: 0 }}>
          <PrintCard
            card={current}
            businessName={businessName}
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
            accentColor={accentColor}
            qrDataUrl={qrUrls[current.id] ?? ""}
          />
        </div>
      </div>

      {/* Card label */}
      <div className="text-center">
        <p className="text-xs font-medium text-slate-700">
          {current.type === "reviews" ? "Avis Google" : "Carte de fidélité"}
          {current.hasNFC && " · NFC + QR"}
          {!current.hasNFC && " · QR uniquement"}
          {current.hasReward && " · Récompense"}
        </p>
        {/* Dots */}
        <div className="mt-1 flex justify-center gap-1">
          {cards.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`h-1.5 rounded-full transition-all ${i === index ? "w-4 bg-indigo-500" : "w-1.5 bg-slate-300"}`}
            />
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={prev}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:bg-slate-50 hover:text-slate-800"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-xs font-medium text-white shadow-sm transition hover:bg-slate-700 disabled:opacity-50"
        >
          <Download className="h-3.5 w-3.5" />
          {downloading ? "Export…" : "Télécharger PNG"}
        </button>
        <button
          onClick={next}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:bg-slate-50 hover:text-slate-800"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// ── Main export ────────────────────────────────────────────────────────────────
export function PrintableCards({
  businessName, slug, primaryColor, secondaryColor, accentColor,
  appUrl, hasReviews, hasLoyalty,
}: Props) {
  if (!hasReviews && !hasLoyalty) return null;

  const reviewsUrl = `${appUrl}/${slug}/avis`;
  const loyaltyUrl = `${appUrl}/${slug}/fidelite`;

  const shared = { businessName, primaryColor, secondaryColor, accentColor, reviewsUrl, loyaltyUrl };

  return (
    <div className="mb-8">
      <h2 className="mb-1 text-sm font-semibold uppercase tracking-wider text-slate-400">
        Impressions
      </h2>
      <p className="mb-4 text-xs text-slate-400">
        Cartes 10×15cm à imprimer et poser en caisse. Téléchargez en PNG haute résolution.
      </p>

      <div className="flex flex-wrap gap-10">
        {hasReviews && (
          <div>
            <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
              <span>⭐</span> Avis Google
              <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-xs text-slate-400">4 variantes</span>
            </p>
            <CardStack cards={REVIEW_CARDS} {...shared} />
          </div>
        )}

        {hasLoyalty && (
          <div>
            <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
              <span>🎯</span> Fidélité
              <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-xs text-slate-400">2 variantes</span>
            </p>
            <CardStack cards={LOYALTY_CARDS} {...shared} />
          </div>
        )}
      </div>
    </div>
  );
}
