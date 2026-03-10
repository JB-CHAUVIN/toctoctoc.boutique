import type { BusinessData } from "./types";

/** DL envelope: 220mm x 110mm */
const DL_W = 220;
const DL_H = 110;

const SENDER = {
  name: "Jean-Baptiste CHAUVIN",
  line1: "TocTocToc.boutique",
  line2: "66 rue du Pré Saint-Gervais",
  line3: "75019 Paris",
};

function escHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function buildRecipientLines(b: BusinessData): string[] {
  const lines: string[] = [];
  lines.push(b.name);
  if (b.address) lines.push(b.address);
  const cityLine = [b.zipCode, b.city].filter(Boolean).join(" ");
  if (cityLine) lines.push(cityLine);
  return lines;
}

function buildEnvelopeHtml(b: BusinessData, logoB64?: string): string {
  const recipient = buildRecipientLines(b);
  const logoImg = logoB64
    ? `<img src="${logoB64}" class="sender-logo" alt="" />`
    : "";

  return `
    <div class="envelope">
      <!-- Expéditeur (haut gauche) -->
      <div class="sender">
        <div class="sender-name">${escHtml(SENDER.name)}</div>
        <div class="sender-brand">${logoImg}<span>${escHtml(SENDER.line1)}</span></div>
        <div>${escHtml(SENDER.line2)}</div>
        <div>${escHtml(SENDER.line3)}</div>
      </div>

      <!-- Zone timbre (haut droit) -->
      <div class="stamp">
        <div class="stamp-box">Affranchissement</div>
      </div>

      <!-- Destinataire (centre-droit) -->
      <div class="recipient">
        ${recipient.map((l) => `<div>${escHtml(l)}</div>`).join("\n        ")}
      </div>
    </div>`;
}

export function buildEnvelopesPrintHtml(businesses: BusinessData[], logoB64?: string): string {
  const envelopes = businesses.map((b) => buildEnvelopeHtml(b, logoB64)).join("\n");

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8" />
<title>Enveloppes DL — ${businesses.length} destinataire${businesses.length > 1 ? "s" : ""}</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
<style>
  @page {
    size: ${DL_W}mm ${DL_H}mm;
    margin: 0;
  }
  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: 'Plus Jakarta Sans', sans-serif;
    color: #1e293b;
  }
  .envelope {
    position: relative;
    width: ${DL_W}mm;
    height: ${DL_H}mm;
    padding: 10mm;
    page-break-after: always;
    overflow: hidden;
  }
  .envelope:last-child {
    page-break-after: auto;
  }

  /* Expéditeur — haut gauche */
  .sender {
    position: absolute;
    top: 8mm;
    left: 10mm;
    font-size: 6.5pt;
    font-weight: 400;
    line-height: 1.45;
    color: #64748b;
    max-width: 80mm;
  }
  .sender-name {
    font-weight: 600;
    color: #334155;
    margin-bottom: 0.3mm;
  }
  .sender-brand {
    display: flex;
    align-items: center;
    gap: 1.2mm;
    font-weight: 600;
    color: #6366f1;
    font-size: 6.5pt;
    margin-bottom: 0.3mm;
  }
  .sender-logo {
    width: 3.5mm;
    height: 3.5mm;
    object-fit: contain;
    border-radius: 0.5mm;
  }

  /* Zone timbre — haut droit */
  .stamp {
    position: absolute;
    top: 8mm;
    right: 10mm;
  }
  .stamp-box {
    width: 28mm;
    height: 20mm;
    border: 0.5pt dashed #94a3b8;
    border-radius: 2mm;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 6.5pt;
    font-weight: 500;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.3pt;
  }

  /* Destinataire — centre-droit (norme postale FR) */
  .recipient {
    position: absolute;
    bottom: 18mm;
    right: 15mm;
    text-align: left;
    font-size: 12pt;
    font-weight: 500;
    line-height: 1.55;
    max-width: 100mm;
  }
  .recipient div:first-child {
    font-weight: 700;
    font-size: 13pt;
    text-transform: uppercase;
  }
</style>
</head>
<body>
${envelopes}
</body>
</html>`;
}
