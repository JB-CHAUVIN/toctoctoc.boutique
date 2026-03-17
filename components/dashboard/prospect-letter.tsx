"use client";

import { useState } from "react";
import { FileText, Loader2 } from "lucide-react";
import QRCode from "qrcode";
import { hexToRgb } from "@/lib/utils";
import { PRINT_THEMES, type PrintThemeId } from "@/lib/constants";

interface BrandStyleData {
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  fontFamily?: string | null;
  mood?: string;
  [key: string]: unknown;
}

interface BusinessInfo {
  name: string;
  slug: string;
  businessType: string | null;
  address: string | null;
  city: string | null;
  zipCode: string | null;
  phone: string | null;
  email: string | null;
  primaryColor: string;
  accentColor: string;
  logoUrl?: string | null;
  logoBackground?: string | null;
  googleRating?: number | null;
  googleReviewCount?: number | null;
}

interface Props {
  business: BusinessInfo;
  businessId: string;
  claimToken: string | null;
  appUrl: string;
  brandStyle?: BrandStyleData | null;
}

/** Generates inline SVG stars with partial fill for print HTML */
function buildSvgStars(rating: number, size: number, emptyColor = "#D1D5DB"): string {
  const starPath = "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z";
  return Array.from({ length: 5 }, (_, i) => {
    const fill = Math.max(0, Math.min(1, rating - i));
    const id = `s${i}_${Math.random().toString(36).slice(2, 6)}`;
    if (fill >= 1) {
      return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" style="display:inline-block;vertical-align:middle;"><path d="${starPath}" fill="#FBBC04" stroke="none"/></svg>`;
    }
    if (fill <= 0) {
      return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" style="display:inline-block;vertical-align:middle;"><path d="${starPath}" fill="${emptyColor}" stroke="none"/></svg>`;
    }
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" style="display:inline-block;vertical-align:middle;">
      <defs><linearGradient id="${id}"><stop offset="${Math.round(fill * 100)}%" stop-color="#FBBC04"/><stop offset="${Math.round(fill * 100)}%" stop-color="${emptyColor}"/></linearGradient></defs>
      <path d="${starPath}" fill="url(#${id})" stroke="none"/></svg>`;
  }).join("");
}

/** Builds an HTML mock of a Google Business panel */
function buildGoogleMock(
  name: string, rating: number, reviewCount: number, type: string | null,
  address?: string | null, city?: string | null, zipCode?: string | null,
): string {
  const category = (type && type !== "Autre") ? type : "Commerce local";
  const addressLine = [address, [zipCode, city].filter(Boolean).join(" ")].filter(Boolean).join(", ");
  return `<div style="font-family:Arial,Roboto,sans-serif;background:#fff;border-radius:8px;border:1px solid #dadce0;overflow:hidden;font-size:8pt;line-height:1.4;">
    <div style="padding:3mm 3.5mm 2.5mm;">
      <div style="font-size:12pt;font-weight:400;color:#202124;margin-bottom:1mm;">${name}</div>
      <div style="display:flex;align-items:center;gap:1.5mm;margin-bottom:1mm;">
        <span style="font-size:9pt;font-weight:600;color:#202124;">${rating.toFixed(1)}</span>
        ${buildSvgStars(rating, 11, "#dadce0")}
        <span style="font-size:8pt;color:#70757a;">(${reviewCount.toLocaleString("fr-FR")} avis)</span>
      </div>
      <div style="font-size:8pt;color:#70757a;">${category} · <span style="color:#188038;font-weight:500;">Ouvert</span></div>${addressLine ? `
      <div style="font-size:8pt;color:#70757a;margin-top:0.5mm;">${addressLine}</div>` : ""}
    </div>
    <div style="border-top:1px solid #dadce0;display:flex;text-align:center;font-size:7.5pt;color:#1a73e8;font-weight:500;">
      <div style="flex:1;padding:2mm 0;border-right:1px solid #dadce0;">Itinéraire</div>
      <div style="flex:1;padding:2mm 0;border-right:1px solid #dadce0;">Enregistrer</div>
      <div style="flex:1;padding:2mm 0;">Partager</div>
    </div>
  </div>`;
}

export function buildLetterHtml(
  business: BusinessInfo,
  businessId: string,
  appUrl: string,
  claimUrl: string | null,
  claimQrDataUrl: string | null,
  theme: PrintThemeId = "gradient",
  brandStyle?: BrandStyleData | null,
  showAvatar = true,
): string {
  const today = new Date().toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Apply theme-based color overrides
  const primary    = business.primaryColor;
  const accent     = business.accentColor;
  const primaryRgb = hexToRgb(primary);
  const fontFamily = "Plus Jakarta Sans";

  // Theme-specific CSS overrides
  const isMinimal = theme === "minimal";
  const isBold = theme === "bold";

  // Logo absolute URL (new window needs absolute paths)
  const logoAbsUrl = business.logoUrl
    ? (business.logoUrl.startsWith("http") ? business.logoUrl : `${appUrl}${business.logoUrl}`)
    : null;
  const logoBg = business.logoBackground || "transparent";

  // Business avatar in header (logo img or letter initial)
  const businessAvatar = logoAbsUrl
    ? `<img src="${logoAbsUrl}" alt="${business.name}" style="width:36px;height:36px;object-fit:contain;border-radius:8px;background:${logoBg};padding:2px;flex-shrink:0;display:block;" />`
    : "";

  const addressLines = [
    business.address,
    [business.zipCode, business.city].filter(Boolean).join(" "),
  ]
    .filter(Boolean)
    .map((l) => `<div>${l}</div>`)
    .join("");

  const hasGoogleData = business.googleRating != null && business.googleReviewCount != null;
  const beforeRating = hasGoogleData ? business.googleRating! : 3.2;
  const beforeCount = hasGoogleData ? business.googleReviewCount! : 12;
  const afterRating = 4.9;
  const afterCount = hasGoogleData ? business.googleReviewCount! * 2 : 142;
  const beforeCaption = hasGoogleData
    ? (business.googleRating! >= 4
      ? `Votre fiche est bien notée, mais imaginez avec le double d'avis…`
      : `${business.googleRating!.toFixed(1)}★ avec seulement ${business.googleReviewCount} avis`)
    : "Peu d'avis, peu de visibilité";
  const afterCaption = `${afterRating}★ et ${afterCount} avis — <strong><u>vous dominez la recherche locale</u></strong>`;

  const beforeAfterInline = `
    <div class="before-after">
      <div class="ba-col">
        <div class="ba-label ba-label-before">Aujourd'hui</div>
        ${buildGoogleMock(business.name, beforeRating, beforeCount, business.businessType, business.address, business.city, business.zipCode)}
        <div class="ba-caption">${beforeCaption}</div>
      </div>
      <div class="ba-arrow">→</div>
      <div class="ba-col">
        <div class="ba-label ba-label-after">Avec TocTocToc</div>
        ${buildGoogleMock(business.name, afterRating, afterCount, business.businessType, business.address, business.city, business.zipCode)}
        <div class="ba-caption">${afterCaption}</div>
      </div>
    </div>`;

  const claimSection =
    claimUrl && claimQrDataUrl
      ? `
  <div class="claim-section">
    <div class="claim-title">📲 Activez votre espace en 2 minutes — c'est gratuit</div>
    <div class="claim-body">
      <div class="claim-qr">
        <img src="${claimQrDataUrl}" alt="QR Code activation" width="110" height="110" style="display:block;" />
        <div class="claim-qr-label">Scanner pour activer</div>
      </div>
      <div class="claim-text">
        <p>
          Scannez ce QR code avec votre smartphone pour <strong>activer votre espace ${business.name}</strong> — c'est gratuit, sans engagement, et tout est déjà configuré pour vous.
        </p>
        <p style="margin-top:2mm; font-size:7.5pt; color:#64748b; word-break:break-all; font-family:'Courier New',monospace;">
          ${claimUrl}
        </p>
        <p style="margin-top:2mm; font-size:8.5pt; color:#64748b;">
          Ce lien est personnalisé et vous est réservé — votre espace sera immédiatement accessible.
        </p>
      </div>
    </div>
  </div>`
      : "";

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8" />
<title>Lettre prospect — ${business.name}</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Great+Vibes&display=swap" rel="stylesheet" />
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; font-family: '${fontFamily}', 'Plus Jakarta Sans', sans-serif; }

  @page { size: A4; margin: 0; }

  body {
    font-family: '${fontFamily}', 'Plus Jakarta Sans', sans-serif;
    font-size: 10.5pt;
    line-height: 1.55;
    color: #1e293b;
    background: white;
    width: 210mm;
    margin: 0;
  }

  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  }

  .page {
    width: 210mm;
    height: 297mm;
    display: flex;
    flex-direction: column;
    position: relative;
    overflow: hidden;
  }

  /* ── DECORATIVE BUBBLES (background) ── */
  .bubble {
    position: absolute;
    border-radius: 50%;
    pointer-events: none;
    z-index: 0;
  }

  /* ── HERO BANNER ── */
  .hero {
    background: ${isMinimal ? `#fff` : isBold ? primary : `linear-gradient(135deg, ${primary} 0%, ${accent} 100%)`};
    ${isMinimal ? `border-bottom: 4px solid ${primary};` : ""}
    padding: 8mm 20mm 7mm 20mm;
    position: relative;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 5mm;
  }

  .hero-left {
    display: flex;
    align-items: center;
    gap: 4mm;
    z-index: 1;
  }

  .hero-business-name {
    font-size: 18pt;
    font-weight: 800;
    color: ${isMinimal ? primary : "#fff"};
    letter-spacing: -0.3px;
    line-height: 1.15;
  }

  .hero-type {
    font-size: 9.5pt;
    color: ${isMinimal ? "#64748b" : "rgba(255,255,255,0.75)"};
    font-weight: 500;
    margin-top: 1mm;
  }

  .hero-right {
    z-index: 1;
    text-align: right;
    flex-shrink: 0;
  }

  .hero-brand {
    font-size: 9pt;
    font-weight: 700;
    color: ${isMinimal ? "#334155" : "rgba(255,255,255,0.9)"};
    letter-spacing: 0.2px;
  }

  .hero-tagline {
    font-size: 7.5pt;
    color: ${isMinimal ? "#94a3b8" : "rgba(255,255,255,0.6)"};
    margin-top: 0.5mm;
  }

  /* ── INNER CONTENT ── */
  .inner {
    padding: 6mm 20mm 16mm 20mm;
    flex: 1;
    display: flex;
    flex-direction: column;
    position: relative;
    z-index: 1;
  }

  /* ── HEADER (from / to) ── */
  .meta-bar {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding-bottom: 5mm;
    border-bottom: 2px solid ${primary};
    margin-bottom: 5mm;
  }

  .recipient-address {
    font-size: 10pt;
    line-height: 1.7;
    color: #334155;
  }

  .recipient-name {
    font-weight: 700;
    font-size: 11pt;
    color: #0f172a;
  }

  .date-place {
    font-size: 9.5pt;
    color: #64748b;
    text-align: right;
    padding-top: 1mm;
  }



  /* ── HOOK BANNER ── */
  .hook-banner {
    background: linear-gradient(135deg, ${primary} 0%, ${accent} 100%);
    border-radius: 10px;
    padding: 5mm 6mm;
    margin-bottom: 5mm;
    position: relative;
    overflow: hidden;
  }

  .hook-banner::before {
    content: "";
    position: absolute;
    top: -15mm;
    right: -10mm;
    width: 40mm;
    height: 40mm;
    border-radius: 50%;
    background: rgba(255,255,255,0.08);
  }

  .hook-banner::after {
    content: "";
    position: absolute;
    bottom: -8mm;
    left: 10mm;
    width: 25mm;
    height: 25mm;
    border-radius: 50%;
    background: rgba(255,255,255,0.06);
  }

  .hook-question {
    font-size: 13pt;
    font-weight: 800;
    color: #fff;
    line-height: 1.4;
    position: relative;
    z-index: 1;
    text-align: center;
  }

  .hook-sub {
    text-align: center;
    margin-top: 2.5mm;
    font-size: 8pt;
    color: rgba(255,255,255,0.75);
    font-weight: 500;
    position: relative;
    z-index: 1;
  }

  /* ── BODY ── */
  .body p {
    margin-bottom: 4mm;
    font-size: 10.5pt;
    text-align: justify;
    color: #1e293b;
  }

  .highlight {
    font-weight: 700;
    color: ${primary};
  }


  /* ── CARDS SECTION ── */
  .cards-section {
    margin: 5mm 0;
    border: 1.5px dashed rgba(${primaryRgb}, 0.35);
    border-radius: 8px;
    padding: 4mm 6mm;
    break-inside: avoid;
    page-break-inside: avoid;
  }

  .cards-title {
    font-size: 11pt;
    font-weight: 700;
    color: ${primary};
    margin-bottom: 2.5mm;
  }

  .cards-desc {
    font-size: 9pt;
    color: #475569;
  }

  .cards-urls {
    margin-top: 2mm;
    font-family: 'Courier New', monospace;
    font-size: 8pt;
    color: #64748b;
  }

  /* ── FEATURE GRID ── */
  .feature-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2.5mm;
    margin: 4mm 0;
  }

  .feature-card {
    display: flex;
    align-items: flex-start;
    gap: 2.5mm;
    padding: 2.5mm 3mm;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    background: #f8fafc;
  }

  .feature-icon {
    font-size: 14pt;
    line-height: 1;
    flex-shrink: 0;
    margin-top: 0.5mm;
  }

  .feature-title {
    font-size: 9pt;
    font-weight: 700;
    color: #0f172a;
    margin-bottom: 0.5mm;
  }

  .feature-desc {
    font-size: 7.5pt;
    color: #64748b;
    line-height: 1.35;
  }

  /* ── SOCIAL PROOF ── */
  .social-proof {
    margin: 3mm 0 0;
    padding: 2.5mm 4mm;
    background: #fffbeb;
    border-left: 3px solid #f59e0b;
    border-radius: 0 6px 6px 0;
    font-size: 8.5pt;
    color: #78350f;
    line-height: 1.45;
  }

  .social-proof-stat {
    font-size: 12pt;
    font-weight: 900;
    color: #d97706;
  }

  /* ── REASSURANCE GRID ── */
  .reassurance-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 3mm;
    margin: 5mm 0;
  }

  .reassurance-item {
    display: flex;
    align-items: flex-start;
    gap: 2mm;
    font-size: 9pt;
    color: #334155;
    line-height: 1.4;
  }

  .reassurance-icon {
    font-size: 12pt;
    line-height: 1;
    flex-shrink: 0;
  }

  /* ── CLAIM SECTION ── */
  .claim-section {
    margin: 5mm 0;
    border: 2.5px solid #4f46e5;
    border-radius: 10px;
    padding: 4mm 6mm;
    background: rgba(79,70,229,0.04);
    break-inside: avoid;
    page-break-inside: avoid;
  }

  .claim-title {
    font-size: 13pt;
    font-weight: 700;
    color: #4f46e5;
    margin-bottom: 3mm;
  }

  .claim-body {
    display: flex;
    gap: 5mm;
    align-items: flex-start;
  }

  .claim-qr { flex-shrink: 0; text-align: center; }

  .claim-qr-label {
    font-size: 7.5pt;
    color: #64748b;
    margin-top: 1.5mm;
  }

  .claim-text {
    font-size: 9pt;
    color: #334155;
    line-height: 1.55;
  }

  /* ── SOFT CLOSE ── */
  .soft-close {
    margin: 4mm 0;
    padding: 3.5mm 5mm;
    background: #f8fafc;
    border-radius: 8px;
    font-size: 8.5pt;
    color: #475569;
    font-style: italic;
  }

  /* ── SIGNATURE ── */
  .signature {
    margin-top: auto;
    padding-top: 6mm;
    border-top: 1px solid #e2e8f0;
  }

  .signature-text { font-size: 10pt; color: #334155; margin-bottom: 3mm; }

  .signature-handwriting {
    font-family: 'Great Vibes', cursive;
    font-size: 16pt;
    color: #312e81;
    line-height: 1;
    display: inline-block;
    transform: rotate(-1.5deg);
    margin: 3mm 0 1mm 2mm;
    letter-spacing: 1px;
  }

  .signature-name { font-size: 10pt; font-weight: 600; color: #334155; letter-spacing: 0.3px; }
  .signature-role { font-size: 8.5pt; color: #94a3b8; }

  /* ── FOOTER ── */
  .footer {
    margin-top: 6mm;
    padding-top: 3mm;
    border-top: 1px solid #e2e8f0;
    display: flex;
    justify-content: space-between;
    font-size: 7.5pt;
    color: #94a3b8;
  }

  /* ── BEFORE / AFTER (inside hook banner) ── */
  .before-after {
    display: flex;
    align-items: flex-start;
    gap: 3mm;
    margin: 4mm 0 2mm;
    break-inside: avoid;
    page-break-inside: avoid;
    position: relative;
    z-index: 1;
  }

  .ba-col {
    flex: 1;
    text-align: left;
  }

  .ba-label {
    font-size: 9pt;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    margin-bottom: 2mm;
    padding: 1mm 3mm;
    border-radius: 4px;
    display: inline-block;
  }

  .ba-label-before {
    background: rgba(255,255,255,0.2);
    color: rgba(255,255,255,0.85);
  }

  .ba-label-after {
    background: rgba(255,255,255,0.25);
    color: #fff;
  }

  .ba-caption {
    font-size: 7.5pt;
    color: rgba(255,255,255,0.8);
    margin-top: 1.5mm;
    font-weight: 500;
  }

  .ba-arrow {
    font-size: 22pt;
    color: #fff;
    font-weight: 900;
    flex-shrink: 0;
    padding: 0 1mm;
    margin-top: 10mm;
    text-shadow: 0 1px 3px rgba(0,0,0,0.15);
  }
</style>
</head>
<body>
<div class="page">

  <!-- BACKGROUND BUBBLES (page 1 atmosphere) -->
  <div class="bubble" style="width:100mm;height:100mm;background:rgba(${primaryRgb},0.04);top:-20mm;right:-25mm;"></div>
  <div class="bubble" style="width:65mm;height:65mm;background:rgba(${primaryRgb},0.03);bottom:50mm;left:-20mm;"></div>
  <div class="bubble" style="width:40mm;height:40mm;background:rgba(${primaryRgb},0.025);top:90mm;left:-10mm;"></div>

  <!-- HERO BANNER -->
  <div class="hero">
    <!-- Decorative circles inside hero -->
    <div style="position:absolute;width:70mm;height:70mm;border-radius:50%;background:rgba(255,255,255,0.08);top:-25mm;right:20mm;"></div>
    <div style="position:absolute;width:45mm;height:45mm;border-radius:50%;background:rgba(255,255,255,0.05);bottom:-18mm;right:-10mm;"></div>
    <div style="position:absolute;width:30mm;height:30mm;border-radius:50%;background:rgba(255,255,255,0.06);top:-5mm;left:40%;"></div>

    <div class="hero-left">
      ${showAvatar ? businessAvatar : ""}
      <div>
        <div class="hero-business-name">${business.name}</div>
      </div>
    </div>
    <div class="hero-right">
      <div style="display:flex;align-items:center;gap:3mm;justify-content:flex-end;margin-bottom:1mm;">
        <img src="${appUrl}/logo.png" alt="" style="height:18px;width:18px;vertical-align:middle;border-radius:4px;display:inline-block;" />
        <span class="hero-brand">TocTocToc.boutique</span>
      </div>
      <div class="hero-tagline">Plus d'avis Google, plus de clients fidèles</div>
    </div>
  </div>

  <!-- INNER CONTENT -->
  <div class="inner">

    <!-- META BAR (compact) -->
    <div class="meta-bar">
      <div class="recipient-address">
        <div class="recipient-name">${business.name}</div>
        ${addressLines}
      </div>
      <div>
        <div class="date-place">${business.city ? `${business.city}, le` : "Le"} ${today}</div>
      </div>
    </div>

    <!-- HOOK BANNER + BEFORE/AFTER -->
    <div class="hook-banner">${business.googleRating != null && business.googleReviewCount != null ? `
      <div style="text-align:center;margin-bottom:3mm;">
        <span style="display:inline-flex;align-items:center;gap:2mm;background:rgba(255,255,255,0.18);border:1px solid rgba(255,255,255,0.3);border-radius:20px;padding:1.5mm 5mm;font-size:9pt;color:#fff;font-weight:600;">
          Votre note aujourd'hui : ${buildSvgStars(business.googleRating, 14, "#fff")} ${business.googleRating.toFixed(1)}/5 (${business.googleReviewCount} avis)
        </span>
      </div>` : ""}
      <div class="hook-question">Et si ${business.name} avait 50 avis Google de plus le mois prochain ?</div>
      ${beforeAfterInline}
      <div class="hook-sub"><strong><u>Tout est déjà configuré pour ${business.name} — il ne reste qu'à activer.</u></strong></div>
    </div>

    <!-- BODY -->
    <div class="body">
      <p>Bonjour,</p>

      <p>
        <strong>9 clients sur 10 consultent les avis Google avant de pousser la porte d'un commerce.</strong>
        ${business.googleRating != null && business.googleReviewCount != null
          ? ` Avec ${business.googleReviewCount} avis et une note de ${business.googleRating.toFixed(1)}★, ${business.name} a une belle base — mais vos concurrents avancent vite.`
          : ` Peu d'avis = peu de visibilité. Vos concurrents les mieux notés captent vos futurs clients.`}
        J'ai préparé un espace complet pour <span class="highlight">${business.name}</span> — il est prêt, il ne reste qu'à l'activer.
      </p>

      <!-- FEATURE CARDS -->
      <div class="feature-grid">
        <div class="feature-card">
          <div class="feature-icon">⭐</div>
          <div>
            <div class="feature-title">Collecte d'avis Google</div>
            <div class="feature-desc">Vos clients scannent un QR code, laissent un avis et tentent de gagner un cadeau</div>
          </div>
        </div>
        <div class="feature-card">
          <div class="feature-icon">🎯</div>
          <div>
            <div class="feature-title">Fidélité digitale</div>
            <div class="feature-desc">Carte de fidélité sur smartphone, tamponnage par QR code — fini les cartons perdus</div>
          </div>
        </div>
        <div class="feature-card">
          <div class="feature-icon">🌐</div>
          <div>
            <div class="feature-title">Site vitrine pro</div>
            <div class="feature-desc">Une page aux couleurs de votre commerce, visible sur Google en 5 minutes</div>
          </div>
        </div>
        <div class="feature-card">
          <div class="feature-icon">📅</div>
          <div>
            <div class="feature-title">Réservations en ligne</div>
            <div class="feature-desc">Vos clients réservent 24h/24 depuis votre fiche Google ou votre site</div>
          </div>
        </div>
      </div>

      <!-- SOCIAL PROOF -->
      <div class="social-proof">
        <span class="social-proof-stat">97%</span> des commerçants qui collectent activement leurs avis voient leur note Google augmenter en moins de 30 jours.
      </div>

    </div>

    <!-- FOOTER (page 1) -->
    <div class="footer" style="margin-top:auto;">
      <span>TocTocToc.boutique — Plus d'avis Google, plus de clients fidèles</span>
      <span>page 1/2</span>
    </div>

  </div><!-- /inner -->
</div><!-- /page 1 -->

<!-- ═══════════════ PAGE 2 ═══════════════ -->
<div class="page">

  <!-- BACKGROUND BUBBLES (page 2) -->
  <div class="bubble" style="width:90mm;height:90mm;background:rgba(${primaryRgb},0.04);top:0;right:-20mm;"></div>
  <div class="bubble" style="width:55mm;height:55mm;background:rgba(${primaryRgb},0.03);bottom:40mm;left:-15mm;"></div>

  <div class="inner">

      ${claimSection}

      <!-- CARDS -->
      <div class="cards-section">
        <div class="cards-title">📎 Vous trouverez aussi dans cette enveloppe</div>
        <div class="cards-desc">
          Des <strong>supports QR codes</strong> prêts à poser sur votre comptoir — aucune manipulation technique :
          <br/>
          <strong>• Collecte d'avis Google</strong> — vos clients scannent, laissent un avis et jouent pour gagner un cadeau<br/>
          <strong>• Carte de fidélité</strong> — vos clients scannent à chaque passage pour cumuler leurs points
        </div>
      </div>

      <!-- REASSURANCE -->
      <div class="reassurance-grid">
        <div class="reassurance-item">
          <span class="reassurance-icon">✅</span>
          <div>
            <strong>100% gratuit pour démarrer</strong><br/>
            <span style="font-size:8pt;color:#64748b;">Pas de carte bancaire requise</span>
          </div>
        </div>
        <div class="reassurance-item">
          <span class="reassurance-icon">⏱️</span>
          <div>
            <strong>Activation en 2 minutes</strong><br/>
            <span style="font-size:8pt;color:#64748b;">Tout est déjà configuré pour vous</span>
          </div>
        </div>
        <div class="reassurance-item">
          <span class="reassurance-icon">🔓</span>
          <div>
            <strong>Sans engagement</strong><br/>
            <span style="font-size:8pt;color:#64748b;">Résiliable en un clic, à tout moment</span>
          </div>
        </div>
        <div class="reassurance-item">
          <span class="reassurance-icon">🇫🇷</span>
          <div>
            <strong>Support français</strong><br/>
            <span style="font-size:8pt;color:#64748b;">Une vraie personne vous répond</span>
          </div>
        </div>
      </div>

      <p style="font-size:10pt;color:#334155;margin-top:4mm;">
        Si vous avez la moindre question, je suis disponible par email ou par téléphone — je serai ravi d'échanger avec vous.
      </p>

    <!-- SIGNATURE -->
    <div class="signature">
      <div class="signature-text">Cordialement,</div>
      <div class="signature-handwriting">jbc</div>
      <div class="signature-name">Jean-Baptiste CHAUVIN</div>
      <div class="signature-role">Fondateur · TocTocToc.boutique</div>
      <div style="font-size:8pt;color:#94a3b8;margin-top:1mm;">contact@toctoctoc.boutique · www.toctoctoc.boutique</div>
    </div>

    <!-- FOOTER (page 2) -->
    <div class="footer">
      <span>TocTocToc.boutique — Plus d'avis Google, plus de clients fidèles</span>
      <span>page 2/2</span>
    </div>

  </div><!-- /inner -->
</div><!-- /page 2 -->
</body>
</html>`;
}

export function ProspectLetterButton({
  business,
  businessId,
  claimToken,
  appUrl,
  brandStyle,
}: Props) {
  const [loading, setLoading] = useState(false);
  const hasLogo = !!business.logoUrl;
  const [theme, setTheme] = useState<PrintThemeId>(hasLogo ? "logo" : "gradient");

  async function handlePrint() {
    setLoading(true);
    try {
      let token = claimToken;
      let claimUrl: string | null = null;
      let claimQrDataUrl: string | null = null;

      if (!token) {
        const res = await fetch(`/api/admin/businesses/${businessId}/claim-token`, { method: "POST" });
        const data = await res.json();
        if (data.success) token = data.token;
      }

      if (token) {
        claimUrl = `${appUrl}/claim/${token}`;
        claimQrDataUrl = await QRCode.toDataURL(claimUrl, {
          width: 220,
          margin: 1,
          color: { dark: "#1e293b", light: "#ffffff" },
        });
      }

      const html = buildLetterHtml(business, businessId, appUrl, claimUrl, claimQrDataUrl, theme, brandStyle);
      const win = window.open("", "_blank", "width=900,height=1100");
      if (!win) return;
      win.document.write(html);
      win.document.close();
      win.focus();
      win.document.fonts.ready.then(() => setTimeout(() => win.print(), 200));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handlePrint}
        disabled={loading}
        className="flex items-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-4 py-2 text-sm font-medium text-violet-700 shadow-sm transition hover:border-violet-300 hover:bg-violet-100 disabled:opacity-60"
      >
        {loading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <FileText className="h-3.5 w-3.5" />
        )}
        Imprimer le tract
      </button>
      <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-0.5">
        {PRINT_THEMES.map((t) => {
          const disabled = t.requiresLogo && !hasLogo;
          return (
            <button
              key={t.id}
              onClick={() => !disabled && setTheme(t.id)}
              disabled={disabled}
              title={disabled ? "Nécessite un logo pour le commerce" : t.description}
              className={`rounded-md px-2 py-1 text-xs font-medium transition-all ${
                theme === t.id
                  ? "bg-white text-violet-700 shadow-sm"
                  : disabled
                    ? "cursor-not-allowed text-slate-300"
                    : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {t.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
