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
  googleRating?: number | null;
  googleReviewCount?: number | null;
}

/** Inline SVG stars for print HTML */
function buildSvgStars(rating: number, size: number, emptyColor = "#D1D5DB"): string {
  const starPath = "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z";
  return Array.from({ length: 5 }, (_, i) => {
    const fill = Math.max(0, Math.min(1, rating - i));
    const id = `s${i}_${Math.random().toString(36).slice(2, 6)}`;
    if (fill >= 1) return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" style="display:inline-block;vertical-align:middle;"><path d="${starPath}" fill="#FBBC04" stroke="none"/></svg>`;
    if (fill <= 0) return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" style="display:inline-block;vertical-align:middle;"><path d="${starPath}" fill="${emptyColor}" stroke="none"/></svg>`;
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" style="display:inline-block;vertical-align:middle;"><defs><linearGradient id="${id}"><stop offset="${Math.round(fill * 100)}%" stop-color="#FBBC04"/><stop offset="${Math.round(fill * 100)}%" stop-color="${emptyColor}"/></linearGradient></defs><path d="${starPath}" fill="url(#${id})" stroke="none"/></svg>`;
  }).join("");
}

/** Compact Google Business mock for A5 */
function buildGoogleMockCompact(name: string, rating: number, count: number, type: string | null): string {
  const category = (type && type !== "Autre") ? type : "Commerce local";
  return `<div style="font-family:Arial,Roboto,sans-serif;background:#fff;border-radius:6px;border:1px solid #dadce0;overflow:hidden;font-size:7pt;line-height:1.35;">
    <div style="padding:2mm 2.5mm;">
      <div style="font-size:9pt;font-weight:400;color:#202124;margin-bottom:0.5mm;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${name}</div>
      <div style="display:flex;align-items:center;gap:1mm;">
        <span style="font-size:8pt;font-weight:600;color:#202124;">${rating.toFixed(1)}</span>
        ${buildSvgStars(rating, 9, "#dadce0")}
        <span style="font-size:7pt;color:#70757a;">(${count.toLocaleString("fr-FR")})</span>
      </div>
      <div style="font-size:6.5pt;color:#70757a;margin-top:0.5mm;">${category}</div>
    </div>
  </div>`;
}

interface Props {
  business: BusinessInfo;
  businessId: string;
  claimToken: string | null;
  appUrl: string;
}

// ── Inline SVG icons for print (no emojis) ──────────────────────────

/** Numbered circle for steps */
function svgStepNumber(n: number, color: string, size = 22): string {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" style="display:block;margin:0 auto;"><circle cx="12" cy="12" r="11" fill="${color}"/><text x="12" y="16.5" text-anchor="middle" fill="#fff" font-family="Plus Jakarta Sans,system-ui,sans-serif" font-size="13" font-weight="700">${n}</text></svg>`;
}

/** Google star icon (yellow) */
const SVG_GOOGLE_STAR = `<svg width="22" height="22" viewBox="0 0 24 24" style="display:block;"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="#FBBC04" stroke="none"/></svg>`;

/** Loyalty card / stamp icon */
function svgLoyaltyCard(color: string): string {
  return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:block;"><rect x="2" y="5" width="20" height="14" rx="2"/><circle cx="12" cy="12" r="3" fill="${color}" stroke="none"/><circle cx="6.5" cy="8.5" r="1" fill="${color}" stroke="none"/><circle cx="17.5" cy="8.5" r="1" fill="${color}" stroke="none"/><circle cx="6.5" cy="15.5" r="1" fill="${color}" stroke="none"/><circle cx="17.5" cy="15.5" r="1" fill="${color}" stroke="none"/></svg>`;
}

