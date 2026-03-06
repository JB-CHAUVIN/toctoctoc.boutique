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
}

interface Props {
  business: BusinessInfo;
  businessId: string;
  claimToken: string | null;
  appUrl: string;
  brandStyle?: BrandStyleData | null;
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
  const useCustom = theme === "custom" && brandStyle?.primaryColor;
  const primary    = useCustom ? brandStyle!.primaryColor! : business.primaryColor;
  const accent     = useCustom ? (brandStyle!.accentColor || business.accentColor) : business.accentColor;
  const primaryRgb = hexToRgb(primary);
  const fontFamily = useCustom && brandStyle?.fontFamily ? brandStyle.fontFamily : "Plus Jakarta Sans";

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
    ? `<img src="${logoAbsUrl}" alt="${business.name}" style="width:52px;height:52px;object-fit:contain;border-radius:10px;background:${logoBg};padding:4px;flex-shrink:0;display:block;" />`
    : `<div style="width:52px;height:52px;border-radius:10px;background:${accent};display:flex;align-items:center;justify-content:center;font-size:22pt;font-weight:800;color:#fff;flex-shrink:0;font-family:'Plus Jakarta Sans',sans-serif;">${business.name[0]?.toUpperCase() ?? "?"}</div>`;

  const addressLines = [
    business.address,
    [business.zipCode, business.city].filter(Boolean).join(" "),
  ]
    .filter(Boolean)
    .map((l) => `<div>${l}</div>`)
    .join("");

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

  .sender-info {
    font-size: 8pt;
    color: #64748b;
    text-align: right;
    margin-top: 2mm;
    line-height: 1.6;
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

  .hook-benefits {
    display: flex;
    justify-content: center;
    gap: 4mm;
    margin-top: 3.5mm;
    position: relative;
    z-index: 1;
  }

  .hook-benefit {
    background: rgba(255,255,255,0.12);
    border: 1px solid rgba(255,255,255,0.25);
    border-radius: 10px;
    padding: 3mm 4mm;
    flex: 1;
    text-align: center;
  }

  .hook-benefit-title {
    font-size: 9.5pt;
    font-weight: 800;
    color: #fff;
    margin-bottom: 1mm;
  }

  .hook-benefit-desc {
    font-size: 8.5pt;
    color: rgba(255,255,255,0.85);
    line-height: 1.35;
    font-weight: 500;
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

  /* ── FEATURES ── */
  .features {
    margin: 4mm 0;
    background: rgba(${primaryRgb}, 0.04);
    border: 1px solid rgba(${primaryRgb}, 0.18);
    border-radius: 8px;
    padding: 4mm 6mm;
    break-inside: avoid;
    page-break-inside: avoid;
  }

  .features-title {
    font-size: 10pt;
    font-weight: 700;
    color: ${primary};
    margin-bottom: 3mm;
  }

  .features-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2mm 6mm;
  }

  .feature-item {
    display: flex;
    align-items: flex-start;
    gap: 2mm;
    font-size: 9.5pt;
    color: #334155;
  }

  .feature-text strong {
    display: block;
    font-weight: 700;
    color: #0f172a;
    font-size: 9.5pt;
  }

  .feature-text span {
    font-size: 8.5pt;
    color: #64748b;
  }

  .features-divider {
    border: none;
    border-top: 1px solid rgba(${primaryRgb}, 0.15);
    margin: 3.5mm 0;
  }

  .features-secondary-label {
    font-size: 8pt;
    color: #94a3b8;
    font-weight: 600;
    margin-bottom: 2mm;
  }

  .features-secondary-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5mm 6mm;
  }

  .feature-secondary {
    font-size: 8pt;
    color: #64748b;
  }

  .feature-secondary strong {
    font-weight: 600;
    color: #475569;
  }

