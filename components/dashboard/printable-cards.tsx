"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import QRCode from "qrcode";
import { toPng } from "html-to-image";
import { Download, ChevronLeft, ChevronRight, ChevronDown, Printer, Palette, Lock } from "lucide-react";
import { contrastColor, safeGradientEnd } from "@/lib/utils";
import { PRINT_THEMES, type PrintThemeId } from "@/lib/constants";
import { PrintCardGoogle } from "./print-card-google";
import { PrintCardLogo } from "./print-card-logo";

export interface BrandStyleData {
  // Colors
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  backgroundColor?: string;
  textOnPrimary?: string;
  // Typography
  fontFamily?: string | null;
  fontWeight?: string;
  letterSpacing?: number;
  textTransform?: "none" | "uppercase" | "lowercase";
  // Background
  bgStyle?: "gradient" | "solid" | "split";
  gradientAngle?: number;
  // Decorative
  decorativeElement?: "waves" | "dots" | "circles" | "diagonalLines" | "geometric" | "cornerCut" | "none";
  decorativeOpacity?: number;
  decorativePosition?: "top" | "bottom" | "full" | "topRight" | "bottomLeft";
  // Borders
  borderRadius?: number;
  borderStyle?: "none" | "solid" | "double";
  borderWidth?: number;
  borderColor?: string;
  // Badge
  badgeStyle?: "pill" | "rounded" | "square" | "outlined";
  badgeBorderRadius?: number;
  // General
  mood?: string;
  brandStyle?: string; // legacy compat
}

// Flatten nested brandStyle (GPT sometimes returns { "couleurs": { "primaryColor": ... }, ... })
export function flattenBrandStyle(raw: Record<string, unknown> | null | undefined): BrandStyleData | null {
  if (!raw) return null;
  // Already flat?
  if (raw.primaryColor) return raw as unknown as BrandStyleData;
  // Try to flatten nested objects
  const flat: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      Object.assign(flat, value);
    } else {
      flat[key] = value;
    }
  }
  return flat.primaryColor ? (flat as unknown as BrandStyleData) : null;
}

interface Props {
  businessName: string;
  businessId: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  logoUrl?: string | null;
  logoBackground?: string | null;
  appUrl: string;
  hasReviews: boolean;
  hasLoyalty: boolean;
  brandStyle?: BrandStyleData | null;
}

export interface ThemeStyles {
  bg: string;
  textColor: string;
  subtextColor: string;
  badgeBg: string;
  badgeColor: string;
  fontFamily: string;
  qrBoxBg: string;
  qrBoxShadow: string;
  qrLabelColor: string;
  nfcBoxBg: string;
  nfcBoxBorder: string;
  nfcTextColor: string;
  footerColor: string;
  decorativeCircle1: string;
  decorativeCircle2: string;
}

