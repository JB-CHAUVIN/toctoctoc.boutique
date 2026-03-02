import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  token: z.string().min(1),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
});

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const { token, password } = parsed.data;

  const resetToken = await prisma.passwordResetToken.findUnique({ where: { token } });

  if (!resetToken) {
    return NextResponse.json({ error: "Lien invalide ou déjà utilisé." }, { status: 400 });
  }

  if (resetToken.expiresAt < new Date()) {
    await prisma.passwordResetToken.delete({ where: { token } });
    return NextResponse.json({ error: "Ce lien a expiré. Faites une nouvelle demande." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email: resetToken.email } });
  if (!user) {
    return NextResponse.json({ error: "Utilisateur introuvable." }, { status: 404 });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.$transaction([
    prisma.user.update({ where: { id: user.id }, data: { password: passwordHash } }),
    prisma.passwordResetToken.delete({ where: { token } }),
  ]);

  return NextResponse.json({ success: true });
}
