import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe, getOrCreateCustomer } from "@/lib/stripe";

const schema = z.object({
  returnPath: z.string().optional(),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  const returnPath = parsed.success ? parsed.data.returnPath : undefined;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { email: true },
  });
  if (!user?.email) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });

  const customerId = await getOrCreateCustomer(session.user.id, user.email);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:2203";
  const returnUrl = returnPath ? `${appUrl}${returnPath}` : `${appUrl}/dashboard`;

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });

  return NextResponse.json({ success: true, url: portalSession.url });
}
