"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { LoyaltyCardPreview } from "@/components/loyalty/loyalty-card-preview";
import { Save, Loader2, Plus, Trash2 } from "lucide-react";
import type { LoyaltyConfig, LoyaltyStatus } from "@prisma/client";

const STAMP_ICONS = ["⭐", "☕", "🌟", "💎", "🎯", "❤️", "🌸", "🍕", "🎁", "✨"];
const STATUS_EMOJIS = ["😊", "⭐", "🌟", "👑", "💎", "🔥", "🎯", "❤️", "🏆", "🎁"];

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

  // Statuts
  const [statuses, setStatuses] = useState<LoyaltyStatus[]>([]);
  const [savingStatus, setSavingStatus] = useState<string | null>(null);
  const [addingStatus, setAddingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState({
    name: "", emoji: "⭐", color: "#6366f1",
    minRewards: 1, extraReward: "", inactivityDays: "",
  });

  useEffect(() => {
    async function load() {
      const [configRes, bizRes, statusRes] = await Promise.all([
        fetch(`/api/loyalty/config/${params.businessId}`),
        fetch(`/api/business/${params.businessId}`),
        fetch(`/api/loyalty/statuses/${params.businessId}`),
      ]);

      const configData = await configRes.json();
      const bizData = await bizRes.json();
      const statusData = await statusRes.json();

      if (configData.success) setConfig(configData.data);
      if (bizData.success) setBusinessName(bizData.data.name);
      if (statusData.success) setStatuses(statusData.data);
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

  async function handleAddStatus(e: React.FormEvent) {
    e.preventDefault();
    setAddingStatus(true);
    const res = await fetch(`/api/loyalty/statuses/${params.businessId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...newStatus,
        inactivityDays: newStatus.inactivityDays ? parseInt(newStatus.inactivityDays) : null,
        order: statuses.length,
      }),
    });
    const data = await res.json();
    if (!res.ok) toast.error(data.error || "Erreur");
    else {
      toast.success("Statut ajouté !");
      setStatuses((s) => [...s, data.data]);
      setNewStatus({ name: "", emoji: "⭐", color: "#6366f1", minRewards: 1, extraReward: "", inactivityDays: "" });
    }
    setAddingStatus(false);
  }

  async function handleDeleteStatus(id: string) {
    if (!window.confirm("Supprimer ce statut ?")) return;
    const res = await fetch(`/api/loyalty/statuses/status/${id}`, { method: "DELETE" });
    if (res.ok) setStatuses((s) => s.filter((st) => st.id !== id));
    else toast.error("Erreur lors de la suppression");
  }

  async function handleUpdateStatus(id: string, field: string, value: string | number | null) {
    setSavingStatus(id);
    const res = await fetch(`/api/loyalty/statuses/status/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value }),
    });
    const data = await res.json();
    if (res.ok) setStatuses((s) => s.map((st) => st.id === id ? data.data : st));
    else toast.error("Erreur");
    setSavingStatus(null);
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
                <CardDescription>{"Personnalisez l'apparence de votre carte"}</CardDescription>
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

      {/* ── Statuts clients ─────────────────────────────────── */}
      <div className="mt-8 max-w-3xl">
        <h2 className="mb-1 text-lg font-bold text-slate-900">Statuts clients</h2>
        <p className="mb-6 text-sm text-slate-500">
          Attribuez automatiquement des statuts selon les récompenses obtenues. Le statut affiché est calculé en temps réel.
        </p>

        <div className="space-y-3">
          {statuses.map((st) => (
            <Card key={st.id} padding="sm">
              <div className="flex items-start gap-4">
                {/* Emoji + couleur */}
                <div className="flex flex-col items-center gap-1">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl text-xl"
                    style={{ backgroundColor: st.color + "20" }}
                  >
                    {st.emoji}
                  </div>
                  <input
                    type="color"
                    value={st.color}
                    onChange={(e) => handleUpdateStatus(st.id, "color", e.target.value)}
                    className="h-5 w-10 cursor-pointer rounded border-0"
                    title="Couleur"
                  />
                </div>

                <div className="flex-1 grid gap-3 sm:grid-cols-2">
                  <div>
                    <div className="mb-1 flex gap-2">
                      {STATUS_EMOJIS.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => handleUpdateStatus(st.id, "emoji", emoji)}
                          className={`rounded-lg p-1 text-lg transition ${st.emoji === emoji ? "bg-indigo-100 ring-2 ring-indigo-400" : "hover:bg-slate-100"}`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                    <input
                      className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      value={st.name}
                      onChange={(e) => setStatuses((s) => s.map((x) => x.id === st.id ? { ...x, name: e.target.value } : x))}
                      onBlur={(e) => handleUpdateStatus(st.id, "name", e.target.value)}
                      placeholder="Nom du statut"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <label className="w-28 shrink-0 text-xs text-slate-500">Récompenses min.</label>
                      <input
                        type="number"
                        min={1}
                        className="w-20 rounded-lg border border-slate-200 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        value={st.minRewards}
                        onChange={(e) => setStatuses((s) => s.map((x) => x.id === st.id ? { ...x, minRewards: parseInt(e.target.value) } : x))}
                        onBlur={(e) => handleUpdateStatus(st.id, "minRewards", parseInt(e.target.value))}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="w-28 shrink-0 text-xs text-slate-500">Inactivité (jours)</label>
                      <input
                        type="number"
                        min={1}
                        placeholder="∞"
                        className="w-20 rounded-lg border border-slate-200 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        value={st.inactivityDays ?? ""}
                        onChange={(e) => setStatuses((s) => s.map((x) => x.id === st.id ? { ...x, inactivityDays: e.target.value ? parseInt(e.target.value) : null } : x))}
                        onBlur={(e) => handleUpdateStatus(st.id, "inactivityDays", e.target.value ? parseInt(e.target.value) : null)}
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <input
                      className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      value={st.extraReward ?? ""}
                      onChange={(e) => setStatuses((s) => s.map((x) => x.id === st.id ? { ...x, extraReward: e.target.value } : x))}
                      onBlur={(e) => handleUpdateStatus(st.id, "extraReward", e.target.value)}
                      placeholder="Avantage supplémentaire (ex: 10% de réduction)"
                    />
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteStatus(st.id)}
                  className="rounded-lg p-1.5 text-slate-300 transition hover:bg-red-50 hover:text-red-400"
                  title="Supprimer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              {savingStatus === st.id && (
                <p className="mt-1 text-right text-xs text-indigo-400">Sauvegarde…</p>
              )}
            </Card>
          ))}
        </div>

        {/* Ajouter un statut */}
        <Card className="mt-4">
          <CardHeader>
            <div>
              <CardTitle>Ajouter un statut</CardTitle>
              <CardDescription>{"Les statuts s'appliquent du plus bas au plus haut"}</CardDescription>
            </div>
          </CardHeader>
          <form onSubmit={handleAddStatus} className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <div className="mb-1 flex gap-1.5 flex-wrap">
                  {STATUS_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setNewStatus((s) => ({ ...s, emoji }))}
                      className={`rounded-lg p-1 text-lg transition ${newStatus.emoji === emoji ? "bg-indigo-100 ring-2 ring-indigo-400" : "hover:bg-slate-100"}`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
                <Input
                  label="Nom *"
                  placeholder="Ex: Gold, VIP..."
                  value={newStatus.name}
                  onChange={(e) => setNewStatus((s) => ({ ...s, name: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Input
                    label="Récompenses min."
                    type="number"
                    min={1}
                    value={newStatus.minRewards}
                    onChange={(e) => setNewStatus((s) => ({ ...s, minRewards: parseInt(e.target.value) }))}
                  />
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">Couleur</label>
                    <input
                      type="color"
                      value={newStatus.color}
                      onChange={(e) => setNewStatus((s) => ({ ...s, color: e.target.value }))}
                      className="h-9 w-16 cursor-pointer rounded-lg border border-slate-200"
                    />
                  </div>
                </div>
                <Input
                  label="Inactivité (jours, optionnel)"
                  type="number"
                  min={1}
                  placeholder="Ex: 90"
                  value={newStatus.inactivityDays}
                  onChange={(e) => setNewStatus((s) => ({ ...s, inactivityDays: e.target.value }))}
                />
              </div>
            </div>
            <Input
              label="Avantage supplémentaire (optionnel)"
              placeholder="Ex: 10% de réduction sur votre prochain achat"
              value={newStatus.extraReward}
              onChange={(e) => setNewStatus((s) => ({ ...s, extraReward: e.target.value }))}
            />
            <div className="flex justify-end">
              <Button type="submit" loading={addingStatus} leftIcon={<Plus className="h-4 w-4" />}>
                Ajouter le statut
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
