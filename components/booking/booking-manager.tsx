"use client";

import { useState, useCallback } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { BookingStatusWidget } from "./booking-status-widget";
import { formatDateTime, formatPrice, formatDuration } from "@/lib/utils";
import { BOOKING_STATUS_LABELS } from "@/lib/constants";
import {
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  X,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { BookingStatus } from "@prisma/client";

interface Service {
  id: string;
  name: string;
  duration: number | null;
  price: number | null;
  isActive: boolean;
}

interface Booking {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  date: string;
  status: BookingStatus;
  notes: string | null;
  service: Service | null;
}

interface BookingManagerProps {
  businessId: string;
  initialBookings: Booking[];
  services: Service[];
}

const STATUS_FILTERS = [
  { value: "ALL", label: "Toutes" },
  { value: "PENDING", label: "En attente" },
  { value: "CONFIRMED", label: "Confirmées" },
  { value: "COMPLETED", label: "Terminées" },
  { value: "CANCELLED", label: "Annulées" },
  { value: "NO_SHOW", label: "Absences" },
] as const;

// ── Create booking dialog ─────────────────────────────────

function CreateBookingDialog({
  businessId,
  services,
  onCreated,
  onClose,
}: {
  businessId: string;
  services: Service[];
  onCreated: (booking: Booking) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    serviceId: "",
    date: "",
    time: "09:00",
    notes: "",
    status: "CONFIRMED" as BookingStatus,
  });
  const [saving, setSaving] = useState(false);

  function set(k: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.date) { toast.error("Date requise"); return; }
    setSaving(true);

    const dateISO = new Date(`${form.date}T${form.time}`).toISOString();

    const res = await fetch("/api/booking/manual", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        businessId,
        customerName: form.customerName,
        customerEmail: form.customerEmail,
        customerPhone: form.customerPhone || undefined,
        serviceId: form.serviceId || undefined,
        date: dateISO,
        notes: form.notes || undefined,
        status: form.status,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error || "Erreur");
    } else {
      toast.success("Réservation créée");
      onCreated(data.data);
      onClose();
    }
    setSaving(false);
  }

  const activeServices = services.filter((s) => s.isActive);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">Nouvelle réservation</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Nom *" value={form.customerName} onChange={set("customerName")} required />
            <Input label="Email *" type="email" value={form.customerEmail} onChange={set("customerEmail")} required />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Téléphone" type="tel" value={form.customerPhone} onChange={set("customerPhone")} />
            {activeServices.length > 0 ? (
              <Select
                label="Service"
                value={form.serviceId}
                onChange={set("serviceId")}
                options={[
                  { value: "", label: "Aucun service" },
                  ...activeServices.map((s) => ({
                    value: s.id,
                    label: `${s.name}${s.duration !== null ? ` (${formatDuration(s.duration)})` : ""}${s.price !== null ? ` · ${formatPrice(s.price)}` : ""}`,
                  })),
                ]}
              />
            ) : null}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Date *" type="date" value={form.date} onChange={set("date")} required />
            <Input label="Heure *" type="time" value={form.time} onChange={set("time")} required />
          </div>
          <Select
            label="Statut"
            value={form.status}
            onChange={set("status")}
            options={Object.entries(BOOKING_STATUS_LABELS).map(([v, { label }]) => ({ value: v, label }))}
          />
          <Textarea label="Notes" value={form.notes} onChange={set("notes")} rows={2} placeholder="Notes internes..." />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
            <Button type="submit" loading={saving} leftIcon={<Calendar className="h-4 w-4" />}>
              Créer la réservation
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Row with expanded detail ──────────────────────────────

