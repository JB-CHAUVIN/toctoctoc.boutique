"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import {
  X, Loader2, ChevronDown, Sparkles, ImageIcon, Crop, MapPin, Search,
} from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { BUSINESS_TYPES } from "@/lib/constants";

export interface BusinessFormValues {
  name: string;
  businessType: string;
  address: string;
  city: string;
  zipCode: string;
  phone: string;
  website: string;
  reviewUrl: string;
  googleMapsUrl: string;
  description: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  logoUrl: string;
  logoBackground: string;
}

const DEFAULT_VALUES: BusinessFormValues = {
  name: "",
  businessType: "",
  address: "",
  city: "",
  zipCode: "",
  phone: "",
  website: "",
  reviewUrl: "",
  googleMapsUrl: "",
  description: "",
  primaryColor: "#4f46e5",
  secondaryColor: "#312e81",
  accentColor: "#f59e0b",
  logoUrl: "",
  logoBackground: "",
};

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: (businessId: string) => void;
  initialValues?: Partial<BusinessFormValues>;
  isAdmin: boolean;
  /** Titre du dialog (défaut: "Nouveau commerce") */
  title?: string;
}

function ImageDropZone({
  label, hint, loading, loadingLabel, preview, icon: Icon, onFile,
}: {
  label: string; hint: string; loading: boolean; loadingLabel: string;
  preview: string | null; icon: React.ElementType; onFile: (f: File) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div>
      <p className="mb-1.5 text-xs font-medium text-slate-600">{label}</p>
      <div
        onClick={() => !loading && ref.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-4 transition ${
          loading ? "cursor-not-allowed border-violet-200 bg-violet-50" : "border-slate-200 hover:border-violet-300 hover:bg-violet-50"
        }`}
      >
        {loading ? (
          <><Loader2 className="h-5 w-5 animate-spin text-violet-500" /><p className="text-xs font-medium text-violet-600">{loadingLabel}</p></>
        ) : preview ? (
          <><Image src={preview} alt="preview" width={64} height={64} className="h-16 w-16 rounded-lg object-cover" /><p className="text-xs text-slate-400">Cliquer pour changer</p></>
        ) : (
          <><Icon className="h-5 w-5 text-slate-400" /><p className="text-xs font-medium text-slate-600">Cliquer pour sélectionner</p><p className="text-xs text-slate-400">{hint}</p></>
        )}
      </div>
      <input ref={ref} type="file" accept="image/*" className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); e.target.value = ""; }} />
    </div>
  );
}

export function CreateBusinessDialog({ open, onClose, onSuccess, initialValues, isAdmin, title = "Nouveau commerce" }: Props) {
  const [form, setForm] = useState<BusinessFormValues>({ ...DEFAULT_VALUES, ...initialValues });
  const [creating, setCreating] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [ambiancePreview, setAmbiancePreview] = useState<string | null>(null);
  const [analyzingAmbiance, setAnalyzingAmbiance] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [analyzingLogo, setAnalyzingLogo] = useState(false);
  const [googleUrl, setGoogleUrl] = useState(initialValues?.googleMapsUrl ?? "");
  const [analyzingGoogle, setAnalyzingGoogle] = useState(false);
  const [googleResult, setGoogleResult] = useState<Record<string, string | null> | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // Réinitialiser quand on ouvre avec de nouvelles valeurs
  useEffect(() => {
    if (open) {
      setForm({ ...DEFAULT_VALUES, ...initialValues });
      setGoogleUrl(initialValues?.googleMapsUrl ?? "");
      setAmbiancePreview(null);
      setLogoPreview(null);
      setGoogleResult(null);
      setShowAdvanced(false);
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fermer avec Échap
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (open) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  function set(key: keyof BusinessFormValues, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function fileToBase64(file: File) {
    const buffer = await file.arrayBuffer();
    return { base64: Buffer.from(buffer).toString("base64"), mimeType: file.type };
  }

  async function handleAmbianceImage(file: File) {
    setAmbiancePreview(URL.createObjectURL(file));
    setAnalyzingAmbiance(true);
    try {
      const { base64, mimeType } = await fileToBase64(file);
      const res = await fetch("/api/admin/analyze-business-image", {
        method: "POST", headers: { "Content-Type": "application/json" },
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
    } catch { toast.error("Erreur lors de l'analyse"); }
    finally { setAnalyzingAmbiance(false); }
  }

  async function handleLogoImage(file: File) {
    setLogoPreview(URL.createObjectURL(file));
    setAnalyzingLogo(true);
    try {
      const { base64, mimeType } = await fileToBase64(file);
      const res = await fetch("/api/admin/analyze-business-image", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64, mimeType, mode: "logo" }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "Erreur génération logo"); return; }
      setLogoPreview(data.data.logoUrl);
      setForm((f) => ({ ...f, logoUrl: data.data.logoUrl, ...(data.data.logoBackground && { logoBackground: data.data.logoBackground }) }));
      toast.success("Logo HD généré !");
    } catch { toast.error("Erreur lors de la génération du logo"); }
    finally { setAnalyzingLogo(false); }
  }

  async function handleGoogleAnalyze() {
    if (!googleUrl.trim()) return;
    setAnalyzingGoogle(true);
    try {
      const res = await fetch("/api/admin/analyze-google-business", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: googleUrl.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "Erreur analyse Google"); return; }
      const d = data.data;
      const filled: string[] = [];
      setForm((f) => {
        const next = { ...f };
        const apply = (key: keyof BusinessFormValues, val: string | null | undefined, label: string) => {
          if (val && !f[key]) { (next as Record<string, string>)[key] = val; filled.push(label); }
        };
        apply("name", d.name, "Nom"); apply("businessType", d.businessType, "Type");
        apply("description", d.description, "Description"); apply("address", d.address, "Adresse");
        apply("city", d.city, "Ville"); apply("zipCode", d.zipCode, "Code postal");
        apply("phone", d.phone, "Téléphone"); apply("website", d.website, "Site web");
        apply("googleMapsUrl", d.googleMapsUrl, "Lien Maps"); apply("reviewUrl", d.reviewUrl, "Lien avis");
        return next;
      });
      const hasData = Object.values(d).some(Boolean);
      if (hasData) {
        setGoogleResult(d);
        toast.success(filled.length > 0 ? `${filled.length} info(s) récupérée(s) !` : "Données récupérées");
      } else {
        toast("Aucune information trouvée", { icon: "⚠️" });
      }
    } catch { toast.error("Erreur lors de l'analyse Google"); }
    finally { setAnalyzingGoogle(false); }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { toast.error("Le nom est requis"); return; }
    setCreating(true);
    try {
      const res = await fetch("/api/business", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "Erreur lors de la création"); return; }
      toast.success("Commerce créé !");
      onSuccess(data.data.id);
    } catch { toast.error("Erreur réseau"); }
    finally { setCreating(false); }
  }

  if (!mounted || !open) return null;

  const content = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl my-4 max-h-[calc(100vh-2rem)] overflow-hidden">
        <div className="overflow-y-auto max-h-[calc(100vh-2rem)] p-6">
        {/* Header */}
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          <p className="mt-1 text-sm text-slate-500">Renseignez les informations de base de votre établissement</p>
        </div>
        <button onClick={onClose} className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
          <X className="h-4 w-4" />
        </button>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Nom du commerce *" placeholder="Ex: Café de la Paix"
            value={form.name} onChange={(e) => set("name", e.target.value)} required />

          <Select label="Type d'établissement"
            options={BUSINESS_TYPES.map((t) => ({ value: t, label: t }))}
            placeholder="Sélectionner..."
            value={form.businessType} onChange={(e) => set("businessType", e.target.value)} />

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Couleurs</label>
            <div className="flex gap-4">
              {(["primaryColor", "secondaryColor", "accentColor"] as const).map((key) => (
                <div key={key} className="flex flex-col items-center gap-1">
                  <input type="color" value={form[key]} onChange={(e) => set(key, e.target.value)}
                    className="h-10 w-14 cursor-pointer rounded-lg border border-slate-200" />
                  <span className="text-xs text-slate-400">
                    {key === "primaryColor" ? "Principale" : key === "secondaryColor" ? "Secondaire" : "Accent"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {form.logoUrl && (
            <div className="flex items-center gap-3 rounded-lg border border-indigo-100 bg-indigo-50 p-3">
              <Image src={form.logoUrl} alt="Logo HD" width={48} height={48} className="h-12 w-12 rounded-lg object-contain" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-indigo-700">Logo HD prêt</p>
                <p className="truncate text-xs text-indigo-400">{form.logoUrl}</p>
              </div>
              <button type="button" onClick={() => set("logoUrl", "")} className="rounded p-1 text-indigo-400 hover:bg-indigo-100">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* Mode Avancé — admin only */}
          {isAdmin && (
            <div className="border-t border-slate-100 pt-3">
              <button type="button" onClick={() => setShowAdvanced((v) => !v)}
                className="flex items-center gap-1.5 text-xs font-medium text-violet-600 hover:text-violet-800">
                <Sparkles className="h-3.5 w-3.5" />
                Avancé — Analyse IA
                <ChevronDown className={`h-3 w-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>

              {showAdvanced && (
                <div className="mt-4 space-y-5 rounded-xl border border-violet-100 bg-violet-50 p-4">
                  <ImageDropZone label="📷  Photo devanture / ambiance" hint="Extrait : nom, type, couleurs"
                    loading={analyzingAmbiance} loadingLabel="Analyse via gpt-4o…"
                    preview={ambiancePreview} icon={ImageIcon} onFile={handleAmbianceImage} />

                  <ImageDropZone label="✂️  Logo déjà croppé" hint="Retourné en HD fond transparent via gpt-image-1"
                    loading={analyzingLogo} loadingLabel="Génération HD via gpt-image-1…"
                    preview={logoPreview && !form.logoUrl ? logoPreview : form.logoUrl || null}
                    icon={Crop} onFile={handleLogoImage} />

                  <div>
                    <p className="mb-1.5 text-xs font-medium text-slate-600">
                      <MapPin className="mr-1 inline h-3 w-3" />
                      Lien Google Business
                    </p>
                    <div className="flex gap-2">
                      <input type="url" placeholder="https://maps.google.com/maps?..."
                        value={googleUrl} onChange={(e) => setGoogleUrl(e.target.value)}
                        className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-400"
                        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleGoogleAnalyze(); } }} />
                      <Button type="button" size="sm" variant="outline" loading={analyzingGoogle}
                        onClick={handleGoogleAnalyze} disabled={!googleUrl.trim()}>
                        <Search className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <p className="mt-1 text-xs text-slate-400">Extrait : adresse, téléphone, site web, etc.</p>

                    {googleResult && (() => {
                      const LABELS: Record<string, string> = {
                        name: "Nom", businessType: "Type", address: "Adresse", city: "Ville",
                        zipCode: "CP", phone: "Tél", website: "Site", googleMapsUrl: "Maps", description: "Desc",
                      };
                      const entries = Object.entries(LABELS)
                        .map(([key, label]) => ({ label, value: googleResult[key] }))
                        .filter((e) => e.value);
                      if (!entries.length) return null;
                      return (
                        <div className="mt-2 rounded-lg border border-green-200 bg-green-50 p-3">
                          <p className="mb-2 text-xs font-semibold text-green-700">{entries.length} champ(s) récupéré(s)</p>
                          <div className="space-y-0.5">
                            {entries.map(({ label, value }) => (
                              <div key={label} className="flex gap-1.5 text-xs">
                                <span className="w-16 flex-shrink-0 text-slate-400">{label}</span>
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
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Annuler</Button>
            <Button type="submit" className="flex-1" loading={creating}>Créer le commerce</Button>
          </div>
        </form>
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
