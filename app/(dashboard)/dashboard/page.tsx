"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Plus, Building2, ExternalLink, ChevronRight, Loader2,
  ChevronDown, ShieldCheck, Sparkles, X, ImageIcon, Crop, MapPin, Search,
} from "lucide-react";
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
  logoUrl?: string | null;
};

function BusinessLogo({
  logoUrl, logoBackground, name, primaryColor,
  size = 10, rounded = "xl", textSize = "lg",
}: {
  logoUrl?: string | null; logoBackground?: string | null; name: string;
  primaryColor: string; size?: number; rounded?: string; textSize?: string;
}) {
  const [errored, setErrored] = useState(false);
  const cls = `flex h-${size} w-${size} flex-shrink-0 items-center justify-center rounded-${rounded}`;
  if (logoUrl && !errored) {
    return (
      <div className={`${cls} overflow-hidden border border-slate-100`} style={{ backgroundColor: logoBackground ?? "white" }}>
        <Image
          src={logoUrl} alt={name}
          width={size * 4} height={size * 4}
          className={`h-${size} w-${size} object-contain p-0.5`}
          onError={() => setErrored(true)}
        />
      </div>
    );
  }
  return (
    <div className={`${cls} text-${textSize} font-bold text-white`} style={{ backgroundColor: primaryColor }}>
      {name[0].toUpperCase()}
    </div>
  );
}

interface PlanMeta {
  plan: string;
  planLabel: string;
  maxBusinesses: number;
  businessCount: number;
}

const DEFAULT_FORM: Record<string, string> = {
  name: "",
  businessType: "",
  primaryColor: "#4f46e5",
  secondaryColor: "#312e81",
  accentColor: "#f59e0b",
  logoUrl: "",
};

type AdminBusiness = {
  id: string; name: string; slug: string; primaryColor: string; businessType: string | null;
  isPublished: boolean; city: string | null; logoUrl: string | null;
  user: { name: string | null; email: string };
  modules: { module: string; isActive: boolean }[];
  _count: { bookings: number; loyaltyCards: number };
};

