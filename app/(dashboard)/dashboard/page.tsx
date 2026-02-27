"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Plus, Building2, ExternalLink, ChevronRight, Loader2, Upload, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import toast from "react-hot-toast";
import { BUSINESS_TYPES } from "@/lib/constants";
import type { BusinessWithModules } from "@/types";

type BusinessWithCount = BusinessWithModules & {
  _count: { bookings: number; loyaltyCards: number };
};

interface PlanMeta {
  plan: string;
  planLabel: string;
  maxBusinesses: number;
  businessCount: number;
}

const DEFAULT_FORM = {
  name: "",
  businessType: "",
  primaryColor: "#4f46e5",
  secondaryColor: "#312e81",
  accentColor: "#f59e0b",
};

export default function DashboardPage() {
  const [businesses, setBusinesses] = useState<BusinessWithCount[]>([]);
  const [meta, setMeta] = useState<PlanMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [showJsonImport, setShowJsonImport] = useState(false);
  const [jsonText, setJsonText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchBusinesses();
  }, []);

  async function fetchBusinesses() {
    setLoading(true);
    const res = await fetch("/api/business");
    const data = await res.json();
    if (data.success) {
      setBusinesses(data.data);
      setMeta(data.meta ?? null);
    }
    setLoading(false);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setCreating(true);

    const res = await fetch("/api/business", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error || "Erreur lors de la création");
    } else {
      toast.success("Commerce créé avec succès !");
      setShowCreate(false);
      setForm(DEFAULT_FORM);
      setJsonText("");
      setShowJsonImport(false);
      fetchBusinesses();
    }
    setCreating(false);
  }

  function handleJsonImport() {
    try {
      const parsed = JSON.parse(jsonText);
      setForm((f) => ({
        ...f,
        name: parsed.name ?? f.name,
        businessType: parsed.businessType ?? parsed.type ?? f.businessType,
        primaryColor: parsed.primaryColor ?? f.primaryColor,
        secondaryColor: parsed.secondaryColor ?? f.secondaryColor,
        accentColor: parsed.accentColor ?? f.accentColor,
      }));
      setShowJsonImport(false);
      setJsonText("");
      toast.success("Données importées");
    } catch {
      toast.error("JSON invalide");
    }
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setJsonText((ev.target?.result as string) ?? "");
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  const canCreate = !meta || meta.maxBusinesses === -1 || meta.businessCount < meta.maxBusinesses;
  const upgradePlan = meta?.plan === "FREE" || meta?.plan === "STARTER" ? "Pro" : null;

  const activeModulesCount = (b: BusinessWithCount) =>
    b.modules.filter((m) => m.isActive).length;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900">Mes commerces</h1>
            {meta && (
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                {meta.planLabel} · {meta.businessCount}/{meta.maxBusinesses === -1 ? "∞" : meta.maxBusinesses}
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Gérez vos établissements et configurez vos modules
          </p>
        </div>

        <div className="relative group/btn">
          <Button
            onClick={() => canCreate && setShowCreate(true)}
            leftIcon={<Plus className="h-4 w-4" />}
            disabled={!canCreate}
            className={!canCreate ? "cursor-not-allowed opacity-50" : ""}
          >
            Nouveau commerce
          </Button>
          {!canCreate && (
            <div className="pointer-events-none absolute right-0 top-full z-10 mt-1.5 hidden w-64 rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-600 shadow-lg group-hover/btn:block">
              Vous avez atteint la limite de votre offre {meta?.planLabel}.
              {upgradePlan && (
                <span className="ml-1 font-medium text-indigo-600">
                  Passez à l&apos;offre {upgradePlan} pour ajouter plus de commerces.
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Liste */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      ) : businesses.length === 0 ? (
        <Card className="flex flex-col items-center py-16 text-center">
          <Building2 className="mb-4 h-12 w-12 text-slate-300" />
          <h2 className="text-lg font-semibold text-slate-700">Aucun commerce</h2>
          <p className="mt-2 max-w-sm text-sm text-slate-400">
            Créez votre premier commerce pour commencer à configurer vos modules.
          </p>
          <Button className="mt-6" onClick={() => setShowCreate(true)}>
            Créer mon premier commerce
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {businesses.map((business) => (
            <Link
              key={business.id}
              href={`/dashboard/${business.id}`}
              className="group relative flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-indigo-300 hover:shadow-md"
            >
              {/* Color stripe */}
              <div
                className="mb-4 h-2 w-full rounded-full"
                style={{
                  background: `linear-gradient(90deg, ${business.primaryColor}, ${business.accentColor})`,
                }}
              />

              <div className="mb-3 flex items-start justify-between">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl text-lg font-bold text-white"
                  style={{ backgroundColor: business.primaryColor }}
                >
                  {business.name[0].toUpperCase()}
                </div>
                <Badge variant={business.isPublished ? "success" : "outline"}>
                  {business.isPublished ? "En ligne" : "Brouillon"}
                </Badge>
              </div>

              <h2 className="text-base font-semibold text-slate-900">{business.name}</h2>
              {business.businessType && (
                <p className="mt-0.5 text-sm text-slate-400">{business.businessType}</p>
              )}

              <div className="mt-4 flex items-center gap-4 text-xs text-slate-500">
                <span>{activeModulesCount(business)} module(s) actif(s)</span>
                <span>·</span>
                <span>{business._count.bookings} réservation(s)</span>
              </div>

              <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-4">
                <span className="flex-1 text-xs text-slate-400">/{business.slug}</span>
                <Link
                  href={`/${business.slug}`}
                  target="_blank"
                  onClick={(e) => e.stopPropagation()}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
                <ChevronRight className="h-4 w-4 text-slate-400 transition group-hover:text-indigo-500" />
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Modal création */}
      <Dialog
        open={showCreate}
        onClose={() => { setShowCreate(false); setShowJsonImport(false); setJsonText(""); }}
        title="Nouveau commerce"
        description="Renseignez les informations de base de votre établissement"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Nom du commerce *"
            placeholder="Ex: Café de la Paix"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
          />
          <Select
            label="Type d'établissement"
            options={BUSINESS_TYPES.map((t) => ({ value: t, label: t }))}
            placeholder="Sélectionner..."
            value={form.businessType}
            onChange={(e) => setForm((f) => ({ ...f, businessType: e.target.value }))}
          />
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Couleurs</label>
            <div className="flex gap-4">
              {(["primaryColor", "secondaryColor", "accentColor"] as const).map((key) => (
                <div key={key} className="flex flex-col items-center gap-1">
                  <input
                    type="color"
                    value={form[key]}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                    className="h-10 w-14 cursor-pointer rounded-lg border border-slate-200"
                  />
                  <span className="text-xs text-slate-400">
                    {key === "primaryColor" ? "Principale" : key === "secondaryColor" ? "Secondaire" : "Accent"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* JSON Import — discreet collapsible */}
          <div className="border-t border-slate-100 pt-3">
            <button
              type="button"
              onClick={() => setShowJsonImport((v) => !v)}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600"
            >
              <Upload className="h-3 w-3" />
              Importer depuis un JSON
              <ChevronDown className={`h-3 w-3 transition-transform ${showJsonImport ? "rotate-180" : ""}`} />
            </button>

            {showJsonImport && (
              <div className="mt-2 space-y-2">
                <textarea
                  rows={4}
                  placeholder='{"name": "Mon Commerce", "businessType": "Café", "primaryColor": "#4f46e5"}'
                  value={jsonText}
                  onChange={(e) => setJsonText(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2 font-mono text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs text-slate-500 underline hover:text-slate-700"
                  >
                    Charger un fichier
                  </button>
                  <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleFileUpload} />
                  <Button type="button" size="sm" variant="outline" onClick={handleJsonImport} disabled={!jsonText.trim()}>
                    Appliquer
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setShowCreate(false)}>
              Annuler
            </Button>
            <Button type="submit" className="flex-1" loading={creating}>
              Créer le commerce
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
