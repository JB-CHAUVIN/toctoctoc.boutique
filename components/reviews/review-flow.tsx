"use client";

import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RewardRoulette } from "./reward-roulette";
import { Star, ExternalLink, Gift, CheckCircle, Loader2 } from "lucide-react";
import type { Reward } from "@prisma/client";

interface Props {
  businessId: string;
  businessName: string;
  primaryColor: string;
  accentColor: string;
  googleUrl: string | null;
  instructions: string | null;
  rewards: Reward[];
}

type Step = "info" | "google" | "roulette" | "result";

interface ReviewData {
  token: string;
  rewardCode: string | null;
  reward: Reward | null;
  googleReviewInitiated: boolean;
}

export function ReviewFlow({ businessId, businessName, primaryColor, accentColor, googleUrl, instructions, rewards }: Props) {
  const [step, setStep] = useState<Step>("info");
  const [token, setToken] = useState<string | null>(null);
  const [reviewData, setReviewData] = useState<ReviewData | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");

  // Récupérer le token depuis localStorage si déjà visité
  useEffect(() => {
    const savedToken = localStorage.getItem(`review_token_${businessId}`);
    if (savedToken) {
      setToken(savedToken);
      fetchReview(savedToken);
    }
  }, [businessId]);

  async function fetchReview(t: string) {
    const res = await fetch(`/api/reviews/${t}`);
    const data = await res.json();
    if (data.success) {
      setReviewData(data.data);
      if (data.data.rewardCode) {
        setStep("result");
      } else if (data.data.googleReviewInitiated) {
        setStep("roulette");
      } else {
        setStep("google");
      }
    }
  }

  async function handleStart(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    // Créer un token de review
    const res = await fetch(`/api/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ businessId, customerName, customerEmail }),
    });
    const data = await res.json();

    if (!res.ok) {
      toast.error("Erreur. Veuillez réessayer.");
    } else {
      const newToken = data.data.token;
      setToken(newToken);
      localStorage.setItem(`review_token_${businessId}`, newToken);
      setReviewData(data.data);
      setStep("google");
    }
    setLoading(false);
  }

  async function handleGoogleClick() {
    if (!token) return;
    // Marquer comme initié
    await fetch(`/api/reviews/${token}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "initiate" }),
    });

    // Ouvrir Google dans un nouvel onglet
    if (googleUrl) {
      window.open(googleUrl, "_blank");
    }
  }

  async function handleSpin() {
    if (!token || spinning) return;
    setSpinning(true);

    // Attendre que la roulette tourne (3s)
    await new Promise((r) => setTimeout(r, 3500));

    const res = await fetch(`/api/reviews/${token}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "spin" }),
    });
    const data = await res.json();

    if (data.success) {
      setReviewData(data.data);
      setStep("result");
    } else {
      toast.error(data.error || "Erreur");
      setSpinning(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div
          className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl text-3xl"
          style={{ backgroundColor: primaryColor + "20" }}
        >
          ⭐
        </div>
        <h1 className="text-2xl font-bold text-slate-900">{businessName}</h1>
        <p className="mt-2 text-slate-500">
          {instructions || "Donnez-nous votre avis et gagnez une récompense !"}
        </p>
      </div>

      {/* Step 1: Infos client */}
      {step === "info" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-semibold text-slate-800">Vos informations (optionnel)</h2>
          <form onSubmit={handleStart} className="space-y-4">
            <Input
              label="Votre prénom"
              placeholder="Marie"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
            <Input
              label="Email (pour recevoir votre code)"
              type="email"
              placeholder="marie@exemple.fr"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
            />
            <Button
              type="submit"
              loading={loading}
              className="w-full"
              style={{ backgroundColor: primaryColor }}
            >
              Continuer →
            </Button>
          </form>
        </div>
      )}

      {/* Step 2 : Redirection Google */}
      {step === "google" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mb-6">
            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-amber-50">
              <Star className="h-8 w-8 text-amber-400 fill-amber-400" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Laissez votre avis Google</h2>
            <p className="mt-2 text-sm text-slate-500">
              Cliquez sur le bouton ci-dessous pour accéder à notre page d'avis Google.
              Une fois votre avis déposé, revenez ici pour tenter votre chance !
            </p>
          </div>

          {googleUrl ? (
            <Button
              onClick={handleGoogleClick}
              className="w-full gap-2"
              style={{ backgroundColor: "#4285F4" }}
              rightIcon={<ExternalLink className="h-4 w-4" />}
            >
              Laisser un avis sur Google
            </Button>
          ) : (
            <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
              Aucun lien Google configuré pour le moment.
            </div>
          )}

          <div className="mt-6 border-t border-slate-100 pt-6">
            <p className="mb-3 text-sm text-slate-500">Vous avez déjà laissé votre avis ?</p>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setStep("roulette")}
            >
              🎰 Accéder à la roulette
            </Button>
          </div>
        </div>
      )}

      {/* Step 3 : Roulette */}
      {step === "roulette" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h2 className="mb-2 text-xl font-bold text-slate-900">Tentez votre chance !</h2>
          <p className="mb-6 text-sm text-slate-500">Merci pour votre avis 🙏 Tournez la roue !</p>

          <RewardRoulette
            rewards={rewards}
            spinning={spinning}
            primaryColor={primaryColor}
          />

          {!spinning && (
            <Button
              onClick={handleSpin}
              className="mt-6 w-full text-lg py-4"
              style={{ backgroundColor: accentColor }}
            >
              🎰 Tourner la roue !
            </Button>
          )}
          {spinning && (
            <p className="mt-4 text-sm text-slate-400 animate-pulse">La roue tourne...</p>
          )}
        </div>
      )}

      {/* Step 4 : Résultat */}
      {step === "result" && reviewData && (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          {reviewData.reward ? (
            <>
              <div className="mb-4 text-6xl">{reviewData.reward.emoji}</div>
              <h2 className="text-2xl font-bold text-slate-900">Félicitations !</h2>
              <p className="mt-2 text-lg font-semibold" style={{ color: primaryColor }}>
                {reviewData.reward.name}
              </p>
              {reviewData.reward.description && (
                <p className="mt-2 text-sm text-slate-500">{reviewData.reward.description}</p>
              )}
              <div className="mt-6 rounded-xl border-2 border-dashed p-6" style={{ borderColor: primaryColor + "40" }}>
                <div className="text-xs font-medium uppercase tracking-wider text-slate-400">
                  Votre code récompense
                </div>
                <div
                  className="mt-2 text-3xl font-bold font-mono tracking-widest"
                  style={{ color: primaryColor }}
                >
                  {reviewData.rewardCode}
                </div>
                <p className="mt-2 text-xs text-slate-400">
                  Présentez ce code au comptoir pour bénéficier de votre récompense
                </p>
              </div>
              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-400">
                <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                Valable {reviewData.reward.expiryDays} jours
              </div>
            </>
          ) : (
            <>
              <Gift className="mx-auto mb-4 h-16 w-16 text-slate-300" />
              <h2 className="text-xl font-bold text-slate-900">Merci pour votre avis !</h2>
              <p className="mt-2 text-slate-500">
                Nous n'avons pas de récompense à distribuer actuellement, mais merci de nous avoir
                fait confiance !
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