// ── Zone image générique ──────────────────────────────────────────────────────
function ImageDropZone({
  label, hint, loading, loadingLabel, preview, icon: Icon,
  onFile,
}: {
  label: string;
  hint: string;
  loading: boolean;
  loadingLabel: string;
  preview: string | null;
  icon: React.ElementType;
  onFile: (file: File) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div>
      <p className="mb-1.5 text-xs font-medium text-slate-600">{label}</p>
      <div
        onClick={() => !loading && ref.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-4 transition ${
          loading
            ? "cursor-not-allowed border-violet-200 bg-violet-50"
            : "border-slate-200 hover:border-violet-300 hover:bg-violet-50"
        }`}
      >
        {loading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin text-violet-500" />
            <p className="text-xs font-medium text-violet-600">{loadingLabel}</p>
          </>
        ) : preview ? (
          <>
            <Image src={preview} alt="preview" width={64} height={64} className="h-16 w-16 rounded-lg object-cover" />
            <p className="text-xs text-slate-400">Cliquer pour changer</p>
          </>
        ) : (
          <>
            <Icon className="h-5 w-5 text-slate-400" />
            <p className="text-xs font-medium text-slate-600">Cliquer pour sélectionner</p>
            <p className="text-xs text-slate-400">{hint}</p>
          </>
        )}
      </div>
      <input
        ref={ref}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFile(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}

// ── Composant principal ───────────────────────────────────────────────────────
function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminBusinesses, setAdminBusinesses] = useState<AdminBusiness[]>([]);
  const [adminLoading, setAdminLoading] = useState(false);
  const [businesses, setBusinesses] = useState<BusinessWithCount[]>([]);
  const [meta, setMeta] = useState<PlanMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<Record<string, string>>(DEFAULT_FORM);

  // Mode avancé
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [ambiancePreview, setAmbiancePreview] = useState<string | null>(null);
  const [analyzingAmbiance, setAnalyzingAmbiance] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [analyzingLogo, setAnalyzingLogo] = useState(false);
  const [googleUrl, setGoogleUrl] = useState("");
  const [analyzingGoogle, setAnalyzingGoogle] = useState(false);
  const [googleResult, setGoogleResult] = useState<Record<string, string | null> | null>(null);

  useEffect(() => {
    fetchBusinesses();
    fetch("/api/user/me")
      .then((r) => r.json())
      .then((d) => { if (d.success && d.data.role === "ADMIN") setIsAdmin(true); });
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    setAdminLoading(true);
    fetch("/api/admin/businesses")
      .then((r) => r.json())
      .then((d) => { if (d.success) setAdminBusinesses(d.data); })
      .finally(() => setAdminLoading(false));
  }, [isAdmin]);

  useEffect(() => {
    if (searchParams.get("new") === "1") {
      setShowCreate(true);
      router.replace("/dashboard", { scroll: false });
    }
  }, [searchParams, router]);

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
      resetDialog();
      fetchBusinesses();
      router.refresh();
    }
    setCreating(false);
  }

  function resetDialog() {
    setForm(DEFAULT_FORM);
    setShowAdvanced(false);
    setAmbiancePreview(null);
    setLogoPreview(null);
    setGoogleUrl("");
    setGoogleResult(null);
  }

  async function fileToBase64(file: File): Promise<{ base64: string; mimeType: string }> {
    const buffer = await file.arrayBuffer();
    return {
      base64: Buffer.from(buffer).toString("base64"),
      mimeType: file.type,
    };
  }

  async function handleAmbianceImage(file: File) {
    setAmbiancePreview(URL.createObjectURL(file));
    setAnalyzingAmbiance(true);
    try {
      const { base64, mimeType } = await fileToBase64(file);
      const res = await fetch("/api/admin/analyze-business-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64, mimeType, mode: "ambiance" }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "Erreur analyse"); return; }
      const d = data.data;
      setForm((f) => ({
        ...f,
        ...(d.name && !f.name && { name: d.name }),
        ...(d.businessType && { businessType: d.businessType }),
        ...(d.primaryColor && { primaryColor: d.primaryColor }),
        ...(d.secondaryColor && { secondaryColor: d.secondaryColor }),
        ...(d.accentColor && { accentColor: d.accentColor }),
      }));
      toast.success("Nom, type et couleurs extraits !");
    } catch {
      toast.error("Erreur lors de l'analyse");
    } finally {
      setAnalyzingAmbiance(false);
    }
  }

  async function handleLogoImage(file: File) {
    setLogoPreview(URL.createObjectURL(file));
    setAnalyzingLogo(true);
    try {
      const { base64, mimeType } = await fileToBase64(file);
      const res = await fetch("/api/admin/analyze-business-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64, mimeType, mode: "logo" }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "Erreur génération logo"); return; }
      setLogoPreview(data.data.logoUrl);
      setForm((f) => ({
        ...f,
        logoUrl: data.data.logoUrl,
        ...(data.data.logoBackground && { logoBackground: data.data.logoBackground }),
      }));
      toast.success("Logo HD généré !");
    } catch {
      toast.error("Erreur lors de la génération du logo");
    } finally {
      setAnalyzingLogo(false);
    }
  }

  async function handleGoogleAnalyze() {
    if (!googleUrl.trim()) return;
    setAnalyzingGoogle(true);
    try {
      const res = await fetch("/api/admin/analyze-google-business", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: googleUrl.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "Erreur analyse Google"); return; }
      const d = data.data;
      const filled: string[] = [];
      setForm((f) => {
        const next = { ...f };
        const apply = (key: string, val: string | null | undefined, label: string) => {
          if (val && !f[key]) { next[key] = val; filled.push(label); }
        };
        apply("name", d.name, "Nom");
        apply("businessType", d.businessType, "Type");
        apply("description", d.description, "Description");
        apply("address", d.address, "Adresse");
        apply("city", d.city, "Ville");
        apply("zipCode", d.zipCode, "Code postal");
        apply("phone", d.phone, "Téléphone");
        apply("website", d.website, "Site web");
        apply("googleMapsUrl", d.googleMapsUrl, "Lien Maps");
        return next;
      });
      const hasData = Object.values(d).some(Boolean);
      if (hasData) {
        setGoogleResult(d);
        toast.success(
          filled.length > 0
            ? `${filled.length} info(s) récupérée(s) !`
            : "Données récupérées (champs déjà remplis conservés)"
        );
      } else {
        toast("Aucune information trouvée (page JS-only ?)", { icon: "⚠️" });
      }
    } catch {
      toast.error("Erreur lors de l'analyse Google");
    } finally {
      setAnalyzingGoogle(false);
    }
  }

  const canCreate = !meta || meta.maxBusinesses === -1 || meta.businessCount < meta.maxBusinesses;
  const upgradePlan = meta?.plan === "FREE" || meta?.plan === "STARTER" ? "Pro" : null;
  const activeModulesCount = (b: BusinessWithCount) => b.modules.filter((m) => m.isActive).length;

  return (
    <div className="p-4 sm:p-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900">Mes commerces</h1>
            {meta && (
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                {meta.planLabel} · {meta.businessCount}/{meta.maxBusinesses === -1 ? "∞" : meta.maxBusinesses}
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-slate-500">Gérez vos établissements et configurez vos modules</p>
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
          <Button className="mt-6" onClick={() => setShowCreate(true)}>Créer mon premier commerce</Button>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {businesses.map((business) => (
            <Link
              key={business.id}
              href={`/dashboard/${business.id}`}
              className="group relative flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-indigo-300 hover:shadow-md"
            >
              <div className="mb-4 h-2 w-full rounded-full" style={{ background: `linear-gradient(90deg, ${business.primaryColor}, ${business.accentColor})` }} />
              <div className="mb-3 flex items-start justify-between">
                <BusinessLogo
                  logoUrl={business.logoUrl}
                  logoBackground={(business as Record<string, unknown>).logoBackground as string}
                  name={business.name}
                  primaryColor={business.primaryColor}
                />
                <Badge variant={business.isPublished ? "success" : "outline"}>
                  {business.isPublished ? "En ligne" : "Brouillon"}
                </Badge>
              </div>
              <h2 className="text-base font-semibold text-slate-900">{business.name}</h2>
              {business.businessType && <p className="mt-0.5 text-sm text-slate-400">{business.businessType}</p>}
              <div className="mt-4 flex items-center gap-4 text-xs text-slate-500">
                <span>{activeModulesCount(business)} module(s) actif(s)</span>
                <span>·</span>
                <span>{business._count.bookings} réservation(s)</span>
              </div>
              <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-4">
                <span className="flex-1 text-xs text-slate-400">/{business.slug}</span>
                <Link href={`/${business.slug}`} target="_blank" onClick={(e) => e.stopPropagation()} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
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
        onClose={() => { setShowCreate(false); resetDialog(); }}
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

          {/* Logo preview */}
          {form.logoUrl && (
            <div className="flex items-center gap-3 rounded-lg border border-indigo-100 bg-indigo-50 p-3">
              <Image src={form.logoUrl} alt="Logo HD" width={48} height={48} className="h-12 w-12 rounded-lg object-contain" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-indigo-700">Logo HD prêt</p>
                <p className="truncate text-xs text-indigo-400">{form.logoUrl}</p>
              </div>
              <button type="button" onClick={() => setForm((f) => ({ ...f, logoUrl: "" }))} className="rounded p-1 text-indigo-400 hover:bg-indigo-100">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* Mode Avancé (admin only) */}
          {isAdmin && (
            <div className="border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => setShowAdvanced((v) => !v)}
                className="flex items-center gap-1.5 text-xs font-medium text-violet-600 hover:text-violet-800"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Avancé — Analyse IA
                <ChevronDown className={`h-3 w-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>

              {showAdvanced && (
                <div className="mt-4 space-y-5 rounded-xl border border-violet-100 bg-violet-50 p-4">

                  {/* Zone 1 : Devanture */}
                  <ImageDropZone
                    label="📷  Photo devanture / ambiance"
                    hint="Extrait : nom, type, couleurs"
                    loading={analyzingAmbiance}
                    loadingLabel="Analyse via gpt-4o…"
                    preview={ambiancePreview}
                    icon={ImageIcon}
                    onFile={handleAmbianceImage}
                  />

                  {/* Zone 2 : Logo croppé */}
                  <ImageDropZone
                    label="✂️  Logo déjà croppé"
                    hint="Retourné en HD fond transparent via gpt-image-1"
                    loading={analyzingLogo}
                    loadingLabel="Génération HD via gpt-image-1…"
                    preview={logoPreview && !form.logoUrl ? logoPreview : form.logoUrl || null}
                    icon={Crop}
                    onFile={handleLogoImage}
                  />

                  {/* Zone 3 : Google Business */}
                  <div>
                    <p className="mb-1.5 text-xs font-medium text-slate-600">
                      <MapPin className="mr-1 inline h-3 w-3" />
                      Lien Google Business
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        placeholder="https://maps.google.com/maps?..."
                        value={googleUrl}
                        onChange={(e) => setGoogleUrl(e.target.value)}
                        className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-400"
                        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleGoogleAnalyze(); } }}
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        loading={analyzingGoogle}
                        onClick={handleGoogleAnalyze}
                        disabled={!googleUrl.trim()}
                      >
                        <Search className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <p className="mt-1 text-xs text-slate-400">
                      Extrait : adresse, téléphone, site web, etc.
                    </p>

                    {/* Résultat Google Business */}
                    {googleResult && (() => {
                      const LABELS: Record<string, string> = {
                        name: "Nom",
                        businessType: "Type",
                        address: "Adresse",
                        city: "Ville",
                        zipCode: "Code postal",
                        phone: "Téléphone",
                        website: "Site web",
                        googleMapsUrl: "Lien Maps",
                        description: "Description",
                      };
                      const entries = Object.entries(LABELS)
                        .map(([key, label]) => ({ label, value: googleResult[key] }))
                        .filter((e) => e.value);
                      if (!entries.length) return null;
                      return (
                        <div className="mt-2 rounded-lg border border-green-200 bg-green-50 p-3">
                          <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-green-700">
                            <svg className="h-3.5 w-3.5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                            </svg>
                            {entries.length} champ(s) récupéré(s)
                          </div>
                          <div className="space-y-0.5">
                            {entries.map(({ label, value }) => (
                              <div key={label} className="flex gap-1.5 text-xs">
                                <span className="w-20 flex-shrink-0 text-slate-400">{label}</span>
                                <span className="truncate font-medium text-slate-700">{value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                </div>
              )}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => { setShowCreate(false); resetDialog(); }}>
              Annuler
            </Button>
            <Button type="submit" className="flex-1" loading={creating}>
              Créer le commerce
            </Button>
          </div>
        </form>
      </Dialog>

      {/* ── Vue Admin ── */}
      {isAdmin && (
        <div className="mt-12">
          <div className="mb-4 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-violet-500" />
            <h2 className="text-lg font-bold text-slate-900">Vue Admin — tous les commerces</h2>
            <span className="rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-medium text-violet-700">
              {adminBusinesses.length}
            </span>
          </div>

          {adminLoading ? (
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Loader2 className="h-4 w-4 animate-spin" /> Chargement...
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {adminBusinesses.map((b) => (
                <Link
                  key={b.id}
                  href={`/dashboard/${b.id}`}
                  className="group flex flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-violet-300 hover:shadow-md"
                >
                  <div className="mb-3 flex items-start gap-3">
                    <BusinessLogo
                      logoUrl={b.logoUrl}
                      logoBackground={(b as Record<string, unknown>).logoBackground as string}
                      name={b.name}
                      primaryColor={b.primaryColor}
                      size={9} rounded="lg" textSize="sm"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold text-slate-900">{b.name}</div>
                      <div className="text-xs text-slate-400">
                        {b.businessType ?? "—"}{b.city ? ` · ${b.city}` : ""}
                      </div>
                    </div>
                    <ExternalLink className="h-3.5 w-3.5 flex-shrink-0 text-slate-300 group-hover:text-violet-400" />
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>{b.user.name ?? b.user.email}</span>
                    <span>{b.modules.filter((m) => m.isActive).length} modules</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense>
      <DashboardContent />
    </Suspense>
  );
}