export function getThemeStyles(
  theme: PrintThemeId,
  primaryColor: string,
  secondaryColor: string,
  accentColor: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _brandStyle?: BrandStyleData | null,
): ThemeStyles {
  const gradientEnd = safeGradientEnd(primaryColor, secondaryColor);

  switch (theme) {
    case "minimal":
      return {
        bg: `#ffffff`,
        textColor: "#1e293b",
        subtextColor: "#64748b",
        badgeBg: primaryColor,
        badgeColor: contrastColor(primaryColor),
        fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
        qrBoxBg: "#f8fafc",
        qrBoxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        qrLabelColor: "#64748b",
        nfcBoxBg: "#f1f5f9",
        nfcBoxBorder: `2px solid ${primaryColor}`,
        nfcTextColor: "#334155",
        footerColor: "#94a3b8",
        decorativeCircle1: "transparent",
        decorativeCircle2: "transparent",
      };
    case "bold":
      return {
        bg: primaryColor,
        textColor: "#fff",
        subtextColor: "rgba(255,255,255,0.7)",
        badgeBg: "#fff",
        badgeColor: primaryColor,
        fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
        qrBoxBg: "#fff",
        qrBoxShadow: "0 4px 16px rgba(0,0,0,0.25)",
        qrLabelColor: "#64748b",
        nfcBoxBg: "rgba(255,255,255,0.15)",
        nfcBoxBorder: `2px solid rgba(255,255,255,0.5)`,
        nfcTextColor: "rgba(255,255,255,0.95)",
        footerColor: "rgba(255,255,255,0.45)",
        decorativeCircle1: "rgba(255,255,255,0.08)",
        decorativeCircle2: "rgba(255,255,255,0.05)",
      };
    case "google": {
      const gEnd = safeGradientEnd(primaryColor, secondaryColor);
      return {
        bg: `linear-gradient(160deg, ${primaryColor} 0%, ${gEnd} 100%)`,
        textColor: contrastColor(primaryColor),
        subtextColor: contrastColor(primaryColor) === "#fff"
          ? "rgba(255,255,255,0.7)"
          : "rgba(0,0,0,0.5)",
        badgeBg: accentColor,
        badgeColor: contrastColor(accentColor),
        fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
        qrBoxBg: "#fff",
        qrBoxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        qrLabelColor: "#64748b",
        nfcBoxBg: "#f8fafc",
        nfcBoxBorder: "1.5px solid #e2e8f0",
        nfcTextColor: "#334155",
        footerColor: "#94a3b8",
        decorativeCircle1: "transparent",
        decorativeCircle2: "transparent",
      };
    }
    case "logo":
      // "Logo en avant!" uses a split layout (handled by PrintCardLogo component)
      // ThemeStyles here are minimal — just enough for fallback/print contexts
      return {
        bg: primaryColor,
        textColor: "#fff",
        subtextColor: "rgba(255,255,255,0.7)",
        badgeBg: accentColor,
        badgeColor: contrastColor(accentColor),
        fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
        qrBoxBg: "#fff",
        qrBoxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        qrLabelColor: "#64748b",
        nfcBoxBg: "#f8fafc",
        nfcBoxBorder: "1.5px solid #e2e8f0",
        nfcTextColor: "#334155",
        footerColor: "#94a3b8",
        decorativeCircle1: "transparent",
        decorativeCircle2: "transparent",
      };
    default: // gradient
      return {
        bg: `linear-gradient(145deg, ${primaryColor} 0%, ${gradientEnd} 100%)`,
        textColor: "#fff",
        subtextColor: "rgba(255,255,255,0.65)",
        badgeBg: accentColor,
        badgeColor: contrastColor(accentColor),
        fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
        qrBoxBg: "#fff",
        qrBoxShadow: "0 4px 12px rgba(0,0,0,0.2)",
        qrLabelColor: "#64748b",
        nfcBoxBg: "rgba(255,255,255,0.12)",
        nfcBoxBorder: `${Math.max(1, 1.5)}px solid rgba(255,255,255,0.5)`,
        nfcTextColor: "rgba(255,255,255,0.95)",
        footerColor: "rgba(255,255,255,0.45)",
        decorativeCircle1: "rgba(255,255,255,0.07)",
        decorativeCircle2: "rgba(255,255,255,0.04)",
      };
  }
}

export interface CardDef {
  id: string;
  type: "reviews" | "loyalty";
  hasNFC: boolean;
  hasReward: boolean;
}

export const REVIEW_CARDS: CardDef[] = [
  { id: "r-nfc-reward", type: "reviews", hasNFC: true, hasReward: true },
  { id: "r-qr-reward", type: "reviews", hasNFC: false, hasReward: true },
  { id: "r-nfc", type: "reviews", hasNFC: true, hasReward: false },
  { id: "r-qr", type: "reviews", hasNFC: false, hasReward: false },
];

export const LOYALTY_CARDS: CardDef[] = [
  { id: "l-nfc", type: "loyalty", hasNFC: true, hasReward: true },
  { id: "l-qr", type: "loyalty", hasNFC: false, hasReward: true },
];

const SIZE_OPTIONS = [
  { id: "10x10", label: "10 × 10 cm", cardW: 215, cardH: 215 },
  { id: "10x15", label: "10 × 15 cm", cardW: 220, cardH: 330 },
] as const;
type SizeId = (typeof SIZE_OPTIONS)[number]["id"];

// 3× the display size → exported at pixelRatio 2 → ~300-340 DPI
const DOWNLOAD_SCALE = 3;

const PRINT_PRESETS = [
  { id: "9.3x9.3", label: "9.3 × 9.3", w: "9.3", h: "9.3" },
  { id: "10x10",   label: "10 × 10",   w: "10",  h: "10"  },
  { id: "10x15",   label: "10 × 15",   w: "10",  h: "15"  },
] as const;
type PaperFormat = "A4" | "A5" | "Photo";

// ── Inline SVG icons (no emoji, consistent across OS) ────────────────────────


function IconGift({
  size = 14,
  color = "#fff",
}: {
  size?: number;
  color?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 12 20 22 4 22 4 12" />
      <rect x="2" y="7" width="20" height="5" rx="1" />
      <line x1="12" y1="22" x2="12" y2="7" />
      <path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z" />
      <path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z" />
    </svg>
  );
}

