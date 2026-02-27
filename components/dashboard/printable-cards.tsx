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

function IconNFC({ size = 32, color = "#fff" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round">
      <path d="M6.5 17.5A8 8 0 0 1 6.5 6.5" opacity=".4"/>
      <path d="M9.5 14.5A4.5 4.5 0 0 1 9.5 9.5" opacity=".7"/>
      <path d="M12.5 11.5a1.5 1.5 0 0 1 0 1" />
      <circle cx="13" cy="12" r="1.5" fill={color} stroke="none" />
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
  qrDataUrl, logoB64, style,
}: {
  card: CardDef;
  businessName: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  qrDataUrl: string;
  logoB64?: string;
  style?: React.CSSProperties;
}) {
  const isReviews = card.type === "reviews";
  const initial = businessName[0]?.toUpperCase() ?? "?";
  const bg = `linear-gradient(145deg, ${primaryColor} 0%, ${secondaryColor} 100%)`;

  const boxStyle: React.CSSProperties = {
    flex: 1,
    borderRadius: 10,
    padding: "10px 8px 8px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
  };

  return (
    <div style={{
      width: 220, height: 330,
      background: bg,
      borderRadius: 16,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "16px 14px 12px",
      overflow: "hidden",
      position: "relative",
      fontFamily: "Inter, system-ui, -apple-system, sans-serif",
      ...style,
    }}>
      {/* Decorative circles */}
      <div style={{ position: "absolute", width: 160, height: 160, borderRadius: "50%", background: "rgba(255,255,255,0.07)", top: -50, right: -50, pointerEvents: "none" }} />
      <div style={{ position: "absolute", width: 100, height: 100, borderRadius: "50%", background: "rgba(255,255,255,0.04)", bottom: 60, left: -30, pointerEvents: "none" }} />

      {/* Header: business name */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, width: "100%", zIndex: 1 }}>
        <div style={{
          width: 28, height: 28, borderRadius: 7,
          background: accentColor,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 13, fontWeight: 800, color: "#fff", flexShrink: 0,
        }}>
          {initial}
        </div>
        <span style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.75)", letterSpacing: 0.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {businessName}
        </span>
      </div>

      {/* Main content */}
      <div style={{ zIndex: 1, flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, textAlign: "center", padding: "4px 0" }}>
        {/* Icon */}
        {isReviews
          ? <IconStar size={34} color="#fff" />
          : <IconLoyalty size={34} color="#fff" />
        }

        {/* Title */}
        <div style={{ fontSize: 19, fontWeight: 800, color: "#fff", lineHeight: 1.2, letterSpacing: -0.5 }}>
          {isReviews ? <>Laissez-nous<br />un avis Google</> : <>Votre carte<br />de fidélité</>}
        </div>

        {/* Reward badge */}
        {card.hasReward && (
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            background: accentColor,
            borderRadius: 20, padding: "5px 11px",
            fontSize: 9.5, fontWeight: 700, color: "#fff",
            boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
          }}>
            <IconGift size={11} color="#fff" />
            {isReviews ? "Récompense à la clé !" : "Cadeaux à gagner !"}
          </div>
        )}

        {/* Instruction */}
        <div style={{ fontSize: 9.5, color: "rgba(255,255,255,0.65)", lineHeight: 1.45 }}>
          {card.hasNFC
            ? isReviews
              ? "Scannez le QR code ou approchez\nvotre téléphone pour laisser un avis"
              : "Scannez le QR code ou approchez\nvotre téléphone pour ouvrir votre carte"
            : isReviews
              ? "Scannez le QR code pour\nnous laisser un avis Google"
              : "Scannez le QR code pour\nouvrir votre carte de fidélité"
          }
        </div>
      </div>

      {/* Bottom: QR + NFC (equal width) */}
      <div style={{ display: "flex", gap: 8, width: "100%", zIndex: 1, alignItems: "stretch" }}>
        {/* QR code */}
        <div style={{ ...boxStyle, background: "#fff", boxShadow: "0 4px 12px rgba(0,0,0,0.2)" }}>
          {qrDataUrl ? (
            <img src={qrDataUrl} alt="QR" style={{ width: 64, height: 64, borderRadius: 3 }} />
          ) : (
            <div style={{ width: 64, height: 64, background: "#f1f5f9", borderRadius: 3 }} />
          )}
          <span style={{ fontSize: 7.5, fontWeight: 700, color: "#64748b", letterSpacing: 0.8, textTransform: "uppercase" }}>
            Scanner
          </span>
        </div>

        {/* NFC — same width as QR */}
        {card.hasNFC && (
          <div style={{
            ...boxStyle,
            background: "rgba(255,255,255,0.12)",
            border: "1.5px solid rgba(255,255,255,0.5)",
            boxShadow: "0 0 0 0.5px rgba(255,255,255,0.15) inset",
          }}>
            <IconNFC size={36} color="#fff" />
            <span style={{ fontSize: 8, fontWeight: 700, color: "rgba(255,255,255,0.9)", letterSpacing: 0.3, textAlign: "center", lineHeight: 1.35 }}>
              Approchez<br />votre téléphone
            </span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{
        marginTop: 5, zIndex: 1,
        display: "flex", alignItems: "center", gap: 4,
        opacity: 0.45,
      }}>
        <IconLogo size={11} logoB64={logoB64} />
        <span style={{ fontSize: 7.5, fontWeight: 600, color: "#fff", letterSpacing: 0.2 }}>
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
  const [downloading, setDownloading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const [qrUrls, setQrUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    const generate = async () => {
      const urls: Record<string, string> = {};
      for (const card of cards) {
        const url = card.type === "reviews" ? reviewsUrl : loyaltyUrl;
        urls[card.id] = await QRCode.toDataURL(url, {
          width: 220, margin: 1,
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
      const dataUrl = await toPng(cardRef.current, { pixelRatio: 4 });
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

  const shared = { businessName, primaryColor, secondaryColor, accentColor, logoB64 };

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Stack */}
      <div style={{ position: "relative", width: 220, height: 345 }}>
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
        Cartes 10×15cm à imprimer et poser en caisse. Téléchargez en PNG haute résolution (300 DPI).
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
