"use client";

import { useState, useRef } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Camera, QrCode, Plus, Minus, ArrowLeft, X, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQrScanner } from "@/hooks/use-qr-scanner";

interface CardInfo {
  id: string;
  qrCode: string;
  customerName: string;
  customerEmail: string | null;
  totalStamps: number;
  totalRewards: number;
  progress: number;
  stampsRequired: number;
  rewardName: string;
  stampIcon: string;
}

interface StampResult {
  customerName: string;
  totalStamps: number;
  progress: number;
  stampsRequired: number;
  stampsAdded: number;
  rewardsGranted: number;
  rewardName: string | null;
}

type Step = "input" | "confirm" | "success";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function StampScanner({ businessId }: { businessId: string }) {
  const [step, setStep] = useState<Step>("input");
  const [qrInput, setQrInput] = useState("");
  const [card, setCard] = useState<CardInfo | null>(null);
  const [stampCount, setStampCount] = useState(1);
  const [result, setResult] = useState<StampResult | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { cameraSupported, cameraActive, videoRef, canvasRef, startCamera, stopCamera } =
    useQrScanner({ onScan: (value) => lookupCard(value) });

  async function lookupCard(code: string) {
    const trimmed = code.trim();
    if (!trimmed) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/loyalty/cards/${encodeURIComponent(trimmed)}`);
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Carte introuvable");
        return;
      }
      setCard(data.data);
      setStampCount(1);
      setStep("confirm");
    } catch {
      toast.error("Erreur réseau");
    } finally {
      setLoading(false);
    }
  }

  async function handleStartCamera() {
    try {
      await startCamera();
    } catch (e) {
      const msg = e instanceof Error && e.message === "camera_insecure"
        ? "Caméra indisponible sur HTTP. Utilisez localhost ou HTTPS."
        : "Impossible d'accéder à la caméra. Vérifiez les permissions.";
      toast.error(msg);
    }
  }

  async function handleConfirm() {
    if (!card) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/loyalty/cards/${encodeURIComponent(card.qrCode)}/stamp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count: stampCount }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Erreur");
        return;
      }
      setResult(data);
      setStep("success");
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setStep("input");
    setQrInput("");
    setCard(null);
    setResult(null);
    setStampCount(1);
    setTimeout(() => inputRef.current?.focus(), 100);
  }

  // ── STEP: input ──────────────────────────────────────────────────

  if (step === "input") {
    return (
      <div className="flex flex-col gap-5">
        {/* Canvas caché pour jsQR (fallback iOS/Firefox) — toujours dans le DOM */}
        <canvas ref={canvasRef} style={{ display: "none" }} />

        {/* Vue caméra live — toujours dans le DOM pour que videoRef soit prêt avant setCameraActive */}
        <div className={cn("relative overflow-hidden rounded-2xl bg-black", !cameraActive && "hidden")}>
          <video
            ref={videoRef}
            className="w-full"
            playsInline
            autoPlay
            muted
            style={{ minHeight: 260, objectFit: "cover", width: "100%" }}
          />
          {/* Cadre de visée */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="h-52 w-52 rounded-2xl border-2 border-white shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]" />
          </div>
          <button
            onClick={stopCamera}
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white"
          >
            <X className="h-5 w-5" />
          </button>
          <p className="absolute bottom-4 left-0 right-0 text-center text-sm text-white/80">
            Pointez vers le QR code du client
          </p>
        </div>

        {/* Bouton démarrer caméra */}
        {!cameraActive && cameraSupported && (
          <button
            onClick={handleStartCamera}
            className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 py-10 text-slate-500 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 active:scale-95"
          >
            <Camera className="h-8 w-8" />
            <span className="text-sm font-medium">Scanner avec la caméra</span>
          </button>
        )}

        {/* Séparateur */}
        {!cameraActive && (
          <>
            {cameraSupported && (
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-slate-200" />
                <span className="text-xs text-slate-400">ou saisir manuellement</span>
                <div className="h-px flex-1 bg-slate-200" />
              </div>
            )}

            {/* Saisie manuelle */}
            <form
              onSubmit={(e) => { e.preventDefault(); lookupCard(qrInput); }}
              className="flex gap-2 sm:gap-3"
            >
              <div className="relative min-w-0 flex-1">
                <QrCode className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  ref={inputRef}
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-3 text-sm text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="Code de la carte fidélité"
                  value={qrInput}
                  onChange={(e) => setQrInput(e.target.value)}
                  autoFocus
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                />
              </div>
              <Button type="submit" loading={loading} disabled={!qrInput.trim()}>
                Chercher
              </Button>
            </form>

            {!cameraSupported && (
              <p className="text-center text-xs text-slate-400">
                {"💡 Utilisez l'appareil photo de votre téléphone pour scanner le QR code, puis collez le texte ici."}
              </p>
            )}
          </>
        )}
      </div>
    );
  }

  // ── STEP: confirm ────────────────────────────────────────────────

  if (step === "confirm" && card) {
    const rewardsCount = Math.floor((card.progress + stampCount) / card.stampsRequired);
    const willGetReward = rewardsCount > 0;

    return (
      <div className="flex flex-col gap-5">
        <button
          onClick={reset}
          className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Autre client
        </button>

        {/* Infos client */}
        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
          <div className="mb-4">
            <div className="text-lg font-bold text-slate-900">{card.customerName}</div>
            {card.customerEmail && (
              <div className="text-sm text-slate-400">{card.customerEmail}</div>
            )}
            <div className="mt-1 text-xs text-slate-400">{card.totalRewards} récompense(s) obtenue(s)</div>
          </div>

          {/* Grille de tampons */}
          <p className="mb-2 text-xs font-medium text-slate-500">
            Progression : {card.progress}/{card.stampsRequired}
          </p>
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: card.stampsRequired }, (_, i) => {
              const filled = i < card.progress;
              const adding = i >= card.progress && i < card.progress + stampCount;
              return (
                <span
                  key={i}
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full text-lg transition-all duration-150",
                    filled
                      ? "bg-indigo-600 text-white shadow-sm"
                      : adding
                      ? "bg-amber-400 text-white ring-2 ring-amber-300 ring-offset-1"
                      : "bg-slate-200"
                  )}
                >
                  {filled || adding ? card.stampIcon : ""}
                </span>
              );
            })}
          </div>

          {willGetReward && (
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700">
              <Trophy className="h-4 w-4 flex-shrink-0" />
              {rewardsCount > 1
                ? `${rewardsCount}× ${card.rewardName}`
                : card.rewardName}
            </div>
          )}
        </div>

        {/* Sélecteur de tampons */}
        <div>
          <p className="mb-3 text-sm font-medium text-slate-700">Tampons à ajouter</p>
          <div className="flex items-center gap-5">
            <button
              onClick={() => setStampCount((c) => Math.max(1, c - 1))}
              disabled={stampCount <= 1}
              className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 active:scale-95 disabled:opacity-30"
            >
              <Minus className="h-5 w-5" />
            </button>
            <span className="min-w-[2rem] text-center text-3xl font-bold text-slate-900">
              {stampCount}
            </span>
            <button
              onClick={() => setStampCount((c) => Math.min(10, c + 1))}
              disabled={stampCount >= 10}
              className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 active:scale-95 disabled:opacity-30"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
        </div>

        <Button onClick={handleConfirm} loading={loading} size="lg" className="w-full">
          Valider {stampCount} tampon{stampCount > 1 ? "s" : ""}
        </Button>
      </div>
    );
  }

  // ── STEP: success ────────────────────────────────────────────────

  if (step === "success" && result) {
    return (
      <div className="flex flex-col items-center gap-5 py-6 text-center">
        <div
          className={cn(
            "flex h-20 w-20 items-center justify-center rounded-full text-4xl",
            result.rewardsGranted > 0 ? "bg-amber-100" : "bg-emerald-100"
          )}
        >
          {result.rewardsGranted > 0 ? "🏆" : "✅"}
        </div>

        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            {result.rewardsGranted > 0
              ? "Récompense gagnée !"
              : `${result.stampsAdded} tampon${result.stampsAdded > 1 ? "s" : ""} ajouté${result.stampsAdded > 1 ? "s" : ""}`}
          </h2>
          <p className="mt-1 text-slate-500">{result.customerName}</p>
          {result.rewardsGranted > 0 && result.rewardName && (
            <p className="mt-2 font-semibold text-amber-700">{result.rewardName}</p>
          )}
        </div>

        <div className="text-sm text-slate-400">
          {result.progress}/{result.stampsRequired} tampons dans le cycle actuel
        </div>

        <Button onClick={reset} variant="outline" size="lg" className="w-full">
          Scanner un autre client
        </Button>
      </div>
    );
  }

  return null;
}