function BookingRow({
  booking,
  onDelete,
}: {
  booking: Booking;
  onDelete: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!window.confirm(`Supprimer la réservation de ${booking.customerName} ?`)) return;
    setDeleting(true);
    const res = await fetch(`/api/booking/item/${booking.id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Réservation supprimée");
      onDelete(booking.id);
    } else {
      toast.error("Erreur lors de la suppression");
      setDeleting(false);
    }
  }

  const statusInfo = BOOKING_STATUS_LABELS[booking.status];

  return (
    <>
      <tr className={cn("border-b border-slate-50 hover:bg-slate-50/50", expanded && "bg-slate-50/50")}>
        <td className="px-5 py-3.5">
          <div className="font-medium text-slate-800">{booking.customerName}</div>
          <div className="text-xs text-slate-400">{booking.customerEmail}</div>
        </td>
        <td className="px-5 py-3.5 text-sm text-slate-600">
          {booking.service ? (
            <span>{booking.service.name}</span>
          ) : (
            <span className="text-slate-300">—</span>
          )}
        </td>
        <td className="whitespace-nowrap px-5 py-3.5 text-sm text-slate-600">
          {formatDateTime(new Date(booking.date))}
        </td>
        <td className="px-5 py-3.5">
          <Badge
            variant={
              booking.status === "CONFIRMED" ? "success" :
              booking.status === "CANCELLED" ? "danger" :
              booking.status === "PENDING" ? "warning" : "default"
            }
          >
            {statusInfo.label}
          </Badge>
        </td>
        <td className="px-5 py-3.5">
          <BookingStatusWidget
            bookingId={booking.id}
            currentStatus={booking.status}
          />
        </td>
        <td className="px-5 py-3.5">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setExpanded((e) => !e)}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
              title="Voir détails"
            >
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="rounded-lg p-1.5 text-slate-300 hover:bg-red-50 hover:text-red-500 disabled:opacity-40"
              title="Supprimer"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </td>
      </tr>
      {expanded && (
        <tr className="bg-slate-50/70">
          <td colSpan={6} className="px-5 py-3 text-sm">
            <div className="flex flex-wrap gap-6 text-slate-500">
              {booking.customerPhone && (
                <span>
                  <span className="font-medium text-slate-700">Tél :</span>{" "}
                  <a href={`tel:${booking.customerPhone}`} className="hover:underline">
                    {booking.customerPhone}
                  </a>
                </span>
              )}
              {booking.service && (
                <span>
                  <span className="font-medium text-slate-700">Durée :</span>{" "}
                  {booking.service.duration !== null ? formatDuration(booking.service.duration) : "Durée variable"}
                  {booking.service.price !== null && ` · ${formatPrice(booking.service.price)}`}
                </span>
              )}
              {booking.notes ? (
                <span>
                  <span className="font-medium text-slate-700">Notes :</span>{" "}
                  {booking.notes}
                </span>
              ) : (
                <span className="italic text-slate-300">Aucune note</span>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

// ── Main component ────────────────────────────────────────

export function BookingManager({ businessId, initialBookings, services }: BookingManagerProps) {
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [filter, setFilter] = useState<string>("ALL");
  const [showCreate, setShowCreate] = useState(false);

  const filtered =
    filter === "ALL"
      ? bookings
      : bookings.filter((b) => b.status === filter);

  const counts = STATUS_FILTERS.reduce<Record<string, number>>((acc, { value }) => {
    acc[value] = value === "ALL" ? bookings.length : bookings.filter((b) => b.status === value).length;
    return acc;
  }, {});

  const handleDelete = useCallback((id: string) => {
    setBookings((prev) => prev.filter((b) => b.id !== id));
  }, []);

  const handleCreated = useCallback((booking: Booking) => {
    setBookings((prev) => [booking, ...prev]);
  }, []);

  return (
    <>
      {showCreate && (
        <CreateBookingDialog
          businessId={businessId}
          services={services}
          onCreated={handleCreated}
          onClose={() => setShowCreate(false)}
        />
      )}

      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex flex-wrap gap-1">
          {STATUS_FILTERS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={cn(
                "rounded-full px-3 py-1 text-sm transition",
                filter === value
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              )}
            >
              {label}
              {counts[value] > 0 && (
                <span className={cn("ml-1.5 text-xs", filter === value ? "text-indigo-200" : "text-slate-400")}>
                  {counts[value]}
                </span>
              )}
            </button>
          ))}
        </div>
        <Button
          size="sm"
          leftIcon={<Plus className="h-4 w-4" />}
          onClick={() => setShowCreate(true)}
        >
          Nouvelle réservation
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-100">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-medium text-slate-500">
              <th className="px-5 py-3">Client</th>
              <th className="px-5 py-3">Service</th>
              <th className="px-5 py-3">Date</th>
              <th className="px-5 py-3">Statut</th>
              <th className="px-5 py-3">Changer statut</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-sm text-slate-400">
                  Aucune réservation{filter !== "ALL" ? " dans cette catégorie" : ""}
                </td>
              </tr>
            ) : (
              filtered.map((booking) => (
                <BookingRow
                  key={booking.id}
                  booking={booking}
                  onDelete={handleDelete}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
