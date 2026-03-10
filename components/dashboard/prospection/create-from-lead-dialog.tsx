"use client";

import { CreateBusinessDialog } from "@/components/dashboard/create-business-dialog";
import type { ProspectLead } from "./prospect-map";
import toast from "react-hot-toast";

interface Props {
  lead: ProspectLead;
  onClose: () => void;
  onConverted: (businessId: string) => void;
}

/** Parse "118 Rue de Belleville, 75020 Paris" → { street, zipCode, city } */
function parseAddress(raw: string | null): { street: string; zipCode: string; city: string } {
  if (!raw) return { street: "", zipCode: "", city: "" };
  // Split on comma, trim parts
  const parts = raw.split(",").map((s) => s.trim());
  // Last part often contains "75020 Paris" or "Paris" or "75020 Paris, France"
  // Remove trailing "France" part
  const filtered = parts.filter((p) => !/^france$/i.test(p));
  if (filtered.length <= 1) {
    // Single part — try to extract zipCode from it
    const match = filtered[0]?.match(/^(.+?)\s+(\d{5})\s+(.+)$/);
    if (match) return { street: match[1], zipCode: match[2], city: match[3] };
    return { street: filtered[0] ?? "", zipCode: "", city: "" };
  }
  const street = filtered[0];
  // Look for a part matching "75020 Paris" pattern
  const cityPart = filtered.slice(1).join(", ");
  const zipMatch = cityPart.match(/(\d{5})\s*(.+)/);
  if (zipMatch) return { street, zipCode: zipMatch[1], city: zipMatch[2] };
  return { street, zipCode: "", city: cityPart };
}

export function CreateFromLeadDialog({ lead, onClose, onConverted }: Props) {
  async function handleSuccess(businessId: string) {
    // Marquer le lead comme converti
    try {
      await fetch(`/api/admin/prospection/leads/${lead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CONVERTED", businessId }),
      });
    } catch {
      toast.error("Erreur lors de la mise à jour du lead");
    }
    onConverted(businessId);
  }

  const parsed = parseAddress(lead.address);

  return (
    <CreateBusinessDialog
      open={true}
      onClose={onClose}
      onSuccess={handleSuccess}
      isAdmin={true}
      title={`Créer "${lead.name}"`}
      initialValues={{
        name: lead.name,
        businessType: lead.businessType ?? "",
        address: parsed.street,
        city: parsed.city,
        zipCode: parsed.zipCode,
        phone: lead.phone ?? "",
        website: lead.website ?? "",
        googleMapsUrl: lead.googleMapsUrl ?? "",
        reviewUrl: lead.googleMapsUrl ?? "",
      }}
    />
  );
}
