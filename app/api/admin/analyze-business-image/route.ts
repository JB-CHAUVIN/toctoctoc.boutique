import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import OpenAI, { toFile } from "openai";
import sharp from "sharp";
import { logoBackgroundColor } from "@/lib/utils";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function buildAmbiancePrompt(imgW: number, imgH: number) {
  return `Analyse cette image d'un commerce local (photo de vitrine, devanture, ambiance intérieure, etc.).
L'image fait exactement ${imgW}×${imgH} pixels (largeur×hauteur).

Extrais les couleurs de la CHARTE GRAPHIQUE du commerce (enseigne, logo, décoration volontaire).

Règles couleurs STRICTES :
- primaryColor : la couleur dominante de l'identité visuelle (enseigne, logo, devanture peinte). JAMAIS blanc, crème, beige clair, gris clair ou toute couleur très pâle/désaturée. La primaryColor doit être une couleur franche et saturée. Si l'enseigne est blanche sur fond coloré, prends la couleur du fond. Si tout est clair/blanc, choisis une couleur riche qui correspond à l'ambiance du commerce (ex: boulangerie → brun doré, fleuriste → vert, etc.).
- secondaryColor : une VRAIE couleur secondaire de la charte (bandeau, bordure, typographie colorée). Doit être chromatique et saturée. Ne choisis JAMAIS le noir (#000000), le quasi-noir, le blanc ou le gris SAUF si c'est clairement un choix de design intentionnel. En cas de doute, dérive une teinte plus sombre de la primaryColor.
- accentColor : couleur d'accent contrastée (détail décoratif, prix affiché, élément qui attire l'œil). Doit aussi être une couleur vive.

Retourne UNIQUEMENT un JSON valide sans backticks ni markdown :
{
  "name": "Nom du commerce visible sur l'image, ou null si non lisible",
  "businessType": "Type parmi : Restaurant, Café, Bar, Bar à jeux, Glacier, Boulangerie, Pâtisserie, Boulangerie / Pâtisserie, Chocolaterie, Traiteur, Fromagerie, Boucherie, Charcuterie, Poissonnerie, Épicerie fine, Salon de coiffure, Barbier, Salon de beauté, Institut d'esthétique, Nail art, Spa, Studio de yoga, Coach sportif, Salle de sport, Épicerie, Superette, Fleuriste, Librairie, Boutique de vêtements, Boutique cadeaux, Bijouterie, Pressing, Garage / Auto, Autre, ou null si indéterminé",
  "primaryColor": "#hexcode",
  "secondaryColor": "#hexcode",
  "accentColor": "#hexcode"
}`;
}

async function handleAmbianceMode(imageBase64: string) {
  const rawBuffer = Buffer.from(imageBase64, "base64");
  const normalizedBuffer = await sharp(rawBuffer).rotate().png().toBuffer();
  const meta = await sharp(normalizedBuffer).metadata();
  const imgW = meta.width ?? 0;
  const imgH = meta.height ?? 0;
  const normalizedBase64 = normalizedBuffer.toString("base64");

  const kb = Math.round(normalizedBuffer.length / 1024);
  console.log(`[AI/ambiance] Image normalisée : ${imgW}×${imgH}px, ${kb} Ko`);
  console.log(`[AI/ambiance] → Appel gpt-4o…`);

  const t0 = Date.now();
  const resp = await openai.chat.completions.create({
    model: "gpt-4o",
    max_tokens: 600,
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: buildAmbiancePrompt(imgW, imgH) },
          {
            type: "image_url",
            image_url: { url: `data:image/png;base64,${normalizedBase64}`, detail: "high" },
          },
        ],
      },
    ],
  });
  console.log(`[AI/ambiance] ✓ gpt-4o répondu en ${Date.now() - t0}ms — tokens: ${resp.usage?.total_tokens ?? "?"}`);

  const rawJson = resp.choices[0]?.message?.content ?? "{}";
  console.log(`[AI/ambiance]   Réponse brute :`, rawJson);

  let parsed: {
    name?: string | null;
    businessType?: string | null;
    primaryColor?: string;
    secondaryColor?: string;
    accentColor?: string;
  } = {};

  try {
    parsed = JSON.parse(rawJson.trim());
  } catch {
    const match = rawJson.match(/\{[\s\S]*\}/);
    if (match) parsed = JSON.parse(match[0]);
  }

  console.log(`[AI/ambiance] ✓ Parsé → name="${parsed.name}", type="${parsed.businessType}"`);

  return {
    name: parsed.name ?? null,
    businessType: parsed.businessType ?? null,
    primaryColor: parsed.primaryColor,
    secondaryColor: parsed.secondaryColor,
    accentColor: parsed.accentColor,
  };
}

