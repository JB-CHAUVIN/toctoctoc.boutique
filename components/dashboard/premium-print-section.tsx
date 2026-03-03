"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Sparkles, Plus, Minus, ShoppingCart, Truck, CheckCircle2, Loader2 } from "lucide-react";
import { PRINT_PRODUCTS, type PrintProduct } from "@/lib/constants";
import toast from "react-hot-toast";

interface CartItem {
  product: PrintProduct;
  quantity: number;
}

interface PremiumPrintSectionProps {
  businessId: string;
  businessName: string;
  businessAddress?: string | null;
  businessCity?: string | null;
  businessZipCode?: string | null;
  businessPhone?: string | null;
  businessEmail?: string | null;
}

export function PremiumPrintSection({
  businessId,
  businessName,
  businessAddress,
  businessCity,
  businessZipCode,
  businessPhone,
  businessEmail,
}: PremiumPrintSectionProps) {
  const searchParams = useSearchParams();
  const orderSuccess = searchParams.get("order") === "success";

  const [cart, setCart] = useState<Record<string, CartItem>>({});
  const [showCheckout, setShowCheckout] = useState(false);
  const [loading, setLoading] = useState(false);

  // Shipping form
  const [shipping, setShipping] = useState({
    name: businessName ?? "",
    address: businessAddress ?? "",
    city: businessCity ?? "",
    zipCode: businessZipCode ?? "",
    phone: businessPhone ?? "",
    email: businessEmail ?? "",
  });

  const cartItems = Object.values(cart).filter((i) => i.quantity > 0);
  const totalCents = cartItems.reduce((sum, i) => sum + i.product.priceCents * i.quantity, 0);

  function updateQuantity(product: PrintProduct, delta: number) {
    setCart((prev) => {
      const current = prev[product.id]?.quantity ?? 0;
      const next = Math.max(0, Math.min(10, current + delta));
      if (next === 0) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [product.id]: _removed, ...rest } = prev;
        return rest;
      }
      return { ...prev, [product.id]: { product, quantity: next } };
    });
  }

  async function handleCheckout() {
    if (cartItems.length === 0) return;

    // Validation basique
    if (!shipping.name || !shipping.address || !shipping.city || !shipping.zipCode || !shipping.email) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/print-orders/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId,
          items: cartItems.map((i) => ({
            productId: i.product.id,
            quantity: i.quantity,
          })),
          shipping,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.url) {
        toast.error(data.error ?? "Erreur lors de la commande");
        return;
      }

      window.location.href = data.url;
    } catch {
      toast.error("Erreur réseau");
    } finally {
      setLoading(false);
    }
  }

  const comingSoon = true; // TODO: passer à false quand la commande sera activée

  return (
    <div>
      {/* Bandeau succès */}
      {orderSuccess && (
        <div className="mb-6 flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
          <div>
            <p className="font-semibold text-emerald-800">Commande confirmée !</p>
            <p className="text-sm text-emerald-600">
              Vous recevrez un email de confirmation avec le suivi de votre commande.
            </p>
          </div>
        </div>
      )}

      {/* Section pitch */}
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-amber-500" />
          <h2 className="text-xl font-bold text-slate-900">Supports premium</h2>
          {comingSoon && (
            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
              Bientôt disponible
            </span>
          )}
        </div>
        <p className="mt-1 text-sm font-medium text-slate-600">
          Faites bonne impression avec des supports professionnels
        </p>
        <p className="mt-1 text-sm text-slate-500">
          Un chevalet en acrylique sur votre comptoir, c&apos;est chic, durable, et ça montre que
          vous êtes pro. Chaque support est personnalisé avec votre QR code.
        </p>
      </div>

      {/* Grille produits */}
      <div className={`grid gap-4 sm:grid-cols-2 ${comingSoon ? "pointer-events-none opacity-50 select-none" : ""}`}>
        {PRINT_PRODUCTS.map((product) => {
          const qty = cart[product.id]?.quantity ?? 0;
          return (
            <div
              key={product.id}
              className="relative rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              {product.badge && (
                <span className="absolute -top-2.5 right-3 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                  {product.badge}
                </span>
              )}
              <div className="mb-3 text-3xl">{product.emoji}</div>
              <h3 className="font-semibold text-slate-900">{product.name}</h3>
              <p className="mt-1 text-sm text-slate-500">{product.description}</p>
              <p className="mt-2 text-lg font-bold text-indigo-600">{product.price} €</p>

              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={() => updateQuantity(product, -1)}
                  disabled={qty === 0}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 disabled:opacity-30"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-8 text-center text-sm font-semibold text-slate-700">{qty}</span>
                <button
                  onClick={() => updateQuantity(product, 1)}
                  disabled={qty >= 10}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 disabled:opacity-30"
                >
                  <Plus className="h-4 w-4" />
                </button>
                {qty === 0 && (
                  <button
                    onClick={() => updateQuantity(product, 1)}
                    className="ml-auto rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-600 transition-colors hover:bg-indigo-100"
                  >
                    Ajouter
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Panier + formulaire (masqué en mode coming soon) */}
      {!comingSoon && cartItems.length > 0 && (
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <ShoppingCart className="h-5 w-5 text-indigo-600" />
            <h3 className="font-semibold text-slate-900">Votre commande</h3>
          </div>

          {/* Récap items */}
          <div className="space-y-2 mb-4">
            {cartItems.map((item) => (
              <div key={item.product.id} className="flex items-center justify-between text-sm">
                <span className="text-slate-600">
                  {item.product.emoji} {item.product.name} × {item.quantity}
                </span>
                <span className="font-medium text-slate-900">
                  {((item.product.priceCents * item.quantity) / 100).toFixed(2)} €
                </span>
              </div>
            ))}
            <div className="border-t border-slate-100 pt-2 flex items-center justify-between">
              <span className="font-semibold text-slate-900">Total</span>
              <span className="text-lg font-bold text-indigo-600">
                {(totalCents / 100).toFixed(2)} €
              </span>
            </div>
          </div>

          {!showCheckout ? (
            <button
              onClick={() => setShowCheckout(true)}
              className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
            >
              <Truck className="mr-2 inline-block h-4 w-4" />
              Renseigner l&apos;adresse de livraison
            </button>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <Truck className="h-4 w-4 text-slate-400" />
                <span className="text-sm font-medium text-slate-700">Adresse de livraison</span>
              </div>
              <input
                type="text"
                placeholder="Nom *"
                value={shipping.name}
                onChange={(e) => setShipping((s) => ({ ...s, name: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
              />
              <input
                type="text"
                placeholder="Adresse *"
                value={shipping.address}
                onChange={(e) => setShipping((s) => ({ ...s, address: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Code postal *"
                  value={shipping.zipCode}
                  onChange={(e) => setShipping((s) => ({ ...s, zipCode: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                />
                <input
                  type="text"
                  placeholder="Ville *"
                  value={shipping.city}
                  onChange={(e) => setShipping((s) => ({ ...s, city: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                />
              </div>
              <input
                type="tel"
                placeholder="Téléphone"
                value={shipping.phone}
                onChange={(e) => setShipping((s) => ({ ...s, phone: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
              />
              <input
                type="email"
                placeholder="Email *"
                value={shipping.email}
                onChange={(e) => setShipping((s) => ({ ...s, email: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
              />
              <button
                onClick={handleCheckout}
                disabled={loading}
                className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 inline-block h-4 w-4 animate-spin" />
                    Redirection vers le paiement…
                  </>
                ) : (
                  <>Commander — {(totalCents / 100).toFixed(2)} €</>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
