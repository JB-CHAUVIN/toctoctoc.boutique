import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import OpenAI from "openai";
import { captureScreenshot } from "@/lib/screenshot";
import {
  extractStyleData,
  extractStructureHints,
  extractTopColors,
  extractGoogleFonts,
  extractThemeColor,
  fetchExternalStylesheets,
} from "@/lib/css-extract";

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

    // ── Step 1: Screenshot + HTML via Puppeteer ─────────────────────────
    let screenshotB64: string;
    let html: string;
    let logoUrl: string | null = null;

    try {
      const result = await captureScreenshot(url);
      screenshotB64 = result.screenshotB64;
      html = result.html;
      logoUrl = result.logoUrl;
    } catch (e) {
      console.error("[ANALYZE_WEBSITE] Screenshot failed:", e);
      return NextResponse.json({ error: "Impossible de capturer le site web" }, { status: 422 });
    }

    // ── Step 2: Extract CSS data from HTML ──────────────────────────────
    const styleContent = extractStyleData(html);
    const externalCss = await fetchExternalStylesheets(html, url);
    const themeColor = extractThemeColor(html);
    const fontLinks = extractGoogleFonts(html);
    const topColors = extractTopColors(html);
    const structureHints = extractStructureHints(html);

    // ── Step 3: GPT-4o Vision — screenshot + CSS context ────────────────
    const prompt = buildVisionPrompt({ topColors, themeColor, fontLinks, styleContent, externalCss, structureHints });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      temperature: 0.2,
      max_tokens: 1000,
      messages: [{
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: {
              url: `data:image/jpeg;base64,${screenshotB64}`,
              detail: "high",
            },
          },
          { type: "text", text: prompt },
        ],
      }],
    });

    const raw = completion.choices[0]?.message?.content ?? "";
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: "Impossible d'extraire la charte graphique" }, { status: 422 });
    }

    let result = JSON.parse(jsonMatch[0]);

    // Flatten nested JSON (GPT sometimes nests despite instructions)
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

    // Attach logo URL if found on the page
    if (logoUrl) result.logoUrl = logoUrl;

    console.log(`[ANALYZE_WEBSITE] Extracted:`, {
      primary: result.primaryColor,
      secondary: result.secondaryColor,
      accent: result.accentColor,
      font: result.fontFamily,
      mood: result.mood,
      logo: logoUrl ?? "none",
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("[ANALYZE_WEBSITE_ERROR]", error);
    return NextResponse.json({ error: "Erreur lors de l'analyse du site" }, { status: 500 });
  }
}

// ── Prompt builder ────────────────────────────────────────────────────────────

function buildVisionPrompt(ctx: {
  topColors: string;
  themeColor: string | null;
  fontLinks: string[];
  styleContent: string;
  externalCss: string;
  structureHints: string;
}): string {
  return `Tu es un expert en design graphique. Tu vois le screenshot de ce site web commercial. Analyse son identité visuelle COMPLÈTE en regardant le screenshot ET les données CSS ci-dessous.

## Screenshot
L'image ci-dessus montre le rendu réel du site. C'est ta source PRINCIPALE pour identifier :
- La palette de couleurs dominante (hero, header, boutons, fond)
- Le style typographique (empattement, graisse, espacement)
- L'ambiance générale (moderne, classique, luxe, chaleureux, minimaliste…)
- Les éléments décoratifs visibles (vagues, formes, dégradés, motifs, textures)

## Données CSS complémentaires

Couleurs fréquentes dans le code : ${ctx.topColors || "Aucune"}
Meta theme-color : ${ctx.themeColor ?? "Non trouvé"}
Google Fonts : ${ctx.fontLinks.length ? ctx.fontLinks.join(", ") : "Aucune"}
Structure HTML : ${ctx.structureHints.slice(0, 1500)}
Styles inline : ${ctx.styleContent.slice(0, 3000)}
CSS externe : ${ctx.externalCss.slice(0, 2000)}

## Ce que tu dois extraire

Produis un JSON qui décrit l'identité visuelle pour recréer une carte imprimable (10×10 cm) fidèle au style de cette marque.

### Couleurs — regarde LE SCREENSHOT en priorité
- primaryColor : LA couleur signature (la plus visible sur le screenshot, jamais un gris/noir)
- secondaryColor : couleur complémentaire (fond, footer, second plan)
- accentColor : couleur d'accent (CTA, badges, liens — souvent vive)
- backgroundColor : fond principal du site (#fff, crème, gris clair, sombre…)
- textOnPrimary : "#ffffff" si primary est foncé, "#000000" si clair

### Typographie
- fontFamily : nom exact de la Google Font (ou null si système)
- fontWeight : poids des titres ("400" à "900")
- letterSpacing : en px (-1, 0, 0.5, 1, 2…)
- textTransform : "none", "uppercase" ou "lowercase"

### Style de fond de la carte
- bgStyle : "gradient" | "solid" | "split"
- gradientAngle : angle en degrés si gradient

### Éléments décoratifs — regarde le screenshot
- decorativeElement : "waves" | "dots" | "circles" | "diagonalLines" | "geometric" | "cornerCut" | "none"
- decorativeOpacity : 0.03 à 0.15
- decorativePosition : "top" | "bottom" | "full" | "topRight" | "bottomLeft"

### Coins et badges
- borderRadius : 0 (carré) à 24 (très arrondi)
- badgeStyle : "pill" | "rounded" | "square" | "outlined"
- badgeBorderRadius : 4 à 20

### Style général
- mood : description courte ("Élégant et sombre", "Naturel et chaleureux", etc.)

## FORMAT OBLIGATOIRE
- JSON PLAT unique, pas d'objets imbriqués
- Clés au premier niveau : { "primaryColor": "...", "fontFamily": "...", ... }
- Pas de backticks, pas de markdown, JUSTE le JSON
- Utilise les codes hex EXACTS que tu vois

Réponds UNIQUEMENT avec le JSON plat :`;
}