function NfcPhoneIllustration({ size = 52 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 52 52" fill="none">
      {/* Phone body */}
      <rect
        x="13"
        y="0"
        width="26"
        height="32"
        rx="5"
        fill="rgba(255,255,255,0.88)"
      />
      {/* Camera dot */}
      <circle cx="26" cy="3" r="1.2" fill="rgba(0,0,0,0.12)" />
      {/* Screen area */}
      <rect
        x="16"
        y="6"
        width="20"
        height="20"
        rx="2"
        fill="rgba(0,0,0,0.10)"
      />
      {/* Home bar */}
      <rect
        x="21"
        y="28"
        width="10"
        height="1.5"
        rx="1"
        fill="rgba(0,0,0,0.10)"
      />

      {/* Motion indicator: dashes */}
      <line
        x1="26"
        y1="34"
        x2="26"
        y2="38"
        stroke="rgba(255,255,255,0.6)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeDasharray="2 2"
      />
      {/* Arrowhead pointing down */}
      <polyline
        points="23,36 26,40 29,36"
        stroke="rgba(255,255,255,0.75)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Card / terminal surface */}
      <rect
        x="5"
        y="44"
        width="42"
        height="8"
        rx="3"
        fill="rgba(255,255,255,0.22)"
      />
      {/* NFC ripples on card */}
      <path
        d="M19 48 Q26 45 33 48"
        stroke="rgba(255,255,255,0.45)"
        strokeWidth="1"
        strokeLinecap="round"
      />
      <path
        d="M22 49.5 Q26 47.5 30 49.5"
        stroke="rgba(255,255,255,0.65)"
        strokeWidth="1"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconLogo({ size = 12, logoB64 }: { size?: number; logoB64?: string }) {
  if (!logoB64) return null;
  return (
    <img
      src={logoB64}
      alt=""
      style={{
        width: size,
        height: size,
        borderRadius: 2,
        objectFit: "contain",
        display: "inline-block",
        verticalAlign: "middle",
      }}
    />
  );
}

// ── PrintCard ────────────────────────────────────────────────────────────────
export function PrintCard({
  card,
  businessName,
  primaryColor,
  secondaryColor,
  accentColor,
  qrDataUrl,
  logoB64,
  businessLogoB64,
  businessLogoUrl,
  logoBackground,
  style,
  cardW = 220,
  cardH = 330,
  themeStyles,
  showAvatar = true,
  invertLogo = false,
  theme,
}: {
  card: CardDef;
  businessName: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  qrDataUrl: string;
  logoB64?: string;
  businessLogoB64?: string;
  businessLogoUrl?: string;
  logoBackground?: string;
  style?: React.CSSProperties;
  cardW?: number;
  cardH?: number;
  themeStyles?: ThemeStyles;
  showAvatar?: boolean;
  invertLogo?: boolean;
  theme?: PrintThemeId;
}) {
  // Delegate to google-specific layout
  if (theme === "google" && themeStyles) {
    return (
      <PrintCardGoogle
        card={card}
        businessName={businessName}
        primaryColor={primaryColor}
        qrDataUrl={qrDataUrl}
        logoB64={logoB64}
        businessLogoB64={businessLogoB64}
        businessLogoUrl={businessLogoUrl}
        logoBackground={logoBackground}
        style={style}
        cardW={cardW}
        cardH={cardH}
        themeStyles={themeStyles}
        showAvatar={showAvatar}
        invertLogo={invertLogo}
      />
    );
  }

  // Delegate to logo-specific layout
  if (theme === "logo" && themeStyles) {
    return (
      <PrintCardLogo
        card={card}
        businessName={businessName}
        primaryColor={primaryColor}
        qrDataUrl={qrDataUrl}
        logoB64={logoB64}
        businessLogoB64={businessLogoB64}
        businessLogoUrl={businessLogoUrl}
        logoBackground={logoBackground}
        style={style}
        cardW={cardW}
        cardH={cardH}
        themeStyles={themeStyles}
        showAvatar={showAvatar}
        invertLogo={invertLogo}
      />
    );
  }

  const isReviews = card.type === "reviews";
  const isSquare = cardH <= cardW;
  const initial = businessName[0]?.toUpperCase() ?? "?";

  // Use theme styles if provided, otherwise fall back to gradient default
  const ts = themeStyles ?? getThemeStyles("gradient", primaryColor, secondaryColor, accentColor);

  const titleWeight = "800";
  const titleSpacing = -0.5;
  const titleTransform = "none" as const;
  const badgeRadius = 20;

  // s  : structural/vertical scale (height-limited in square format)
  const s = Math.min(cardW / 220, cardH / 330);
  // sF : font & horizontal scale (width-limited only — prevents text overflow)
  const sF = cardW / 220;
  const px = (n: number) => n * s;
  const pf = (n: number) => n * sF;

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
    <div
      style={{
        width: cardW,
        height: cardH,
        background: ts.bg,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: `${px(16)}px ${pf(14)}px ${px(12)}px`,
        overflow: "hidden",
        position: "relative",
        fontFamily: ts.fontFamily,
        borderRadius: 0,
        ...style,
      }}
    >
      {/* Decorative circles */}
      <div
        style={{
          position: "absolute",
          width: px(160),
          height: px(160),
          borderRadius: "50%",
          background: ts.decorativeCircle1,
          top: -px(50),
          right: -px(50),
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: px(100),
          height: px(100),
          borderRadius: "50%",
          background: ts.decorativeCircle2,
          bottom: px(60),
          left: -px(30),
          pointerEvents: "none",
        }}
      />

      {/* Header: business name */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: pf(6),
          width: "100%",
          zIndex: 1,
        }}
      >
        {showAvatar && ((businessLogoB64 || businessLogoUrl) ? (
          <img
            src={businessLogoB64 || businessLogoUrl}
            alt=""
            style={{
              width: pf(28),
              height: pf(28),
              borderRadius: pf(7),
              objectFit: "contain",
              background: logoBackground || accentColor,
              padding: pf(2),
              flexShrink: 0,
              ...(invertLogo ? { filter: "invert(1)" } : {}),
            }}
          />
        ) : (
          <div
            style={{
              width: pf(28),
              height: pf(28),
              borderRadius: pf(7),
              background: accentColor,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: pf(13),
              fontWeight: 800,
              color: contrastColor(accentColor),
              flexShrink: 0,
            }}
          >
            {initial}
          </div>
        ))}
        <span
          style={{
            fontSize: pf(10),
            fontWeight: 600,
            color: ts.subtextColor,
            letterSpacing: 0.2,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {businessName}
        </span>
      </div>

      {/* Main content */}
      <div
        style={{
          zIndex: 1,
          flex: 1,
          minHeight: 0,
          overflow: "hidden",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: px(6),
          textAlign: "center",
          padding: `${px(6)}px 0`,
        }}
      >
        <div
          style={{
            fontSize: pf(22),
            fontWeight: Number(titleWeight) || 800,
            color: ts.textColor,
            lineHeight: 1.2,
            letterSpacing: titleSpacing,
            textTransform: titleTransform,
          }}
        >
          {isReviews ? (
            <>
              Laissez-nous
              <br />
              un avis Google
            </>
          ) : (
            <>
              Votre carte
              <br />
              de fidélité
            </>
          )}
        </div>

        {card.hasReward && (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: pf(5),
              background: ts.badgeBg,
              borderRadius: pf(badgeRadius),
              padding: `${px(5)}px ${pf(11)}px`,
              fontSize: pf(9.5),
              fontWeight: 700,
              color: ts.badgeColor,
              boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
            }}
          >
            <IconGift size={pf(11)} color={ts.badgeColor} />
            {isReviews ? "Récompense à la clé !" : "Cadeaux à gagner !"}
          </div>
        )}

        {/* Instruction — masquée sur format carré pour économiser l'espace */}
        {!isSquare && (
          <div
            style={{
              fontSize: pf(9.5),
              color: ts.subtextColor,
              lineHeight: 1.45,
            }}
          >
            {card.hasNFC
              ? isReviews
                ? "Scannez le QR code ou approchez\nvotre téléphone pour laisser un avis"
                : "Scannez le QR code ou approchez\nvotre téléphone pour ouvrir votre carte"
              : isReviews
                ? "Scannez le QR code pour\nnous laisser un avis Google"
                : "Scannez le QR code pour\nouvrir votre carte de fidélité"}
          </div>
        )}
      </div>

      {/* Bottom: QR + NFC */}
      <div
        style={{
          display: "flex",
          gap: px(8),
          width: "100%",
          zIndex: 1,
          alignItems: "stretch",
        }}
      >
        {card.hasNFC && (
          <div
            style={{
              ...boxStyle,
              background: ts.nfcBoxBg,
              border: ts.nfcBoxBorder,
              boxShadow: "0 0 0 0.5px rgba(255,255,255,0.15) inset",
              gap: px(2),
            }}
          >
            <NfcPhoneIllustration size={px(64)} />
            <span
              style={{
                fontSize: px(7.5),
                fontWeight: 700,
                color: ts.nfcTextColor,
                letterSpacing: 0.2,
                textAlign: "center",
                lineHeight: 1.4,
              }}
            >
              APPROCHEZ
              <br />
              votre téléphone
            </span>
            {!isSquare && (
              <span
                style={{
                  fontSize: px(6.5),
                  fontWeight: 500,
                  color: ts.subtextColor,
                  letterSpacing: 0.5,
                  textTransform: "uppercase",
                }}
              >
                Sans contact
              </span>
            )}
          </div>
        )}

        <div
          style={{
            ...boxStyle,
            background: ts.qrBoxBg,
            boxShadow: ts.qrBoxShadow,
          }}
        >
          {qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt="QR"
              style={{ width: px(64), height: px(64), borderRadius: px(3) }}
            />
          ) : (
            <div
              style={{
                width: px(64),
                height: px(64),
                background: "#f1f5f9",
                borderRadius: px(3),
              }}
            />
          )}
          <span
            style={{
              fontSize: px(7.5),
              fontWeight: 700,
              color: ts.qrLabelColor,
              letterSpacing: 0.2,
              textAlign: "center",
              lineHeight: 1.4,
            }}
          >
            SCANNER
            <br />
            avec votre appareil photo
          </span>
        </div>
      </div>

    </div>
  );
}

