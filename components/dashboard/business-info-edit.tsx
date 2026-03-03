"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Toggle } from "@/components/ui/toggle";
import { BUSINESS_TYPES, FONT_FAMILIES } from "@/lib/constants";
import { Loader2, Save, Upload, X, Trash2 } from "lucide-react";

interface InitialData {
  name: string;
  slug: string;
  businessType: string | null;
  shortDesc: string | null;
  description: string | null;
  address: string | null;
  city: string | null;
  zipCode: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  logoUrl: string | null;
  logoBackground: string | null;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  facebookUrl: string | null;
  instagramUrl: string | null;
  googleMapsUrl: string | null;
  isPublished: boolean;
}

interface Props {
  businessId: string;
  initialData: InitialData;
}

export function BusinessInfoEdit({ businessId, initialData }: Props) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: initialData.name,
    slug: initialData.slug,
    businessType: initialData.businessType ?? "",
    shortDesc: initialData.shortDesc ?? "",
    description: initialData.description ?? "",
    address: initialData.address ?? "",
    city: initialData.city ?? "",
    zipCode: initialData.zipCode ?? "",
    phone: initialData.phone ?? "",
    email: initialData.email ?? "",
    website: initialData.website ?? "",
    logoUrl: initialData.logoUrl ?? "",
    logoBackground: initialData.logoBackground ?? "",
    primaryColor: initialData.primaryColor,
    secondaryColor: initialData.secondaryColor,
    accentColor: initialData.accentColor,
    fontFamily: initialData.fontFamily,
    facebookUrl: initialData.facebookUrl ?? "",
    instagramUrl: initialData.instagramUrl ?? "",
    googleMapsUrl: initialData.googleMapsUrl ?? "",
    isPublished: initialData.isPublished,
  });
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmName, setConfirmName] = useState("");
  const logoInputRef = useRef<HTMLInputElement>(null);

  function update(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setUploadingLogo(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("type", "logos");
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "Erreur upload"); return; }
      setForm((f) => ({ ...f, logoUrl: data.url }));
      toast.success("Logo uploadé !");
    } catch {
      toast.error("Erreur lors de l'upload");
    } finally {
      setUploadingLogo(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch(`/api/business/${businessId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) toast.error(data.error || "Erreur lors de la sauvegarde");
    else toast.success("Informations sauvegardées !");
    setSaving(false);
  }

  async function handleDelete() {
    setDeleting(true);
    const res = await fetch(`/api/business/${businessId}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Commerce supprimé");
      router.push("/dashboard");
      router.refresh();
    } else {
      toast.error("Erreur lors de la suppression");
      setDeleting(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Informations générales */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Informations générales</CardTitle>
            <CardDescription>Nom, description et type de votre établissement</CardDescription>
          </div>
        </CardHeader>
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Nom du commerce *" value={form.name} onChange={update("name")} required />
            <Input
              label="URL publique (slug)"
              value={form.slug}
              onChange={update("slug")}
              hint={`toctoctoc.boutique/${form.slug || "votre-slug"}`}
            />
          </div>
          <Select
            label="Type d'établissement"
            options={BUSINESS_TYPES.map((t) => ({ value: t, label: t }))}
            value={form.businessType}
            onChange={update("businessType")}
            placeholder="Sélectionner..."
          />
          <Input
            label="Description courte (SEO)"
            value={form.shortDesc}
            onChange={update("shortDesc")}
            hint="Max 160 caractères"
            maxLength={160}
          />
          <Textarea
            label="Description complète"
            value={form.description}
            onChange={update("description")}
            rows={4}
          />
        </div>
      </Card>

      {/* Coordonnées */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Coordonnées</CardTitle>
            <CardDescription>Adresse et informations de contact</CardDescription>
          </div>
        </CardHeader>
        <div className="space-y-4">
          <Input label="Adresse" value={form.address} onChange={update("address")} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Ville" value={form.city} onChange={update("city")} />
            <Input label="Code postal" value={form.zipCode} onChange={update("zipCode")} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Téléphone" type="tel" value={form.phone} onChange={update("phone")} />
            <Input label="Email" type="email" value={form.email} onChange={update("email")} />
          </div>
          <Input label="Site web" type="url" value={form.website} onChange={update("website")} placeholder="https://" />
        </div>
      </Card>

      {/* Branding & Design */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Branding & Design</CardTitle>
            <CardDescription>Logo, couleurs et typographie de votre site vitrine</CardDescription>
          </div>
        </CardHeader>
        <div className="space-y-6">
          {/* Logo */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Logo</label>
            {form.logoUrl ? (
              <div className="flex items-center gap-4">
                <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                  <Image src={form.logoUrl} alt="Logo" width={80} height={80} className="h-20 w-20 object-contain" />
                </div>
                <div className="space-y-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    loading={uploadingLogo}
                    leftIcon={<Upload className="h-3.5 w-3.5" />}
                    onClick={() => logoInputRef.current?.click()}
                  >
                    Changer
                  </Button>
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, logoUrl: "" }))}
                    className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700"
                  >
                    <X className="h-3 w-3" /> Supprimer
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => !uploadingLogo && logoInputRef.current?.click()}
                className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-8 transition ${
                  uploadingLogo
                    ? "cursor-not-allowed border-indigo-200 bg-indigo-50"
                    : "border-slate-200 hover:border-indigo-300 hover:bg-indigo-50"
                }`}
              >
                {uploadingLogo ? (
                  <>
                    <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
                    <p className="text-xs text-indigo-600">Upload en cours...</p>
                  </>
                ) : (
                  <>
                    <Upload className="h-6 w-6 text-slate-400" />
                    <p className="text-xs font-medium text-slate-600">Cliquez pour uploader un logo</p>
                    <p className="text-xs text-slate-400">JPG, PNG, WEBP — max 5 Mo</p>
                  </>
                )}
              </div>
            )}
            <input
              ref={logoInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleLogoUpload}
            />
          </div>

          {/* Colors */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Palette de couleurs</label>
            <div className="flex flex-wrap gap-6">
              {([
                { key: "primaryColor" as const, label: "Couleur principale" },
                { key: "secondaryColor" as const, label: "Couleur secondaire" },
                { key: "accentColor" as const, label: "Couleur d'accent" },
              ]).map(({ key, label }) => (
                <div key={key} className="flex flex-col items-center gap-1.5">
                  <input
                    type="color"
                    value={form[key]}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                    className="h-12 w-16 cursor-pointer rounded-xl border border-slate-200"
                  />
                  <span className="text-xs text-slate-500">{label}</span>
                  <span className="text-xs font-mono text-slate-400">{form[key]}</span>
                </div>
              ))}
              {form.logoUrl && (
                <div className="flex flex-col items-center gap-1.5">
                  <input
                    type="color"
                    value={form.logoBackground || "#1e293b"}
                    onChange={(e) => setForm((f) => ({ ...f, logoBackground: e.target.value }))}
                    className="h-12 w-16 cursor-pointer rounded-xl border border-slate-200"
                  />
                  <span className="text-xs text-slate-500">Fond du logo</span>
                  <span className="text-xs font-mono text-slate-400">{form.logoBackground || "auto"}</span>
                </div>
              )}
            </div>
            <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
              <div
                className="flex h-14 items-center justify-center text-sm font-semibold text-white"
                style={{ backgroundColor: form.primaryColor }}
              >
                Aperçu couleur principale
              </div>
              <div className="flex">
                <div className="flex-1 py-4 text-center text-xs font-medium text-white" style={{ backgroundColor: form.secondaryColor }}>
                  Secondaire
                </div>
                <div className="flex-1 py-4 text-center text-xs font-medium text-white" style={{ backgroundColor: form.accentColor }}>
                  Accent
                </div>
              </div>
            </div>
          </div>

          <Select
            label="Police d'écriture"
            options={FONT_FAMILIES.map((f) => ({ value: f.value, label: f.label }))}
            value={form.fontFamily}
            onChange={update("fontFamily")}
          />
        </div>
      </Card>

      {/* Réseaux sociaux */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Réseaux sociaux & Google</CardTitle>
            <CardDescription>Liens vers vos pages de réseaux sociaux</CardDescription>
          </div>
        </CardHeader>
        <div className="space-y-4">
          <Input label="Page Facebook" type="url" value={form.facebookUrl} onChange={update("facebookUrl")} placeholder="https://facebook.com/..." />
          <Input label="Compte Instagram" type="url" value={form.instagramUrl} onChange={update("instagramUrl")} placeholder="https://instagram.com/..." />
          <Input label="Fiche Google Maps" type="url" value={form.googleMapsUrl} onChange={update("googleMapsUrl")} placeholder="https://maps.google.com/..." hint="Utilisé pour le module avis" />
        </div>
      </Card>

      {/* Publication */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Publication</CardTitle>
            <CardDescription>Contrôlez la visibilité de votre site</CardDescription>
          </div>
        </CardHeader>
        <Toggle
          checked={form.isPublished}
          onChange={(v) => setForm((f) => ({ ...f, isPublished: v }))}
          label="Site public visible"
          description="Votre site sera accessible à l'adresse publique"
        />
      </Card>

      <div className="flex justify-end">
        <Button type="submit" loading={saving} leftIcon={<Save className="h-4 w-4" />} size="lg">
          Sauvegarder
        </Button>
      </div>

      {/* Zone de danger */}
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
        <h2 className="mb-1 text-base font-semibold text-red-700">Zone de danger</h2>
        <p className="mb-4 text-sm text-red-600">
          La suppression retire définitivement ce commerce de votre compte. Les données sont conservées en base mais inaccessibles.
        </p>
        <p className="mb-2 text-sm text-red-700">
          Saisissez <span className="font-mono font-bold">{initialData.name}</span> pour confirmer :
        </p>
        <div className="flex gap-3">
          <input
            type="text"
            value={confirmName}
            onChange={(e) => setConfirmName(e.target.value)}
            placeholder={initialData.name}
            className="flex-1 rounded-lg border border-red-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
          />
          <Button
            type="button"
            variant="danger"
            loading={deleting}
            disabled={confirmName.trim() !== initialData.name.trim()}
            leftIcon={<Trash2 className="h-4 w-4" />}
            onClick={handleDelete}
          >
            Supprimer
          </Button>
        </div>
      </div>
    </form>
  );
}
