import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe, getOrCreateCustomer, PLAN_TO_PRICE } from "@/lib/stripe";

const schema = z.object({
  plan: z.enum(["STARTER", "PRO"]),
  returnPath: z.string().optional(),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Données invalides" }, { status: 400 });

  const { plan, returnPath } = parsed.data;
  const priceId = PLAN_TO_PRICE[plan];
  if (!priceId) return NextResponse.json({ error: "Plan invalide" }, { status: 400 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { email: true },
  });
  if (!user?.email) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });

  const customerId = await getOrCreateCustomer(session.user.id, user.email);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:2203";
  const cancelUrl = returnPath ? `${appUrl}${returnPath}` : `${appUrl}/dashboard`;

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    subscription_data: {
      trial_period_days: 14,
      metadata: { userId: session.user.id },
    },
    payment_method_collection: "always",
    allow_promotion_codes: true,
    success_url: `${appUrl}/dashboard/billing?billing=success`,
    cancel_url: cancelUrl,
    metadata: { userId: session.user.id },
  });

  return NextResponse.json({ success: true, url: checkoutSession.url });
}
