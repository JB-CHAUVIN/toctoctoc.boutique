"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import Link from "next/link";
import { Plus, Save, Loader2, AlertCircle, ExternalLink } from "lucide-react";
import type { ReviewConfig, Reward } from "@prisma/client";

type ConfigWithRewards = ReviewConfig & { rewards: Reward[] };

const EMOJI_PRESETS = ["🎁", "☕", "🥐", "🍰", "🏆", "💚", "🎉", "🎫", "🛍️", "🌟"];

export default function ReviewsSettingsPage() {
  const params = useParams<{ businessId: string }>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<ConfigWithRewards | null>(null);
  const [showAddReward, setShowAddReward] = useState(false);
  const [addingReward, setAddingReward] = useState(false);
  const [newReward, setNewReward] = useState({
    name: "", description: "", probability: 0.1,
    color: "#4f46e5", emoji: "🎁", expiryDays: 30,
  });

  useEffect(() => {
    fetch(`/api/reviews/config/${params.businessId}`)
      .then((r) => r.json())
      .then((d) => { if (d.success) setConfig(d.data); })
      .finally(() => setLoading(false));
  }, [params.businessId]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch(`/api/reviews/config/${params.businessId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ googleUrl: config?.googleUrl, instructions: config?.instructions }),
    });
    const data = await res.json();
    if (!res.ok) toast.error(data.error || "Erreur");
    else toast.success("Configuration sauvegardée !");
    setSaving(false);
  }

  async function handleAddReward(e: React.FormEvent) {
    e.preventDefault();
    setAddingReward(true);
    const res = await fetch(`/api/reviews/config/${params.businessId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newReward),
    });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error || "Erreur");
    } else {
      toast.success("Récompense ajoutée !");
      setConfig((c) => c ? { ...c, rewards: [...c.rewards, data.data] } : c);
      setShowAddReward(false);
      setNewReward({ name: "", description: "", probability: 0.1, color: "#4f46e5", emoji: "🎁", expiryDays: 30 });
    }
    setAddingReward(false);
  }

  const totalProbability = config?.rewards.reduce((sum, r) => sum + (r.isActive ? r.probability : 0), 0) ?? 0;
  const probWarning = Math.abs(totalProbability - 1) > 0.01;

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
        <h1 className="text-2xl font-bold text-slate-900">Configuration Avis & Roulette</h1>
        <p className="mt-1 text-sm text-slate-500">Configurez la roulette de récompenses pour vos clients</p>
      </div>

      <form onSubmit={handleSave} className="max-w-3xl space-y-6">
        {/* Paramètres Google */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Lien Google Avis</CardTitle>
              <CardDescription>{"URL vers votre page d'avis Google Maps"}</CardDescription>
            </div>
          </CardHeader>
          <div className="space-y-4">
            <Input
              label="URL Google Avis"
              type="url"
              placeholder="https://g.page/r/.../review"
              value={config?.googleUrl ?? ""}
              onChange={(e) => setConfig((c) => c ? { ...c, googleUrl: e.target.value } : c)}
            />

            {/* Tutoriel */}
            <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-blue-600">
                Comment trouver ce lien ?
              </p>
              <ol className="space-y-2.5">
                <li className="flex gap-3 text-sm text-slate-700">
                  <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">1</span>
                  <span>
                    Ouvrez{" "}
                    <a
                      href="https://maps.google.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-0.5 font-medium text-blue-600 hover:underline"
                    >
                      Google Maps
                      <ExternalLink className="h-3 w-3" />
                    </a>
                    {" "}et recherchez le nom de votre établissement.
                  </span>
                </li>
                <li className="flex gap-3 text-sm text-slate-700">
                  <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">2</span>
                  <span>
                    Sur la fiche de votre établissement, cliquez sur <strong>Avis</strong>, puis sur <strong>Gérer vos avis</strong>.
                  </span>
                </li>
                <li className="flex gap-3 text-sm text-slate-700">
                  <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">3</span>
                  <span>
                    Cliquez sur <strong>Recueillez plus d&apos;avis</strong> — un lien s&apos;affiche, copiez-le et collez-le ci-dessus.
                  </span>
                </li>
              </ol>
            </div>
            <p className="text-xs text-slate-500">
              Vous ne trouvez pas ce lien ?{" "}
              <Link
                href="/contact?subject=aide-google-avis"
                className="font-medium text-blue-600 hover:underline"
              >
                Contactez-nous
              </Link>
              {" "}— nous vous aiderons à le retrouver.
            </p>

            <Textarea
              label="Instructions pour les clients"
              placeholder="Ex: Laissez-nous un avis et gagnez une surprise !"
              value={config?.instructions ?? ""}
              onChange={(e) => setConfig((c) => c ? { ...c, instructions: e.target.value } : c)}
            />
          </div>
        </Card>

        {/* Récompenses */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Récompenses de la roulette</CardTitle>
              <CardDescription>
                Configurez les lots. La somme des probabilités doit être égale à 1.0.
              </CardDescription>
            </div>
            <Button type="button" size="sm" onClick={() => setShowAddReward(true)} leftIcon={<Plus className="h-4 w-4" />}>
              Ajouter
            </Button>
          </CardHeader>

          {probWarning && config?.rewards && config.rewards.length > 0 && (
            <div className="mb-4 flex items-center gap-2 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              Total des probabilités : {Math.round(totalProbability * 100)}% (doit être 100%)
            </div>
          )}

          <div className="space-y-3">
            {(!config?.rewards || config.rewards.length === 0) ? (
              <p className="text-sm text-slate-400">Aucune récompense configurée</p>
            ) : (
              config.rewards.map((reward) => (
                <div
                  key={reward.id}
                  className="flex items-center gap-4 rounded-xl border border-slate-100 p-4"
                  style={{ borderLeftColor: reward.color, borderLeftWidth: 4 }}
                >
                  <span className="text-2xl">{reward.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-slate-800">{reward.name}</div>
                    <div className="text-xs text-slate-400">{reward.description}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-slate-800">
                      {Math.round(reward.probability * 100)}%
                    </div>
                    <div className="text-xs text-slate-400">expire {reward.expiryDays}j</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" loading={saving} leftIcon={<Save className="h-4 w-4" />}>
            Sauvegarder
          </Button>
        </div>
      </form>

      {/* Modal ajout récompense */}
      <Dialog open={showAddReward} onClose={() => setShowAddReward(false)} title="Nouvelle récompense">
        <form onSubmit={handleAddReward} className="space-y-4">
          <Input
            label="Nom de la récompense *"
            placeholder="Ex: Café offert"
            value={newReward.name}
            onChange={(e) => setNewReward((r) => ({ ...r, name: e.target.value }))}
            required
          />
          <Input
            label="Description"
            placeholder="Ex: Un café au choix lors de votre prochaine visite"
            value={newReward.description}
            onChange={(e) => setNewReward((r) => ({ ...r, description: e.target.value }))}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Probabilité</label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min={0.01}
                  max={1}
                  step={0.01}
                  value={newReward.probability}
                  onChange={(e) => setNewReward((r) => ({ ...r, probability: parseFloat(e.target.value) }))}
                  className="flex-1"
                />
                <span className="w-12 text-right text-sm font-medium">
                  {Math.round(newReward.probability * 100)}%
                </span>
              </div>
            </div>
            <Input
              label="Expiration (jours)"
              type="number"
              min={1}
              value={newReward.expiryDays}
              onChange={(e) => setNewReward((r) => ({ ...r, expiryDays: parseInt(e.target.value) }))}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Emoji</label>
            <div className="flex flex-wrap gap-2">
              {EMOJI_PRESETS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setNewReward((r) => ({ ...r, emoji }))}
                  className={`rounded-lg p-2 text-xl transition ${
                    newReward.emoji === emoji ? "bg-indigo-100 ring-2 ring-indigo-500" : "hover:bg-slate-100"
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Couleur</label>
            <input
              type="color"
              value={newReward.color}
              onChange={(e) => setNewReward((r) => ({ ...r, color: e.target.value }))}
              className="h-10 w-20 cursor-pointer rounded-xl border border-slate-200"
            />
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setShowAddReward(false)}>
              Annuler
            </Button>
            <Button type="submit" className="flex-1" loading={addingReward}>
              Ajouter
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
