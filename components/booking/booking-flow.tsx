"use client";

import { useState } from "react";
import { useCustomerInfo } from "@/hooks/use-customer-info";
import { format, addDays, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { formatPrice, formatDuration } from "@/lib/utils";
import { ChevronLeft, CheckCircle, Loader2, Calendar, Clock, Users } from "lucide-react";
import type { Service, BookingConfig } from "@prisma/client";
import type { TimeSlot } from "@/types";

interface ExtraField {
  key: string;
  label: string;
  type: "text" | "number" | "tel" | "email";
  required: boolean;
}

interface Props {
  businessId: string;
  businessName: string;
  primaryColor: string;
  accentColor: string;
  services: Service[];
  config: BookingConfig;
}

type Step = "service" | "date" | "time" | "guests" | "info" | "confirm";

export function BookingFlow({ businessId, primaryColor, services, config }: Props) {
  const mode = config.mode ?? "APPOINTMENT";
  const extraFields: ExtraField[] = Array.isArray(config.extraFields)
    ? (config.extraFields as unknown as ExtraField[])
    : [];

  // Determine steps for this mode
  const steps: Step[] =
    mode === "APPOINTMENT"
      ? services.length > 0
        ? ["service", "date", "time", "info"]
        : ["date", "time", "info"]
      : mode === "TABLE"
      ? ["date", "time", "guests", "info"]
      : /* CLASS */ services.length > 0
      ? ["service", "date", "time", "info"]
      : ["date", "time", "info"];

  const { load: loadCustomer, save: saveCustomer } = useCustomerInfo();
  const [step, setStep] = useState<Step>(steps[0]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [guestCount, setGuestCount] = useState<number>(2);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState(() => {
    const info = loadCustomer();
    return {
      customerName: info.name ?? "",
      customerEmail: info.email ?? "",
      customerPhone: info.phone ?? "",
      notes: "",
    };
  });
  const [customData, setCustomData] = useState<Record<string, string>>({});

  const maxDays = config.maxAdvanceDays;
  const availableDates = Array.from({ length: maxDays }, (_, i) => {
    const date = addDays(new Date(), i + 1);
    return format(date, "yyyy-MM-dd");
  });

  function goBack() {
    const idx = steps.indexOf(step);
    if (idx > 0) setStep(steps[idx - 1]);
  }

  async function selectDate(date: string) {
    setSelectedDate(date);
    setSelectedTime("");
    setLoadingSlots(true);
    const serviceParam = selectedService ? `&serviceId=${selectedService.id}` : "";
    const res = await fetch(`/api/booking/${businessId}?date=${date}${serviceParam}`);
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
        serviceId: selectedService?.id,
        date: selectedDate,
        time: selectedTime,
        guestCount: mode === "TABLE" ? guestCount : undefined,
        customData: Object.keys(customData).length > 0 ? customData : undefined,
        ...form,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error || "Erreur lors de la réservation");
    } else {
      saveCustomer({ name: form.customerName, email: form.customerEmail, phone: form.customerPhone });
      setDone(true);
    }
    setSubmitting(false);
  }

  function reset() {
    setDone(false);
    setStep(steps[0]);
    setSelectedService(null);
    setSelectedDate("");
    setSelectedTime("");
    setGuestCount(2);
    setForm({ customerName: "", customerEmail: "", customerPhone: "", notes: "" });
    setCustomData({});
  }

  // ── Stepper ──────────────────────────────────────────────

  const STEP_LABELS: Record<Step, string> = {
    service: mode === "CLASS" ? "Cours" : "Service",
    date: "Date",
    time: "Heure",
    guests: "Couverts",
    info: "Infos",
    confirm: "Confirmation",
  };

  const currentIdx = steps.indexOf(step);

  if (done) {
    return (
      <Card className="py-12 text-center">
        <CheckCircle className="mx-auto mb-4 h-16 w-16 text-emerald-500" />
        <h2 className="text-2xl font-bold text-slate-900">
          {mode === "TABLE" ? "Réservation confirmée !" : "Rendez-vous confirmé !"}
        </h2>
        <p className="mx-auto mt-3 max-w-md text-slate-500">
          {config.confirmationMsg || "Merci pour votre réservation. Nous vous attendons avec plaisir !"}
        </p>
        <div className="mt-6 inline-block rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
          {selectedService && <div className="font-medium">{selectedService.name}</div>}
          <div className={selectedService ? "mt-1 text-slate-400" : "font-medium"}>
            {format(parseISO(selectedDate), "EEEE d MMMM yyyy", { locale: fr })} à {selectedTime}
          </div>
          {mode === "TABLE" && (
            <div className="mt-1 text-slate-400">{guestCount} couvert{guestCount > 1 ? "s" : ""}</div>
          )}
        </div>
        <Button className="mt-6" variant="outline" onClick={reset}>
          Faire une autre réservation
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stepper */}
      <div className="flex items-center justify-center gap-2">
        {steps.filter((s) => s !== "confirm").map((s, i) => {
          const isActive = step === s;
          const isDone = steps.indexOf(s) < currentIdx;
          return (
            <div key={s} className="flex items-center gap-2">
              <div className="flex flex-col items-center gap-1">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition ${
                    isActive || isDone ? "text-white" : "bg-slate-100 text-slate-400"
                  }`}
                  style={isActive || isDone ? { backgroundColor: primaryColor } : undefined}
                >
                  {isDone ? "✓" : i + 1}
                </div>
                <span className="text-xs text-slate-400">{STEP_LABELS[s]}</span>
              </div>
              {i < steps.filter((s2) => s2 !== "confirm").length - 1 && (
                <div className={`mb-4 h-px w-8 ${isDone ? "bg-indigo-300" : "bg-slate-200"}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Step : Service / Class */}
      {step === "service" && (
        <div>
          <h2 className="mb-4 text-lg font-semibold text-slate-900">
            {mode === "CLASS" ? "Choisir un cours" : "Choisir une prestation"}
          </h2>
          <div className="grid gap-3">
            {services.map((service) => (
              <button
                key={service.id}
                onClick={() => {
                  setSelectedService(service);
                  setStep("date");
                }}
                className="flex items-center justify-between rounded-2xl border-2 p-5 text-left transition hover:shadow-md"
                style={{
                  borderColor: selectedService?.id === service.id ? primaryColor : "#e2e8f0",
                }}
              >
                <div>
                  <div className="font-semibold text-slate-800">{service.name}</div>
                  {service.description && (
                    <div className="mt-0.5 text-sm text-slate-400">{service.description}</div>
                  )}
                </div>
                <div className="ml-4 flex-shrink-0 text-right">
                  {service.duration !== null && (
                    <div className="flex items-center gap-1 text-sm text-slate-500">
                      <Clock className="h-3.5 w-3.5" /> {formatDuration(service.duration)}
                    </div>
                  )}
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

      {/* Step : Date */}
      {step === "date" && (
        <div>
          {steps.indexOf("date") > 0 && (
            <button
              onClick={goBack}
              className="mb-4 flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800"
            >
              <ChevronLeft className="h-4 w-4" /> Retour
            </button>
          )}
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

      {/* Step : Heure */}
      {step === "time" && (
        <div>
          <button
            onClick={goBack}
            className="mb-4 flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800"
          >
            <ChevronLeft className="h-4 w-4" /> Retour
          </button>
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Choisir un horaire</h2>
          <div className="mb-3 text-sm text-slate-500">
            <Calendar className="mr-1 inline h-3.5 w-3.5" />
            {format(parseISO(selectedDate), "EEEE d MMMM", { locale: fr })}
          </div>
          {loadingSlots ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" style={{ color: primaryColor }} />
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-5 lg:grid-cols-6">
              {slots.length === 0 ? (
                <p className="col-span-full py-8 text-center text-slate-400">
                  Aucun créneau disponible ce jour-là
                </p>
              ) : (
                slots.map((slot) => (
                  <button
                    key={slot.time}
                    disabled={!slot.available}
                    onClick={() => {
                      setSelectedTime(slot.time);
                      const nextStep = steps[steps.indexOf("time") + 1];
                      setStep(nextStep);
                    }}
                    className={`rounded-xl border-2 py-2.5 text-sm font-medium transition ${
                      !slot.available
                        ? "cursor-not-allowed border-slate-100 bg-slate-50 text-slate-300"
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

      {/* Step : Couverts (TABLE mode) */}
      {step === "guests" && (
        <div>
          <button
            onClick={goBack}
            className="mb-4 flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800"
          >
            <ChevronLeft className="h-4 w-4" /> Retour
          </button>
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Nombre de couverts</h2>
          <div className="mb-6 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
            <Calendar className="mr-1 inline h-3.5 w-3.5" />
            {format(parseISO(selectedDate), "EEEE d MMMM", { locale: fr })} à {selectedTime}
          </div>
          <div className="flex items-center gap-6">
            <Users className="h-8 w-8 text-slate-300" />
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setGuestCount((c) => Math.max(1, c - 1))}
                className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-slate-200 text-lg font-semibold text-slate-600 hover:border-indigo-300"
              >
                −
              </button>
              <span className="w-12 text-center text-3xl font-bold text-slate-900">
                {guestCount}
              </span>
              <button
                type="button"
                onClick={() => setGuestCount((c) => c + 1)}
                className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-slate-200 text-lg font-semibold text-slate-600 hover:border-indigo-300"
              >
                +
              </button>
            </div>
            <span className="text-slate-500">couvert{guestCount > 1 ? "s" : ""}</span>
          </div>
          <Button
            className="mt-8 w-full"
            style={{ backgroundColor: primaryColor }}
            onClick={() => setStep("info")}
          >
            Continuer
          </Button>
        </div>
      )}

      {/* Step : Infos client */}
      {step === "info" && (
        <div>
          <button
            onClick={goBack}
            className="mb-4 flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800"
          >
            <ChevronLeft className="h-4 w-4" /> Retour
          </button>
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Vos informations</h2>

          {/* Recap */}
          <div className="mb-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
            {selectedService && <div className="font-medium">{selectedService.name}</div>}
            <div className={selectedService ? "mt-1 text-slate-400" : "font-medium"}>
              {format(parseISO(selectedDate), "EEEE d MMMM", { locale: fr })} à {selectedTime}
            </div>
            {mode === "TABLE" && (
              <div className="mt-1 text-slate-400">
                {guestCount} couvert{guestCount > 1 ? "s" : ""}
              </div>
            )}
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

            {/* Extra fields */}
            {extraFields.map((field) => (
              <Input
                key={field.key}
                label={field.label + (field.required ? " *" : "")}
                type={field.type}
                required={field.required}
                value={customData[field.key] ?? ""}
                onChange={(e) =>
                  setCustomData((d) => ({ ...d, [field.key]: e.target.value }))
                }
              />
            ))}

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
