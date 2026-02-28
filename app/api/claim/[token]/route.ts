import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(
  req: Request,
  { params }: { params: { token: string } }
) {
  const { email, password } = await req.json();

  if (!email || !password || password.length < 8) {
    return NextResponse.json({ error: "Données invalides." }, { status: 400 });
  }

  const business = await prisma.business.findUnique({
    where: { claimToken: params.token },
    select: { id: true, claimedAt: true },
  });

  if (!business) {
    return NextResponse.json({ error: "Lien invalide ou expiré." }, { status: 404 });
  }

  if (business.claimedAt) {
    return NextResponse.json({ error: "Ce lien a déjà été utilisé." }, { status: 409 });
  }

  // Check no existing user with that email
  const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (existing) {
    return NextResponse.json(
      { error: "Un compte existe déjà avec cet email. Connectez-vous puis contactez le support pour transférer votre espace." },
      { status: 409 }
    );
  }

  const hashed = await bcrypt.hash(password, 10);

  // Create user + subscription + transfer business in a transaction
  await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email,
        password: hashed,
        name: email.split("@")[0],
        subscription: {
          create: { plan: "FREE", status: "ACTIVE" },
        },
      },
    });

    await tx.business.update({
      where: { id: business.id },
      data: {
        userId: user.id,
        claimedAt: new Date(),
      },
    });
  });

  return NextResponse.json({ success: true });
}
