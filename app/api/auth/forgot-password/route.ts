import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { PasswordResetEmail } from "@/emails/password-reset";

const schema = z.object({
  email: z.string().email(),
});

const EXPIRES_IN_MINUTES = 60;

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Email invalide" }, { status: 400 });
  }

  const { email } = parsed.data;

  // Toujours répondre success — ne pas révéler si l'email existe
  const user = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (!user) {
    return NextResponse.json({ success: true });
  }

  // Supprimer tout token existant pour cet email
  await prisma.passwordResetToken.deleteMany({ where: { email } });

  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + EXPIRES_IN_MINUTES * 60 * 1000);

  await prisma.passwordResetToken.create({
    data: { email, token, expiresAt },
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://toctoctoc.boutique";
  const resetUrl = `${appUrl}/reset-password?token=${token}`;

  sendEmail({
    to: email,
    subject: "Réinitialisation de votre mot de passe",
    template: PasswordResetEmail({ resetUrl, expiresInMinutes: EXPIRES_IN_MINUTES }),
  }).catch((err) => console.error("[EMAIL_RESET]", err));

  return NextResponse.json({ success: true });
}
