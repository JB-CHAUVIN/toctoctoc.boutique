"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Select } from "@/components/ui/select";
import { BOOKING_STATUS_LABELS } from "@/lib/constants";

interface Props {
  bookingId: string;
  currentStatus: string;
}

const statusOptions = Object.entries(BOOKING_STATUS_LABELS).map(([value, { label }]) => ({
  value,
  label,
}));

export function BookingStatusWidget({ bookingId, currentStatus }: Props) {
  const [status, setStatus] = useState(currentStatus);
  const [saving, setSaving] = useState(false);

  async function handleChange(newStatus: string) {
    if (newStatus === status) return;
    setSaving(true);
    const res = await fetch(`/api/booking/status/${bookingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      setStatus(newStatus);
      toast.success("Statut mis à jour");
    } else {
      toast.error("Erreur lors de la mise à jour");
    }
    setSaving(false);
  }

  return (
    <Select
      options={statusOptions}
      value={status}
      onChange={(e) => handleChange(e.target.value)}
      disabled={saving}
      className="text-xs py-1 h-8"
    />
  );
}