// ── CardStack ─────────────────────────────────────────────────────────────────
function CardStack({
  cards,
  businessName,
  primaryColor,
  secondaryColor,
  accentColor,
  reviewsUrl,
  loyaltyUrl,
  logoB64,
  businessLogoB64,
  businessLogoUrl,
  logoBackground,
  themeStyles,
  showAvatar = true,
  invertLogo = false,
  theme,
}: {
  cards: CardDef[];
  businessName: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  reviewsUrl: string;
  loyaltyUrl: string;
  logoB64?: string;
  businessLogoB64?: string;
  businessLogoUrl?: string;
  logoBackground?: string;
  themeStyles?: ThemeStyles;
  showAvatar?: boolean;
  invertLogo?: boolean;
  theme?: PrintThemeId;
}) {
  const [index, setIndex] = useState(0);
  const [sizeId, setSizeId] = useState<SizeId>("10x10");
  const [downloading, setDownloading] = useState(false);
  const [nfcOpen, setNfcOpen] = useState(false);
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
          width: 600,
          margin: 1,
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

  const shared = {
    businessName,
    primaryColor,
    secondaryColor,
    accentColor,
    logoB64,
    businessLogoB64,
    businessLogoUrl,
    logoBackground,
    cardW,
    cardH,
    themeStyles,
    showAvatar,
    invertLogo,
    theme,
  };

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
      <div
        style={{ position: "relative", width: cardW + 16, height: cardH + 15 }}
      >
        {cards.length > 2 && (
          <div
            style={{
              position: "absolute",
              top: 10,
              left: 8,
              opacity: 0.2,
              transform: "rotate(5deg)",
              pointerEvents: "none",
            }}
          >
            <PrintCard
              card={cards[(index + 2) % cards.length]}
              qrDataUrl={qrUrls[cards[(index + 2) % cards.length].id] ?? ""}
              {...shared}
            />
          </div>
        )}
        {cards.length > 1 && (
          <div
            style={{
              position: "absolute",
              top: 6,
              left: 4,
              opacity: 0.4,
              transform: "rotate(2.5deg)",
              pointerEvents: "none",
            }}
          >
            <PrintCard
              card={cards[(index + 1) % cards.length]}
              qrDataUrl={qrUrls[cards[(index + 1) % cards.length].id] ?? ""}
              {...shared}
            />
          </div>
        )}
        <div ref={cardRef} style={{ position: "absolute", top: 0, left: 0 }}>
          <PrintCard
            card={current}
            qrDataUrl={qrUrls[current.id] ?? ""}
            {...shared}
          />
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
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`h-1.5 rounded-full transition-all ${i === index ? "w-4 bg-indigo-500" : "w-1.5 bg-slate-200"}`}
            />
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={prev}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:bg-slate-50"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-700 disabled:opacity-50"
        >
          <Download className="h-3.5 w-3.5" />
          {downloading ? "Export…" : "Télécharger PNG"}
        </button>
        <button
          onClick={next}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:bg-slate-50"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* NFC explanation */}
      {current.hasNFC && (
        <div className="max-w-xs rounded-xl border border-indigo-100 bg-indigo-50 text-xs overflow-hidden">
          <button
            type="button"
            onClick={() => setNfcOpen((o) => !o)}
            className="flex w-full items-center justify-between px-3.5 py-3 text-left font-semibold text-indigo-800 hover:bg-indigo-100 transition-colors"
          >
            <span>⚡ Qu&apos;est-ce que le NFC ?</span>
            <ChevronDown
              className={`h-3.5 w-3.5 flex-shrink-0 text-indigo-400 transition-transform duration-200 ${nfcOpen ? "rotate-180" : ""}`}
            />
          </button>
          {nfcOpen && (
            <div className="px-3.5 pb-3.5 pt-0.5 flex flex-col gap-2">
              <p className="leading-relaxed text-indigo-700">
                Le <strong>NFC</strong> (Near Field Communication) permet à vos
                clients d&apos;accéder à votre page en approchant simplement leur
                smartphone de la carte — sans avoir à scanner de QR code. La
                plupart des iPhones (depuis 2018) et Android le supportent
                nativement. Résultat : zéro friction, expérience instantanée.
              </p>
              <p className="leading-relaxed text-indigo-700">
                Vous souhaitez des cartes physiques avec{" "}
                <strong>puce NFC intégrée</strong> ?{" "}
                <button
                  type="button"
                  onClick={() =>
                    window.dispatchEvent(
                      new CustomEvent("open-contact-form", {
                        detail: { subject: "Cartes physiques NFC" },
                      })
                    )
                  }
                  className="font-semibold underline underline-offset-2 hover:text-indigo-900"
                >
                  Contactez-nous →
                </button>
              </p>
            </div>
          )}
        </div>
      )}

      {/* Hidden high-resolution card for download (3× display size) */}
      <div
        style={{
          position: "fixed",
          left: -99999,
          top: -99999,
          pointerEvents: "none",
          opacity: 0,
        }}
        aria-hidden
      >
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

