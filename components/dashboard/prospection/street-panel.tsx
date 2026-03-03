"use client";

import { useState } from "react";
import { X, ExternalLink, Phone, Globe, Plus, CheckCircle, XCircle, Mail } from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import type { ProspectStreet, ProspectLead } from "./prospect-map";
import { CreateFromLeadDialog } from "./create-from-lead-dialog";

const STATUS_LABELS: Record<ProspectLead["status"], string> = {
  DISCOVERED: "À prospecter",
  CONTACTED: "Contacté",
  CONVERTED: "Converti",
  DECLINED: "Décliné",
};

const STATUS_COLORS: Record<ProspectLead["status"], string> = {
  DISCOVERED: "bg-slate-100 text-slate-700",
  CONTACTED:  "bg-orange-100 text-orange-700",
  CONVERTED:  "bg-green-100 text-green-700",
  DECLINED:   "bg-red-100 text-red-700",
};

interface Props {
  street: ProspectStreet | null;
  onClose: () => void;
  onLeadUpdate: (leadId: string, updates: Partial<ProspectLead>) => void;
  onStreetUpdate: (street: ProspectStreet) => void;
}

export function StreetPanel({ street, onClose, onLeadUpdate, onStreetUpdate }: Props) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [createLead, setCreateLead] = useState<ProspectLead | null>(null);

  if (!street) {
    return (
      <div className="hidden w-80 flex-shrink-0 border-l border-slate-200 bg-white lg:flex lg:items-center lg:justify-center">
        <div className="text-center text-slate-400">
          <div className="mb-3 text-4xl">🗺️</div>
          <p className="text-sm">Cliquez sur une rue<br />ou recherchez-en une</p>
        </div>
      </div>
    );
  }

  const totalLeads = street.leads.length;
  const converted = street.leads.filter((l) => l.status === "CONVERTED").length;
  const progress = totalLeads > 0 ? (converted / totalLeads) * 100 : 0;

  async function patchLead(leadId: string, updates: Record<string, unknown>) {
    setLoadingId(leadId);
    try {
      const res = await fetch(`/api/admin/prospection/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      const json = await res.json();
      if (!res.ok) { toast.error(json.error ?? "Erreur"); return; }
      onLeadUpdate(leadId, updates as Partial<ProspectLead>);
    } catch {
      toast.error("Erreur réseau");
    } finally {
      setLoadingId(null);
    }
  }

  function handleConverted(lead: ProspectLead, businessId: string) {
    if (!street) return;
    onLeadUpdate(lead.id, { status: "CONVERTED", businessId });
    const updatedStreet: ProspectStreet = {
      ...street,
      leads: street.leads.map((l) =>
        l.id === lead.id ? { ...l, status: "CONVERTED" as const, businessId } : l
      ),
    };
    onStreetUpdate(updatedStreet);
    setCreateLead(null);
    toast.success("Commerce créé et lead converti !");
  }

  // Grouper par statut
  const groups: Record<ProspectLead["status"], ProspectLead[]> = {
    DISCOVERED: [],
    CONTACTED: [],
    CONVERTED: [],
    DECLINED: [],
  };
  for (const lead of street.leads) {
    groups[lead.status].push(lead);
  }

  return (
    <>
      <div className="flex w-80 flex-shrink-0 flex-col border-l border-slate-200 bg-white">
        {/* Header rue */}
        <div className="flex items-start justify-between border-b border-slate-100 px-4 py-4">
          <div className="flex-1 min-w-0">
            <h2 className="truncate text-base font-bold text-slate-900">{street.name}</h2>
            <p className="text-xs text-slate-500">{street.city} — {totalLeads} lead{totalLeads > 1 ? "s" : ""}</p>
          </div>
          <button
            onClick={onClose}
            className="ml-2 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Barre de progression */}
        <div className="border-b border-slate-100 px-4 py-3">
          <div className="mb-1 flex justify-between text-xs text-slate-500">
            <span>Conversion</span>
            <span className="font-semibold text-slate-700">{converted}/{totalLeads}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-green-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Liste des leads */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
          {totalLeads === 0 && (
            <p className="text-center text-sm text-slate-400 py-8">Aucun lead trouvé sur cette rue.</p>
          )}

          {(["DISCOVERED", "CONTACTED", "CONVERTED", "DECLINED"] as const).map((status) => {
            const leads = groups[status];
            if (leads.length === 0) return null;
            return (
              <div key={status}>
                <p className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-400">
                  {STATUS_LABELS[status]} ({leads.length})
                </p>
                <div className="space-y-2">
                  {leads.map((lead) => (
                    <LeadCard
                      key={lead.id}
                      lead={lead}
                      loading={loadingId === lead.id}
                      onContacte={() => patchLead(lead.id, { status: "CONTACTED" })}
                      onDeclined={() => patchLead(lead.id, { status: "DECLINED" })}
                      onRestore={() => patchLead(lead.id, { status: "DISCOVERED" })}
                      onAdd={() => setCreateLead(lead)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {createLead && (
        <CreateFromLeadDialog
          lead={createLead}
          onClose={() => setCreateLead(null)}
          onConverted={(businessId) => handleConverted(createLead, businessId)}
        />
      )}
    </>
  );
}

function LeadCard({
  lead,
  loading,
  onContacte,
  onDeclined,
  onRestore,
  onAdd,
}: {
  lead: ProspectLead;
  loading: boolean;
  onContacte: () => void;
  onDeclined: () => void;
  onRestore: () => void;
  onAdd: () => void;
}) {
  return (
    <div className={cn("rounded-lg border p-3", lead.status === "DECLINED" ? "opacity-50" : "")}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-slate-800">{lead.name}</p>
          {lead.businessType && (
            <p className="text-xs text-slate-500">{lead.businessType}</p>
          )}
          {lead.address && (
            <p className="mt-0.5 truncate text-xs text-slate-400">{lead.address}</p>
          )}
        </div>
        <span className={cn("flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium", STATUS_COLORS[lead.status])}>
          {STATUS_LABELS[lead.status]}
        </span>
      </div>

      {/* Contacts */}
      <div className="mt-2 flex flex-wrap gap-1.5">
        {lead.phone && (
          <a
            href={`tel:${lead.phone}`}
            className="flex items-center gap-1 rounded-md bg-slate-50 px-2 py-0.5 text-[11px] text-slate-600 hover:bg-slate-100"
          >
            <Phone className="h-3 w-3" />
            {lead.phone}
          </a>
        )}
        {lead.website && (
          <a
            href={lead.website}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 rounded-md bg-slate-50 px-2 py-0.5 text-[11px] text-slate-600 hover:bg-slate-100"
          >
            <Globe className="h-3 w-3" />
            Site web
          </a>
        )}
        {lead.googleMapsUrl && (
          <a
            href={lead.googleMapsUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 rounded-md bg-slate-50 px-2 py-0.5 text-[11px] text-slate-600 hover:bg-slate-100"
          >
            <ExternalLink className="h-3 w-3" />
            Maps
          </a>
        )}
      </div>

      {/* Actions */}
      {lead.status !== "CONVERTED" && (
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {lead.status === "DECLINED" ? (
            <button
              onClick={onRestore}
              disabled={loading}
              className="flex items-center gap-1 rounded-md bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600 transition hover:bg-slate-200 disabled:opacity-50"
            >
              Restaurer
            </button>
          ) : (
            <>
              <button
                onClick={onAdd}
                disabled={loading}
                className="flex items-center gap-1 rounded-md bg-green-600 px-2.5 py-1 text-[11px] font-medium text-white transition hover:bg-green-700 disabled:opacity-50"
              >
                <Plus className="h-3 w-3" />
                Ajouter
              </button>
              {lead.status !== "CONTACTED" && (
                <button
                  onClick={onContacte}
                  disabled={loading}
                  className="flex items-center gap-1 rounded-md bg-orange-100 px-2.5 py-1 text-[11px] font-medium text-orange-700 transition hover:bg-orange-200 disabled:opacity-50"
                >
                  <Mail className="h-3 w-3" />
                  Contacté
                </button>
              )}
              <button
                onClick={onDeclined}
                disabled={loading}
                className="flex items-center gap-1 rounded-md bg-red-50 px-2.5 py-1 text-[11px] font-medium text-red-600 transition hover:bg-red-100 disabled:opacity-50"
              >
                <XCircle className="h-3 w-3" />
                Décliné
              </button>
            </>
          )}
        </div>
      )}

      {lead.status === "CONVERTED" && lead.businessId && (
        <div className="mt-2">
          <a
            href={`/dashboard/${lead.businessId}`}
            className="flex items-center gap-1 text-[11px] font-medium text-green-600 hover:text-green-700"
          >
            <CheckCircle className="h-3 w-3" />
            Voir le commerce
          </a>
        </div>
      )}
    </div>
  );
}
