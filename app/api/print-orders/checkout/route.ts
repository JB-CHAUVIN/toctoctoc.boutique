import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe, getOrCreateCustomer } from "@/lib/stripe";
import { PRINT_PRODUCTS_MAP } from "@/lib/constants";

const itemSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().min(1).max(10),
});

const shippingSchema = z.object({
  name: z.string().min(1),
  address: z.string().min(1),
  city: z.string().min(1),
  zipCode: z.string().min(1),
  country: z.string().optional().default("FR"),
  phone: z.string().optional(),
  email: z.string().email(),
});

const schema = z.object({
  businessId: z.string().min(1),
  items: z.array(itemSchema).min(1),
  shipping: shippingSchema,
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Données invalides" }, { status: 400 });

  const { businessId, items, shipping } = parsed.data;

  // Vérifier ownership ou admin
  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { email: true, role: true },
  });
  if (!dbUser) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });

  const isAdmin = dbUser.role === "ADMIN";
  const business = await prisma.business.findFirst({
    where: isAdmin
      ? { id: businessId, deletedAt: null }
      : { id: businessId, userId: session.user.id, deletedAt: null },
    select: { id: true, name: true },
  });
  if (!business) return NextResponse.json({ error: "Commerce introuvable" }, { status: 404 });

  // Calcul du total côté serveur
  const orderItems = items.map((item) => {
    const product = PRINT_PRODUCTS_MAP[item.productId];
    if (!product) throw new Error(`Produit inconnu : ${item.productId}`);
    return {
      productId: product.id,
      name: product.name,
      quantity: item.quantity,
      unitPrice: product.priceCents,
    };
  });

  const totalAmount = orderItems.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);

  // Créer la commande en DB
  const printOrder = await prisma.printOrder.create({
    data: {
      businessId,
      userId: session.user.id,
      items: orderItems,
      totalAmount,
      status: "PENDING",
      shippingName: shipping.name,
      shippingAddress: shipping.address,
      shippingCity: shipping.city,
      shippingZipCode: shipping.zipCode,
      shippingCountry: shipping.country ?? "FR",
      shippingPhone: shipping.phone,
      shippingEmail: shipping.email,
    },
  });

  // Créer Stripe Checkout Session (mode payment)
  const customerId = await getOrCreateCustomer(session.user.id, dbUser.email!);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:2203";

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "payment",
    line_items: orderItems.map((item) => ({
      price_data: {
        currency: "eur",
        product_data: { name: item.name },
        unit_amount: item.unitPrice,
      },
      quantity: item.quantity,
    })),
    shipping_address_collection: undefined,
    success_url: `${appUrl}/dashboard/${businessId}/supports?order=success`,
    cancel_url: `${appUrl}/dashboard/${businessId}/supports`,
    metadata: {
      type: "print_order",
      printOrderId: printOrder.id,
      userId: session.user.id,
      businessId,
    },
  });

  // Stocker le session ID Stripe
  await prisma.printOrder.update({
    where: { id: printOrder.id },
    data: { stripeSessionId: checkoutSession.id },
  });

  return NextResponse.json({ success: true, url: checkoutSession.url });
}
