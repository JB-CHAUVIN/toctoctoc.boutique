"use client";

import { useState } from "react";
import { format, addDays, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { formatPrice, formatDuration } from "@/lib/utils";
import { ChevronLeft, CheckCircle, Loader2, Calendar, Clock } from "lucide-react";
import type { Service, BookingConfig } from "@prisma/client";
import type { TimeSlot } from "@/types";

interface Props {
  businessId: string;
  businessName: string;
  primaryColor: string;
  accentColor: string;
  services: Service[];
  config: BookingConfig;
}

type Step = "service" | "date" | "time" | "info" | "confirm";

export function BookingFlow({ businessId, businessName, primaryColor, accentColor, services, config }: Props) {
  const [step, setStep] = useState<Step>("service");
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({ customerName: "", customerEmail: "", customerPhone: "", notes: "" });

  // Générer les prochains 30 jours disponibles
  const maxDays = config.maxAdvanceDays;
  const availableDates = Array.from({ length: maxDays }, (_, i) => {
    const date = addDays(new Date(), i + 1);
    return format(date, "yyyy-MM-dd");
  });

  async function selectDate(date: string) {
    setSelectedDate(date);
    setSelectedTime("");
    setLoadingSlots(true);
    const res = await fetch(
      `/api/booking/${businessId}?date=${date}&serviceId=${selectedService!.id}`
    );
    const data = await res.json();
    if (data.success) setSlots(data.data);
    setLoadingSlots(false);
    setStep("time");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const res = await fetch(`/api/booking/${businessId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        serviceId: selectedService!.id,
        date: selectedDate,
        time: selectedTime,
        ...form,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error || "Erreur lors de la réservation");
    } else {
      setDone(true);
    }
    setSubmitting(false);
  }

  if (done) {
    return (
      <Card className="text-center py-12">
        <CheckCircle className="mx-auto mb-4 h-16 w-16 text-emerald-500" />
        <h2 className="text-2xl font-bold text-slate-900">Réservation confirmée !</h2>
        <p className="mt-3 text-slate-500 max-w-md mx-auto">
          {config.confirmationMsg || "Merci pour votre réservation. Nous vous attendons avec plaisir !"}
        </p>
        <div className="mt-6 rounded-xl bg-slate-50 p-4 text-sm text-slate-600 inline-block">
          <div><strong>{selectedService?.name}</strong></div>
          <div className="mt-1">
            {format(parseISO(selectedDate), "EEEE d MMMM yyyy", { locale: fr })} à {selectedTime}
          </div>
        </div>
        <p className="mt-4 text-sm text-slate-400">Un email de confirmation vous sera envoyé.</p>
        <Button
          className="mt-6"
          variant="outline"
          onClick={() => { setDone(false); setStep("service"); setSelectedService(null); setSelectedDate(""); setSelectedTime(""); setForm({ customerName: "", customerEmail: "", customerPhone: "", notes: "" }); }}
        >
          Faire une autre réservation
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stepper */}
      <div className="flex items-center justify-center gap-2">
        {(["service", "date", "time", "info"] as Step[]).map((s, i) => {
          const steps = ["service", "date", "time", "info"];
          const currentIndex = steps.indexOf(step);
          const isActive = step === s;
          const isDone = steps.indexOf(s) < currentIndex;
          return (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition ${
                  isActive ? "text-white" : isDone ? "text-white" : "bg-slate-100 text-slate-400"
                }`}
                style={
                  isActive || isDone ? { backgroundColor: primaryColor } : undefined
                }
              >
                {isDone ? "✓" : i + 1}
              </div>
              {i < 3 && <div className={`h-px w-8 ${isDone ? "bg-indigo-300" : "bg-slate-200"}`} />}
            </div>
          );
        })}
      </div>

      {/* Step 1 : Service */}
      {step === "service" && (
        <div>
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Choisir une prestation</h2>
          <div className="grid gap-3">
            {services.map((service) => (
              <button
                key={service.id}
                onClick={() => { setSelectedService(service); setStep("date"); }}
                className="flex items-center justify-between rounded-2xl border-2 p-5 text-left transition hover:shadow-md"
                style={{ borderColor: selectedService?.id === service.id ? primaryColor : "#e2e8f0" }}
              >
                <div>
                  <div className="font-semibold text-slate-800">{service.name}</div>
                  {service.description && (
                    <div className="mt-0.5 text-sm text-slate-400">{service.description}</div>
                  )}
                </div>
                <div className="text-right flex-shrink-0 ml-4">
                  <div className="text-sm text-slate-500 flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" /> {formatDuration(service.duration)}
                  </div>
                  {service.price !== null && (
                    <div className="mt-0.5 font-semibold" style={{ color: primaryColor }}>
                      {formatPrice(service.price)}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2 : Date */}
      {step === "date" && (
        <div>
          <button onClick={() => setStep("service")} className="mb-4 flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800">
            <ChevronLeft className="h-4 w-4" /> Retour
          </button>
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Choisir une date</h2>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-5">
            {availableDates.map((date) => {
              const d = parseISO(date);
              return (
                <button
                  key={date}
                  onClick={() => selectDate(date)}
                  className="flex flex-col items-center rounded-2xl border-2 p-3 text-center transition hover:shadow-md"
                  style={{ borderColor: selectedDate === date ? primaryColor : "#e2e8f0" }}
                >
                  <span className="text-xs font-medium text-slate-400">
                    {format(d, "EEE", { locale: fr })}
                  </span>
                  <span className="text-lg font-bold text-slate-800">{format(d, "d")}</span>
                  <span className="text-xs text-slate-400">{format(d, "MMM", { locale: fr })}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Step 3 : Heure */}
      {step === "time" && (
        <div>
          <button onClick={() => setStep("date")} className="mb-4 flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800">
            <ChevronLeft className="h-4 w-4" /> Retour
          </button>
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Choisir un horaire</h2>
          <div className="mb-3 text-sm text-slate-500">
            <Calendar className="inline h-3.5 w-3.5 mr-1" />
            {format(parseISO(selectedDate), "EEEE d MMMM", { locale: fr })}
          </div>
          {loadingSlots ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" style={{ color: primaryColor }} />
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-5 lg:grid-cols-6">
              {slots.length === 0 ? (
                <p className="col-span-full text-center text-slate-400 py-8">
                  Aucun créneau disponible ce jour-là
                </p>
              ) : (
                slots.map((slot) => (
                  <button
                    key={slot.time}
                    disabled={!slot.available}
                    onClick={() => { setSelectedTime(slot.time); setStep("info"); }}
                    className={`rounded-xl border-2 py-2.5 text-sm font-medium transition ${
                      !slot.available
                        ? "border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed"
                        : selectedTime === slot.time
                        ? "text-white"
                        : "border-slate-200 text-slate-700 hover:shadow-sm"
                    }`}
                    style={
                      selectedTime === slot.time && slot.available
                        ? { backgroundColor: primaryColor, borderColor: primaryColor }
                        : undefined
                    }
                  >
                    {slot.time}
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* Step 4 : Infos client */}
      {step === "info" && (
        <div>
          <button onClick={() => setStep("time")} className="mb-4 flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800">
            <ChevronLeft className="h-4 w-4" /> Retour
          </button>
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Vos informations</h2>
          <div className="mb-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
            <div className="font-medium">{selectedService?.name}</div>
            <div className="mt-1 text-slate-400">
              {format(parseISO(selectedDate), "EEEE d MMMM", { locale: fr })} à {selectedTime}
            </div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Nom complet *"
              placeholder="Jean Dupont"
              value={form.customerName}
              onChange={(e) => setForm((f) => ({ ...f, customerName: e.target.value }))}
              required
            />
            <Input
              label="Email *"
              type="email"
              placeholder="jean@exemple.fr"
              value={form.customerEmail}
              onChange={(e) => setForm((f) => ({ ...f, customerEmail: e.target.value }))}
              required
            />
            <Input
              label="Téléphone"
              type="tel"
              placeholder="06 12 34 56 78"
              value={form.customerPhone}
              onChange={(e) => setForm((f) => ({ ...f, customerPhone: e.target.value }))}
            />
            <Input
              label="Notes (optionnel)"
              placeholder="Précisions sur votre demande..."
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            />
            <Button
              type="submit"
              loading={submitting}
              className="w-full"
              style={{ backgroundColor: primaryColor }}
            >
              Confirmer ma réservation
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}
