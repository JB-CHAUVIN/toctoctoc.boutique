"use client";

import { useState, useEffect, useRef } from "react";
import { useCustomerInfo } from "@/hooks/use-customer-info";
import QRCode from "qrcode";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoyaltyCardPreview } from "./loyalty-card-preview";
import { Loader2, Share2, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LoyaltyConfig } from "@prisma/client";

interface CardStatus {
  name: string;
  emoji: string;
  color: string;
  extraReward: string | null;
}

interface Card {
  id: string;
  customerName: string;
  qrCode: string;
  currentStamps: number;
  totalRewards: number;
  resetCount: number;
  progress: number;
  stampsRequired: number;
  status: CardStatus | null;
}

interface Props {
  businessId: string;
  businessName: string;
  primaryColor: string;
  accentColor: string;
  config: LoyaltyConfig;
}

export function LoyaltyFlow({ businessId, businessName, primaryColor, config }: Props) {
  const { load: loadCustomer, save: saveCustomer } = useCustomerInfo();
  const [step, setStep] = useState<"form" | "card">("form");
  const [card, setCard] = useState<Card | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(() => {
    const info = loadCustomer();
    return { customerName: info.name ?? "", customerEmail: info.email ?? "", customerPhone: info.phone ?? "" };
  });
  const [stampAnim, setStampAnim] = useState(false);
  const prevStampsRef = useRef<number | null>(null);

  // ── Récupérer la carte sauvegardée ─────────────────────────
  useEffect(() => {
    const savedEmail = localStorage.getItem(`loyalty_email_${businessId}`);
    if (savedEmail) fetchOrCreate(savedEmail, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businessId]);

  // ── Polling toutes les 2s ────────────────────────────────────
  useEffect(() => {
    if (step !== "card" || !card) return;
    prevStampsRef.current = card.currentStamps;

    const timer = setInterval(async () => {
      try {
        const res = await fetch(`/api/loyalty/poll/${card.qrCode}`);
        if (!res.ok) return;
        const data = await res.json();

        const prev = prevStampsRef.current ?? card.currentStamps;
        const added = data.currentStamps - prev;

        if (added > 0) {
          setStampAnim(true);
          setTimeout(() => setStampAnim(false), 1500);

          toast.custom(
            (t) => (
              <div
                className={cn(
                  "flex items-center gap-3 rounded-2xl bg-white px-5 py-4 shadow-xl border border-slate-100 transition-all duration-300",
                  t.visible ? "opacity-100 scale-100" : "opacity-0 scale-95"
                )}
              >
                <span className="text-3xl">{config.stampIcon}</span>
                <div>
                  <p className="font-bold text-slate-900">
                    +{added} tampon{added > 1 ? "s" : ""} crédité{added > 1 ? "s" : ""} !
                  </p>
                  <p className="text-sm text-slate-500">
                    {data.progress}/{data.stampsRequired} dans le cycle actuel
                  </p>
                </div>
              </div>
            ),
            { duration: 4000 }
          );
        }

        if (data.currentStamps !== prev || data.totalRewards !== card.totalRewards) {
          prevStampsRef.current = data.currentStamps;
          setCard((c) => c ? { ...c, ...data } : c);
        }
      } catch {
        // Silencieux
      }
    }, 2000);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, card?.qrCode]);

  // ── Helpers ──────────────────────────────────────────────────
  async function fetchOrCreate(email: string, silent = false) {
    if (!silent) setLoading(true);
    try {
      const res = await fetch("/api/loyalty/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessId, customerName: "Client", customerEmail: email }),
      });
      const data = await res.json();
      if (data.success) await loadCard(data.data.qrCode, data.data);
    } finally {
      if (!silent) setLoading(false);
    }
  }

  async function loadCard(qrCode: string, baseCard: { id: string; customerName: string }) {
    const res = await fetch(`/api/loyalty/poll/${qrCode}`);
    const pollData = res.ok ? await res.json() : {};

    setCard({
      id: baseCard.id,
      customerName: baseCard.customerName,
      qrCode,
      currentStamps: pollData.currentStamps ?? 0,
      totalRewards: pollData.totalRewards ?? 0,
      resetCount: pollData.resetCount ?? 0,
      progress: pollData.progress ?? 0,
      stampsRequired: pollData.stampsRequired ?? config.stampsRequired,
      status: pollData.status ?? null,
    });

    const url = await QRCode.toDataURL(qrCode, {
      width: 200, margin: 1,
      color: { dark: "#1e293b", light: "#ffffff" },
    });
    setQrDataUrl(url);
    setStep("card");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.customerName.trim()) return;
    setLoading(true);

    const res = await fetch("/api/loyalty/cards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ businessId, ...form }),
    });
    const data = await res.json();

    if (!res.ok) {
      toast.error(data.error || "Erreur");
    } else {
      saveCustomer({ name: form.customerName, email: form.customerEmail, phone: form.customerPhone });
      if (form.customerEmail) {
        localStorage.setItem(`loyalty_email_${businessId}`, form.customerEmail);
      }
      await loadCard(data.data.qrCode, data.data);
    }
    setLoading(false);
  }

  async function handleShare() {
    if (navigator.share) {
      navigator.share({ title: `Ma carte fidélité ${businessName}`, text: card?.qrCode ?? "" });
    } else {
      await navigator.clipboard.writeText(card?.qrCode ?? "");
      toast.success("Code copié !");
    }
  }

  const stampsRequired = card?.stampsRequired ?? config.stampsRequired;
  const remaining = stampsRequired - (card?.progress ?? 0);

  // ── FORM ─────────────────────────────────────────────────────
  if (step === "form") {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div
            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl text-3xl"
            style={{ backgroundColor: primaryColor + "20" }}
          >
            🎯
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Carte de fidélité</h1>
          <p className="mt-2 text-slate-500">{businessName}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-semibold text-slate-800">Obtenir ma carte</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Prénom et nom *"
              placeholder="Marie Martin"
              value={form.customerName}
              onChange={(e) => setForm((f) => ({ ...f, customerName: e.target.value }))}
              required
            />
            <Input
              label="Email (pour retrouver votre carte)"
              type="email"
              placeholder="marie@exemple.fr"
              value={form.customerEmail}
              onChange={(e) => setForm((f) => ({ ...f, customerEmail: e.target.value }))}
            />
            <Input
              label="Téléphone"
              type="tel"
              placeholder="06 12 34 56 78"
              value={form.customerPhone}
              onChange={(e) => setForm((f) => ({ ...f, customerPhone: e.target.value }))}
            />
            <Button type="submit" loading={loading} className="w-full" style={{ backgroundColor: primaryColor }}>
              Obtenir ma carte
            </Button>
          </form>
        </div>
      </div>
    );
  }

  // ── CARD ─────────────────────────────────────────────────────
  if (step === "card" && card) {
    return (
      <div className="space-y-6">
        {/* Badge statut */}
        {card.status && (
          <div
            className="flex items-center gap-3 rounded-2xl px-5 py-3 text-white shadow-sm"
            style={{ backgroundColor: card.status.color }}
          >
            <span className="text-2xl">{card.status.emoji}</span>
            <div>
              <p className="font-bold">{card.status.name}</p>
              {card.status.extraReward && (
                <p className="text-sm opacity-90">🎁 {card.status.extraReward}</p>
              )}
            </div>
          </div>
        )}

        {/* Carte avec animation au tampon */}
        <div className={cn("transition-transform duration-300", stampAnim && "scale-[1.03]")}>
          <LoyaltyCardPreview
            config={config}
            businessName={businessName}
            customerName={card.customerName}
            totalStamps={card.currentStamps}
          />
        </div>

        {/* QR Code */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm text-center">
          <h3 className="mb-4 font-semibold text-slate-800">Mon QR code</h3>
          {qrDataUrl ? (
            <img src={qrDataUrl} alt="QR Code fidélité" className="mx-auto rounded-xl" />
          ) : (
            <div className="flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
          )}
          <p className="mt-3 text-xs text-slate-400">
            Présentez ce QR code en caisse pour obtenir vos tampons
          </p>
          {process.env.NODE_ENV === "development" && (
            <code className="mt-2 block font-mono text-xs text-slate-300">{card.qrCode}</code>
          )}
        </div>

        {/* Progression */}
        <div className="rounded-2xl p-5 text-center" style={{ backgroundColor: primaryColor + "12" }}>
          <div
            className={cn("text-3xl font-bold transition-all duration-500", stampAnim && "scale-110")}
            style={{ color: primaryColor }}
          >
            {remaining} tampon{remaining > 1 ? "s" : ""}
          </div>
          <div className="mt-1 text-sm text-slate-600">
            restant{remaining > 1 ? "s" : ""} avant votre prochaine récompense
          </div>
          <div className="mt-2 text-sm font-medium" style={{ color: primaryColor }}>
            🏆 {config.rewardName}
          </div>

          {(card.totalRewards > 0 || card.resetCount > 0) && (
            <div className="mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-slate-400">
              {card.totalRewards > 0 && (
                <span className="flex items-center gap-1">
                  <Trophy className="h-3 w-3" />
                  {card.totalRewards} récompense{card.totalRewards > 1 ? "s" : ""} obtenue{card.totalRewards > 1 ? "s" : ""}
                </span>
              )}
              {card.resetCount > 0 && (
                <span>· Carte renouvelée {card.resetCount}×</span>
              )}
            </div>
          )}
        </div>

        <Button
          onClick={handleShare}
          variant="outline"
          className="w-full"
          leftIcon={<Share2 className="h-4 w-4" />}
        >
          Partager ma carte
        </Button>
      </div>
    );
  }

  return null;
}
