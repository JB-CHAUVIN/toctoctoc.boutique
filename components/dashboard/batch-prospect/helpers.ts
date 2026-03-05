import QRCode from "qrcode";
import { REVIEW_CARDS, LOYALTY_CARDS, type CardDef } from "../printable-cards";
import type { BusinessData, CardVariant } from "./types";

export function hasModule(b: BusinessData, mod: string): boolean {
  return b.modules.some((m) => m.module === mod && m.isActive);
}

export function getCard(type: "reviews" | "loyalty", variant: CardVariant): CardDef {
  const cards = type === "reviews" ? REVIEW_CARDS : LOYALTY_CARDS;
  const hasNFC = variant === "nfc";
  return cards.find((c) => c.hasNFC === hasNFC) ?? cards[0];
}

export async function ensureClaimToken(businessId: string): Promise<string | null> {
  const res = await fetch(`/api/admin/businesses/${businessId}/claim-token`, {
    method: "POST",
  });
  const data = await res.json();
  return data.success ? data.token : null;
}

export async function generateClaimQr(
  appUrl: string,
  token: string,
): Promise<{ url: string; qrDataUrl: string }> {
  const url = `${appUrl}/claim/${token}`;
  const qrDataUrl = await QRCode.toDataURL(url, {
    width: 220,
    margin: 1,
    color: { dark: "#1e293b", light: "#ffffff" },
  });
  return { url, qrDataUrl };
}

export async function loadImageAsBase64(url: string): Promise<string | undefined> {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    return new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  } catch {
    return undefined;
  }
}

export function buildCombinedTractHtml(pages: string[]): string {
  if (pages.length === 0) return "";
  if (pages.length === 1) return pages[0];

  // Each page has its own colors baked into identical CSS selectors.
  // Scope each page's styles under a unique class to avoid conflicts.
  const scopedBlocks = pages.map((html, i) => {
    const scope = `tract-${i}`;
    const styleMatch = html.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
    const rawCss = styleMatch ? styleMatch[1] : "";
    // Prefix every rule with the scope class
    const scopedCss = rawCss.replace(
      /([^\n{}]+)\{/g,
      (match, selector: string) => {
        // Don't scope @-rules (@page, @media, @font-face)
        if (selector.trim().startsWith("@")) return match;
        // Don't scope * reset
        if (selector.trim() === "*") return `.${scope} * {`;
        // Don't scope body
        if (selector.trim() === "body") return `.${scope} {`;
        return `.${scope} ${selector.trim()} {`;
      },
    );
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    const body = bodyMatch ? bodyMatch[1] : "";
    return { scope, css: scopedCss, body };
  });

  // Collect unique Google Font links from all pages
  const fontLinks = new Set<string>();
  pages.forEach((html) => {
    let m: RegExpExecArray | null;
    const re = /<link[^>]*href="(https:\/\/fonts\.googleapis\.com[^"]*)"[^>]*>/gi;
    while ((m = re.exec(html)) !== null) fontLinks.add(m[1]);
  });

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8" />
<title>Tracts prospection - ${pages.length} commerces</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
${Array.from(fontLinks).map((href) => `<link href="${href}" rel="stylesheet" />`).join("\n")}
<style>
  @page { size: A4; margin: 0; }
  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .page-separator { page-break-before: always; }
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { margin: 0; }
</style>
${scopedBlocks.map((b) => `<style>${b.css}</style>`).join("\n")}
</head>
<body>
${scopedBlocks
  .map(
    (b, i) =>
      `${i > 0 ? '<div class="page-separator"></div>' : ""}<div class="${b.scope}">${b.body}</div>`,
  )
  .join("\n")}
</body>
</html>`;
}

export async function markBusinessAsProspected(businessId: string): Promise<void> {
  await fetch(`/api/admin/businesses/${businessId}/prospect`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prospected: true }),
  });
}
