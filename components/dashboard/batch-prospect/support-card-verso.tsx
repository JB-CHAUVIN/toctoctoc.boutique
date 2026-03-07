"use client";

import { SUPPORT_CARD_W, SUPPORT_CARD_H } from "./support-card-capture";

interface SupportCardVersoProps {
  businessName: string;
  cardType: "reviews" | "loyalty";
  refSetter: (el: HTMLDivElement | null) => void;
}

const CONTENT = {
  reviews: {
    gift: "Nous vous offrons ce support pour collecter facilement les avis de vos clients.",
    how: "Vos clients approchent leur t\u00e9l\u00e9phone de ce support (ou scannent le QR code au recto). Ils sont guid\u00e9s pour laisser un avis Google et peuvent gagner une r\u00e9compense-surprise\u00a0!",
    why: "Plus d\u2019avis Google = plus de visibilit\u00e9 = plus de clients. C\u2019est aussi simple que \u00e7a.",
  },
  loyalty: {
    gift: "Nous vous offrons ce support pour fid\u00e9liser vos clients avec une carte de fid\u00e9lit\u00e9 digitale.",
    how: "Vos clients approchent leur t\u00e9l\u00e9phone de ce support (ou scannent le QR code au recto). Leurs points s\u2019ajoutent automatiquement \u00e0 leur carte de fid\u00e9lit\u00e9, directement sur leur t\u00e9l\u00e9phone.",
    why: "Fini les cartons perdus. Vos clients reviennent plus souvent et vous les r\u00e9compensez facilement.",
  },
};

// NFC box position mirrored from recto PrintCard (bottom-left on recto = bottom-right on verso)
// Card 300x300: s=0.909, sF=1.364, padding: top~14.5 sides~19 bottom~10.9, box flex:1 with gap~7.3
// Each box ~127px wide, box padding: 10s top 8s sides 8s bottom, borderRadius: 10s ≈ 9
const NFC_BOX_W = 127;
const NFC_BOX_H = 110;
const NFC_BOTTOM = 11;
const NFC_RIGHT = 19;

export function SupportCardVerso({
  businessName,
  cardType,
  refSetter,
}: SupportCardVersoProps) {
  const c = CONTENT[cardType];
  const title = cardType === "reviews"
    ? "Support Avis Google"
    : "Support Carte de Fid\u00e9lit\u00e9";

  return (
    <div
      ref={refSetter}
      style={{
        position: "absolute",
        left: -99999,
        top: 0,
        width: SUPPORT_CARD_W,
        height: SUPPORT_CARD_H,
        pointerEvents: "none",
        overflow: "hidden",
      }}
      aria-hidden
    >
      <div
        style={{
          width: SUPPORT_CARD_W,
          height: SUPPORT_CARD_H,
          background: "#ffffff",
          fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
          color: "#64748b",
          padding: 16,
          boxSizing: "border-box",
          position: "relative",
        }}
      >
        {/* Title */}
        <div style={{ textAlign: "center", marginBottom: 8 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#334155", marginBottom: 2 }}>
            {title}
          </div>
          <div style={{ fontSize: 7.5, color: "#94a3b8", letterSpacing: 0.3 }}>
            {"\u00C0"} coller pr{"\u00E8"}s du comptoir {"\u2022"} face QR visible
          </div>
        </div>

        {/* Gift block */}
        <div
          style={{
            background: "#f8fafb",
            border: "1px solid #e2e8f0",
            borderRadius: 6,
            padding: "6px 10px",
            marginBottom: 8,
          }}
        >
          <div style={{ fontSize: 8, fontWeight: 600, color: "#334155", lineHeight: 1.4, marginBottom: 2 }}>
            Offert {"\u00E0"} {businessName}
          </div>
          <div style={{ fontSize: 7.5, color: "#64748b", lineHeight: 1.35 }}>
            {c.gift}
          </div>
        </div>

        {/* How it works */}
        <div style={{ marginBottom: 7 }}>
          <div style={{ fontSize: 8, fontWeight: 700, color: "#475569", marginBottom: 2 }}>
            Comment {"\u00E7"}a marche{"\u00A0"}?
          </div>
          <div style={{ fontSize: 7, lineHeight: 1.4, color: "#64748b" }}>
            {c.how}
          </div>
        </div>

        {/* Why */}
        <div style={{ marginBottom: 0 }}>
          <div style={{ fontSize: 8, fontWeight: 700, color: "#475569", marginBottom: 2 }}>
            Pourquoi c{"\u2019"}est utile{"\u00A0"}?
          </div>
          <div style={{ fontSize: 7, lineHeight: 1.4, color: "#64748b" }}>
            {c.why}
          </div>
        </div>

        {/* Support block - bottom left */}
        <div
          style={{
            position: "absolute",
            bottom: 16,
            left: 16,
            width: NFC_BOX_W - 4,
            background: "#f8fafc",
            borderRadius: 5,
            padding: "4px 7px",
            border: "1px solid #e2e8f0",
          }}
        >
          <div style={{ fontSize: 6.5, fontWeight: 600, color: "#94a3b8", marginBottom: 1 }}>
            Besoin d{"\u2019"}aide{"\u00A0"}?
          </div>
          <div style={{ fontSize: 6, color: "#94a3b8", lineHeight: 1.3 }}>
            Votre support ne fonctionne plus{"\u00A0"}?
            <br />
            contact@toctoctoc.boutique
          </div>
        </div>

        {/* NFC dashed zone - bottom right, mirrored from recto */}
        <div
          style={{
            position: "absolute",
            bottom: NFC_BOTTOM,
            right: NFC_RIGHT,
            width: NFC_BOX_W,
            height: NFC_BOX_H,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
          }}
        >
          {/* Label + arrow above the box */}
          <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: -2 }}>
            <div style={{ fontSize: 6.5, color: "#94a3b8", fontStyle: "italic", textAlign: "right", lineHeight: 1.15 }}>
              Coller le tag
              <br />
              NFC ici
            </div>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
              <path d="M4 4L12 12M12 12V5M12 12H5" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          {/* Dashed square */}
          <div
            style={{
              width: NFC_BOX_W - 16,
              height: NFC_BOX_H - 40,
              border: "2px dashed #cbd5e1",
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 8.32a7.43 7.43 0 0 1 0 7.36" />
              <path d="M9.46 6.21a11.76 11.76 0 0 1 0 11.58" />
              <path d="M12.91 4.1a16.1 16.1 0 0 1 0 15.8" />
              <path d="M16.37 2a20.16 20.16 0 0 1 0 20" />
            </svg>
            <div style={{ fontSize: 6, color: "#b0b8c4", lineHeight: 1.2 }}>
              Pastille NFC
              <br />
              sans contact
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
