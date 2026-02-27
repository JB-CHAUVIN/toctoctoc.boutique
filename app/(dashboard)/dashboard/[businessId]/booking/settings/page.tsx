"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { Toggle } from "@/components/ui/toggle";
import { WEEK_DAYS } from "@/lib/constants";
import { Plus, Trash2, Loader2, Save } from "lucide-react";
import type { BookingConfig, Service } from "@prisma/client";

type ConfigWithServices = BookingConfig & { services: Service[] };

export default function BookingSettingsPage() {
  const params = useParams<{ businessId: string }>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<ConfigWithServices | null>(null);
  const [workDays, setWorkDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [showAddService, setShowAddService] = useState(false);
  const [addingService, setAddingService] = useState(false);
  const [newService, setNewService] = useState({
    name: "", description: "", duration: 60, price: "" as string | number,
  });

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/booking/config/${params.businessId}`);
      const data = await res.json();
      if (data.success) {
        setConfig(data.data);
        setWorkDays(data.data.workDays as number[]);
      }
      setLoading(false);
    }
    load();
  }, [params.businessId]);

  function updateConfig<K extends keyof ConfigWithServices>(key: K, value: ConfigWithServices[K]) {
    setConfig((c) => c ? { ...c, [key]: value } : c);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!config) return;
    setSaving(true);
    const res = await fetch(`/api/booking/config/${params.businessId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        openTime: config.openTime,
        closeTime: config.closeTime,
        workDays,
        defaultDuration: config.defaultDuration,
        bufferTime: config.bufferTime,
        maxAdvanceDays: config.maxAdvanceDays,
        minAdvanceHours: config.minAdvanceHours,
        confirmationMsg: config.confirmationMsg,
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
        ...newService,
        price: newService.price === "" ? null : Number(newService.price),
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error || "Erreur");
    } else {
      toast.success("Service ajouté !");
      setConfig((c) => c ? { ...c, services: [...c.services, data.data] } : c);
      setShowAddService(false);
      setNewService({ name: "", description: "", duration: 60, price: "" });
    }
    setAddingService(false);
  }

  function toggleWorkDay(day: number) {
    setWorkDays((days) =>
      days.includes(day) ? days.filter((d) => d !== day) : [...days, day].sort()
    );
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
        <h1 className="text-2xl font-bold text-slate-900">Configuration des réservations</h1>
        <p className="mt-1 text-sm text-slate-500">Horaires, services et paramètres de prise de rendez-vous</p>
      </div>

      <form onSubmit={handleSave} className="max-w-3xl space-y-6">
        {/* Horaires */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Horaires d'ouverture</CardTitle>
              <CardDescription>Configurez vos jours et heures de disponibilité</CardDescription>
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
              <CardTitle>Paramètres de réservation</CardTitle>
              <CardDescription>Durées, délais et restrictions</CardDescription>
            </div>
          </CardHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Durée par défaut (min)"
              type="number"
              min={15}
              value={config?.defaultDuration ?? 60}
              onChange={(e) => updateConfig("defaultDuration", parseInt(e.target.value))}
            />
            <Input
              label="Temps tampon entre RDV (min)"
              type="number"
              min={0}
              value={config?.bufferTime ?? 15}
              onChange={(e) => updateConfig("bufferTime", parseInt(e.target.value))}
            />
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

        {/* Services */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Services & Prestations</CardTitle>
              <CardDescription>Définissez vos services disponibles à la réservation</CardDescription>
            </div>
            <Button type="button" size="sm" onClick={() => setShowAddService(true)} leftIcon={<Plus className="h-4 w-4" />}>
              Ajouter
            </Button>
          </CardHeader>
          <div className="space-y-3">
            {(!config?.services || config.services.length === 0) ? (
              <p className="text-sm text-slate-400">Aucun service configuré</p>
            ) : (
              config.services.map((service) => (
                <div key={service.id} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <div>
                    <div className="font-medium text-slate-800">{service.name}</div>
                    <div className="text-xs text-slate-400">
                      {service.duration} min{service.price !== null ? ` · ${service.price}€` : ""}
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
                        setConfig((c) => c ? {
                          ...c,
                          services: c.services.map((s) => s.id === service.id ? { ...s, isActive: v } : s),
                        } : c);
                      }
                    }}
                    size="sm"
                  />
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
      <Dialog open={showAddService} onClose={() => setShowAddService(false)} title="Nouveau service">
        <form onSubmit={handleAddService} className="space-y-4">
          <Input
            label="Nom du service *"
            placeholder="Ex: Coupe femme"
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
              label="Durée (min) *"
              type="number"
              min={15}
              value={newService.duration}
              onChange={(e) => setNewService((s) => ({ ...s, duration: parseInt(e.target.value) }))}
              required
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
            <Button type="button" variant="outline" className="flex-1" onClick={() => setShowAddService(false)}>
              Annuler
            </Button>
            <Button type="submit" className="flex-1" loading={addingService}>
              Ajouter
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
