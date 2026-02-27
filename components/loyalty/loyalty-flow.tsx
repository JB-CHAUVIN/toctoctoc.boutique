"use client";

import { useState, useEffect } from "react";
import QRCode from "qrcode";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoyaltyCardPreview } from "./loyalty-card-preview";
import { Loader2, Share2 } from "lucide-react";
import type { LoyaltyConfig } from "@prisma/client";

interface Card {
  id: string;
  customerName: string;
  qrCode: string;
  totalStamps: number;
  totalRewards: number;
}

interface Props {
  businessId: string;
  businessName: string;
  primaryColor: string;
  accentColor: string;
  config: LoyaltyConfig;
}

export function LoyaltyFlow({ businessId, businessName, primaryColor, accentColor, config }: Props) {
  const [step, setStep] = useState<"form" | "card">("form");
  const [card, setCard] = useState<Card | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ customerName: "", customerEmail: "", customerPhone: "" });

  // Récupérer la carte depuis localStorage
  useEffect(() => {
    const savedQr = localStorage.getItem(`loyalty_qr_${businessId}`);
    if (savedQr) {
      fetchCardByEmail(savedQr);
    }
  }, [businessId]);

  async function fetchCardByEmail(email: string) {
    const res = await fetch("/api/loyalty/cards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ businessId, customerName: "Client", customerEmail: email }),
    });
    const data = await res.json();
    if (data.success) {
      setCard(data.data);
      await generateQr(data.data.qrCode);
      setStep("card");
    }
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
      setCard(data.data);
      await generateQr(data.data.qrCode);
      if (form.customerEmail) {
        localStorage.setItem(`loyalty_qr_${businessId}`, form.customerEmail);
      }
      setStep("card");
    }
    setLoading(false);
  }

  async function generateQr(code: string) {
    const url = await QRCode.toDataURL(code, {
      width: 200,
      margin: 1,
      color: { dark: "#1e293b", light: "#ffffff" },
    });
    setQrDataUrl(url);
  }

  async function handleShare() {
    if (navigator.share) {
      navigator.share({
        title: `Ma carte fidélité ${businessName}`,
        text: `Mon code de fidélité : ${card?.qrCode}`,
      });
    } else {
      await navigator.clipboard.writeText(card?.qrCode ?? "");
      toast.success("Code copié !");
    }
  }

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

      {step === "form" && (
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
            <Button
              type="submit"
              loading={loading}
              className="w-full"
              style={{ backgroundColor: primaryColor }}
            >
              Obtenir ma carte
            </Button>
          </form>
        </div>
      )}

      {step === "card" && card && (
        <div className="space-y-6">
          {/* Carte de fidélité visuelle */}
          <LoyaltyCardPreview
            config={config}
            businessName={businessName}
            customerName={card.customerName}
            totalStamps={card.totalStamps}
          />

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
            <code className="mt-2 block font-mono text-xs text-slate-400">{card.qrCode}</code>
          </div>

          {/* Infos programme */}
          <div
            className="rounded-2xl p-5 text-center"
            style={{ backgroundColor: primaryColor + "10" }}
          >
            <div className="text-2xl font-bold" style={{ color: primaryColor }}>
              {config.stampsRequired - (card.totalStamps % config.stampsRequired)} tampon(s)
            </div>
            <div className="mt-1 text-sm text-slate-600">
              restant(s) avant votre prochaine récompense
            </div>
            <div className="mt-2 text-sm font-medium" style={{ color: primaryColor }}>
              🏆 {config.rewardName}
            </div>
            {card.totalRewards > 0 && (
              <div className="mt-2 text-xs text-slate-400">
                {card.totalRewards} récompense(s) obtenue(s) jusqu'ici
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
      )}
    </div>
  );
}
