"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { Toggle } from "@/components/ui/toggle";
import { Select } from "@/components/ui/select";
import { WEEK_DAYS } from "@/lib/constants";
import { Plus, Loader2, Save, Trash2, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BookingConfig, Service } from "@prisma/client";

type ConfigWithServices = BookingConfig & { services: Service[] };

interface ExtraField {
  key: string;
  label: string;
  type: "text" | "number" | "tel" | "email";
  required: boolean;
}

const MODE_OPTIONS = [
  {
    value: "APPOINTMENT",
    label: "Rendez-vous",
    description: "Coiffeur, médecin, coach... Chaque créneau est réservé pour 1 client.",
    emoji: "📅",
  },
  {
    value: "TABLE",
    label: "Table / Couverts",
    description: "Restaurant, café... Plusieurs tables par créneau, avec nombre de couverts.",
    emoji: "🍽️",
  },
  {
    value: "CLASS",
    label: "Cours / Activité",
    description: "Fitness, atelier, yoga... Capacité limitée par session.",
    emoji: "🏋️",
  },
] as const;

const FIELD_TYPE_OPTIONS = [
  { value: "text", label: "Texte" },
  { value: "number", label: "Nombre" },
  { value: "tel", label: "Téléphone" },
  { value: "email", label: "Email" },
];

