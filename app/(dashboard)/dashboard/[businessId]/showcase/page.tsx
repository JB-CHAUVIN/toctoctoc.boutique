"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/input";
import { Toggle } from "@/components/ui/toggle";
import {
  ChevronUp,
  ChevronDown,
  Edit2,
  Eye,
  Loader2,
  X,
  Check,
  GripVertical,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ShowcaseBlock, ShowcaseBlockType } from "@prisma/client";

// ── Block metadata ─────────────────────────────────────────

const BLOCK_META: Record<
  ShowcaseBlockType,
  { label: string; emoji: string; description: string }
> = {
  HERO:        { label: "Hero",             emoji: "🖼️",  description: "Section principale avec titre et bouton d'action" },
  ABOUT:       { label: "À propos",         emoji: "📖",  description: "Présentation de votre établissement" },
  SERVICES:    { label: "Nos services",     emoji: "📋",  description: "Liste de vos prestations avec tarifs" },
  BOOKING_CTA: { label: "Réservation",      emoji: "📅",  description: "Bloc d'invitation à prendre rendez-vous" },
  LOYALTY_CTA: { label: "Fidélité",         emoji: "🎯",  description: "Bloc d'invitation à la carte fidélité" },
  REVIEWS_CTA: { label: "Avis",            emoji: "⭐",  description: "Bloc d'invitation à laisser un avis" },
  CONTACT:     { label: "Contact",          emoji: "📍",  description: "Coordonnées et informations de contact" },
  HOURS:       { label: "Horaires",         emoji: "🕐",  description: "Vos horaires d'ouverture" },
  BANNER:      { label: "Bannière CTA",     emoji: "📣",  description: "Bandeau avec message et bouton" },
  SOCIAL:      { label: "Réseaux sociaux",  emoji: "🔗",  description: "Liens vers vos réseaux sociaux" },
  FAQ:         { label: "FAQ",              emoji: "❓",  description: "Questions fréquemment posées" },
};

// ── Block editor form fields ────────────────────────────────

