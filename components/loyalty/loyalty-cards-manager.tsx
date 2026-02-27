"use client";

import { useState, useCallback } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Trash2,
  ChevronDown,
  ChevronUp,
  Plus,
  RotateCcw,
  Pencil,
  Check,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Stamp {
  id: string;
  isReward: boolean;
  createdAt: string;
}

interface Card {
  id: string;
  qrCode: string;
  customerName: string;
  customerEmail: string | null;
  customerPhone: string | null;
  currentStamps: number;
  totalStamps: number;
  totalRewards: number;
  resetCount: number;
  lastActivityAt: string | null;
  stamps: Stamp[];
}

interface LoyaltyCardsManagerProps {
  businessId: string;
  initialCards: Card[];
  stampsRequired: number;
  stampIcon: string;
}

// ── Inline edit row ───────────────────────────────────────

function EditRow({
  card,
  onSave,
  onCancel,
}: {
  card: Card;
  onSave: (data: { customerName: string; customerEmail: string; customerPhone: string }) => Promise<void>;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    customerName: card.customerName,
    customerEmail: card.customerEmail ?? "",
    customerPhone: card.customerPhone ?? "",
  });
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    await onSave(form);
    setSaving(false);
  }

  return (
    <tr className="bg-indigo-50/40">
      <td colSpan={6} className="px-5 py-3">
        <div className="flex flex-wrap items-end gap-3">
          <div className="w-40">
            <Input
              label="Nom"
              value={form.customerName}
              onChange={(e) => setForm((f) => ({ ...f, customerName: e.target.value }))}
            />
          </div>
          <div className="w-48">
            <Input
              label="Email"
              type="email"
              value={form.customerEmail}
              onChange={(e) => setForm((f) => ({ ...f, customerEmail: e.target.value }))}
            />
          </div>
          <div className="w-36">
            <Input
              label="Téléphone"
              type="tel"
              value={form.customerPhone}
              onChange={(e) => setForm((f) => ({ ...f, customerPhone: e.target.value }))}
            />
          </div>
          <div className="flex gap-2 pb-0.5">
            <Button size="sm" loading={saving} leftIcon={<Check className="h-3.5 w-3.5" />} onClick={handleSave}>
              Enregistrer
            </Button>
            <Button size="sm" variant="outline" onClick={onCancel}>
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </td>
    </tr>
  );
}

// ── Card row ─────────────────────────────────────────────

