"use client";

import type { CardDef } from "./printable-cards";
import type { ThemeStyles } from "./printable-cards";
import { GoogleLogo, LoyaltyIcon, CurveSeparator, NfcIllustrationCompact } from "./print-card-icons";

// ── Props ────────────────────────────────────────────────────────────────────

interface PrintCardGoogleProps {
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
}

// ── Main Component ──────────────────────────────────────────────────────────

export function PrintCardGoogle({
  card,
  businessName,
  qrDataUrl,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  logoB64: _logoB64,
  businessLogoB64,
  businessLogoUrl,
  logoBackground,
  style,
  cardW = 220,
  cardH = 330,
  themeStyles: ts,
  showAvatar = true,
  invertLogo = false,
}: PrintCardGoogleProps) {
  const isReviews = card.type === "reviews";
  const isSquare = cardH <= cardW;
  const initial = businessName[0]?.toUpperCase() ?? "?";

  // Scale factors
  const s = Math.min(cardW / 220, cardH / 330);
  const sF = cardW / 220;
  const px = (n: number) => n * s;
  const pf = (n: number) => n * sF;

  // Split ratio: top colored section vs bottom white section
  const topRatio = isSquare ? 0.52 : 0.55;
  const topH = Math.round(cardH * topRatio);
  const curveH = Math.round(cardW * 0.12);

  // Google logo circle size
  const logoCircleSize = pf(isSquare ? 36 : 44);

  // Truncate business name for display
  const maxNameLen = Math.floor(cardW / pf(7.5));
  const displayName = businessName.length > maxNameLen
    ? businessName.slice(0, maxNameLen - 1) + "\u2026"
    : businessName;

  return (
    <div
      style={{
        width: cardW,
        height: cardH,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        fontFamily: ts.fontFamily,
        position: "relative",
        ...style,
      }}
    >
      {/* ── Top colored section ──────────────────────────────────────────── */}
      <div
        style={{
          width: cardW,
          height: topH + curveH,
          background: ts.bg,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: `${px(12)}px ${pf(14)}px 0`,
          position: "relative",
          flexShrink: 0,
        }}
      >
        {/* Business name header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: pf(5),
            width: "100%",
            marginBottom: px(isSquare ? 6 : 10),
          }}
        >
          {showAvatar && ((businessLogoB64 || businessLogoUrl) ? (
            <img
              src={businessLogoB64 || businessLogoUrl}
              alt=""
              style={{
                width: pf(20),
                height: pf(20),
                borderRadius: pf(5),
                objectFit: "contain",
                background: logoBackground || "rgba(255,255,255,0.2)",
                padding: pf(1.5),
                flexShrink: 0,
                ...(invertLogo ? { filter: "invert(1)" } : {}),
              }}
            />
          ) : (
            <div
              style={{
                width: pf(20),
                height: pf(20),
                borderRadius: pf(5),
                background: "rgba(255,255,255,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: pf(10),
                fontWeight: 700,
                color: ts.textColor,
                flexShrink: 0,
              }}
            >
              {initial}
            </div>
          ))}
          <span
            style={{
              fontSize: pf(8.5),
              fontWeight: 700,
              color: ts.textColor,
              letterSpacing: 0.2,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              maxWidth: cardW - pf(50),
              background: "rgba(255,255,255,0.15)",
              padding: `${px(2)}px ${pf(6)}px`,
              borderRadius: pf(4),
            }}
          >
            {displayName}
          </span>
        </div>

        {/* Central icon: Google G on white circle, or loyalty icon */}
        <div
          style={{
            width: logoCircleSize,
            height: logoCircleSize,
            borderRadius: "50%",
            background: isReviews ? "#fff" : "rgba(255,255,255,0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: isReviews ? "0 3px 12px rgba(0,0,0,0.15)" : "none",
            marginBottom: px(isSquare ? 5 : 8),
            flexShrink: 0,
          }}
        >
          {isReviews ? (
            <GoogleLogo size={Math.round(logoCircleSize * 0.55)} />
          ) : (
            <LoyaltyIcon size={Math.round(logoCircleSize * 0.7)} color={ts.textColor} />
          )}
        </div>

        {/* Main text */}
        <div
          style={{
            fontSize: pf(isSquare ? 14 : 16),
            fontWeight: 700,
            color: ts.textColor,
            lineHeight: 1.25,
            textAlign: "center",
            letterSpacing: -0.3,
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

        {/* Reward badge */}
        {card.hasReward && (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: pf(4),
              background: "rgba(255,255,255,0.2)",
              borderRadius: pf(12),
              padding: `${px(3)}px ${pf(9)}px`,
              fontSize: pf(8),
              fontWeight: 600,
              color: ts.textColor,
              marginTop: px(6),
            }}
          >
            {isReviews ? "Récompense à la clé !" : "Cadeaux à gagner !"}
          </div>
        )}
      </div>

      {/* ── Curve separator ──────────────────────────────────────────────── */}
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

      {/* ── Bottom white section ─────────────────────────────────────────── */}
      <div
        style={{
          flex: 1,
          background: "#ffffff",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: `0 ${pf(14)}px ${px(8)}px`,
          gap: px(isSquare ? 4 : 6),
        }}
      >
        {/* NFC + QR row */}
        <div
          style={{
            display: "flex",
            gap: px(card.hasNFC ? 4 : 8),
            width: "100%",
            alignItems: "stretch",
          }}
        >
          {card.hasNFC && (
            <>
              <div
                style={{
                  flex: 1,
                  borderRadius: px(8),
                  background: ts.nfcBoxBg,
                  border: ts.nfcBoxBorder,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: `${px(6)}px ${px(4)}px`,
                  gap: px(2),
                }}
              >
                <NfcIllustrationCompact size={px(isSquare ? 38 : 48)} />
                <span
                  style={{
                    fontSize: px(7),
                    fontWeight: 700,
                    color: ts.nfcTextColor,
                    textAlign: "center",
                    lineHeight: 1.3,
                    letterSpacing: 0.3,
                  }}
                >
                  APPROCHEZ
                  <br />
                  votre téléphone
                </span>
              </div>
              <span
                style={{
                  fontSize: px(7),
                  fontWeight: 600,
                  color: "#b0b0b0",
                  flexShrink: 0,
                  alignSelf: "center",
                }}
              >
                ou
              </span>
            </>
          )}

          <div
            style={{
              flex: 1,
              borderRadius: px(8),
              background: ts.qrBoxBg,
              boxShadow: ts.qrBoxShadow,
              border: "1.5px solid #f1f5f9",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: `${px(6)}px ${px(4)}px`,
              gap: px(2),
            }}
          >
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="QR"
                style={{
                  width: px(isSquare ? 52 : 60),
                  height: px(isSquare ? 52 : 60),
                  borderRadius: px(3),
                }}
              />
            ) : (
              <div
                style={{
                  width: px(isSquare ? 52 : 60),
                  height: px(isSquare ? 52 : 60),
                  background: "#f1f5f9",
                  borderRadius: px(3),
                }}
              />
            )}
            <span
              style={{
                fontSize: px(7),
                fontWeight: 700,
                color: ts.qrLabelColor,
                textAlign: "center",
                lineHeight: 1.3,
                letterSpacing: 0.3,
              }}
            >
              SCANNEZ-MOI
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
