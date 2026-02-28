"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import QRCode from "qrcode";
import { toPng } from "html-to-image";
import { Download, ChevronLeft, ChevronRight } from "lucide-react";

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

const SIZE_OPTIONS = [
  { id: "5x5",   label: "5 × 5 cm",   cardW: 175, cardH: 175 },
  { id: "10x10", label: "10 × 10 cm", cardW: 215, cardH: 215 },
  { id: "10x15", label: "10 × 15 cm", cardW: 220, cardH: 330 },
] as const;
type SizeId = typeof SIZE_OPTIONS[number]["id"];

// 3× the display size → exported at pixelRatio 2 → ~300-340 DPI
const DOWNLOAD_SCALE = 3;

// ── Inline SVG icons (no emoji, consistent across OS) ────────────────────────

function IconStar({ size = 36, color = "#fff" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M12 2l2.83 5.73 6.32.92-4.57 4.45 1.08 6.28L12 16.52l-5.66 2.98 1.08-6.28L2.85 8.65l6.32-.92L12 2z" />
    </svg>
  );
}

function IconLoyalty({ size = 36, color = "#fff" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="6" width="20" height="14" rx="3" />
      <path d="M2 11h20" />
      <circle cx="7.5" cy="16" r="1.2" fill={color} stroke="none" />
      <circle cx="11.5" cy="16" r="1.2" fill={color} stroke="none" />
      <circle cx="15.5" cy="16" r="1.2" fill={color} stroke="none" />
      <path d="M8 6V4a4 4 0 018 0v2" />
    </svg>
  );
}

function IconGift({ size = 14, color = "#fff" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 12 20 22 4 22 4 12" />
      <rect x="2" y="7" width="20" height="5" rx="1" />
      <line x1="12" y1="22" x2="12" y2="7" />
      <path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z" />
      <path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z" />
    </svg>
  );
}

