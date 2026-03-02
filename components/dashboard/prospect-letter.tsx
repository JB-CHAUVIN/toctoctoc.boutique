"use client";

import { useState } from "react";
import { FileText, Loader2 } from "lucide-react";
import QRCode from "qrcode";

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
}

interface Props {
  business: BusinessInfo;
  businessId: string;
  claimToken: string | null;
  appUrl: string;
}

function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r}, ${g}, ${b}`;
}

function buildLetterHtml(
  business: BusinessInfo,
  appUrl: string,
  claimUrl: string | null,
  claimQrDataUrl: string | null,
): string {
  const today = new Date().toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const reviewUrl = `${appUrl}/${business.slug}/avis`;
  const loyaltyUrl = `${appUrl}/${business.slug}/fidelite`;
  const siteUrl = `${appUrl}/${business.slug}`;

  const primary = business.primaryColor;
  const accent = business.accentColor;
  const primaryRgb = hexToRgb(primary);

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
  <!-- CLAIM QR CODE -->
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
  * { margin: 0; padding: 0; box-sizing: border-box; }

  @page { size: A4; margin: 0; }

  body {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 10.5pt;
    line-height: 1.65;
    color: #1e293b;
    background: white;
    width: 210mm;
    min-height: 297mm;
  }

  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  }

  .page {
    width: 210mm;
    min-height: 297mm;
    padding: 18mm 20mm 16mm 20mm;
    display: flex;
    flex-direction: column;
  }

  /* ── HEADER ── */
  .header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding-bottom: 10mm;
    border-bottom: 3px solid ${primary};
    margin-bottom: 8mm;
  }

  .header-brand {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .brand-name {
    font-size: 17pt;
    font-weight: 700;
    font-family: 'Plus Jakarta Sans', sans-serif;
    color: #4f46e5;
    letter-spacing: -0.3px;
  }

  .brand-tagline {
    font-size: 8.5pt;
    color: #64748b;
    font-style: italic;
  }

  .header-contact {
    text-align: right;
    font-size: 8.5pt;
    color: #475569;
    line-height: 1.6;
  }

  /* ── RECIPIENT BLOCK ── */
  .recipient-block {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 9mm;
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
    padding-top: 2mm;
  }

  /* ── SUBJECT ── */
  .subject-line {
    background: rgba(${primaryRgb}, 0.08);
    border-left: 4px solid ${primary};
    padding: 4mm 5mm;
    margin-bottom: 7mm;
    font-family: 'Plus Jakarta Sans', sans-serif;
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
    margin: 5mm 0;
    background: rgba(${primaryRgb}, 0.04);
    border: 1px solid rgba(${primaryRgb}, 0.18);
    border-radius: 6px;
    padding: 4mm 6mm;
  }

  .features-title {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 10pt;
    font-weight: 600;
    letter-spacing: 0;
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
    border-radius: 6px;
    padding: 4mm 6mm;
  }

  .cards-title {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 11pt;
    font-weight: 600;
    letter-spacing: 0;
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
    background: ${primary};
    border-radius: 8px;
    padding: 5mm 7mm;
    color: white;
  }

  .price-block-label {
    font-size: 8pt;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
    opacity: 0.85;
    margin-bottom: 2mm;
  }

  .price-block-main {
    display: flex;
    align-items: baseline;
    gap: 2mm;
  }

  .price-amount {
    font-size: 28pt;
    font-weight: 900;
    line-height: 1;
    color: white;
  }

  .price-period {
    font-size: 13pt;
    font-weight: 700;
    opacity: 0.9;
  }

  .price-vs {
    font-size: 9pt;
    opacity: 0.8;
    margin-left: 3mm;
    font-style: italic;
  }

  .price-trial {
    margin-top: 2mm;
    font-size: 8.5pt;
    opacity: 0.85;
  }

  /* ── CLAIM SECTION ── */
  .claim-section {
    margin: 5mm 0;
    border: 2px solid ${primary};
    border-radius: 8px;
    padding: 4mm 6mm;
    background: rgba(${primaryRgb}, 0.03);
  }

  .claim-title {
    font-size: 13pt;
    font-weight: 700;
    color: ${primary};
    margin-bottom: 3mm;
  }

  .claim-body {
    display: flex;
    gap: 5mm;
    align-items: flex-start;
  }

  .claim-qr {
    flex-shrink: 0;
    text-align: center;
  }

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
    border-radius: 6px;
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

  .signature-text {
    font-size: 10pt;
    color: #334155;
    margin-bottom: 3mm;
  }

  .signature-handwriting {
    font-family: 'Great Vibes', cursive;
    font-size: 16pt;
    color: #312e81;
    line-height: 1;
    display: inline-block;
    transform: rotate(-1.5deg);
    margin: 3mm 0 1mm;
    letter-spacing: 1px;
    margin-left: 2mm;
  }

  .signature-name {
    font-size: 10pt;
    font-weight: 600;
    color: #334155;
    letter-spacing: 0.3px;
  }

  .signature-role {
    font-size: 8.5pt;
    color: #94a3b8;
  }

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

  <!-- HEADER -->
  <div class="header">
    <div class="header-brand">
      <div class="brand-name">
        <img src="${appUrl}/logo.png" alt="" style="height:25px;width:25px;vertical-align:middle;margin-right:5px;border-radius:5px;display:inline-block;" />TocTocToc.boutique
      </div>
      <div class="brand-tagline">Digitalisation abordable pour les commerces locaux (avis, fidélité, site...)</div>
    </div>
    <div class="header-contact">
      <div style="font-weight:700; color:#0f172a; font-size:9pt; font-family:'Plus Jakarta Sans', sans-serif;">TocTocToc.boutique</div>
      <div>contact@toctoctoc.boutique</div>
      <div>www.toctoctoc.boutique</div>
    </div>
  </div>

  <!-- RECIPIENT + DATE -->
  <div class="recipient-block">
    <div class="recipient-address">
      <div style="font-size:8.5pt; color:#94a3b8; margin-bottom:2mm; font-style:italic;">À l'attention du/de la responsable</div>
      <div class="recipient-name">${business.name}</div>
      ${addressLines || `<div style="color:#94a3b8; font-size:9pt;">Adresse non renseignée</div>`}
    </div>
    <div class="date-place">
      Le ${today}
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
      <div class="cards-urls">
        Avis Google : ${reviewUrl}<br/>
        Fidélité : ${loyaltyUrl}<br/>
        Votre site : ${siteUrl}
      </div>
    </div>

    <!-- PRICE -->
    <div class="price-block">
      <div class="price-block-label">Le tarif le plus compétitif du marché</div>
      <div class="price-block-main">
        <span class="price-amount">9€</span>
        <span class="price-period">/mois</span>
        <span class="price-vs">soit 3 à 8× moins cher que la concurrence</span>
      </div>
      <div class="price-trial">✓ 14 jours d'essai gratuit &nbsp;·&nbsp; ✓ Sans engagement &nbsp;·&nbsp; ✓ Résiliable à tout moment</div>
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
  </div>

  <!-- SIGNATURE -->
  <div class="signature">
    <div class="signature-text">Cordialement,</div>
    <div class="signature-handwriting">jbc</div>
    <div class="signature-name">Jean-Baptiste CHAUVIN
    </div>
    <div class="signature-role">Fondateur · TocTocToc.boutique</div>
    <div style="font-size:8pt; color:#94a3b8; margin-top:1mm;">contact@toctoctoc.boutique · www.toctoctoc.boutique</div>
  </div>

  <!-- FOOTER -->
  <div class="footer">
    <span>TocTocToc.boutique — La présence digitale accessible à tous les commerces</span>
    <span>Document personnalisé pour ${business.name}</span>
  </div>

</div>
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

      // Generate token if none exists
      if (!token) {
        const res = await fetch(
          `/api/admin/businesses/${businessId}/claim-token`,
          {
            method: "POST",
          },
        );
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

      const html = buildLetterHtml(business, appUrl, claimUrl, claimQrDataUrl);
      const win = window.open("", "_blank", "width=900,height=1100");
      if (!win) return;
      win.document.write(html);
      win.document.close();
      win.focus();
      setTimeout(() => win.print(), 500);
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