async function handleLogoMode(imageBase64: string, mimeType: string) {
  const rawBuffer = Buffer.from(imageBase64, "base64");

  // Convertir en PNG RGBA (requis par gpt-image-1 edit)
  const pngBuffer = await sharp(rawBuffer).rotate().ensureAlpha().png().toBuffer();
  const meta = await sharp(pngBuffer).metadata();
  console.log(`[AI/logo] Image logo : ${meta.width}×${meta.height}px, ${Math.round(pngBuffer.length / 1024)} Ko`);
  console.log(`[AI/logo] → Appel gpt-image-1 edit (reproduction HD fidèle)…`);

  const imageFile = await toFile(pngBuffer, "logo.png", { type: "image/png" });

  const t0 = Date.now();
  const editResp = await openai.images.edit({
    model: "gpt-image-1",
    image: imageFile,
    prompt:
      "Reproduis ce logo exactement tel qu'il apparaît dans cette image. " +
      "Sois le plus fidèle possible : même forme, mêmes couleurs, même typographie, même composition. " +
      "Ne modifie rien, ne stylise pas, ne réinterprète pas. " +
      "Fond 100% transparent (PNG). Haute définition 1024×1024px.",
    size: "1024x1024",
    background: "transparent",
    output_format: "png",
  });
  console.log(`[AI/logo] ✓ gpt-image-1 répondu en ${Date.now() - t0}ms`);

  const b64 = editResp.data?.[0]?.b64_json;
  if (!b64) {
    console.warn(`[AI/logo] ⚠ Pas de b64_json dans la réponse`);
    throw new Error("gpt-image-1 n'a pas retourné d'image");
  }

  const logoBuffer = Buffer.from(b64, "base64");

  const logoDir = join(process.cwd(), "public", "uploads", "logos");
  await mkdir(logoDir, { recursive: true });
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.png`;
  await writeFile(join(logoDir, filename), logoBuffer);
  const logoUrl = `/uploads/logos/${filename}`;
  console.log(`[AI/logo] ✓ Logo HD sauvegardé → ${logoUrl}`);

  // Extraire la couleur dominante pour calculer le fond du logo
  const stats = await sharp(logoBuffer).stats();
  const dominantHex =
    "#" +
    [stats.channels[0].mean, stats.channels[1].mean, stats.channels[2].mean]
      .map((v) => Math.round(v).toString(16).padStart(2, "0"))
      .join("");
  const logoBackground = logoBackgroundColor(dominantHex);
  console.log(`[AI/logo] ✓ Couleur dominante: ${dominantHex} → fond: ${logoBackground}`);

  return { logoUrl, logoBackground };
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  if (dbUser?.role !== "ADMIN") {
    return NextResponse.json({ error: "Accès réservé aux admins" }, { status: 403 });
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "OPENAI_API_KEY non configurée" }, { status: 500 });
  }

  const body = await req.json();
  const { imageBase64, mimeType, mode = "ambiance" } = body as {
    imageBase64: string;
    mimeType: string;
    mode?: "ambiance" | "logo";
  };

  if (!imageBase64 || !mimeType) {
    return NextResponse.json({ error: "imageBase64 et mimeType requis" }, { status: 400 });
  }

  try {
    if (mode === "logo") {
      const data = await handleLogoMode(imageBase64, mimeType);
      return NextResponse.json({ success: true, data });
    } else {
      const data = await handleAmbianceMode(imageBase64);
      return NextResponse.json({ success: true, data });
    }
  } catch (error) {
    console.error(`[AI/${mode}] ✗ Erreur :`, error);
    return NextResponse.json({ error: "Erreur lors de l'analyse" }, { status: 500 });
  }
}