// ── Theme Selector ────────────────────────────────────────────────────────────
function ThemeSelector({
  theme,
  setTheme,
  hasLogo,
}: {
  theme: PrintThemeId;
  setTheme: (t: PrintThemeId) => void;
  hasLogo: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <Palette className="h-4 w-4 text-slate-400" />
      <span className="text-xs font-medium text-slate-500">Thème :</span>
      <div className="flex gap-1 rounded-lg bg-slate-100 p-1">
        {PRINT_THEMES.map((t) => {
          const disabled = t.requiresLogo && !hasLogo;
          return (
            <button
              key={t.id}
              onClick={() => !disabled && setTheme(t.id)}
              disabled={disabled}
              title={disabled ? "Nécessite un logo pour le commerce" : t.description}
              className={`flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                theme === t.id
                  ? "bg-white text-slate-800 shadow-sm"
                  : disabled
                    ? "cursor-not-allowed text-slate-300"
                    : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {t.name}
              {disabled && <Lock className="h-3 w-3" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export function PrintableCards({
  businessName,
  businessId,
  primaryColor,
  secondaryColor,
  accentColor,
  logoUrl,
  logoBackground,
  appUrl,
  hasReviews,
  hasLoyalty,
  brandStyle,
}: Props) {
  const [logoB64, setLogoB64] = useState<string | undefined>();
  const [businessLogoB64, setBusinessLogoB64] = useState<string | undefined>();
  const [theme, setTheme] = useState<PrintThemeId>(logoUrl ? "logo" : "gradient");
  const [showAvatar, setShowAvatar] = useState(true);
  const [invertLogo, setInvertLogo] = useState(false);

  // ── Print at real size ──────────────────────────────────────────────────────
  const [printW, setPrintW] = useState("9.3");
  const [printH, setPrintH] = useState("9.3");
  const [paperFormat, setPaperFormat] = useState<PaperFormat>("A4");
  const [printing, setPrinting] = useState(false);
  const [printQrReview, setPrintQrReview] = useState("");
  const [printQrLoyalty, setPrintQrLoyalty] = useState("");
  const printReviewRef = useRef<HTMLDivElement>(null);
  const printLoyaltyRef = useRef<HTMLDivElement>(null);

  // Load TocTocToc logo as base64 so html-to-image can embed it
  useEffect(() => {
    fetch("/logo.png")
      .then((r) => r.blob())
      .then(
        (blob) =>
          new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          }),
      )
      .then(setLogoB64)
      .catch(() => {});
  }, []);

  // Load business logo as base64 for card header
  useEffect(() => {
    if (!logoUrl) return;
    fetch(logoUrl)
      .then((r) => r.blob())
      .then(
        (blob) =>
          new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          }),
      )
      .then(setBusinessLogoB64)
      .catch(() => {});
  }, [logoUrl]);

  const reviewsUrl = `${appUrl}/${businessId}/avis`;
  const loyaltyUrl = `${appUrl}/${businessId}/fidelite`;

  // QR codes pour l'impression
  useEffect(() => {
    if (!hasReviews) return;
    QRCode.toDataURL(reviewsUrl, { width: 600, margin: 1, color: { dark: "#1e293b", light: "#ffffff" } })
      .then(setPrintQrReview).catch(() => {});
  }, [reviewsUrl, hasReviews]);

  useEffect(() => {
    if (!hasLoyalty) return;
    QRCode.toDataURL(loyaltyUrl, { width: 600, margin: 1, color: { dark: "#1e293b", light: "#ffffff" } })
      .then(setPrintQrLoyalty).catch(() => {});
  }, [loyaltyUrl, hasLoyalty]);

  const normalizedBrandStyle = flattenBrandStyle(brandStyle as Record<string, unknown> | null);
  const hasLogo = !!logoUrl;
  const themeStyles = getThemeStyles(theme, primaryColor, secondaryColor, accentColor, normalizedBrandStyle);

  if (!hasReviews && !hasLoyalty) return null;

  async function handlePrint() {
    setPrinting(true);
    try {
      const w = Math.max(1, parseFloat(printW) || 9);
      const h = Math.max(1, parseFloat(printH) || 9);
      const captures: { src: string; label: string }[] = [];

      if (hasReviews && printReviewRef.current) {
        const src = await toPng(printReviewRef.current, { pixelRatio: 2 });
        captures.push({ src, label: "Avis Google" });
      }
      if (hasLoyalty && printLoyaltyRef.current) {
        const src = await toPng(printLoyaltyRef.current, { pixelRatio: 2 });
        captures.push({ src, label: "Fidélité" });
      }
      if (!captures.length) return;

      const paperSize = paperFormat === "A4" ? "210mm 297mm" : paperFormat === "A5" ? "148mm 210mm" : "100mm 150mm";
      const pageMargin = paperFormat === "Photo" ? "3mm" : "12mm";
      const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Impression ${businessName}</title><style>
  @page { size: ${paperSize}; margin: ${pageMargin}; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: system-ui, sans-serif; display: flex; flex-wrap: wrap; gap: 8mm; align-items: flex-start; align-content: flex-start; }
  .card { display: flex; flex-direction: column; align-items: center; gap: 2mm; }
  .card img { width: ${w}cm; height: ${h}cm; display: block; border-radius: 3mm; }
  .card-label { font-size: 7pt; color: #94a3b8; text-align: center; }
  @media print { * { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
</style></head><body>
${captures.map(c => `<div class="card"><img src="${c.src}"><span class="card-label">${c.label} · ${w}×${h} cm — ${businessName}</span></div>`).join("\n")}
</body></html>`;

      const win = window.open("", "_blank");
      if (win) {
        win.document.write(html);
        win.document.close();
        setTimeout(() => { win.focus(); win.print(); }, 800);
      }
    } catch (e) {
      console.error("[PRINT]", e);
    } finally {
      setPrinting(false);
    }
  }
  const shared = {
    businessName,
    primaryColor,
    secondaryColor,
    accentColor,
    reviewsUrl,
    loyaltyUrl,
    logoB64,
    businessLogoB64,
    businessLogoUrl: logoUrl ?? undefined,
    logoBackground: logoBackground ?? undefined,
    appUrl,
    themeStyles,
    showAvatar,
    invertLogo,
    theme,
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-6">
        <ThemeSelector theme={theme} setTheme={setTheme} hasLogo={hasLogo} />
        <label className="flex items-center gap-2 text-xs text-slate-500">
          <button
            type="button"
            onClick={() => setShowAvatar((v) => !v)}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${showAvatar ? "bg-indigo-600" : "bg-slate-200"}`}
          >
            <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform ${showAvatar ? "translate-x-[18px]" : "translate-x-[3px]"}`} />
          </button>
          Avatar du commerce
        </label>
        {hasLogo && (
          <label className="flex items-center gap-2 text-xs text-slate-500">
            <button
              type="button"
              onClick={() => setInvertLogo((v) => !v)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${invertLogo ? "bg-indigo-600" : "bg-slate-200"}`}
            >
              <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform ${invertLogo ? "translate-x-[18px]" : "translate-x-[3px]"}`} />
            </button>
            Inverser le logo
          </label>
        )}
      </div>
      <div className="flex flex-wrap gap-12">
        {hasReviews && (
          <div>
            <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="#f59e0b">
                <path d="M12 2l2.83 5.73 6.32.92-4.57 4.45 1.08 6.28L12 16.52l-5.66 2.98 1.08-6.28L2.85 8.65l6.32-.92L12 2z" />
              </svg>
              Avis Google
              <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-slate-400">
                4 variantes
              </span>
            </p>
            <CardStack cards={REVIEW_CARDS} {...shared} />
          </div>
        )}

        {hasLoyalty && (
          <div>
            <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#6366f1"
                strokeWidth="2"
              >
                <rect x="2" y="6" width="20" height="14" rx="3" />
                <path d="M2 11h20" />
              </svg>
              Fidélité
              <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-slate-400">
                2 variantes
              </span>
            </p>
            <CardStack cards={LOYALTY_CARDS} {...shared} />
          </div>
        )}
      </div>

      {/* ── Impression à taille réelle ─────────────────────────────────────── */}
      {(hasReviews || hasLoyalty) && (() => {
        const w = Math.max(1, parseFloat(printW) || 9);
        const h = Math.max(1, parseFloat(printH) || 9);
        const renderW = Math.round(600 * w / Math.max(w, h));
        const renderH = Math.round(600 * h / Math.max(w, h));
        const printShared = {
          businessName, primaryColor, secondaryColor, accentColor,
          logoB64, businessLogoB64,
          businessLogoUrl: logoUrl ?? undefined,
          logoBackground: logoBackground ?? undefined,
          cardW: renderW, cardH: renderH,
          themeStyles,
          showAvatar,
          invertLogo,
          theme,
        };
        return (
          <>
            <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4">
              <div className="mb-4 flex items-center gap-2">
                <Printer className="h-4 w-4 text-slate-500" />
                <span className="text-sm font-semibold text-slate-700">Impression à taille réelle</span>
                <span className="text-xs text-slate-400">— les deux cartes positionnées sur la feuille</span>
              </div>

              <div className="flex flex-wrap items-end gap-5">
                {/* Format papier */}
                <div>
                  <p className="mb-1.5 text-xs font-medium text-slate-500">Format papier</p>
                  <div className="flex gap-1 rounded-lg bg-slate-100 p-1">
                    {([
                      { id: "A4" as PaperFormat, label: "A4" },
                      { id: "A5" as PaperFormat, label: "A5" },
                      { id: "Photo" as PaperFormat, label: "Photo 10×15" },
                    ]).map((f) => (
                      <button
                        key={f.id}
                        onClick={() => {
                          setPaperFormat(f.id);
                          if (f.id === "Photo") { setPrintW("9.4"); setPrintH("14.4"); }
                        }}
                        className={`rounded-md px-3 py-1 text-xs font-medium transition-all ${
                          paperFormat === f.id ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Taille */}
                <div>
                  <p className="mb-1.5 text-xs font-medium text-slate-500">Taille de la carte</p>
                  <div className="flex items-center gap-2">
                    <input
                      type="number" min="1" max="30" step="0.1"
                      value={printW}
                      onChange={(e) => setPrintW(e.target.value)}
                      className="w-16 rounded-lg border border-slate-200 px-2.5 py-1.5 text-center text-sm font-medium text-slate-800 focus:border-indigo-400 focus:outline-none"
                    />
                    <span className="text-xs text-slate-400">cm ×</span>
                    <input
                      type="number" min="1" max="30" step="0.1"
                      value={printH}
                      onChange={(e) => setPrintH(e.target.value)}
                      className="w-16 rounded-lg border border-slate-200 px-2.5 py-1.5 text-center text-sm font-medium text-slate-800 focus:border-indigo-400 focus:outline-none"
                    />
                    <span className="text-xs text-slate-400">cm</span>
                  </div>
                </div>

                {/* Presets */}
                <div>
                  <p className="mb-1.5 text-xs font-medium text-slate-500">Formats prédéfinis</p>
                  <div className="flex gap-1">
                    {PRINT_PRESETS.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => { setPrintW(p.w); setPrintH(p.h); }}
                        className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium transition ${
                          printW === p.w && printH === p.h
                            ? "border-indigo-300 bg-indigo-50 text-indigo-700"
                            : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Bouton */}
                <button
                  onClick={handlePrint}
                  disabled={printing}
                  className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-700 disabled:opacity-50"
                >
                  <Printer className="h-3.5 w-3.5" />
                  {printing ? "Préparation…" : "Lancer l'impression"}
                </button>
              </div>
            </div>

            {/* Refs cachées pour la capture */}
            <div style={{ position: "fixed", left: -99999, top: -99999, pointerEvents: "none", opacity: 0 }} aria-hidden>
              {hasReviews && (
                <div ref={printReviewRef}>
                  <PrintCard card={REVIEW_CARDS[1]} qrDataUrl={printQrReview} {...printShared} />
                </div>
              )}
              {hasLoyalty && (
                <div ref={printLoyaltyRef}>
                  <PrintCard card={LOYALTY_CARDS[1]} qrDataUrl={printQrLoyalty} {...printShared} />
                </div>
              )}
            </div>
          </>
        );
      })()}
    </div>
  );
}
