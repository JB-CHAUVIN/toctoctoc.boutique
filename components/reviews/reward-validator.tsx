"use client";

import { useState, useRef } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Camera, QrCode, ArrowLeft, X, Gift, CheckCircle, AlertTriangle } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import { useQrScanner } from "@/hooks/use-qr-scanner";

interface RewardInfo {
  reviewId: string;
  customerName: string | null;
  customerEmail: string | null;
  rewardCode: string;
  reward: {
    name: string;
    description: string | null;
    emoji: string;
    color: string;
    expiryDays: number;
  } | null;
  rewardClaimed: boolean;
  rewardClaimedAt: string | null;
  createdAt: string;
}

type Step = "input" | "confirm" | "success";

export function RewardValidator({ businessId }: { businessId: string }) {
  const [step, setStep] = useState<Step>("input");
  const [codeInput, setCodeInput] = useState("");
  const [reward, setReward] = useState<RewardInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  void businessId;

  const { cameraSupported, cameraActive, videoRef, canvasRef, startCamera, stopCamera } =
    useQrScanner({ onScan: (value) => lookupCode(value) });

  async function lookupCode(code: string) {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;
    setLoading(true);
    setCodeInput(trimmed);
    try {
      const res = await fetch(`/api/reviews/claim/${encodeURIComponent(trimmed)}`);
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        toast.error(data?.error ? `${data.error} (${trimmed})` : `Erreur ${res.status}`);
        return;
      }
      const data = await res.json();
      setReward(data.data);
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

  async function handleClaim() {
    if (!reward) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/reviews/claim/${encodeURIComponent(reward.rewardCode)}`, {
        method: "POST",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        toast.error(data?.error || `Erreur ${res.status}`);
        return;
      }
      setReward((prev) => prev ? { ...prev, rewardClaimed: true } : prev);
      setStep("success");
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setStep("input");
    setCodeInput("");
    setReward(null);
    setTimeout(() => inputRef.current?.focus(), 100);
  }

  // ── STEP: input ───────────────────────────────────────────────────

  if (step === "input") {
    return (
      <div className="flex flex-col gap-5">
        {/* Canvas caché pour jsQR (fallback iOS/Firefox) — toujours dans le DOM */}
        <canvas ref={canvasRef} style={{ display: "none" }} />

        {/* Vue caméra live — toujours dans le DOM pour que videoRef soit prêt */}
        <div className={`relative overflow-hidden rounded-2xl bg-black ${!cameraActive ? "hidden" : ""}`}>
          <video
            ref={videoRef}
            className="w-full"
            playsInline
            autoPlay
            muted
            style={{ minHeight: 260, objectFit: "cover", width: "100%" }}
          />
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
            Scannez le QR code du client
          </p>
        </div>

        {/* Bouton démarrer caméra */}
        {!cameraActive && cameraSupported && (
          <button
            onClick={handleStartCamera}
            className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 py-10 text-slate-500 transition hover:border-amber-300 hover:bg-amber-50 hover:text-amber-600 active:scale-95"
          >
            <Camera className="h-8 w-8" />
            <span className="text-sm font-medium">Scanner le QR code du lot</span>
          </button>
        )}

        {!cameraActive && (
          <>
            {cameraSupported && (
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-slate-200" />
                <span className="text-xs text-slate-400">ou saisir le code manuellement</span>
                <div className="h-px flex-1 bg-slate-200" />
              </div>
            )}

            <form
              onSubmit={(e) => { e.preventDefault(); lookupCode(codeInput); }}
              className="flex gap-2 sm:gap-3"
            >
              <div className="relative min-w-0 flex-1">
                <QrCode className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  ref={inputRef}
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-3 text-sm uppercase tracking-wider text-slate-800 placeholder-slate-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 sm:tracking-widest"
                  placeholder="Code (ex: A3F7K2)"
                  value={codeInput}
                  onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
                  autoFocus
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                />
              </div>
              <Button type="submit" loading={loading} disabled={!codeInput.trim()}>
                Valider
              </Button>
            </form>

            {!cameraSupported && (
              <p className="text-center text-xs text-slate-400">
                Demandez au client de vous montrer son code ou saisissez-le ci-dessus.
              </p>
            )}
          </>
        )}
      </div>
    );
  }

  // ── STEP: confirm ─────────────────────────────────────────────────

  if (step === "confirm" && reward) {
    return (
      <div className="flex flex-col gap-5">
        <button
          onClick={reset}
          className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-700"
        >
          <ArrowLeft className="h-4 w-4" /> Autre client
        </button>

        {/* Alerte si déjà utilisé */}
        {reward.rewardClaimed && (
          <div className="flex items-center gap-3 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            <AlertTriangle className="h-5 w-5 flex-shrink-0" />
            <div>
              <div>Ce lot a déjà été utilisé</div>
              {reward.rewardClaimedAt && (
                <div className="mt-0.5 text-xs font-normal text-red-500">
                  Le {formatDateTime(new Date(reward.rewardClaimedAt))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Infos récompense */}
        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
          <div className="mb-4 flex items-center gap-3">
            {reward.reward ? (
              <span className="text-4xl">{reward.reward.emoji}</span>
            ) : (
              <Gift className="h-10 w-10 text-slate-300" />
            )}
            <div>
              <div className="text-lg font-bold text-slate-900">
                {reward.reward?.name ?? "Récompense"}
              </div>
              {reward.reward?.description && (
                <div className="text-sm text-slate-400">{reward.reward.description}</div>
              )}
            </div>
          </div>

          <div className="space-y-1.5 border-t border-slate-200 pt-4 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Client</span>
              <span className="font-medium text-slate-800">
                {reward.customerName ?? "Anonyme"}
              </span>
            </div>
            {reward.customerEmail && (
              <div className="flex justify-between">
                <span className="text-slate-500">Email</span>
                <span className="text-slate-600">{reward.customerEmail}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-500">Code</span>
              <code className="rounded bg-slate-200 px-2 py-0.5 text-xs font-mono font-bold tracking-widest">
                {reward.rewardCode}
              </code>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Obtenu le</span>
              <span className="text-slate-600">{formatDateTime(new Date(reward.createdAt))}</span>
            </div>
          </div>
        </div>

        {!reward.rewardClaimed ? (
          <Button
            onClick={handleClaim}
            loading={loading}
            size="lg"
            className="w-full bg-amber-500 hover:bg-amber-600"
          >
            ✅ Valider et consommer le lot
          </Button>
        ) : (
          <Button onClick={reset} variant="outline" size="lg" className="w-full">
            Scanner un autre code
          </Button>
        )}
      </div>
    );
  }

  // ── STEP: success ─────────────────────────────────────────────────

  if (step === "success" && reward) {
    return (
      <div className="flex flex-col items-center gap-5 py-6 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-4xl">
          {reward.reward?.emoji ?? "✅"}
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Lot validé !</h2>
          <p className="mt-1 text-slate-500">{reward.customerName ?? "Client"}</p>
          {reward.reward && (
            <p className="mt-2 font-semibold text-amber-700">{reward.reward.name}</p>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm text-emerald-600">
          <CheckCircle className="h-4 w-4" />
          Récompense consommée avec succès
        </div>
        <Button onClick={reset} variant="outline" size="lg" className="w-full">
          Scanner un autre code
        </Button>
      </div>
    );
  }

  return null;
}