function BlockEditor({
  block,
  onSave,
  onClose,
}: {
  block: ShowcaseBlock;
  onSave: (id: string, content: object) => Promise<void>;
  onClose: () => void;
}) {
  const [content, setContent] = useState<Record<string, unknown>>(
    (block.content as Record<string, unknown>) ?? {}
  );
  const [saving, setSaving] = useState(false);

  function set(key: string, value: unknown) {
    setContent((c) => ({ ...c, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    await onSave(block.id, content);
    setSaving(false);
    onClose();
  }

  const fieldClass = "mb-4";

  return (
    <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-5">
      <div className="space-y-0">
        {/* HERO */}
        {block.type === "HERO" && (
          <>
            <div className={fieldClass}>
              <Input label="Accroche (petite ligne)" placeholder="ex: Bienvenue" value={(content.tagline as string) ?? ""} onChange={(e) => set("tagline", e.target.value)} />
            </div>
            <div className={fieldClass}>
              <Input label="Titre principal" placeholder="Votre nom d'établissement" value={(content.title as string) ?? ""} onChange={(e) => set("title", e.target.value)} hint="Laissez vide pour utiliser le nom de votre établissement" />
            </div>
            <div className={fieldClass}>
              <Textarea label="Sous-titre" placeholder="Votre description courte..." value={(content.subtitle as string) ?? ""} onChange={(e) => set("subtitle", e.target.value)} rows={2} hint="Laissez vide pour utiliser la description courte" />
            </div>
            <div className={fieldClass}>
              <Input label="Texte du bouton" placeholder="ex: Réserver maintenant" value={(content.ctaText as string) ?? ""} onChange={(e) => set("ctaText", e.target.value)} />
            </div>
            <div className={fieldClass}>
              <Input label="Lien du bouton" placeholder="/votre-slug/booking" value={(content.ctaUrl as string) ?? ""} onChange={(e) => set("ctaUrl", e.target.value)} hint="Laissez vide pour lien vers la réservation" />
            </div>
          </>
        )}

        {/* ABOUT */}
        {block.type === "ABOUT" && (
          <>
            <div className={fieldClass}>
              <Input label="Titre de section" placeholder="À propos" value={(content.title as string) ?? ""} onChange={(e) => set("title", e.target.value)} />
            </div>
            <div className={fieldClass}>
              <Input label="Citation / accroche" placeholder="Une phrase forte qui vous représente..." value={(content.highlight as string) ?? ""} onChange={(e) => set("highlight", e.target.value)} hint="Affiché en grand avant le texte" />
            </div>
            <div className={fieldClass}>
              <Textarea label="Texte" placeholder="Décrivez votre établissement..." value={(content.text as string) ?? ""} onChange={(e) => set("text", e.target.value)} rows={4} hint="Laissez vide pour utiliser la description de vos paramètres" />
            </div>
          </>
        )}

        {/* SERVICES */}
        {block.type === "SERVICES" && (
          <>
            <div className={fieldClass}>
              <Input label="Titre de section" placeholder="Nos services" value={(content.title as string) ?? ""} onChange={(e) => set("title", e.target.value)} />
            </div>
            <div className={fieldClass}>
              <Input label="Sous-titre" placeholder="Toutes nos prestations..." value={(content.subtitle as string) ?? ""} onChange={(e) => set("subtitle", e.target.value)} />
            </div>
            <p className="text-xs text-slate-400">Les services sont synchronisés depuis le module Réservations.</p>
          </>
        )}

        {/* BOOKING_CTA */}
        {block.type === "BOOKING_CTA" && (
          <>
            <div className={fieldClass}>
              <Input label="Titre" placeholder="Prenez rendez-vous" value={(content.title as string) ?? ""} onChange={(e) => set("title", e.target.value)} />
            </div>
            <div className={fieldClass}>
              <Input label="Sous-titre" placeholder="Réservez en ligne en quelques secondes..." value={(content.subtitle as string) ?? ""} onChange={(e) => set("subtitle", e.target.value)} />
            </div>
            <div className={fieldClass}>
              <Input label="Texte du bouton" placeholder="Choisir un créneau" value={(content.ctaText as string) ?? ""} onChange={(e) => set("ctaText", e.target.value)} />
            </div>
          </>
        )}

        {/* LOYALTY_CTA */}
        {block.type === "LOYALTY_CTA" && (
          <>
            <div className={fieldClass}>
              <Input label="Titre" placeholder="Carte de fidélité" value={(content.title as string) ?? ""} onChange={(e) => set("title", e.target.value)} />
            </div>
            <div className={fieldClass}>
              <Input label="Sous-titre" placeholder="Cumulez des tampons et gagnez des récompenses." value={(content.subtitle as string) ?? ""} onChange={(e) => set("subtitle", e.target.value)} />
            </div>
            <div className={fieldClass}>
              <Input label="Texte du bouton" placeholder="Obtenir ma carte" value={(content.ctaText as string) ?? ""} onChange={(e) => set("ctaText", e.target.value)} />
            </div>
          </>
        )}

        {/* REVIEWS_CTA */}
        {block.type === "REVIEWS_CTA" && (
          <>
            <div className={fieldClass}>
              <Input label="Titre" placeholder="Votre avis compte" value={(content.title as string) ?? ""} onChange={(e) => set("title", e.target.value)} />
            </div>
            <div className={fieldClass}>
              <Input label="Sous-titre" placeholder="Partagez votre expérience..." value={(content.subtitle as string) ?? ""} onChange={(e) => set("subtitle", e.target.value)} />
            </div>
            <div className={fieldClass}>
              <Input label="Texte du bouton" placeholder="Laisser un avis" value={(content.ctaText as string) ?? ""} onChange={(e) => set("ctaText", e.target.value)} />
            </div>
          </>
        )}

        {/* CONTACT */}
        {block.type === "CONTACT" && (
          <>
            <div className={fieldClass}>
              <Input label="Titre" placeholder="Nous trouver" value={(content.title as string) ?? ""} onChange={(e) => set("title", e.target.value)} />
            </div>
            <div className="space-y-2">
              <p className="text-xs font-medium text-slate-600">Informations affichées</p>
              {([
                { key: "showAddress", label: "Adresse" },
                { key: "showPhone", label: "Téléphone" },
                { key: "showEmail", label: "Email" },
                { key: "showWebsite", label: "Site web" },
              ] as const).map(({ key, label }) => (
                <Toggle
                  key={key}
                  checked={(content[key] as boolean) !== false}
                  onChange={(v) => set(key, v)}
                  label={label}
                />
              ))}
            </div>
          </>
        )}

        {/* HOURS */}
        {block.type === "HOURS" && (
          <>
            <div className={fieldClass}>
              <Input label="Titre" placeholder="Horaires" value={(content.title as string) ?? ""} onChange={(e) => set("title", e.target.value)} />
            </div>
            <p className="text-xs text-slate-400">Les horaires sont synchronisés depuis le module Réservations. Vous pouvez les personnaliser en ajoutant un planning manuel ci-dessous.</p>
            <HoursEditor
              schedule={(content.schedule as Array<{ label: string; hours: string }>) ?? []}
              onChange={(s) => set("schedule", s)}
            />
          </>
        )}

        {/* BANNER */}
        {block.type === "BANNER" && (
          <>
            <div className={fieldClass}>
              <Input label="Message" placeholder="Profitez de notre offre de lancement !" value={(content.text as string) ?? ""} onChange={(e) => set("text", e.target.value)} />
            </div>
            <div className={fieldClass}>
              <Input label="Texte du bouton (optionnel)" value={(content.ctaText as string) ?? ""} onChange={(e) => set("ctaText", e.target.value)} />
            </div>
            <div className={fieldClass}>
              <Input label="Lien du bouton" placeholder="https://..." value={(content.ctaUrl as string) ?? ""} onChange={(e) => set("ctaUrl", e.target.value)} />
            </div>
          </>
        )}

        {/* SOCIAL */}
        {block.type === "SOCIAL" && (
          <>
            <div className={fieldClass}>
              <Input label="Titre" placeholder="Suivez-nous" value={(content.title as string) ?? ""} onChange={(e) => set("title", e.target.value)} />
            </div>
            <div className="space-y-2">
              <p className="text-xs font-medium text-slate-600">Réseaux affichés</p>
              {([
                { key: "showFacebook", label: "Facebook" },
                { key: "showInstagram", label: "Instagram" },
                { key: "showWebsite", label: "Site web" },
                { key: "showGoogleMaps", label: "Google Maps" },
              ] as const).map(({ key, label }) => (
                <Toggle
                  key={key}
                  checked={(content[key] as boolean) !== false}
                  onChange={(v) => set(key, v)}
                  label={label}
                />
              ))}
            </div>
          </>
        )}

        {/* FAQ */}
        {block.type === "FAQ" && (
          <>
            <div className={fieldClass}>
              <Input label="Titre" placeholder="Questions fréquentes" value={(content.title as string) ?? ""} onChange={(e) => set("title", e.target.value)} />
            </div>
            <FaqEditor
              items={(content.items as Array<{ q: string; a: string }>) ?? []}
              onChange={(items) => set("items", items)}
            />
          </>
        )}
      </div>

      <div className="mt-4 flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={onClose}>
          Annuler
        </Button>
        <Button size="sm" loading={saving} leftIcon={<Check className="h-3.5 w-3.5" />} onClick={handleSave}>
          Enregistrer
        </Button>
      </div>
    </div>
  );
}

function HoursEditor({
  schedule,
  onChange,
}: {
  schedule: Array<{ label: string; hours: string }>;
  onChange: (s: Array<{ label: string; hours: string }>) => void;
}) {
  const [rows, setRows] = useState(schedule);

  function update(i: number, key: "label" | "hours", value: string) {
    const next = rows.map((r, idx) => (idx === i ? { ...r, [key]: value } : r));
    setRows(next);
    onChange(next);
  }

  function addRow() {
    const next = [...rows, { label: "", hours: "" }];
    setRows(next);
    onChange(next);
  }

  function removeRow(i: number) {
    const next = rows.filter((_, idx) => idx !== i);
    setRows(next);
    onChange(next);
  }

  return (
    <div className="mt-3 space-y-2">
      {rows.map((row, i) => (
        <div key={i} className="flex gap-2">
          <input
            className="flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm"
            placeholder="Lundi"
            value={row.label}
            onChange={(e) => update(i, "label", e.target.value)}
          />
          <input
            className="flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm"
            placeholder="9h – 18h"
            value={row.hours}
            onChange={(e) => update(i, "hours", e.target.value)}
          />
          <button onClick={() => removeRow(i)} className="text-slate-300 hover:text-red-400">
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={addRow}>
        + Ajouter une ligne
      </Button>
    </div>
  );
}

function FaqEditor({
  items,
  onChange,
}: {
  items: Array<{ q: string; a: string }>;
  onChange: (items: Array<{ q: string; a: string }>) => void;
}) {
  const [rows, setRows] = useState(items);

  function update(i: number, key: "q" | "a", value: string) {
    const next = rows.map((r, idx) => (idx === i ? { ...r, [key]: value } : r));
    setRows(next);
    onChange(next);
  }

  function addRow() {
    const next = [...rows, { q: "", a: "" }];
    setRows(next);
    onChange(next);
  }

  function removeRow(i: number) {
    const next = rows.filter((_, idx) => idx !== i);
    setRows(next);
    onChange(next);
  }

  return (
    <div className="mt-3 space-y-3">
      {rows.map((row, i) => (
        <div key={i} className="relative rounded-xl border border-slate-200 p-3">
          <button
            onClick={() => removeRow(i)}
            className="absolute right-2 top-2 text-slate-300 hover:text-red-400"
          >
            <X className="h-3.5 w-3.5" />
          </button>
          <input
            className="mb-2 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium"
            placeholder="Question..."
            value={row.q}
            onChange={(e) => update(i, "q", e.target.value)}
          />
          <textarea
            className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600"
            placeholder="Réponse..."
            rows={2}
            value={row.a}
            onChange={(e) => update(i, "a", e.target.value)}
          />
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={addRow}>
        + Ajouter une question
      </Button>
    </div>
  );
}

// ── Main page ───────────────────────────────────────────────

export default function ShowcaseDashboardPage() {
  const params = useParams<{ businessId: string }>();
  const [blocks, setBlocks] = useState<ShowcaseBlock[]>([]);
  const [slug, setSlug] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchBlocks = useCallback(async () => {
    const [blocksRes, bizRes] = await Promise.all([
      fetch(`/api/showcase/blocks/${params.businessId}`),
      fetch(`/api/business/${params.businessId}`),
    ]);
    const blocksData = await blocksRes.json();
    const bizData = await bizRes.json();
    if (blocksData.success) setBlocks(blocksData.data);
    if (bizData.success) setSlug(bizData.data.slug);
    setLoading(false);
  }, [params.businessId]);

  useEffect(() => { fetchBlocks(); }, [fetchBlocks]);

  async function toggleBlock(id: string, isActive: boolean) {
    const res = await fetch(`/api/showcase/blocks/block/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive }),
    });
    if (res.ok) {
      setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, isActive } : b)));
    }
  }

  async function moveBlock(id: string, direction: "up" | "down") {
    const sorted = [...blocks].sort((a, b) => a.order - b.order);
    const idx = sorted.findIndex((b) => b.id === id);
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;

    const aOrder = sorted[idx].order;
    const bOrder = sorted[swapIdx].order;

    await Promise.all([
      fetch(`/api/showcase/blocks/block/${sorted[idx].id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: bOrder }),
      }),
      fetch(`/api/showcase/blocks/block/${sorted[swapIdx].id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: aOrder }),
      }),
    ]);

    setBlocks((prev) =>
      prev.map((b) => {
        if (b.id === sorted[idx].id) return { ...b, order: bOrder };
        if (b.id === sorted[swapIdx].id) return { ...b, order: aOrder };
        return b;
      })
    );
  }

  async function saveContent(id: string, content: object) {
    const res = await fetch(`/api/showcase/blocks/block/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    if (res.ok) {
      toast.success("Bloc sauvegardé");
      setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, content } : b)));
    } else {
      toast.error("Erreur lors de la sauvegarde");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  const sorted = [...blocks].sort((a, b) => a.order - b.order);

  return (
    <div className="p-8">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Site vitrine</h1>
          <p className="mt-1 text-sm text-slate-500">
            Activez, réordonnez et personnalisez les blocs de votre site
          </p>
        </div>
        <div className="flex gap-3">
          <Link href={`/dashboard/${params.businessId}/settings`}>
            <Button variant="outline" size="sm">Paramètres généraux</Button>
          </Link>
          {slug && (
            <a href={`/${slug}`} target="_blank" rel="noopener noreferrer">
              <Button size="sm" leftIcon={<Eye className="h-4 w-4" />} variant="outline">
                Voir le site
              </Button>
            </a>
          )}
        </div>
      </div>

      <div className="max-w-3xl space-y-3">
        {sorted.map((block, idx) => {
          const meta = BLOCK_META[block.type as ShowcaseBlockType];
          const isEditing = editingId === block.id;

          return (
            <Card key={block.id} padding="none" className={cn(!block.isActive && "opacity-50")}>
              <div className="flex items-center gap-3 p-4">
                {/* Drag handle (visual only) */}
                <GripVertical className="h-4 w-4 flex-shrink-0 cursor-grab text-slate-300" />

                {/* Emoji */}
                <span className="text-xl leading-none">{meta.emoji}</span>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-slate-800">{meta.label}</p>
                    {!block.isActive && (
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-400">
                        Masqué
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 truncate">{meta.description}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => moveBlock(block.id, "up")}
                    disabled={idx === 0}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 disabled:opacity-30"
                    title="Monter"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => moveBlock(block.id, "down")}
                    disabled={idx === sorted.length - 1}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 disabled:opacity-30"
                    title="Descendre"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setEditingId(isEditing ? null : block.id)}
                    className={cn(
                      "rounded-lg p-1.5 transition",
                      isEditing
                        ? "bg-indigo-100 text-indigo-600"
                        : "text-slate-400 hover:bg-slate-100"
                    )}
                    title="Éditer"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <div className="ml-1">
                    <Toggle
                      checked={block.isActive}
                      onChange={(v) => toggleBlock(block.id, v)}
                    />
                  </div>
                </div>
              </div>

              {isEditing && (
                <div className="border-t border-slate-100 px-4 pb-4">
                  <BlockEditor
                    block={block}
                    onSave={saveContent}
                    onClose={() => setEditingId(null)}
                  />
                </div>
              )}
            </Card>
          );
        })}
      </div>

      <p className="mt-6 text-xs text-slate-400">
        {"Les blocs masqués ne s'affichent pas sur votre site public. Les modules désactivés (Réservations, Fidélité, Avis) sont automatiquement masqués."}
      </p>
    </div>
  );
}
