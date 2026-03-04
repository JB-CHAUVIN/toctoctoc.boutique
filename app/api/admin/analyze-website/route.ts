import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { role: true } });
  if (user?.role !== "ADMIN") return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  try {
    const { url } = await req.json();
    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL requise" }, { status: 400 });
    }

    // Fetch the website HTML
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    let html: string;
    try {
      const res = await fetch(url, {
        signal: controller.signal,
        headers: {
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml",
          "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8",
        },
      });
      html = await res.text();
    } catch (e: unknown) {
      const msg = e instanceof Error && e.name === "AbortError" ? "Timeout lors du fetch du site" : "Impossible d'accéder au site web";
      return NextResponse.json({ error: msg }, { status: 422 });
    } finally {
      clearTimeout(timeout);
    }

    // Extract relevant CSS data
    const styleContent = extractStyleData(html);

    // Fetch external stylesheets (up to 3, truncated)
    const externalCss = await fetchExternalStylesheets(html, url);

    // Extract meta theme-color
    const themeColorMatch = html.match(/<meta[^>]*name=["']theme-color["'][^>]*content=["']([^"']+)["']/i);
    const themeColor = themeColorMatch?.[1] ?? null;

    // Extract Google Fonts
    const fontLinks = Array.from(html.matchAll(/fonts\.googleapis\.com\/css2?\?[^"'\s>]+/g)).map((m) => m[0]).slice(0, 3);

    // Extract HTML structure hints (hero sections, shapes, borders)
    const structureHints = extractStructureHints(html);

    // Count most frequent hex colors in HTML to help GPT identify the brand palette
    const hexMatches = html.match(/#[0-9a-fA-F]{3,8}/g) ?? [];
    const colorCounts: Record<string, number> = {};
    for (const c of hexMatches) {
      const norm = c.toLowerCase();
      // Skip pure black/white/grays
      if (["#fff", "#ffffff", "#000", "#000000", "#333", "#333333", "#666", "#666666", "#999", "#ccc", "#ddd", "#eee", "#f5f5f5", "#f8f8f8", "#fafafa", "#e5e5e5", "#d5d5d5"].includes(norm)) continue;
      colorCounts[norm] = (colorCounts[norm] || 0) + 1;
    }
    const topColors = Object.entries(colorCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([color, count]) => `${color} (×${count})`)
      .join(", ");

    // Build prompt for GPT-4o
    const prompt = `Tu es un expert en design graphique. Analyse le CSS et la structure HTML de ce site web commercial pour en extraire la charte graphique COMPLÈTE — pas seulement les couleurs, mais tout le style visuel.

## Couleurs les plus fréquentes dans le HTML/CSS (triées par fréquence)
${topColors || "Aucune couleur spécifique trouvée"}

## Meta theme-color
${themeColor ?? "Non trouvé"}

## Google Fonts
${fontLinks.length ? fontLinks.join("\n") : "Aucune"}

## Styles inline (<style> tags)
${styleContent.slice(0, 5000)}

## CSS externe (lignes pertinentes)
${externalCss.slice(0, 4000)}

## Structure HTML (éléments visuels détectés)
${structureHints.slice(0, 2000)}

## Ce que tu dois extraire

Tu dois produire un JSON qui décrit ENTIÈREMENT l'identité visuelle de ce site, pour qu'on puisse recréer une carte imprimable (10×10 cm) qui semble avoir été conçue par le designer de cette marque.

### Couleurs — CRITIQUES
Pour identifier les couleurs de la marque, regarde EN PRIORITÉ :
1. Les couleurs les plus fréquentes listées ci-dessus (ce sont les couleurs visuellement dominantes)
2. Les boutons CTA, le logo, les éléments d'en-tête
3. Les CSS custom properties (--primary, --accent, etc.)
NE PAS choisir un gris foncé ou un noir comme primaryColor — ce n'est jamais la couleur de marque.
- primaryColor : LA couleur signature de la marque (celle qu'on reconnaît immédiatement, souvent la plus fréquente non-neutre)
- secondaryColor : couleur complémentaire (fonds, footer, ou deuxième couleur de la palette)
- accentColor : couleur d'accent (CTA secondaires, badges, survols — souvent une couleur vive)
- backgroundColor : couleur de fond principale du site (#fff, crème, gris clair, sombre…)
- textOnPrimary : couleur du texte lisible sur primaryColor ("#ffffff" si primary est foncé, "#000000" si primary est clair)

### Typographie
- fontFamily : nom exact de la Google Font ou police utilisée (null si système)
- fontWeight : le poids dominant des titres ("400", "600", "700", "800", "900")
- letterSpacing : espacement des lettres en px pour les titres (-1, 0, 0.5, 1, 2…)
- textTransform : transformation du texte des titres ("none", "uppercase", "lowercase")

### Style de fond
- bgStyle : type de fond de la carte ("gradient", "solid", "split")
  - gradient : dégradé entre primary et secondary
  - solid : couleur unie primary
  - split : haut en couleur, bas en blanc (ou inversé)
- gradientAngle : angle du dégradé en degrés (135, 180, 45…) — ignoré si bgStyle != gradient

### Éléments décoratifs — CRUCIAL
Regarde bien le site : y a-t-il des vagues, des cercles, des points, des lignes diagonales, des formes géométriques, des angles coupés, des textures ? Cela définit le style graphique de la marque.
- decorativeElement : le type d'overlay décoratif principal ("waves", "dots", "circles", "diagonalLines", "geometric", "cornerCut", "none")
- decorativeOpacity : opacité de l'overlay (0.03 à 0.15)
- decorativePosition : où placer l'overlay ("top", "bottom", "full", "topRight", "bottomLeft")

### Coins
- borderRadius : rayon des coins de la carte en px (0 = carré, 8 = léger arrondi, 16 = arrondi, 24 = très arrondi)

### Badge de récompense
- badgeStyle : forme du badge ("pill", "rounded", "square", "outlined")
- badgeBorderRadius : rayon en px (4 = carré, 8 = arrondi, 20 = pill)

### Style général
- mood : description très courte du style (ex: "Élégant et sombre", "Naturel et chaleureux", "Moderne et minimaliste", "Luxe et doré", "Ludique et coloré")

## IMPORTANT
- Sois PRÉCIS sur les couleurs : utilise les hex exacts trouvés dans le CSS, pas des approximations
- Pour decorativeElement, choisis le type qui correspond le MIEUX à l'ambiance du site — même s'il n'y a pas littéralement des vagues dans le CSS, si le site a un style organique/fluide, choisis "waves"
- Si le site est très sobre/minimaliste, mets decorativeElement: "none"
- Le résultat doit permettre de recréer l'ambiance exacte de ce site sur un support 10×10 cm

ATTENTION — FORMAT OBLIGATOIRE :
- Retourne un UNIQUE objet JSON PLAT (pas d'objets imbriqués, pas de catégories)
- Toutes les clés doivent être au premier niveau : { "primaryColor": "...", "secondaryColor": "...", "fontFamily": "...", ... }
- PAS de structure comme { "couleurs": { ... }, "typographie": { ... } } — c'est INTERDIT
- Pas de backticks, pas de markdown, JUSTE le JSON

Réponds UNIQUEMENT avec le JSON plat :`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      temperature: 0.3,
      max_tokens: 800,
      messages: [{ role: "user", content: prompt }],
    });

    const raw = completion.choices[0]?.message?.content ?? "";
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: "Impossible d'extraire les couleurs du site" }, { status: 422 });
    }

    let result = JSON.parse(jsonMatch[0]);

    // Safety: flatten nested JSON (GPT sometimes returns { "couleurs": { ... }, "typographie": { ... } })
    if (!result.primaryColor && typeof result === "object") {
      const flat: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(result)) {
        if (value && typeof value === "object" && !Array.isArray(value)) {
          Object.assign(flat, value);
        } else {
          flat[key] = value;
        }
      }
      if (flat.primaryColor) result = flat;
    }

    console.log(`[ANALYZE_WEBSITE] Colors:`, { primary: result.primaryColor, secondary: result.secondaryColor, accent: result.accentColor, font: result.fontFamily });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("[ANALYZE_WEBSITE_ERROR]", error);
    return NextResponse.json({ error: "Erreur lors de l'analyse du site" }, { status: 500 });
  }
}

