"use client";

import { useState } from "react";
import { FileText, Loader2 } from "lucide-react";
import QRCode from "qrcode";
import { hexToRgb } from "@/lib/utils";

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
}

function buildLetterHtml(
  business: BusinessInfo,
  businessId: string,
  appUrl: string,
  claimUrl: string | null,
  claimQrDataUrl: string | null,
): string {
  const today = new Date().toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });


  const primary    = business.primaryColor;
  const accent     = business.accentColor;
  const primaryRgb = hexToRgb(primary);

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
    <div class="claim-title">📲 Presque rien à faire : prenez possession de votre espace en 2 minutes !</div>
    <div class="claim-body">
      <div class="claim-qr">
        <img src="${claimQrDataUrl}" alt="QR Code activation" width="110" height="110" style="display:block;" />
        <div class="claim-qr-label">Scanner pour activer</div>
      </div>
      <div class="claim-text">
        <p>
          Scannez ce QR code avec votre smartphone (ou rendez-vous sur le lien ci-dessous)
          pour <strong>créer votre compte gratuit</strong> et prendre possession de votre espace
          <strong>${business.name}</strong> qui vous a été préparé.
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
  * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Plus Jakarta Sans', sans-serif; }

  @page { size: A4; margin: 0; }

  body {
    font-family: 'Plus Jakarta Sans', sans-serif;
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
    background: linear-gradient(135deg, ${primary} 0%, ${accent} 100%);
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
    color: #fff;
    letter-spacing: -0.3px;
    line-height: 1.15;
  }

  .hero-type {
    font-size: 9.5pt;
    color: rgba(255,255,255,0.75);
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
    color: rgba(255,255,255,0.9);
    letter-spacing: 0.2px;
  }

  .hero-tagline {
    font-size: 7.5pt;
    color: rgba(255,255,255,0.6);
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

  /* ── SUBJECT ── */
  .subject-line {
    background: rgba(${primaryRgb}, 0.08);
    border-left: 4px solid ${primary};
    padding: 3mm 5mm;
    margin-bottom: 5mm;
    font-size: 12pt;
    font-weight: 600;
    color: ${primary};
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

  .feature-dot {
    width: 5px;
    height: 5px;
    min-width: 5px;
    border-radius: 50%;
    background: ${accent};
    margin-top: 5px;
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
      ${businessAvatar}
      <div>
        <div class="hero-business-name">${business.name}</div>
        ${business.businessType ? `<div class="hero-type">${business.businessType}</div>` : ""}
      </div>
    </div>
    <div class="hero-right">
      <div style="display:flex;align-items:center;gap:3mm;justify-content:flex-end;margin-bottom:1mm;">
        <img src="${appUrl}/logo.png" alt="" style="height:18px;width:18px;vertical-align:middle;border-radius:4px;display:inline-block;" />
        <span class="hero-brand">TocTocToc.boutique</span>
      </div>
      <div class="hero-tagline">Digitalisation abordable pour les commerces locaux</div>
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

    <!-- SUBJECT -->
    <div class="subject-line">
      Objet : Outils digitaux pour ${business.name} (carte de <b>fidélité</b>, <b>boost avis</b> Google, ...)
    </div>

    <!-- BODY -->
    <div class="body">
      <p>Madame, Monsieur,</p>

      <p>
        Je me permets de vous contacter au sujet de <span class="highlight">${business.name}</span>${business.businessType ? `, votre ${business.businessType.toLowerCase()}` : ""}.
        J'ai eu l'occasion de préparer pour vous un espace digital complet sur notre plateforme
        <span class="highlight">TocTocToc.boutique</span> — il est déjà configuré et opérationnel.
      </p>

      <p>
        Notre conviction est simple : la vraie valeur d'une présence digitale se joue <strong>en magasin</strong>.
        Deux outils suffisent à transformer l'expérience client au quotidien : une invitation à laisser un
        <span class="highlight">avis Google</span> — pour booster votre visibilité locale —
        et une <span class="highlight">carte de fidélité numérique</span> — pour fidéliser sans carton ni impression.
        Vos clients scannent un QR code depuis leur téléphone, en quelques secondes, sans rien télécharger.
      </p>

      <!-- FEATURES -->
      <div class="features">
        <div class="features-title">Ce que vous obtenez</div>
        <div class="features-grid">
          <div class="feature-item">
            <div class="feature-text">
              <strong>⭐ Avis Google automatisés</strong>
              <span>Un système gamifié incite vos clients à laisser des avis — votre visibilité locale s'envole</span>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-text">
              <strong>🎯 Carte de fidélité digitale</strong>
              <span>Remplacez les cartons tamponnés par une carte numérique QR — zéro perte, zéro impression</span>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-text">
              <strong>🌐 Site vitrine inclus</strong>
              <span>Une page professionnelle aux couleurs de votre commerce, visible immédiatement sur Google</span>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-text">
              <strong>📅 Réservations en ligne</strong>
              <span>Vos clients réservent 24h/24 sans vous déranger — vous gérez tout depuis votre tableau de bord</span>
            </div>
          </div>
        </div>
      </div>

      <!-- CARDS -->
      <div class="cards-section">
        <div class="cards-title">📎 Inclus dans ce courrier</div>
        <div class="cards-desc">
          J'ai joint à ce courrier des <strong>fiches imprimées</strong> (QR codes) que vous pouvez coller
          directement dans votre commerce dès aujourd'hui — aucune manipulation technique requise :
          <br/>
          <strong>• Collecte d'avis Google</strong> — vos clients scannent, laissent un avis, et tentent de gagner un cadeau<br/>
          <strong>• Carte de fidélité</strong> — vos clients scannent à chaque visite pour accumuler des tampons
        </div>
      </div>

    </div>

    <!-- FOOTER (page 1) -->
    <div class="footer" style="margin-top:auto;">
      <span>TocTocToc.boutique — La présence digitale accessible à tous les commerces</span>
      <span>Document personnalisé pour ${business.name} — page 1/2</span>
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

        <div class="price-block-label">Le tarif le plus compétitif du marché</div>

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
        Les solutions concurrentes dépassent généralement <strong>30 à 80€/mois</strong> pour des fonctionnalités équivalentes.
        Chez TocTocToc.boutique, nous avons fait le choix d'être accessibles — parce que chaque commerce local mérite une présence digitale professionnelle.
      </p>

      ${claimSection}

      <!-- SOFT CLOSE -->
      <div class="soft-close">
        Si cette proposition ne correspond pas à vos besoins actuels, pas d'inquiétude —
        gardons simplement contact. Des nouvelles fonctionnalités arrivent régulièrement (e-commerce, standard téléphonique IA, gestion du personnel…)
        et nous serions ravis de vous en informer le moment venu.
        Votre espace reste disponible et vous attend.
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
      <span>TocTocToc.boutique — La présence digitale accessible à tous les commerces</span>
      <span>Document personnalisé pour ${business.name} — page 2/2</span>
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
}: Props) {
  const [loading, setLoading] = useState(false);

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

      const html = buildLetterHtml(business, businessId, appUrl, claimUrl, claimQrDataUrl);
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
  );
}
