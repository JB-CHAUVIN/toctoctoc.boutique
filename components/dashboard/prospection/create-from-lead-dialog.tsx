"use client";

import { CreateBusinessDialog } from "@/components/dashboard/create-business-dialog";
import type { ProspectLead } from "./prospect-map";
import toast from "react-hot-toast";

interface Props {
  lead: ProspectLead;
  onClose: () => void;
  onConverted: (businessId: string) => void;
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
        address: lead.address ?? "",
        phone: lead.phone ?? "",
        website: lead.website ?? "",
        googleMapsUrl: lead.googleMapsUrl ?? "",
        reviewUrl: lead.googleMapsUrl ?? "",
      }}
    />
  );
}
