/** Extract inline <style> content + CSS custom properties from HTML */
export function extractStyleData(html: string): string {
  const styles: string[] = [];

  const styleMatches = Array.from(html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi));
  for (const m of styleMatches) {
    styles.push(m[1]);
  }

  const cssVarMatches = styles.join("\n").match(/--[a-zA-Z-]+\s*:\s*[^;]+;/g);
  if (cssVarMatches) {
    styles.push("/* CSS Variables */\n" + cssVarMatches.join("\n"));
  }

  return styles.join("\n").slice(0, 8000);
}

/** Extract visual structure hints (SVGs, waves, gradients, shadows, etc.) */
export function extractStructureHints(html: string): string {
  const hints: string[] = [];

  const svgCount = (html.match(/<svg/gi) || []).length;
  if (svgCount > 0) hints.push(`${svgCount} SVG elements found`);

  if (/wave|ondulation|vague/i.test(html)) hints.push("Wave patterns detected");
  if (/clip-path|clipPath/i.test(html)) hints.push("clip-path used (shaped sections)");

  const borderRadiusMatches = html.match(/border-radius\s*:\s*([^;}"]+)/gi);
  if (borderRadiusMatches) {
    hints.push(`Border radii: ${Array.from(new Set(borderRadiusMatches.slice(0, 10))).join(", ")}`);
  }

  const gradientMatches = html.match(/linear-gradient|radial-gradient/gi);
  if (gradientMatches) hints.push(`${gradientMatches.length} gradient(s) detected`);

  const decorClasses = html.match(/class="[^"]*(?:hero|banner|wave|shape|blob|circle|dot|pattern|overlay|decoration|ornament)[^"]*"/gi);
  if (decorClasses) hints.push(`Decorative classes: ${decorClasses.slice(0, 5).join(", ")}`);

  const weightMatches = html.match(/font-weight\s*:\s*([^;}"]+)/gi);
  if (weightMatches) hints.push(`Font weights: ${Array.from(new Set(weightMatches.slice(0, 8))).join(", ")}`);

  const transformMatches = html.match(/text-transform\s*:\s*([^;}"]+)/gi);
  if (transformMatches) hints.push(`Text transforms: ${Array.from(new Set(transformMatches.slice(0, 5))).join(", ")}`);

  const shadowCount = (html.match(/box-shadow/gi) || []).length;
  if (shadowCount > 3) hints.push(`Heavy shadow usage (${shadowCount}×) — elevated style`);

  const spacingMatches = html.match(/letter-spacing\s*:\s*([^;}"]+)/gi);
  if (spacingMatches) hints.push(`Letter-spacing: ${Array.from(new Set(spacingMatches.slice(0, 5))).join(", ")}`);

  return hints.join("\n");
}

/** Count most frequent non-neutral hex colors in HTML */
export function extractTopColors(html: string): string {
  const NEUTRALS = new Set([
    "#fff", "#ffffff", "#000", "#000000", "#333", "#333333",
    "#666", "#666666", "#999", "#ccc", "#ddd", "#eee",
    "#f5f5f5", "#f8f8f8", "#fafafa", "#e5e5e5", "#d5d5d5",
  ]);

  const hexMatches = html.match(/#[0-9a-fA-F]{3,8}/g) ?? [];
  const counts: Record<string, number> = {};
  for (const c of hexMatches) {
    const norm = c.toLowerCase();
    if (NEUTRALS.has(norm)) continue;
    counts[norm] = (counts[norm] || 0) + 1;
  }

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([color, count]) => `${color} (×${count})`)
    .join(", ");
}

/** Extract Google Fonts URLs from HTML */
export function extractGoogleFonts(html: string): string[] {
  return Array.from(html.matchAll(/fonts\.googleapis\.com\/css2?\?[^"'\s>]+/g))
    .map((m) => m[0])
    .slice(0, 3);
}

/** Extract meta theme-color value */
export function extractThemeColor(html: string): string | null {
  const match = html.match(/<meta[^>]*name=["']theme-color["'][^>]*content=["']([^"']+)["']/i);
  return match?.[1] ?? null;
}

/** Fetch external stylesheets and extract color/font-relevant lines */
export async function fetchExternalStylesheets(html: string, baseUrl: string): Promise<string> {
  const linkMatches = Array.from(html.matchAll(/<link[^>]*rel=["']stylesheet["'][^>]*href=["']([^"']+)["'][^>]*>/gi));
  const hrefMatches = Array.from(html.matchAll(/<link[^>]*href=["']([^"']+)["'][^>]*rel=["']stylesheet["'][^>]*>/gi));
  const allHrefs = [...linkMatches, ...hrefMatches].map((m) => m[1]).slice(0, 3);

  const relevantLines: string[] = [];
  const colorRegex = /color|background|font|#[0-9a-fA-F]{3,8}|rgb|hsl|--[a-z]|border-radius|letter-spacing|text-transform|clip-path|gradient|shadow/i;

  for (const href of allHrefs) {
    try {
      const cssUrl = href.startsWith("http") ? href : new URL(href, baseUrl).toString();
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      try {
        const res = await fetch(cssUrl, {
          signal: controller.signal,
          headers: { "User-Agent": "Mozilla/5.0 (compatible)" },
        });
        const css = await res.text();
        for (const line of css.split("\n")) {
          if (colorRegex.test(line)) relevantLines.push(line.trim());
          if (relevantLines.length > 300) break;
        }
      } finally {
        clearTimeout(timeout);
      }
    } catch {
      // skip
    }
  }

  return relevantLines.join("\n");
}
