"use client";

import { useState, useEffect } from "react";
import type { CardDef, ThemeStyles } from "./printable-cards";
import { contrastColor } from "@/lib/utils";
import { CurveSeparator } from "./print-card-icons";

// ── Load image as base64 (needed for html-to-image export) ──────────────────

function useImageBase64(src: string) {
  const [b64, setB64] = useState<string>();
  useEffect(() => {
    fetch(src)
      .then((r) => r.blob())
      .then(
        (blob) =>
          new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          }),
      )
      .then(setB64)
      .catch(() => {});
  }, [src]);
  return b64;
}

// ── Props ────────────────────────────────────────────────────────────────────

interface PrintCardLogoProps {
  card: CardDef;
  businessName: string;
  primaryColor: string;
  qrDataUrl: string;
  logoB64?: string;
  businessLogoB64?: string;
  businessLogoUrl?: string;
  logoBackground?: string;
  style?: React.CSSProperties;
  cardW?: number;
  cardH?: number;
  themeStyles: ThemeStyles;
  showAvatar?: boolean;
  invertLogo?: boolean;
  logoScale?: number;
}

// ── Main Component ──────────────────────────────────────────────────────────

export function PrintCardLogo({
  card,
  businessName,
  primaryColor,
  qrDataUrl,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  logoB64: _logoB64,
  businessLogoB64,
  businessLogoUrl,
  invertLogo = false,
  logoScale = 1,
  style,
  cardW = 215,
  cardH = 215,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  themeStyles: _ts,
}: PrintCardLogoProps) {
  const isReviews = card.type === "reviews";
  const isSquare = cardH <= cardW;

  // NFC icon as base64 for html-to-image compatibility
  const nfcIconB64 = useImageBase64("/nfc-hand.png");

  // Scale factors
  const s = Math.min(cardW / 215, cardH / 215);
  const sF = cardW / 215;
  const px = (n: number) => n * s;
  const pf = (n: number) => n * sF;

  // Split: top colored section takes more space when no reward badge
  const hasReward = card.hasReward;
  const topRatio = isSquare ? (hasReward ? 0.56 : 0.53) : 0.55;
  const topH = Math.round(cardH * topRatio);
  const curveH = Math.round(cardW * 0.1);

  // Logo
  const logoSrc = businessLogoB64 || businessLogoUrl;
  const logoBaseSize = pf(isSquare ? (hasReward ? 40 : 48) : 58);
  const logoSize = logoBaseSize * logoScale;

  // Text color on primary
  const textOnPrimary = contrastColor(primaryColor);

  // Common size for NFC icon and QR code — perfectly aligned
  const iconQrSize = px(isSquare ? 34 : 44);

  return (
    <div
      style={{
        width: cardW,
        height: cardH,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
        position: "relative",
        borderRadius: pf(12),
        border: "1px solid #e2e8f0",
        ...style,
      }}
    >
      {/* ── Top colored section ──────────────────────────────────────── */}
      <div
        style={{
          width: cardW,
          height: topH + curveH,
          background: primaryColor,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          padding: `${px(10)}px ${pf(14)}px ${curveH + px(18)}px`,
          position: "relative",
          flexShrink: 0,
          gap: px(hasReward ? 4 : 5),
        }}
      >
        {/* Business logo — scales without pushing other content */}
        {logoSrc ? (
          <img
            src={logoSrc}
            alt=""
            style={{
              width: logoSize,
              height: logoSize,
              objectFit: "contain",
              flexShrink: 1,
              minHeight: 0,
              ...(invertLogo ? { filter: "invert(1)" } : {}),
            }}
          />
        ) : (
          <div
            style={{
              width: logoSize,
              height: logoSize,
              borderRadius: pf(8),
              background: "rgba(255,255,255,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: pf(28),
              fontWeight: 800,
              color: textOnPrimary,
              flexShrink: 1,
              minHeight: 0,
            }}
          >
            {businessName[0]?.toUpperCase() ?? "?"}
          </div>
        )}

        {/* CTA text — uppercase, tracked, bold "GOOGLE" */}
        <div
          style={{
            fontSize: pf(isSquare ? 10.5 : 12.5),
            fontWeight: 800,
            color: textOnPrimary,
            lineHeight: 1.25,
            textAlign: "center",
            letterSpacing: pf(0.3),
          }}
        >
          {isReviews ? (
            <>
              Laissez-nous votre avis
              <br />
              sur <span style={{ fontWeight: 800 }}>Google</span>
            </>
          ) : (
            <>
              Votre carte
              <br />
              de <span style={{ fontWeight: 800 }}>fidélité</span>
            </>
          )}
        </div>

        {/* 5 gold stars (reviews) or spacer (loyalty) — same height */}
        <div style={{ display: "flex", gap: pf(2), flexShrink: 0, height: pf(12) }}>
          {isReviews && [0, 1, 2, 3, 4].map((i) => (
            <svg key={i} width={pf(12)} height={pf(12)} viewBox="0 0 24 24" fill="#FBBF24">
              <path d="M12 2l2.83 5.73 6.32.92-4.57 4.45 1.08 6.28L12 16.52l-5.66 2.98 1.08-6.28L2.85 8.65l6.32-.92L12 2z" />
            </svg>
          ))}
        </div>

        {/* Reward banner — visible, accrocheur */}
        {hasReward && (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: pf(4),
              background: "#FBBF24",
              borderRadius: pf(12),
              padding: `${px(2.5)}px ${pf(10)}px`,
              fontSize: pf(7),
              fontWeight: 800,
              color: "#1e293b",
              letterSpacing: 0.3,
              flexShrink: 0,
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            }}
          >
            <svg width={pf(10)} height={pf(10)} viewBox="0 0 24 24" fill="none" stroke="#1e293b" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 12 20 22 4 22 4 12" />
              <rect x="2" y="7" width="20" height="5" rx="1" />
              <line x1="12" y1="22" x2="12" y2="7" />
              <path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z" />
              <path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z" />
            </svg>
            {isReviews ? "Tentez de gagner un cadeau !" : "Récompense à la clé !"}
          </div>
        )}
      </div>

      {/* ── Curve separator ──────────────────────────────────────────── */}
      <div
        style={{
          marginTop: -curveH,
          position: "relative",
          zIndex: 2,
          flexShrink: 0,
        }}
      >
        <CurveSeparator width={cardW} color="#ffffff" />
      </div>

      {/* ── Bottom white section ─────────────────────────────────────── */}
      <div
        style={{
          flex: 1,
          background: "#ffffff",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          padding: `${px(2)}px ${pf(8)}px ${px(10)}px`,
          gap: px(6),
        }}
      >
        {/* NFC + separator + QR row */}
        <div
          style={{
            display: "flex",
            width: "100%",
            alignItems: "center",
            flex: 1,
          }}
        >
          {/* NFC side */}
          {card.hasNFC && (
            <>
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: px(2),
                }}
              >
                <span
                  style={{
                    fontSize: px(isSquare ? 6 : 7),
                    fontWeight: 800,
                    color: "#1e293b",
                    letterSpacing: 0.5,
                    textAlign: "center",
                    lineHeight: 1.35,
                    textTransform: "uppercase",
                  }}
                >
                  <span style={{ fontWeight: 800 }}>Collez</span>
                  <br />
                  votre téléphone
                </span>
                {nfcIconB64 ? (
                  <img
                    src={nfcIconB64}
                    alt="NFC"
                    style={{
                      width: iconQrSize,
                      height: iconQrSize,
                      objectFit: "contain",
                    }}
                  />
                ) : (
                  <div style={{ width: iconQrSize, height: iconQrSize }} />
                )}
              </div>

              {/* Vertical separator with "ou" */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  height: "70%",
                }}
              >
                <div style={{ flex: 1, width: 1, background: "#cbd5e1" }} />
                <span
                  style={{
                    fontSize: px(5.5),
                    fontWeight: 600,
                    color: "#94a3b8",
                    padding: `${px(2)}px 0`,
                    flexShrink: 0,
                  }}
                >
                  ou
                </span>
                <div style={{ flex: 1, width: 1, background: "#cbd5e1" }} />
              </div>
            </>
          )}

          {/* QR code side */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: px(2),
            }}
          >
            <span
              style={{
                fontSize: px(isSquare ? 6 : 7),
                fontWeight: 700,
                color: "#1e293b",
                letterSpacing: 0.5,
                textAlign: "center",
                lineHeight: 1.35,
                textTransform: "uppercase",
              }}
            >
              Scannez
              <br />
              le QR code
            </span>
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="QR"
                style={{
                  width: iconQrSize,
                  height: iconQrSize,
                  borderRadius: px(2),
                }}
              />
            ) : (
              <div
                style={{
                  width: iconQrSize,
                  height: iconQrSize,
                  background: "#f1f5f9",
                  borderRadius: px(2),
                }}
              />
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