export default function BookingSettingsPage() {
  const params = useParams<{ businessId: string }>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<ConfigWithServices | null>(null);
  const [workDays, setWorkDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [extraFields, setExtraFields] = useState<ExtraField[]>([]);

  // Add service modal
  const [showAddService, setShowAddService] = useState(false);
  const [addingService, setAddingService] = useState(false);
  const [newService, setNewService] = useState({
    name: "",
    description: "",
    duration: "" as string | number,
    price: "" as string | number,
  });

  // Add extra field modal
  const [showAddField, setShowAddField] = useState(false);
  const [newField, setNewField] = useState<ExtraField>({
    key: "",
    label: "",
    type: "text",
    required: false,
  });

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/booking/config/${params.businessId}`);
      const data = await res.json();
      if (data.success) {
        setConfig(data.data);
        setWorkDays(data.data.workDays as number[]);
        const fields = data.data.extraFields;
        if (Array.isArray(fields)) setExtraFields(fields as ExtraField[]);
      }
      setLoading(false);
    }
    load();
  }, [params.businessId]);

  function updateConfig<K extends keyof ConfigWithServices>(key: K, value: ConfigWithServices[K]) {
    setConfig((c) => (c ? { ...c, [key]: value } : c));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!config) return;
    setSaving(true);
    const res = await fetch(`/api/booking/config/${params.businessId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode: config.mode,
        openTime: config.openTime,
        closeTime: config.closeTime,
        workDays,
        defaultDuration: config.defaultDuration,
        slotInterval: config.slotInterval,
        maxPerSlot: config.maxPerSlot,
        bufferTime: config.bufferTime,
        maxAdvanceDays: config.maxAdvanceDays,
        minAdvanceHours: config.minAdvanceHours,
        confirmationMsg: config.confirmationMsg,
        extraFields: extraFields.length > 0 ? extraFields : null,
      }),
    });
    const data = await res.json();
    if (!res.ok) toast.error(data.error || "Erreur");
    else toast.success("Configuration sauvegardée !");
    setSaving(false);
  }

  async function handleAddService(e: React.FormEvent) {
    e.preventDefault();
    setAddingService(true);
    const res = await fetch(`/api/booking/config/${params.businessId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newService.name,
        description: newService.description || undefined,
        duration: newService.duration === "" ? null : Number(newService.duration),
        price: newService.price === "" ? null : Number(newService.price),
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error || "Erreur");
    } else {
      toast.success("Service ajouté !");
      setConfig((c) => (c ? { ...c, services: [...c.services, data.data] } : c));
      setShowAddService(false);
      setNewService({ name: "", description: "", duration: "", price: "" });
    }
    setAddingService(false);
  }

  function toggleWorkDay(day: number) {
    setWorkDays((days) =>
      days.includes(day) ? days.filter((d) => d !== day) : [...days, day].sort()
    );
  }

  function handleAddField(e: React.FormEvent) {
    e.preventDefault();
    if (!newField.key || !newField.label) return;
    // Prevent duplicate keys
    if (extraFields.some((f) => f.key === newField.key)) {
      toast.error("Ce champ existe déjà (clé en double)");
      return;
    }
    setExtraFields((prev) => [...prev, { ...newField }]);
    setShowAddField(false);
    setNewField({ key: "", label: "", type: "text", required: false });
  }

  const currentMode = config?.mode ?? "APPOINTMENT";

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
        <h1 className="text-2xl font-bold text-slate-900">Configuration des réservations</h1>
        <p className="mt-1 text-sm text-slate-500">
          Mode, horaires, services et formulaire de réservation
        </p>
      </div>

      <form onSubmit={handleSave} className="max-w-3xl space-y-6">
        {/* Mode */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Mode de réservation</CardTitle>
              <CardDescription>Choisissez le type de réservations pour votre activité</CardDescription>
            </div>
          </CardHeader>
          <div className="grid gap-3 sm:grid-cols-3">
            {MODE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => config && updateConfig("mode", opt.value as typeof config.mode)}
                className={cn(
                  "flex flex-col items-start rounded-xl border-2 p-4 text-left transition",
                  currentMode === opt.value
                    ? "border-indigo-500 bg-indigo-50"
                    : "border-slate-200 hover:border-slate-300"
                )}
              >
                <span className="mb-2 text-2xl">{opt.emoji}</span>
                <span className="font-semibold text-slate-800">{opt.label}</span>
                <span className="mt-1 text-xs text-slate-500">{opt.description}</span>
              </button>
            ))}
          </div>
        </Card>

        {/* Horaires */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>{"Horaires d'ouverture"}</CardTitle>
              <CardDescription>Jours et heures de disponibilité</CardDescription>
            </div>
          </CardHeader>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Heure d'ouverture"
                type="time"
                value={config?.openTime ?? "09:00"}
                onChange={(e) => updateConfig("openTime", e.target.value)}
              />
              <Input
                label="Heure de fermeture"
                type="time"
                value={config?.closeTime ?? "18:00"}
                onChange={(e) => updateConfig("closeTime", e.target.value)}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Jours ouvrés</label>
              <div className="flex flex-wrap gap-2">
                {WEEK_DAYS.map((day) => (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => toggleWorkDay(day.value)}
                    className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                      workDays.includes(day.value)
                        ? "bg-indigo-600 text-white"
                        : "border border-slate-200 text-slate-600 hover:border-indigo-300"
                    }`}
                  >
                    {day.label.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Paramètres */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Paramètres des créneaux</CardTitle>
              <CardDescription>Durées, délais et capacité</CardDescription>
            </div>
          </CardHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label={
                currentMode === "APPOINTMENT"
                  ? "Durée par défaut (min)"
                  : currentMode === "TABLE"
                  ? "Durée d'occupation (min)"
                  : "Durée d'un cours (min)"
              }
              type="number"
              min={5}
              value={config?.defaultDuration ?? 60}
              onChange={(e) => updateConfig("defaultDuration", parseInt(e.target.value))}
            />
            <Input
              label="Intervalle entre créneaux (min)"
              type="number"
              min={5}
              placeholder={`Par défaut : durée (${config?.defaultDuration ?? 60} min)`}
              value={config?.slotInterval ?? ""}
              onChange={(e) =>
                updateConfig(
                  "slotInterval",
                  e.target.value === "" ? null : parseInt(e.target.value)
                )
              }
            />
            {currentMode !== "APPOINTMENT" && (
              <Input
                label="Capacité max par créneau"
                type="number"
                min={1}
                placeholder="Illimité"
                value={config?.maxPerSlot ?? ""}
                onChange={(e) =>
                  updateConfig(
                    "maxPerSlot",
                    e.target.value === "" ? null : parseInt(e.target.value)
                  )
                }
              />
            )}
            {currentMode === "APPOINTMENT" && (
              <Input
                label="Temps tampon entre RDV (min)"
                type="number"
                min={0}
                value={config?.bufferTime ?? 15}
                onChange={(e) => updateConfig("bufferTime", parseInt(e.target.value))}
              />
            )}
            <Input
              label="Réservation max à l'avance (jours)"
              type="number"
              min={1}
              value={config?.maxAdvanceDays ?? 30}
              onChange={(e) => updateConfig("maxAdvanceDays", parseInt(e.target.value))}
            />
            <Input
              label="Délai minimum (heures)"
              type="number"
              min={0}
              value={config?.minAdvanceHours ?? 2}
              onChange={(e) => updateConfig("minAdvanceHours", parseInt(e.target.value))}
            />
          </div>
          <div className="mt-4">
            <Input
              label="Message de confirmation"
              value={config?.confirmationMsg ?? ""}
              onChange={(e) => updateConfig("confirmationMsg", e.target.value)}
              placeholder="Merci pour votre réservation !"
            />
          </div>
        </Card>

        {/* Services (APPOINTMENT / CLASS) */}
        {currentMode !== "TABLE" && (
          <Card>
            <CardHeader>
              <div>
                <CardTitle>
                  {currentMode === "CLASS" ? "Cours & Activités" : "Services & Prestations"}
                </CardTitle>
                <CardDescription>
                  {currentMode === "CLASS"
                    ? "Listez vos cours disponibles (optionnel)"
                    : "Services proposés à la réservation"}
                </CardDescription>
              </div>
              <Button
                type="button"
                size="sm"
                onClick={() => setShowAddService(true)}
                leftIcon={<Plus className="h-4 w-4" />}
              >
                Ajouter
              </Button>
            </CardHeader>
            <div className="space-y-3">
              {!config?.services || config.services.length === 0 ? (
                <p className="text-sm text-slate-400">Aucun service configuré</p>
              ) : (
                config.services.map((service) => (
                  <div
                    key={service.id}
                    className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-4"
                  >
                    <div className="flex items-center gap-3">
                      <GripVertical className="h-4 w-4 text-slate-300" />
                      <div>
                        <div className="font-medium text-slate-800">{service.name}</div>
                        <div className="text-xs text-slate-400">
                          {service.duration !== null
                            ? `${service.duration} min`
                            : "Durée variable"}
                          {service.price !== null ? ` · ${service.price}€` : ""}
                        </div>
                      </div>
                    </div>
                    <Toggle
                      checked={service.isActive}
                      onChange={async (v) => {
                        const res = await fetch(`/api/booking/services/${service.id}`, {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ isActive: v }),
                        });
                        if (res.ok) {
                          setConfig((c) =>
                            c
                              ? {
                                  ...c,
                                  services: c.services.map((s) =>
                                    s.id === service.id ? { ...s, isActive: v } : s
                                  ),
                                }
                              : c
                          );
                        }
                      }}
                      size="sm"
                    />
                  </div>
                ))
              )}
            </div>
          </Card>
        )}

        {/* Champs libres */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Champs libres</CardTitle>
              <CardDescription>
                Informations supplémentaires à collecter lors de la réservation
              </CardDescription>
            </div>
            <Button
              type="button"
              size="sm"
              onClick={() => setShowAddField(true)}
              leftIcon={<Plus className="h-4 w-4" />}
            >
              Ajouter
            </Button>
          </CardHeader>
          <div className="space-y-2">
            {extraFields.length === 0 ? (
              <p className="text-sm text-slate-400">Aucun champ supplémentaire</p>
            ) : (
              extraFields.map((field, i) => (
                <div
                  key={field.key}
                  className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <GripVertical className="h-4 w-4 text-slate-300" />
                    <div>
                      <span className="font-medium text-slate-800">{field.label}</span>
                      <span className="ml-2 text-xs text-slate-400">
                        ({field.type}
                        {field.required ? ", requis" : ""})
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setExtraFields((prev) => prev.filter((_, idx) => idx !== i))}
                    className="rounded p-1 text-slate-300 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
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

      {/* Modal ajout service */}
      <Dialog
        open={showAddService}
        onClose={() => setShowAddService(false)}
        title={currentMode === "CLASS" ? "Nouveau cours" : "Nouveau service"}
      >
        <form onSubmit={handleAddService} className="space-y-4">
          <Input
            label="Nom *"
            placeholder={currentMode === "CLASS" ? "Ex: Yoga débutant" : "Ex: Coupe femme"}
            value={newService.name}
            onChange={(e) => setNewService((s) => ({ ...s, name: e.target.value }))}
            required
          />
          <Input
            label="Description"
            placeholder="Brève description..."
            value={newService.description}
            onChange={(e) => setNewService((s) => ({ ...s, description: e.target.value }))}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Durée (min)"
              type="number"
              min={5}
              placeholder="Optionnel"
              value={newService.duration}
              onChange={(e) => setNewService((s) => ({ ...s, duration: e.target.value }))}
            />
            <Input
              label="Prix (€)"
              type="number"
              min={0}
              step={0.5}
              placeholder="Optionnel"
              value={newService.price}
              onChange={(e) => setNewService((s) => ({ ...s, price: e.target.value }))}
            />
          </div>
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setShowAddService(false)}
            >
              Annuler
            </Button>
            <Button type="submit" className="flex-1" loading={addingService}>
              Ajouter
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Modal ajout champ libre */}
      <Dialog
        open={showAddField}
        onClose={() => setShowAddField(false)}
        title="Nouveau champ"
      >
        <form onSubmit={handleAddField} className="space-y-4">
          <Input
            label="Libellé *"
            placeholder="Ex: Allergies, Taille de groupe..."
            value={newField.label}
            onChange={(e) => {
              const label = e.target.value;
              // Auto-generate key from label
              const key = label
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/[^a-z0-9]+/g, "_")
                .replace(/^_|_$/g, "");
              setNewField((f) => ({ ...f, label, key }));
            }}
            required
          />
          <Input
            label="Clé technique"
            placeholder="automatique"
            value={newField.key}
            onChange={(e) => setNewField((f) => ({ ...f, key: e.target.value }))}
          />
          <Select
            label="Type"
            value={newField.type}
            onChange={(e) =>
              setNewField((f) => ({ ...f, type: e.target.value as ExtraField["type"] }))
            }
            options={FIELD_TYPE_OPTIONS}
          />
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={newField.required}
              onChange={(e) => setNewField((f) => ({ ...f, required: e.target.checked }))}
              className="h-4 w-4 rounded border-slate-300 text-indigo-600"
            />
            <span className="text-sm font-medium text-slate-700">Champ obligatoire</span>
          </label>
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setShowAddField(false)}
            >
              Annuler
            </Button>
            <Button type="submit" className="flex-1">
              Ajouter
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
