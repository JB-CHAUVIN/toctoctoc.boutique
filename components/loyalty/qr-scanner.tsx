"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { QrCode, Check, Gift } from "lucide-react";

interface StampResult {
  rewardGranted: boolean;
  rewardName: string | null;
  data: {
    customerName: string;
    totalStamps: number;
  };
}

export function QrScanner({ businessId }: { businessId: string }) {
  const [qrCode, setQrCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<StampResult | null>(null);

  async function handleStamp(e: React.FormEvent) {
    e.preventDefault();
    if (!qrCode.trim()) return;
    setLoading(true);
    setResult(null);

    const res = await fetch(`/api/loyalty/cards/${encodeURIComponent(qrCode.trim())}/stamp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ businessId }),
    });

    const data = await res.json();

    if (!res.ok) {
      toast.error(data.error || "Erreur lors de l'ajout du tampon");
    } else {
      setResult(data);
      if (data.rewardGranted) {
        toast.success(`🏆 Récompense gagnée : ${data.rewardName} !`);
      } else {
        toast.success("Tampon ajouté !");
      }
      setQrCode("");
    }
    setLoading(false);
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500">
        Saisissez le code QR du client ou scannez-le avec une douchette
      </p>

      <form onSubmit={handleStamp} className="flex gap-3">
        <Input
          placeholder="Code QR / identifiant de carte"
          value={qrCode}
          onChange={(e) => setQrCode(e.target.value)}
          leftAddon={<QrCode className="h-4 w-4" />}
        />
        <Button type="submit" loading={loading}>
          Tamponner
        </Button>
      </form>

      {result && (
        <div
          className={`flex items-center gap-3 rounded-xl p-4 ${
            result.rewardGranted
              ? "bg-amber-50 border border-amber-200"
              : "bg-emerald-50 border border-emerald-200"
          }`}
        >
          {result.rewardGranted ? (
            <Gift className="h-6 w-6 flex-shrink-0 text-amber-500" />
          ) : (
            <Check className="h-6 w-6 flex-shrink-0 text-emerald-500" />
          )}
          <div>
            <div className="font-medium text-slate-800">
              {result.rewardGranted ? `🏆 ${result.rewardName}` : "Tampon ajouté !"}
            </div>
            <div className="text-sm text-slate-500">
              {result.data.customerName} · {result.data.totalStamps} tampon(s) au total
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