function NfcPhoneIllustration({ scale = 1 }: { scale?: number }) {
  return (
    <svg width={52 * scale} height={52 * scale} viewBox="0 0 52 52" fill="none">
      {/* Phone body */}
      <rect x="13" y="0" width="26" height="32" rx="5" fill="rgba(255,255,255,0.88)" />
      {/* Camera dot */}
      <circle cx="26" cy="3" r="1.2" fill="rgba(0,0,0,0.12)" />
      {/* Screen area */}
      <rect x="16" y="6" width="20" height="20" rx="2" fill="rgba(0,0,0,0.10)" />
      {/* Home bar */}
      <rect x="21" y="28" width="10" height="1.5" rx="1" fill="rgba(0,0,0,0.10)" />

      {/* Motion indicator: dashes */}
      <line x1="26" y1="34" x2="26" y2="38" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="2 2" />
      {/* Arrowhead pointing down */}
      <polyline points="23,36 26,40 29,36" stroke="rgba(255,255,255,0.75)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />

      {/* Card / terminal surface */}
      <rect x="5" y="44" width="42" height="8" rx="3" fill="rgba(255,255,255,0.22)" />
      {/* NFC ripples on card */}
      <path d="M19 48 Q26 45 33 48" stroke="rgba(255,255,255,0.45)" strokeWidth="1" strokeLinecap="round" />
      <path d="M22 49.5 Q26 47.5 30 49.5" stroke="rgba(255,255,255,0.65)" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}

function IconLogo({ size = 12, logoB64 }: { size?: number; logoB64?: string }) {
  if (!logoB64) return null;
  return (
    <img
      src={logoB64}
      alt=""
      style={{ width: size, height: size, borderRadius: 2, objectFit: "contain", display: "inline-block", verticalAlign: "middle" }}
    />
  );
}

// ── PrintCard ────────────────────────────────────────────────────────────────
function PrintCard({
  card, businessName, primaryColor, secondaryColor, accentColor,
  qrDataUrl, logoB64, style, cardW = 220, cardH = 330,
}: {
  card: CardDef;
  businessName: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  qrDataUrl: string;
  logoB64?: string;
  style?: React.CSSProperties;
  cardW?: number;
  cardH?: number;
}) {
  const isReviews = card.type === "reviews";
  const isSquare = cardH <= cardW;
  const initial = businessName[0]?.toUpperCase() ?? "?";
  const bg = `linear-gradient(145deg, ${primaryColor} 0%, ${secondaryColor} 100%)`;
  // Scale factor relative to the base portrait card (220×330)
  const s = Math.min(cardW / 220, cardH / 330);
  const px = (n: number) => n * s;

  const boxStyle: React.CSSProperties = {
    flex: 1,
    borderRadius: px(10),
    padding: `${px(10)}px ${px(8)}px ${px(8)}px`,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: px(4),
  };

  return (
    <div style={{
      width: cardW, height: cardH,
      background: bg,
      borderRadius: px(16),
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: `${px(16)}px ${px(14)}px ${px(12)}px`,
      overflow: "hidden",
      position: "relative",
      fontFamily: "Inter, system-ui, -apple-system, sans-serif",
      ...style,
    }}>
      {/* Decorative circles */}
      <div style={{ position: "absolute", width: px(160), height: px(160), borderRadius: "50%", background: "rgba(255,255,255,0.07)", top: -px(50), right: -px(50), pointerEvents: "none" }} />
      <div style={{ position: "absolute", width: px(100), height: px(100), borderRadius: "50%", background: "rgba(255,255,255,0.04)", bottom: px(60), left: -px(30), pointerEvents: "none" }} />

      {/* Header: business name */}
      <div style={{ display: "flex", alignItems: "center", gap: px(6), width: "100%", zIndex: 1 }}>
        <div style={{
          width: px(28), height: px(28), borderRadius: px(7),
          background: accentColor,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: px(13), fontWeight: 800, color: "#fff", flexShrink: 0,
        }}>
          {initial}
        </div>
        <span style={{ fontSize: px(10), fontWeight: 600, color: "rgba(255,255,255,0.75)", letterSpacing: 0.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {businessName}
        </span>
      </div>

      {/* Main content */}
      <div style={{ zIndex: 1, flex: 1, minHeight: 0, overflow: "hidden", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: px(8), textAlign: "center", padding: `${px(4)}px 0` }}>
        {isReviews
          ? <IconStar size={px(34)} color="#fff" />
          : <IconLoyalty size={px(34)} color="#fff" />
        }

        <div style={{ fontSize: px(19), fontWeight: 800, color: "#fff", lineHeight: 1.2, letterSpacing: -0.5 }}>
          {isReviews ? <>Laissez-nous<br />un avis Google</> : <>Votre carte<br />de fidélité</>}
        </div>

        {card.hasReward && (
          <div style={{
            display: "inline-flex", alignItems: "center", gap: px(5),
            background: accentColor,
            borderRadius: px(20), padding: `${px(5)}px ${px(11)}px`,
            fontSize: px(9.5), fontWeight: 700, color: "#fff",
            boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
          }}>
            <IconGift size={px(11)} color="#fff" />
            {isReviews ? "Récompense à la clé !" : "Cadeaux à gagner !"}
          </div>
        )}

        {/* Instruction — masquée sur format carré pour économiser l'espace */}
        {!isSquare && (
          <div style={{ fontSize: px(9.5), color: "rgba(255,255,255,0.65)", lineHeight: 1.45 }}>
            {card.hasNFC
              ? isReviews
                ? "Scannez le QR code ou approchez\nvotre téléphone pour laisser un avis"
                : "Scannez le QR code ou approchez\nvotre téléphone pour ouvrir votre carte"
              : isReviews
                ? "Scannez le QR code pour\nnous laisser un avis Google"
                : "Scannez le QR code pour\nouvrir votre carte de fidélité"
            }
          </div>
        )}
      </div>

      {/* Bottom: QR + NFC */}
      <div style={{ display: "flex", gap: px(8), width: "100%", zIndex: 1, alignItems: "stretch" }}>
        <div style={{ ...boxStyle, background: "#fff", boxShadow: "0 4px 12px rgba(0,0,0,0.2)" }}>
          {qrDataUrl ? (
            <img src={qrDataUrl} alt="QR" style={{ width: px(64), height: px(64), borderRadius: px(3) }} />
          ) : (
            <div style={{ width: px(64), height: px(64), background: "#f1f5f9", borderRadius: px(3) }} />
          )}
          <span style={{ fontSize: px(7.5), fontWeight: 700, color: "#64748b", letterSpacing: 0.8, textTransform: "uppercase" }}>
            Scanner
          </span>
        </div>

        {card.hasNFC && (
          <div style={{
            ...boxStyle,
            background: "rgba(255,255,255,0.12)",
            border: `${Math.max(1, px(1.5))}px solid rgba(255,255,255,0.5)`,
            boxShadow: "0 0 0 0.5px rgba(255,255,255,0.15) inset",
            gap: px(2),
          }}>
            <NfcPhoneIllustration scale={s} />
            <span style={{ fontSize: px(7.5), fontWeight: 700, color: "rgba(255,255,255,0.95)", letterSpacing: 0.2, textAlign: "center", lineHeight: 1.4 }}>
              Approchez<br />votre téléphone
            </span>
            {!isSquare && (
              <span style={{ fontSize: px(6.5), fontWeight: 500, color: "rgba(255,255,255,0.55)", letterSpacing: 0.5, textTransform: "uppercase" }}>
                Sans contact
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{
        marginTop: px(5), zIndex: 1,
        display: "flex", alignItems: "center", gap: px(4),
        opacity: 0.45,
      }}>
        <IconLogo size={px(10)} logoB64={logoB64} />
        <span style={{ fontSize: px(6.5), fontWeight: 800, color: "#fff", letterSpacing: 0.2, marginBottom: px(-2) }}>
          TocTocToc.boutique
        </span>
      </div>
    </div>
  );
}

// ── CardStack ─────────────────────────────────────────────────────────────────
function CardStack({
  cards, businessName, primaryColor, secondaryColor, accentColor,
  reviewsUrl, loyaltyUrl, logoB64,
}: {
  cards: CardDef[];
  businessName: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  reviewsUrl: string;
  loyaltyUrl: string;
  logoB64?: string;
}) {
  const [index, setIndex] = useState(0);
  const [sizeId, setSizeId] = useState<SizeId>("10x15");
  const [downloading, setDownloading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const downloadRef = useRef<HTMLDivElement>(null);
  const [qrUrls, setQrUrls] = useState<Record<string, string>>({});

  const sizeOpt = SIZE_OPTIONS.find((o) => o.id === sizeId)!;
  const { cardW, cardH } = sizeOpt;

  useEffect(() => {
    const generate = async () => {
      const urls: Record<string, string> = {};
      for (const card of cards) {
        const url = card.type === "reviews" ? reviewsUrl : loyaltyUrl;
        urls[card.id] = await QRCode.toDataURL(url, {
          width: 600, margin: 1,
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
    if (!downloadRef.current) return;
    setDownloading(true);
    try {
      // Render from the hidden 3× card → pixelRatio 2 → ~300-340 DPI output
      const dataUrl = await toPng(downloadRef.current, { pixelRatio: 2 });
      const link = document.createElement("a");
      link.download = `carte-${current.type}-${current.id}-${sizeId}.png`;
      link.href = dataUrl;
      link.click();
    } catch (e) {
      console.error(e);
    } finally {
      setDownloading(false);
    }
  }, [current, sizeId]);

  const shared = { businessName, primaryColor, secondaryColor, accentColor, logoB64, cardW, cardH };

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Size selector */}
      <div className="flex gap-1 rounded-lg bg-slate-100 p-1">
        {SIZE_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            onClick={() => setSizeId(opt.id)}
            className={`rounded-md px-3 py-1 text-xs font-medium transition-all ${
              sizeId === opt.id
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Stack */}
      <div style={{ position: "relative", width: cardW + 16, height: cardH + 15 }}>
        {cards.length > 2 && (
          <div style={{ position: "absolute", top: 10, left: 8, opacity: 0.2, transform: "rotate(5deg)", pointerEvents: "none" }}>
            <PrintCard card={cards[(index + 2) % cards.length]} qrDataUrl={qrUrls[cards[(index + 2) % cards.length].id] ?? ""} {...shared} />
          </div>
        )}
        {cards.length > 1 && (
          <div style={{ position: "absolute", top: 6, left: 4, opacity: 0.4, transform: "rotate(2.5deg)", pointerEvents: "none" }}>
            <PrintCard card={cards[(index + 1) % cards.length]} qrDataUrl={qrUrls[cards[(index + 1) % cards.length].id] ?? ""} {...shared} />
          </div>
        )}
        <div ref={cardRef} style={{ position: "absolute", top: 0, left: 0 }}>
          <PrintCard card={current} qrDataUrl={qrUrls[current.id] ?? ""} {...shared} />
        </div>
      </div>

      {/* Label + dots */}
      <div className="text-center">
        <p className="text-xs font-medium text-slate-600">
          {current.hasNFC ? "NFC + QR" : "QR uniquement"}
          {current.hasReward && " · Récompense"}
        </p>
        <div className="mt-1.5 flex justify-center gap-1">
          {cards.map((_, i) => (
            <button key={i} onClick={() => setIndex(i)}
              className={`h-1.5 rounded-full transition-all ${i === index ? "w-4 bg-indigo-500" : "w-1.5 bg-slate-200"}`}
            />
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        <button onClick={prev} className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:bg-slate-50">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button onClick={handleDownload} disabled={downloading}
          className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-700 disabled:opacity-50"
        >
          <Download className="h-3.5 w-3.5" />
          {downloading ? "Export…" : "Télécharger PNG"}
        </button>
        <button onClick={next} className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:bg-slate-50">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Hidden high-resolution card for download (3× display size) */}
      <div style={{ position: "fixed", left: -99999, top: -99999, pointerEvents: "none", opacity: 0 }} aria-hidden>
        <div ref={downloadRef}>
          <PrintCard
            card={current}
            qrDataUrl={qrUrls[current.id] ?? ""}
            {...shared}
            cardW={cardW * DOWNLOAD_SCALE}
            cardH={cardH * DOWNLOAD_SCALE}
          />
        </div>
      </div>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export function PrintableCards({
  businessName, slug, primaryColor, secondaryColor, accentColor,
  appUrl, hasReviews, hasLoyalty,
}: Props) {
  const [logoB64, setLogoB64] = useState<string | undefined>();

  // Load logo as base64 so html-to-image can embed it
  useEffect(() => {
    fetch("/logo.png")
      .then((r) => r.blob())
      .then((blob) => new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      }))
      .then(setLogoB64)
      .catch(() => {});
  }, []);

  if (!hasReviews && !hasLoyalty) return null;

  const reviewsUrl = `${appUrl}/${slug}/avis`;
  const loyaltyUrl = `${appUrl}/${slug}/fidelite`;
  const shared = { businessName, primaryColor, secondaryColor, accentColor, reviewsUrl, loyaltyUrl, logoB64 };

  return (
    <div className="mb-8">
      <h2 className="mb-1 text-sm font-semibold uppercase tracking-wider text-slate-400">
        Impressions
      </h2>
      <p className="mb-5 text-xs text-slate-400">
        Cartes à imprimer et poser en caisse. Choisissez le format puis téléchargez en PNG haute résolution.
      </p>

      <div className="flex flex-wrap gap-12">
        {hasReviews && (
          <div>
            <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="#f59e0b"><path d="M12 2l2.83 5.73 6.32.92-4.57 4.45 1.08 6.28L12 16.52l-5.66 2.98 1.08-6.28L2.85 8.65l6.32-.92L12 2z"/></svg>
              Avis Google
              <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-slate-400">4 variantes</span>
            </p>
            <CardStack cards={REVIEW_CARDS} {...shared} />
          </div>
        )}

        {hasLoyalty && (
          <div>
            <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2"><rect x="2" y="6" width="20" height="14" rx="3"/><path d="M2 11h20"/></svg>
              Fidélité
              <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-slate-400">2 variantes</span>
            </p>
            <CardStack cards={LOYALTY_CARDS} {...shared} />
          </div>
        )}
      </div>
    </div>
  );
}