/** Checkmark circle for reassurance */
function svgCheck(color: string, size = 14): string {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" style="display:block;flex-shrink:0;"><circle cx="12" cy="12" r="11" fill="${color}"/><path d="M7 12.5l3.5 3.5 6.5-7" stroke="#fff" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}

/** Package/box icon for reassurance */
const SVG_PACKAGE = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:block;flex-shrink:0;"><path d="M16.5 9.4l-9-5.19"/><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>`;

/** France flag mini icon */
const SVG_FLAG_FR = `<svg width="14" height="11" viewBox="0 0 21 14" style="display:block;flex-shrink:0;border-radius:1.5px;overflow:hidden;"><rect width="7" height="14" fill="#002395"/><rect x="7" width="7" height="14" fill="#fff"/><rect x="14" width="7" height="14" fill="#ED2939"/></svg>`;

/** Before/after Google Business block — only shown if we have Google data */
function buildBeforeAfterBlock(business: BusinessInfo, primary: string): string {
  const hasGoogle = business.googleRating != null && business.googleReviewCount != null;
  if (!hasGoogle) return "";

  const beforeRating = business.googleRating!;
  const beforeCount = business.googleReviewCount!;
  const afterRating = Math.min(4.9, beforeRating + 0.5);
  const afterCount = Math.max(beforeCount * 2, beforeCount + 80);

  return `
    <!-- Before / After Google -->
    <div style="display:flex;align-items:stretch;gap:2mm;margin-bottom:3mm;">
      <div style="flex:1;">
        <div style="font-size:6.5pt;font-weight:800;text-transform:uppercase;letter-spacing:0.5px;color:#94a3b8;margin-bottom:1mm;">Aujourd'hui</div>
        ${buildGoogleMockCompact(business.name, beforeRating, beforeCount, business.businessType)}
      </div>
      <div style="display:flex;align-items:center;font-size:16pt;color:${primary};font-weight:900;padding:0 1mm;">→</div>
      <div style="flex:1;">
        <div style="font-size:6.5pt;font-weight:800;text-transform:uppercase;letter-spacing:0.5px;color:${primary};margin-bottom:1mm;">Avec vos supports</div>
        ${buildGoogleMockCompact(business.name, afterRating, afterCount, business.businessType)}
      </div>
    </div>`;
}

/**
 * Tract V2 — Format A5 (148mm x 210mm), 1 seule page.
 * Approche "cadeau" : on offre un support prêt à l'emploi,
 * le commerçant n'a rien à faire. Le claim est secondaire.
 */
export function buildLetterV2Html(
  business: BusinessInfo,
  appUrl: string,
  claimUrl: string | null,
  claimQrDataUrl: string | null,
): string {
  const primary = business.primaryColor;
  const accent = business.accentColor;
  const primaryRgb = hexToRgb(primary);

  const logoAbsUrl = business.logoUrl
    ? (business.logoUrl.startsWith("http") ? business.logoUrl : `${appUrl}${business.logoUrl}`)
    : null;
  const logoBg = business.logoBackground || "transparent";

  const businessAvatar = logoAbsUrl
    ? `<img src="${logoAbsUrl}" alt="${business.name}" style="width:32px;height:32px;object-fit:contain;border-radius:8px;background:${logoBg};padding:2px;" />`
    : `<div style="width:32px;height:32px;border-radius:8px;background:${primary}22;display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:800;color:${primary};">${business.name.charAt(0)}</div>`;

  const claimBlock = claimUrl && claimQrDataUrl ? `
    <div style="margin-top:5mm;padding:3mm 4mm;border:1.5px solid ${primary}40;border-radius:8px;background:${primary}08;">
      <div style="display:flex;align-items:center;gap:3mm;">
        <img src="${claimQrDataUrl}" alt="QR" width="60" height="60" style="display:block;border-radius:4px;" />
        <div>
          <div style="font-size:8.5pt;font-weight:700;color:${primary};">Envie d'aller plus loin ?</div>
          <div style="font-size:7.5pt;color:#475569;margin-top:1mm;line-height:1.4;">
            Scannez pour accéder à votre <strong>tableau de bord gratuit</strong> : fidélité, réservations, site vitrine.
          </div>
          <div style="font-size:6.5pt;color:#94a3b8;margin-top:1mm;">Gratuit, sans engagement · toctoctoc.boutique</div>
        </div>
      </div>
    </div>` : "";

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8" />
<title>Support — ${business.name}</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  @page { size: 148mm 210mm; margin: 0; }
  body {
    font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
    width: 148mm;
    margin: 0;
    background: white;
    color: #1e293b;
  }
  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  }
  .page {
    width: 148mm;
    height: 210mm;
    display: flex;
    flex-direction: column;
    position: relative;
    overflow: hidden;
  }
  .bubble {
    position: absolute;
    border-radius: 50%;
    pointer-events: none;
    z-index: 0;
  }
</style>
</head>
<body>
<div class="page">

  <!-- Background bubbles -->
  <div class="bubble" style="width:70mm;height:70mm;background:rgba(${primaryRgb},0.04);top:-15mm;right:-20mm;"></div>
  <div class="bubble" style="width:45mm;height:45mm;background:rgba(${primaryRgb},0.03);bottom:30mm;left:-15mm;"></div>

  <!-- Header strip -->
  <div style="background:linear-gradient(135deg, ${primary} 0%, ${accent} 100%);padding:5mm 6mm;display:flex;align-items:center;justify-content:space-between;position:relative;z-index:1;">
    <div style="display:flex;align-items:center;gap:3mm;">
      ${businessAvatar}
      <div>
        <div style="font-size:13pt;font-weight:800;color:#fff;line-height:1.15;">${business.name}</div>
        ${business.businessType ? `<div style="font-size:7.5pt;color:rgba(255,255,255,0.7);margin-top:0.5mm;">${business.businessType}</div>` : ""}
      </div>
    </div>
    <div style="text-align:right;">
      <div style="display:flex;align-items:center;gap:1.5mm;justify-content:flex-end;">
        <img src="${appUrl}/logo.png" alt="" style="height:14px;width:14px;border-radius:3px;" />
        <span style="font-size:7.5pt;font-weight:700;color:rgba(255,255,255,0.9);">TocTocToc.boutique</span>
      </div>
    </div>
  </div>

  <!-- Content -->
  <div style="padding:5mm 6mm;flex:1;display:flex;flex-direction:column;position:relative;z-index:1;">

    <!-- Gift headline -->
    <div style="text-align:center;margin-bottom:3mm;">
      <div style="font-size:11pt;font-weight:800;color:#0f172a;line-height:1.35;">
        On vous offre ces supports.<br/>
        <span style="color:${primary};">Posez-les, c'est tout.</span>
      </div>
    </div>

    ${buildBeforeAfterBlock(business, primary)}

    <!-- Divider: transition constat → solution -->
    <div style="display:flex;align-items:center;gap:3mm;margin-bottom:3mm;">
      <div style="flex:1;height:1px;background:linear-gradient(to right, transparent, #e2e8f0);"></div>
      <div style="font-size:7pt;font-weight:700;color:${primary};text-transform:uppercase;letter-spacing:0.8px;white-space:nowrap;">Dans cette enveloppe</div>
      <div style="flex:1;height:1px;background:linear-gradient(to left, transparent, #e2e8f0);"></div>
    </div>

    <!-- Supports description -->
    <div style="display:flex;gap:3mm;margin-bottom:4mm;">
      <!-- Support Avis -->
      <div style="flex:1;border:1.5px solid #e2e8f0;border-radius:8px;padding:3mm;background:#f8fafc;">
        <div style="margin-bottom:1.5mm;">${SVG_GOOGLE_STAR}</div>
        <div style="font-size:8.5pt;font-weight:700;color:#0f172a;margin-bottom:1mm;">Avis Google</div>
        <div style="font-size:7pt;color:#64748b;line-height:1.4;">
          Vos clients scannent le QR code, laissent un avis Google et tentent de gagner un cadeau.
        </div>
        <div style="margin-top:2mm;font-size:6.5pt;color:${primary};font-weight:600;">
          Déjà configuré pour vous
        </div>
      </div>
      <!-- Support Fidélité -->
      <div style="flex:1;border:1.5px solid #e2e8f0;border-radius:8px;padding:3mm;background:#f8fafc;">
        <div style="margin-bottom:1.5mm;">${svgLoyaltyCard(primary)}</div>
        <div style="font-size:8.5pt;font-weight:700;color:#0f172a;margin-bottom:1mm;">Carte de fidélité</div>
        <div style="font-size:7pt;color:#64748b;line-height:1.4;">
          Vos clients scannent à chaque visite pour cumuler des points. Fini les cartons perdus.
        </div>
        <div style="margin-top:2mm;font-size:6.5pt;color:${primary};font-weight:600;">
          Déjà configuré pour vous
        </div>
      </div>
    </div>

    <!-- How it works (ultra-simple) -->
    <div style="background:#f8fafc;border-radius:8px;padding:3mm 4mm;margin-bottom:4mm;">
      <div style="font-size:8pt;font-weight:700;color:#334155;margin-bottom:2mm;">Comment ça marche ?</div>
      <div style="display:flex;gap:3mm;align-items:flex-start;">
        <div style="text-align:center;flex:1;">
          <div style="margin-bottom:1.5mm;">${svgStepNumber(1, primary)}</div>
          <div style="font-size:7pt;color:#475569;line-height:1.3;"><strong>Posez les supports</strong> près de votre comptoir ou caisse</div>
        </div>
        <div style="text-align:center;flex:1;">
          <div style="margin-bottom:1.5mm;">${svgStepNumber(2, primary)}</div>
          <div style="font-size:7pt;color:#475569;line-height:1.3;"><strong>Vos clients scannent</strong> avec leur téléphone</div>
        </div>
        <div style="text-align:center;flex:1;">
          <div style="margin-bottom:1.5mm;">${svgStepNumber(3, primary)}</div>
          <div style="font-size:7pt;color:#475569;line-height:1.3;"><strong>Résultat :</strong> plus d'avis Google + clients fidélisés</div>
        </div>
      </div>
    </div>

    <!-- Key stat -->
    <div style="display:flex;align-items:center;gap:2mm;background:#fffbeb;border-left:3px solid #f59e0b;border-radius:0 6px 6px 0;padding:2.5mm 4mm;margin-bottom:4mm;">
      ${buildSvgStars(5, 12)}
      <div>
        <span style="font-size:10pt;font-weight:900;color:#d97706;">9 clients sur 10</span>
        <span style="font-size:8pt;color:#78350f;"> consultent les avis Google avant de choisir un commerce.</span>
      </div>
    </div>

    <!-- Reassurance -->
    <div style="display:flex;gap:2mm;margin-bottom:auto;">
      <div style="flex:1;font-size:7pt;color:#475569;display:flex;align-items:flex-start;gap:1.5mm;">
        ${svgCheck("#10b981")}
        <span><strong>100% gratuit</strong><br/>Aucun abonnement requis</span>
      </div>
      <div style="flex:1;font-size:7pt;color:#475569;display:flex;align-items:flex-start;gap:1.5mm;">
        ${SVG_PACKAGE}
        <span><strong>Prêt à l'emploi</strong><br/>Rien à installer</span>
      </div>
      <div style="flex:1;font-size:7pt;color:#475569;display:flex;align-items:flex-start;gap:1.5mm;">
        ${SVG_FLAG_FR}
        <span><strong>Support français</strong><br/>contact@toctoctoc.boutique</span>
      </div>
    </div>

    <!-- Claim section (secondary) -->
    ${claimBlock}

    <!-- Footer / contact -->
    <div style="margin-top:4mm;padding-top:3mm;border-top:1px solid #e2e8f0;display:flex;justify-content:space-between;align-items:center;">
      <div>
        <div style="font-size:7.5pt;font-weight:600;color:#334155;">Jean-Baptiste CHAUVIN</div>
        <div style="font-size:6.5pt;color:#94a3b8;">contact@toctoctoc.boutique · www.toctoctoc.boutique</div>
      </div>
      <div style="font-size:6pt;color:#cbd5e1;">Offert par TocTocToc.boutique</div>
    </div>

  </div>
</div>
</body>
</html>`;
}

export function ProspectLetterV2Button({ business, businessId, claimToken, appUrl }: Props) {
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
          width: 150,
          margin: 1,
          color: { dark: "#1e293b", light: "#ffffff" },
        });
      }

      const html = buildLetterV2Html(business, appUrl, claimUrl, claimQrDataUrl);
      const win = window.open("", "_blank", "width=600,height=850");
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
      className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-100 disabled:opacity-60"
    >
      {loading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <FileText className="h-3.5 w-3.5" />
      )}
      Tract V2 (A5 cadeau)
    </button>
  );
}
