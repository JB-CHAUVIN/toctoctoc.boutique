"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Toggle } from "@/components/ui/toggle";
import { BUSINESS_TYPES, FONT_FAMILIES } from "@/lib/constants";
import { Loader2, Save, Trash2 } from "lucide-react";
import type { BusinessFull } from "@/types";

export default function BusinessSettingsPage() {
  const params = useParams<{ businessId: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmName, setConfirmName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    shortDesc: "",
    businessType: "",
    address: "",
    city: "",
    zipCode: "",
    phone: "",
    email: "",
    website: "",
    primaryColor: "#4f46e5",
    secondaryColor: "#312e81",
    accentColor: "#f59e0b",
    fontFamily: "Inter",
    facebookUrl: "",
    instagramUrl: "",
    googleMapsUrl: "",
    isPublished: false,
  });

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/business/${params.businessId}`);
      const data = await res.json();
      if (data.success) {
        const b = data.data as BusinessFull;
        setBusinessName(b.name);
        setForm({
          name: b.name,
          slug: b.slug,
          description: b.description ?? "",
          shortDesc: b.shortDesc ?? "",
          businessType: b.businessType ?? "",
          address: b.address ?? "",
          city: b.city ?? "",
          zipCode: b.zipCode ?? "",
          phone: b.phone ?? "",
          email: b.email ?? "",
          website: b.website ?? "",
          primaryColor: b.primaryColor,
          secondaryColor: b.secondaryColor,
          accentColor: b.accentColor,
          fontFamily: b.fontFamily,
          facebookUrl: b.facebookUrl ?? "",
          instagramUrl: b.instagramUrl ?? "",
          googleMapsUrl: b.googleMapsUrl ?? "",
          isPublished: b.isPublished,
        });
      }
      setLoading(false);
    }
    load();
  }, [params.businessId]);

  function update(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch(`/api/business/${params.businessId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) toast.error(data.error || "Erreur lors de la sauvegarde");
    else toast.success("Paramètres sauvegardés !");
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
        <h1 className="text-2xl font-bold text-slate-900">Paramètres</h1>
        <p className="mt-1 text-sm text-slate-500">
          {"Configurez les informations et l'apparence de votre commerce"}
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6 max-w-3xl">
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
              <Input label="URL publique (slug)" value={form.slug} onChange={update("slug")} hint="localsaas.fr/votre-slug" />
            </div>
            <Select
              label="Type d'établissement"
              options={BUSINESS_TYPES.map((t) => ({ value: t, label: t }))}
              value={form.businessType}
              onChange={update("businessType")}
              placeholder="Sélectionner..."
            />
            <Input label="Description courte (SEO)" value={form.shortDesc} onChange={update("shortDesc")} hint="Max 160 caractères" maxLength={160} />
            <Textarea label="Description complète" value={form.description} onChange={update("description")} rows={4} />
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

        {/* Branding */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Branding & Design</CardTitle>
              <CardDescription>Couleurs et typographie de votre site vitrine</CardDescription>
            </div>
          </CardHeader>
          <div className="space-y-4">
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
              </div>
              {/* Preview */}
              <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
                <div
                  className="flex h-14 items-center justify-center text-sm font-semibold text-white"
                  style={{ backgroundColor: form.primaryColor }}
                >
                  Aperçu couleur principale
                </div>
                <div className="flex">
                  <div
                    className="flex-1 py-4 text-center text-xs font-medium text-white"
                    style={{ backgroundColor: form.secondaryColor }}
                  >
                    Secondaire
                  </div>
                  <div
                    className="flex-1 py-4 text-center text-xs font-medium text-white"
                    style={{ backgroundColor: form.accentColor }}
                  >
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
      </form>

      {/* Zone de danger */}
      <div className="mt-10 max-w-3xl rounded-2xl border border-red-200 bg-red-50 p-6">
        <h2 className="mb-1 text-base font-semibold text-red-700">Zone de danger</h2>
        <p className="mb-4 text-sm text-red-600">
          La suppression retire définitivement ce commerce de votre compte. Les données sont conservées en base mais inaccessibles.
        </p>
        <p className="mb-2 text-sm text-red-700">
          Saisissez <span className="font-mono font-bold">{businessName}</span> pour confirmer :
        </p>
        <div className="flex gap-3">
          <input
            type="text"
            value={confirmName}
            onChange={(e) => setConfirmName(e.target.value)}
            placeholder={businessName}
            className="flex-1 rounded-lg border border-red-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
          />
          <Button
            type="button"
            variant="danger"
            loading={deleting}
            disabled={confirmName !== businessName}
            leftIcon={<Trash2 className="h-4 w-4" />}
            onClick={async () => {
              setDeleting(true);
              const res = await fetch(`/api/business/${params.businessId}`, { method: "DELETE" });
              if (res.ok) {
                toast.success("Commerce supprimé");
                router.push("/dashboard");
                router.refresh();
              } else {
                toast.error("Erreur lors de la suppression");
                setDeleting(false);
              }
            }}
          >
            Supprimer
          </Button>
        </div>
      </div>
    </div>
  );
}
