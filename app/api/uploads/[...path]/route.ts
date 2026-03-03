import { NextResponse } from "next/server";
import { readFile, stat } from "fs/promises";
import { join, extname } from "path";

const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path: segments } = await params;

  // Sécurité : interdire le path traversal
  if (segments.some((s) => s === ".." || s.includes("/"))) {
    return NextResponse.json({ error: "Interdit" }, { status: 403 });
  }

  const filePath = join(process.cwd(), "public", "uploads", ...segments);
  const ext = extname(filePath).toLowerCase();
  const mime = MIME[ext];

  if (!mime) {
    return NextResponse.json({ error: "Type non supporté" }, { status: 400 });
  }

  try {
    const info = await stat(filePath);
    if (!info.isFile()) throw new Error("Not a file");

    const buffer = await readFile(filePath);

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": mime,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "Fichier introuvable" }, { status: 404 });
  }
}