  .features-coming {
    margin-top: 3mm;
    font-size: 7.5pt;
    color: #94a3b8;
    font-style: italic;
    line-height: 1.45;
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

  /* ── PRICE BLOCK ── */
  .price-block {
    margin: 5mm 0;
    background: linear-gradient(135deg, ${primary} 0%, ${accent} 100%);
    border-radius: 12px;
    padding: 6mm 7mm 5mm;
    color: white;
    position: relative;
    overflow: hidden;
    break-inside: avoid;
    page-break-inside: avoid;
  }

  .price-block-label {
    font-size: 8pt;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1.2px;
    opacity: 0.85;
    margin-bottom: 4mm;
    position: relative;
    z-index: 1;
  }

  .price-plans {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 3mm;
    margin-bottom: 4mm;
    position: relative;
    z-index: 1;
  }

  .plan-card {
    background: rgba(255,255,255,0.10);
    border-radius: 8px;
    padding: 3.5mm 3mm;
    text-align: center;
  }

  .plan-card.featured {
    background: rgba(255,255,255,0.22);
    border: 1.5px solid rgba(255,255,255,0.5);
  }

  .plan-name {
    font-size: 8.5pt;
    font-weight: 800;
    color: #fff;
    letter-spacing: 0.3px;
  }

  .plan-subtitle {
    font-size: 7pt;
    opacity: 0.7;
    color: #fff;
    margin-top: 0.5mm;
  }

  .plan-price {
    font-size: 18pt;
    font-weight: 900;
    color: #fff;
    line-height: 1;
    margin: 2mm 0 0.5mm;
  }

  .plan-features {
    font-size: 7pt;
    opacity: 0.75;
    color: #fff;
    line-height: 1.5;
  }

  .price-trial {
    font-size: 8.5pt;
    opacity: 0.88;
    position: relative;
    z-index: 1;
    text-align: center;
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

    <!-- META BAR (from / to / date) -->
    <div class="meta-bar">
      <div class="recipient-address">
        <div style="font-size:8.5pt;color:#94a3b8;margin-bottom:2mm;font-style:italic;">À l'attention du/de la responsable</div>
        <div class="recipient-name">${business.name}</div>
        ${addressLines}
      </div>
      <div>
        <div class="date-place">Le ${today}</div>
        <div class="sender-info">
          contact@toctoctoc.boutique<br/>
          www.toctoctoc.boutique
        </div>
      </div>
    </div>

    <!-- HOOK BANNER -->
    <div class="hook-banner">
      <div class="hook-question">Et si ${business.name} avait 50 avis Google de plus le mois prochain ?</div>
      <div class="hook-benefits">
        <div class="hook-benefit">
          <div class="hook-benefit-title">⭐ 3x plus d'avis Google</div>
          <div class="hook-benefit-desc">Vos clients scannent, laissent un avis et tentent de gagner un cadeau. Votre note grimpe, votre visibilité explose.</div>
        </div>
        <div class="hook-benefit">
          <div class="hook-benefit-title">🎯 Des clients qui reviennent</div>
          <div class="hook-benefit-desc">Carte de fidélité digitale sur leur téléphone. Fini les cartons perdus, bonjour la récurrence.</div>
        </div>
      </div>
      <div class="hook-sub">Tout est déjà configuré pour ${business.name} — il ne reste qu'à activer.</div>
    </div>

    <!-- BODY -->
    <div class="body">
      <p>Bonjour,</p>

      <p>
        Savez-vous combien d'avis Google vous avez ? Et votre concurrent le plus proche ? Aujourd'hui, 9 clients sur 10 consultent les avis avant de choisir un commerce. J'ai préparé un système complet pour <span class="highlight">${business.name}</span> sur <span class="highlight">TocTocToc.boutique</span> — il est déjà configuré et prêt à l'emploi. Vos clients scannent un simple QR code pour laisser un avis Google et tenter de gagner une récompense, ou pour accumuler leurs points de fidélité — le tout en quelques secondes, sans rien télécharger.
      </p>

      <!-- FEATURES -->
      <div class="features">
        <div class="features-title">Les résultats concrets</div>
        <div class="features-grid">
          <div class="feature-item">
            <div class="feature-text">
              <strong>⭐ 3x plus d'avis Google</strong>
              <span>Vos clients laissent un avis et jouent à la roulette pour gagner un cadeau. Votre note Google monte, vous apparaissez en tête des recherches locales.</span>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-text">
              <strong>🎯 Des clients qui reviennent</strong>
              <span>Carte de fidélité sur téléphone, tamponnage par QR code. Vos clients reviennent plus souvent et dépensent davantage.</span>
            </div>
          </div>
        </div>

        <hr class="features-divider" />

        <div class="features-secondary-label">Également inclus dans votre espace, sans surcoût :</div>
        <div class="features-secondary-grid">
          <div class="feature-secondary"><strong>🌐 Site vitrine</strong> — une page pro aux couleurs de votre commerce</div>
          <div class="feature-secondary"><strong>📅 Réservations en ligne</strong> — vos clients réservent 24h/24</div>
        </div>

        <div class="features-coming">
          Bientôt disponible : publication automatique sur les réseaux sociaux, boutique en ligne, standard téléphonique IA, gestion d'équipe, facturation électronique…
        </div>
      </div>

      <!-- CARDS -->
      <div class="cards-section">
        <div class="cards-title">📎 Prêt à utiliser dès aujourd'hui</div>
        <div class="cards-desc">
          Vous trouverez avec ce courrier des <strong>supports QR codes</strong> prêts à poser sur votre comptoir dès maintenant — aucune manipulation technique :
          <br/>
          <strong>• Collecte d'avis Google</strong> — vos clients scannent, laissent un avis Google, et jouent pour gagner un cadeau<br/>
          <strong>• Carte de fidélité</strong> — vos clients scannent à chaque passage pour cumuler leurs points
        </div>
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

      <!-- PRICE BLOCK -->
      <div class="price-block">
        <!-- Bubbles inside price block -->
        <div style="position:absolute;width:55mm;height:55mm;border-radius:50%;background:rgba(255,255,255,0.07);top:-15mm;right:-10mm;pointer-events:none;"></div>
        <div style="position:absolute;width:35mm;height:35mm;border-radius:50%;background:rgba(255,255,255,0.05);bottom:-10mm;left:20mm;pointer-events:none;"></div>
        <div style="position:absolute;width:22mm;height:22mm;border-radius:50%;background:rgba(255,255,255,0.04);top:5mm;left:-5mm;pointer-events:none;"></div>

        <div class="price-block-label">3 à 8x moins cher que la concurrence</div>

        <div style="text-align:center;margin-bottom:3mm;">
          <span style="display:inline-block;background:linear-gradient(90deg,#f59e0b,#f97316);color:white;font-size:8pt;font-weight:800;padding:1.5mm 4mm;border-radius:20px;">
            OFFRE DE LANCEMENT -50% À VIE
          </span>
        </div>

        <div class="price-plans">
          <!-- FREE -->
          <div class="plan-card">
            <div class="plan-name">GRATUIT</div>
            <div class="plan-subtitle">Pour découvrir</div>
            <div class="plan-price">0€</div>
            <div class="plan-features">Avis + Fidélité<br/>(limité à 3)</div>
          </div>
          <!-- STARTER (featured) -->
          <div class="plan-card featured">
            <div class="plan-name">STARTER ⭐</div>
            <div class="plan-subtitle">Le plus populaire</div>
            <div class="plan-price"><span style="text-decoration:line-through;font-size:11pt;opacity:0.6;">18€</span> 9€<span style="font-size:9pt;font-weight:600;">/mois</span></div>
            <div class="plan-features">Tout inclus<br/>Sans engagement</div>
            <div style="margin-top:1mm;font-size:7pt;font-weight:700;color:#f59e0b;">-50% à vie</div>
          </div>
          <!-- PRO -->
          <div class="plan-card">
            <div class="plan-name">PRO</div>
            <div class="plan-subtitle">Multi-commerces</div>
            <div class="plan-price"><span style="text-decoration:line-through;font-size:11pt;opacity:0.5;">38€</span> 19€<span style="font-size:9pt;font-weight:600;">/mois</span></div>
            <div class="plan-features">Jusqu'à 3 commerces<br/>+ Réseaux sociaux</div>
            <div style="margin-top:1mm;font-size:7pt;font-weight:700;color:#f59e0b;">-50% à vie</div>
          </div>
        </div>

        <div class="price-trial">
          ✓ 14 jours d'essai gratuit &nbsp;·&nbsp; ✓ Sans engagement &nbsp;·&nbsp; ✓ 3 à 8× moins cher que la concurrence
        </div>
      </div>

      <p style="margin-top:3mm;">
        Les solutions concurrentes coûtent entre <strong>30 et 80€/mois</strong>. Chez TocTocToc.boutique, on croit que chaque commerce local mérite des outils performants à un prix juste. C'est pourquoi nous proposons le système complet à partir de <strong>9€/mois</strong>, soit 3 à 8 fois moins cher que la concurrence.
      </p>

      ${claimSection}

      <!-- SOFT CLOSE -->
      <div class="soft-close">
        Même si le moment n'est pas idéal, votre espace reste disponible. Et si un jour vous souhaitez booster vos avis Google ou fidéliser vos clients, tout sera prêt en un scan.
      </div>

      <p>
        N'hésitez pas à me contacter pour toute question ou pour activer votre abonnement en quelques clics.
        Je reste à votre disposition.
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
  const [theme, setTheme] = useState<PrintThemeId>("gradient");
  const hasBrandStyle = !!brandStyle?.primaryColor;

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
          const disabled = t.requiresBrandStyle && !hasBrandStyle;
          return (
            <button
              key={t.id}
              onClick={() => !disabled && setTheme(t.id)}
              disabled={disabled}
              title={disabled ? "Nécessite l'extraction des couleurs du site web" : t.description}
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