function CardRow({
  card,
  stampsRequired,
  stampIcon,
  onDelete,
  onUpdate,
  onReset,
}: {
  card: Card;
  stampsRequired: number;
  stampIcon: string;
  onDelete: (id: string) => void;
  onUpdate: (id: string, data: Partial<Card>) => void;
  onReset: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [addingStamps, setAddingStamps] = useState(false);
  const [stampCount, setStampCount] = useState(1);
  const [deleting, setDeleting] = useState(false);

  const progress = card.currentStamps % stampsRequired;

  async function handleDelete() {
    if (!window.confirm(`Supprimer la carte de ${card.customerName} ? Cette action est irréversible.`)) return;
    setDeleting(true);
    const res = await fetch(`/api/loyalty/cards/${encodeURIComponent(card.qrCode)}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Carte supprimée");
      onDelete(card.id);
    } else {
      toast.error("Erreur lors de la suppression");
      setDeleting(false);
    }
  }

  async function handleReset() {
    if (!window.confirm(`Réinitialiser le cycle de ${card.customerName} ?`)) return;
    const res = await fetch(`/api/loyalty/cards/${encodeURIComponent(card.qrCode)}/reset`, { method: "POST" });
    if (res.ok) {
      toast.success("Carte réinitialisée");
      onReset(card.id);
    } else {
      toast.error("Erreur");
    }
  }

  async function handleAddStamps() {
    const res = await fetch(`/api/loyalty/cards/${encodeURIComponent(card.qrCode)}/stamp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ count: stampCount }),
    });
    const data = await res.json();
    if (res.ok) {
      toast.success(`+${stampCount} tampon${stampCount > 1 ? "s" : ""} crédité${stampCount > 1 ? "s" : ""}`);
      onUpdate(card.id, {
        currentStamps: data.data.currentStamps,
        totalStamps: data.data.totalStamps,
      });
      setAddingStamps(false);
      setStampCount(1);
    } else {
      toast.error(data.error || "Erreur");
    }
  }

  async function handleSaveEdit(data: { customerName: string; customerEmail: string; customerPhone: string }) {
    const res = await fetch(`/api/loyalty/cards/${encodeURIComponent(card.qrCode)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      toast.success("Informations mises à jour");
      onUpdate(card.id, { ...data, customerEmail: data.customerEmail || null, customerPhone: data.customerPhone || null });
      setEditing(false);
    } else {
      toast.error("Erreur lors de la mise à jour");
    }
  }

  return (
    <>
      <tr className={cn("border-b border-slate-50 hover:bg-slate-50/50", expanded && "bg-slate-50/50")}>
        <td className="px-5 py-3.5">
          <div className="font-medium text-slate-800">{card.customerName}</div>
          <div className="text-xs text-slate-400">{card.customerEmail ?? card.customerPhone ?? "—"}</div>
        </td>

        {/* Progress */}
        <td className="px-5 py-3.5">
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-20 rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-indigo-500 transition-all"
                style={{ width: `${(progress / stampsRequired) * 100}%` }}
              />
            </div>
            <span className="text-xs text-slate-500">{progress}/{stampsRequired}</span>
          </div>
        </td>

        {/* Stats */}
        <td className="px-5 py-3.5 text-sm text-slate-600">
          <span className="flex items-center gap-1">
            {stampIcon} {card.totalStamps}
          </span>
        </td>
        <td className="px-5 py-3.5 text-sm text-slate-600">🏆 {card.totalRewards}</td>
        <td className="px-5 py-3.5 text-xs text-slate-400">
          {card.lastActivityAt
            ? new Date(card.lastActivityAt).toLocaleDateString("fr-FR")
            : "Jamais"}
        </td>

        {/* Actions */}
        <td className="px-5 py-3.5">
          <div className="flex items-center gap-1">
            {/* Add stamps */}
            {addingStamps ? (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setStampCount((c) => Math.max(1, c - 1))}
                  className="rounded px-1 text-slate-500 hover:bg-slate-100"
                >−</button>
                <span className="w-5 text-center text-sm font-medium">{stampCount}</span>
                <button
                  onClick={() => setStampCount((c) => Math.min(10, c + 1))}
                  className="rounded px-1 text-slate-500 hover:bg-slate-100"
                >+</button>
                <button
                  onClick={handleAddStamps}
                  className="ml-1 rounded-lg bg-indigo-600 px-2 py-1 text-xs font-medium text-white hover:bg-indigo-700"
                >
                  OK
                </button>
                <button
                  onClick={() => { setAddingStamps(false); setStampCount(1); }}
                  className="text-slate-300 hover:text-slate-500"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setAddingStamps(true)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600"
                title="Ajouter des tampons"
              >
                <Plus className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={() => setEditing((e) => !e)}
              className={cn("rounded-lg p-1.5 hover:bg-slate-100", editing ? "text-indigo-600" : "text-slate-400")}
              title="Modifier"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              onClick={handleReset}
              className="rounded-lg p-1.5 text-slate-300 hover:bg-amber-50 hover:text-amber-500"
              title="Réinitialiser le cycle"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            <button
              onClick={() => setExpanded((e) => !e)}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
              title="Voir tampons"
            >
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="rounded-lg p-1.5 text-slate-300 hover:bg-red-50 hover:text-red-500 disabled:opacity-40"
              title="Supprimer"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </td>
      </tr>

      {editing && !addingStamps && (
        <EditRow card={card} onSave={handleSaveEdit} onCancel={() => setEditing(false)} />
      )}

      {expanded && !editing && (
        <tr className="bg-slate-50/70">
          <td colSpan={6} className="px-5 py-3">
            <div className="text-xs text-slate-500">
              <p className="mb-1.5 font-medium text-slate-700">
                Historique des tampons ({card.stamps.length} total
                {card.resetCount > 0 && `, carte renouvelée ${card.resetCount}×`})
              </p>
              {card.stamps.length === 0 ? (
                <span className="italic text-slate-300">Aucun tampon</span>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {card.stamps.slice(0, 40).map((stamp) => (
                    <span
                      key={stamp.id}
                      className={cn(
                        "rounded px-2 py-0.5",
                        stamp.isReward
                          ? "bg-amber-100 text-amber-700"
                          : "bg-slate-100 text-slate-500"
                      )}
                      title={new Date(stamp.createdAt).toLocaleString("fr-FR")}
                    >
                      {stamp.isReward ? "🏆" : stampIcon}
                    </span>
                  ))}
                  {card.stamps.length > 40 && (
                    <span className="italic text-slate-300">+{card.stamps.length - 40} autres</span>
                  )}
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

// ── Main component ────────────────────────────────────────

export function LoyaltyCardsManager({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  businessId,
  initialCards,
  stampsRequired,
  stampIcon,
}: LoyaltyCardsManagerProps) {
  const [cards, setCards] = useState<Card[]>(initialCards);
  const [search, setSearch] = useState("");

  const filtered = search
    ? cards.filter(
        (c) =>
          c.customerName.toLowerCase().includes(search.toLowerCase()) ||
          c.customerEmail?.toLowerCase().includes(search.toLowerCase()) ||
          c.customerPhone?.includes(search)
      )
    : cards;

  const handleDelete = useCallback((id: string) => {
    setCards((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const handleUpdate = useCallback((id: string, data: Partial<Card>) => {
    setCards((prev) => prev.map((c) => (c.id === id ? { ...c, ...data } : c)));
  }, []);

  const handleReset = useCallback((id: string) => {
    setCards((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, currentStamps: 0, resetCount: c.resetCount + 1 } : c
      )
    );
  }, []);

  return (
    <div>
      {/* Search */}
      <div className="mb-4">
        <Input
          placeholder="Rechercher par nom, email, téléphone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-100">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-medium text-slate-500">
              <th className="px-5 py-3">Client</th>
              <th className="px-5 py-3">Cycle actuel</th>
              <th className="px-5 py-3">Tampons</th>
              <th className="px-5 py-3">Récompenses</th>
              <th className="px-5 py-3">Dernière activité</th>
              <th className="px-5 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-sm text-slate-400">
                  {search ? "Aucun résultat pour cette recherche" : "Aucune carte fidélité"}
                </td>
              </tr>
            ) : (
              filtered.map((card) => (
                <CardRow
                  key={card.id}
                  card={card}
                  stampsRequired={stampsRequired}
                  stampIcon={stampIcon}
                  onDelete={handleDelete}
                  onUpdate={handleUpdate}
                  onReset={handleReset}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-xs text-slate-400">
        {filtered.length} carte{filtered.length !== 1 ? "s" : ""} affichée{filtered.length !== 1 ? "s" : ""}
        {search && ` sur ${cards.length} au total`}
      </p>
    </div>
  );
}