function extractStyleData(html: string): string {
  const styles: string[] = [];

  // Inline <style> tags
  const styleMatches = Array.from(html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi));
  for (const m of styleMatches) {
    styles.push(m[1]);
  }

  // CSS custom properties from :root or body
  const cssVarMatches = styles.join("\n").match(/--[a-zA-Z-]+\s*:\s*[^;]+;/g);
  if (cssVarMatches) {
    styles.push("/* CSS Variables */\n" + cssVarMatches.join("\n"));
  }

  return styles.join("\n").slice(0, 8000);
}

function extractStructureHints(html: string): string {
  const hints: string[] = [];

  // Detect SVG usage (waves, shapes)
  const svgCount = (html.match(/<svg/gi) || []).length;
  if (svgCount > 0) hints.push(`${svgCount} SVG elements found`);

  // Detect wave-like patterns
  if (/wave|ondulation|vague/i.test(html)) hints.push("Wave patterns detected in class names / content");
  if (/clip-path|clipPath/i.test(html)) hints.push("clip-path used (likely shaped sections)");

  // Detect border-radius patterns
  const borderRadiusMatches = html.match(/border-radius\s*:\s*([^;}"]+)/gi);
  if (borderRadiusMatches) {
    const unique = Array.from(new Set(borderRadiusMatches.slice(0, 10)));
    hints.push(`Border radii found: ${unique.join(", ")}`);
  }

  // Detect gradients
  const gradientMatches = html.match(/linear-gradient|radial-gradient/gi);
  if (gradientMatches) hints.push(`${gradientMatches.length} gradient(s) detected`);

  // Detect specific decorative classes
  const decorClasses = html.match(/class="[^"]*(?:hero|banner|wave|shape|blob|circle|dot|pattern|overlay|decoration|ornament)[^"]*"/gi);
  if (decorClasses) hints.push(`Decorative classes: ${decorClasses.slice(0, 5).join(", ")}`);

  // Detect font-weight usage
  const weightMatches = html.match(/font-weight\s*:\s*([^;}"]+)/gi);
  if (weightMatches) {
    const unique = Array.from(new Set(weightMatches.slice(0, 8)));
    hints.push(`Font weights: ${unique.join(", ")}`);
  }

  // Detect text-transform
  const transformMatches = html.match(/text-transform\s*:\s*([^;}"]+)/gi);
  if (transformMatches) {
    const unique = Array.from(new Set(transformMatches.slice(0, 5)));
    hints.push(`Text transforms: ${unique.join(", ")}`);
  }

  // Detect box-shadow (indicates depth style)
  const shadowCount = (html.match(/box-shadow/gi) || []).length;
  if (shadowCount > 3) hints.push(`Heavy shadow usage (${shadowCount} occurrences) — elevated/material style`);

  // Detect letter-spacing
  const spacingMatches = html.match(/letter-spacing\s*:\s*([^;}"]+)/gi);
  if (spacingMatches) {
    hints.push(`Letter-spacing: ${Array.from(new Set(spacingMatches.slice(0, 5))).join(", ")}`);
  }

  return hints.join("\n");
}

async function fetchExternalStylesheets(html: string, baseUrl: string): Promise<string> {
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
        const lines = css.split("\n");
        for (const line of lines) {
          if (colorRegex.test(line)) {
            relevantLines.push(line.trim());
          }
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
