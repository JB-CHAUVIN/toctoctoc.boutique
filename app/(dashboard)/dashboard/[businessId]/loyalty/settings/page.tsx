"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { LoyaltyCardPreview } from "@/components/loyalty/loyalty-card-preview";
import { Save, Loader2 } from "lucide-react";
import type { LoyaltyConfig } from "@prisma/client";

const STAMP_ICONS = ["⭐", "☕", "🌟", "💎", "🎯", "❤️", "🌸", "🍕", "🎁", "✨"];

export default function LoyaltySettingsPage() {
  const params = useParams<{ businessId: string }>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [businessName, setBusinessName] = useState("Mon Commerce");
  const [config, setConfig] = useState<Partial<LoyaltyConfig>>({
    cardColor: "#4f46e5",
    cardTextColor: "#ffffff",
    stampColor: "#f59e0b",
    stampIcon: "⭐",
    stampsRequired: 10,
    rewardName: "Un produit offert",
    rewardDescription: "",
  });

  useEffect(() => {
    async function load() {
      const [configRes, bizRes] = await Promise.all([
        fetch(`/api/loyalty/config/${params.businessId}`),
        fetch(`/api/business/${params.businessId}`),
      ]);

      const configData = await configRes.json();
      const bizData = await bizRes.json();

      if (configData.success) setConfig(configData.data);
      if (bizData.success) setBusinessName(bizData.data.name);
      setLoading(false);
    }
    load();
  }, [params.businessId]);

  function update<K extends keyof typeof config>(key: K, value: (typeof config)[K]) {
    setConfig((c) => ({ ...c, [key]: value }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch(`/api/loyalty/config/${params.businessId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
    });
    const data = await res.json();
    if (!res.ok) toast.error(data.error || "Erreur");
    else toast.success("Configuration sauvegardée !");
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Configuration Fidélité</h1>
        <p className="mt-1 text-sm text-slate-500">Design et règles du programme de fidélité</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <form onSubmit={handleSave} className="space-y-6">
          {/* Programme */}
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Règles du programme</CardTitle>
                <CardDescription>Nombre de tampons et récompense</CardDescription>
              </div>
            </CardHeader>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Nombre de tampons requis : <strong>{config.stampsRequired}</strong>
                </label>
                <input
                  type="range"
                  min={2}
                  max={20}
                  value={config.stampsRequired ?? 10}
                  onChange={(e) => update("stampsRequired", parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-slate-400">
                  <span>2</span><span>20</span>
                </div>
              </div>
              <Input
                label="Récompense *"
                placeholder="Ex: Un café offert"
                value={config.rewardName ?? ""}
                onChange={(e) => update("rewardName", e.target.value)}
                required
              />
              <Input
                label="Description de la récompense"
                placeholder="Ex: Votre café préféré, totalement gratuit !"
                value={config.rewardDescription ?? ""}
                onChange={(e) => update("rewardDescription", e.target.value)}
              />
            </div>
          </Card>

          {/* Design */}
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Design de la carte</CardTitle>
                <CardDescription>Personnalisez l'apparence de votre carte</CardDescription>
              </div>
            </CardHeader>
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                {([
                  { key: "cardColor" as const, label: "Fond" },
                  { key: "cardTextColor" as const, label: "Texte" },
                  { key: "stampColor" as const, label: "Tampon" },
                ] as const).map(({ key, label }) => (
                  <div key={key} className="flex flex-col items-center gap-1">
                    <input
                      type="color"
                      value={(config[key] as string) ?? "#000000"}
                      onChange={(e) => update(key, e.target.value)}
                      className="h-10 w-full cursor-pointer rounded-xl border border-slate-200"
                    />
                    <span className="text-xs text-slate-500">{label}</span>
                  </div>
                ))}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Icône tampon</label>
                <div className="flex flex-wrap gap-2">
                  {STAMP_ICONS.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => update("stampIcon", icon)}
                      className={`rounded-lg p-2 text-2xl transition ${
                        config.stampIcon === icon ? "bg-indigo-100 ring-2 ring-indigo-500" : "hover:bg-slate-100"
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" loading={saving} leftIcon={<Save className="h-4 w-4" />}>
              Sauvegarder
            </Button>
          </div>
        </form>

        {/* Preview live */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Aperçu en temps réel</CardTitle>
            </CardHeader>
            <LoyaltyCardPreview
              config={{
                ...config,
                id: "",
                businessId: "",
                createdAt: new Date(),
                updatedAt: new Date(),
                cardColor: config.cardColor ?? "#4f46e5",
                cardTextColor: config.cardTextColor ?? "#ffffff",
                stampColor: config.stampColor ?? "#f59e0b",
                stampIcon: config.stampIcon ?? "⭐",
                stampsRequired: config.stampsRequired ?? 10,
                rewardName: config.rewardName ?? "Récompense",
                rewardDescription: config.rewardDescription ?? null,
                stampExpiryDays: config.stampExpiryDays ?? null,
              }}
              businessName={businessName}
              customerName="Marie Martin"
              totalStamps={7}
            />
          </Card>
        </div>
      </div>
    </div>
  );
}
