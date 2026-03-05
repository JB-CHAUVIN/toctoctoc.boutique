import QRCode from "qrcode";
import type { BusinessData } from "./types";

export function hasModule(b: BusinessData, mod: string): boolean {
  return b.modules.some((m) => m.module === mod && m.isActive);
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

  const bodies = pages.map((html) => {
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    return bodyMatch ? bodyMatch[1] : "";
  });

  const pageStyles = pages.map((html) => {
    const styleMatch = html.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
    return styleMatch ? styleMatch[1] : "";
  });

  const allStyles = new Set<string>();
  pageStyles.forEach((s) => allStyles.add(s));

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8" />
<title>Tracts prospection - ${pages.length} commerces</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Great+Vibes&display=swap" rel="stylesheet" />
<style>
  @page { size: A4; margin: 0; }
  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .page-separator { page-break-before: always; }
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { margin: 0; }
</style>
${Array.from(allStyles)
  .map((s) => `<style>${s}</style>`)
  .join("\n")}
</head>
<body>
${bodies
  .map(
    (body, i) =>
      `${i > 0 ? '<div class="page-separator"></div>' : ""}${body}`,
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
