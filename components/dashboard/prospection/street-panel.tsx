"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X, ExternalLink, Phone, Globe, Plus, CheckCircle, XCircle, Mail, Link2, Loader2, Search, Building2, Star, Copy } from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import type { ProspectStreet, ProspectLead } from "./prospect-map";
import { CreateFromLeadDialog } from "./create-from-lead-dialog";

const STATUS_LABELS: Record<ProspectLead["status"], string> = {
  DISCOVERED: "À prospecter",
  CONTACTED:  "Contacté",
  CONVERTED:  "Converti",
  DECLINED:   "Décliné",
};

const STATUS_COLORS: Record<ProspectLead["status"], string> = {
  DISCOVERED: "bg-slate-100 text-slate-700",
  CONTACTED:  "bg-orange-100 text-orange-700",
  CONVERTED:  "bg-green-100 text-green-700",
  DECLINED:   "bg-red-100 text-red-700",
};

// Contactés en premier → plus actifs / prioritaires
const STATUS_ORDER: ProspectLead["status"][] = ["CONTACTED", "DISCOVERED", "CONVERTED", "DECLINED"];

interface AdminBusiness {
  id: string;
  name: string;
  businessType: string | null;
  city: string | null;
  slug: string;
  user: { name: string | null; email: string };
}

interface Props {
  street: ProspectStreet | null;
  highlightLead?: { id: string; tick: number } | null;
  onClose: () => void;
  onLeadUpdate: (leadId: string, updates: Partial<ProspectLead>) => void;
  onStreetUpdate: (street: ProspectStreet) => void;
}

export function StreetPanel({ street, highlightLead, onClose, onLeadUpdate, onStreetUpdate }: Props) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [createLead, setCreateLead] = useState<ProspectLead | null>(null);
  const [linkLead, setLinkLead] = useState<ProspectLead | null>(null);
  const [activeHighlight, setActiveHighlight] = useState<string | null>(null);
  const leadRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Scroll vers le lead cliqué sur la carte et le surligner
  useEffect(() => {
    if (!highlightLead) return;
    let timer: ReturnType<typeof setTimeout>;
    // rAF pour laisser le DOM se mettre à jour si la rue vient de changer
    const rafId = requestAnimationFrame(() => {
      const el = leadRefs.current.get(highlightLead.id);
      if (!el) return;
      el.scrollIntoView({ behavior: "smooth", block: "nearest" });
      setActiveHighlight(highlightLead.id);
      timer = setTimeout(() => setActiveHighlight(null), 2000);
    });
    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(timer);
    };
  }, [highlightLead]);

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
    setLinkLead(null);
    toast.success("Lead converti !");
  }

  // Grouper par statut
  const groups: Record<ProspectLead["status"], ProspectLead[]> = {
    DISCOVERED: [], CONTACTED: [], CONVERTED: [], DECLINED: [],
  };
  for (const lead of street.leads) {
    groups[lead.status].push(lead);
  }

  return (
    <>
      <div className="flex w-80 flex-shrink-0 flex-col border-l border-slate-200 bg-white">
        {/* Header rue */}
        <div className="flex items-start justify-between border-b border-slate-100 px-4 py-4">
          <div className="min-w-0 flex-1">
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
        <div className="flex-1 space-y-4 overflow-y-auto px-4 py-3">
          {totalLeads === 0 && (
            <p className="py-8 text-center text-sm text-slate-400">Aucun lead trouvé sur cette rue.</p>
          )}

          {STATUS_ORDER.map((status) => {
            const leads = groups[status];
            if (leads.length === 0) return null;
            return (
              <div key={status}>
                <p className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-400">
                  {STATUS_LABELS[status]} ({leads.length})
                </p>
                <div className="space-y-2">
                  {leads.map((lead) => (
                    <div
                      key={lead.id}
                      ref={(el) => { if (el) leadRefs.current.set(lead.id, el); else leadRefs.current.delete(lead.id); }}
                    >
                      <LeadCard
                        lead={lead}
                        loading={loadingId === lead.id}
                        highlighted={activeHighlight === lead.id}
                        onContacte={() => patchLead(lead.id, { status: "CONTACTED" })}
                        onDeclined={() => patchLead(lead.id, { status: "DECLINED" })}
                        onRestore={() => patchLead(lead.id, { status: "DISCOVERED" })}
                        onAdd={() => setCreateLead(lead)}
                        onLink={() => setLinkLead(lead)}
                      />
                    </div>
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

      {linkLead && (
        <LinkBusinessDialog
          lead={linkLead}
          onClose={() => setLinkLead(null)}
          onLinked={(businessId) => handleConverted(linkLead, businessId)}
        />
      )}
    </>
  );
}

// ── LeadCard ──────────────────────────────────────────────────────────────────

function LeadCard({
  lead, loading, highlighted,
  onContacte, onDeclined, onRestore, onAdd, onLink,
}: {
  lead: ProspectLead;
  loading: boolean;
  highlighted: boolean;
  onContacte: () => void;
  onDeclined: () => void;
  onRestore: () => void;
  onAdd: () => void;
  onLink: () => void;
}) {
  return (
    <div className={cn(
      "rounded-lg border p-3 transition-all duration-500",
      lead.status === "DECLINED" ? "opacity-50" : "",
      highlighted ? "border-indigo-400 bg-indigo-50 shadow-md shadow-indigo-100" : "border-slate-200 bg-white",
    )}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p
            className="cursor-copy truncate text-sm font-semibold text-slate-800 hover:text-indigo-600"
            title="Copier le nom"
            onClick={() => {
              navigator.clipboard.writeText(lead.name);
              toast.success("Nom copié !");
            }}
          >{lead.name}</p>
          <div className="flex items-center gap-1.5">
            {lead.businessType && <span className="text-xs text-slate-500">{lead.businessType}</span>}
            {lead.rating != null && (
              <span className={cn(
                "flex items-center gap-0.5 text-[11px] font-medium",
                lead.rating >= 4.5 ? "text-green-600" : lead.rating >= 4 ? "text-yellow-600" : "text-orange-600"
              )}>
                <Star className="h-3 w-3 fill-current" />{lead.rating}
                {lead.reviewCount != null && <span className="font-normal text-slate-400">({lead.reviewCount})</span>}
              </span>
            )}
          </div>
          {lead.address && <p className="mt-0.5 truncate text-xs text-slate-400">{lead.address}</p>}
        </div>
        <span className={cn("flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium", STATUS_COLORS[lead.status])}>
          {STATUS_LABELS[lead.status]}
        </span>
      </div>

      {/* Liens */}
      <div className="mt-2 flex flex-wrap gap-1.5">
        {lead.phone && (
          <a href={`tel:${lead.phone}`} className="flex items-center gap-1 rounded-md bg-slate-50 px-2 py-0.5 text-[11px] text-slate-600 hover:bg-slate-100">
            <Phone className="h-3 w-3" />{lead.phone}
          </a>
        )}
        {lead.website && (
          <a href={lead.website} target="_blank" rel="noreferrer" className="flex items-center gap-1 rounded-md bg-slate-50 px-2 py-0.5 text-[11px] text-slate-600 hover:bg-slate-100">
            <Globe className="h-3 w-3" />Site web
          </a>
        )}
        {lead.googleMapsUrl && (
          <>
            <a href={lead.googleMapsUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 rounded-md bg-slate-50 px-2 py-0.5 text-[11px] text-slate-600 hover:bg-slate-100">
              <ExternalLink className="h-3 w-3" />Maps
            </a>
            <button
              onClick={() => { navigator.clipboard.writeText(lead.googleMapsUrl!); toast.success("Lien Maps copié !"); }}
              className="flex items-center gap-1 rounded-md bg-slate-50 px-2 py-0.5 text-[11px] text-slate-600 hover:bg-slate-100"
              title="Copier le lien Maps"
            >
              <Copy className="h-3 w-3" />
            </button>
          </>
        )}
      </div>

      {/* Actions */}
      {lead.status === "CONVERTED" ? (
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {lead.businessId && (
            <a href={`/dashboard/${lead.businessId}`} className="flex items-center gap-1 text-[11px] font-medium text-green-600 hover:text-green-700">
              <CheckCircle className="h-3 w-3" />Voir le commerce
            </a>
          )}
          <button onClick={onAdd} disabled={loading} className="flex items-center gap-1 rounded-md bg-green-600 px-2.5 py-1 text-[11px] font-medium text-white transition hover:bg-green-700 disabled:opacity-50">
            <Plus className="h-3 w-3" />Créer
          </button>
          <button onClick={onLink} disabled={loading} className="flex items-center gap-1 rounded-md bg-indigo-50 px-2.5 py-1 text-[11px] font-medium text-indigo-700 transition hover:bg-indigo-100 disabled:opacity-50">
            <Link2 className="h-3 w-3" />Déjà créé
          </button>
        </div>
      ) : lead.status === "DECLINED" ? (
        <div className="mt-2.5">
          <button onClick={onRestore} disabled={loading} className="flex items-center gap-1 rounded-md bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600 transition hover:bg-slate-200 disabled:opacity-50">
            Restaurer
          </button>
        </div>
      ) : (
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {/* Créer nouveau commerce */}
          <button onClick={onAdd} disabled={loading} className="flex items-center gap-1 rounded-md bg-green-600 px-2.5 py-1 text-[11px] font-medium text-white transition hover:bg-green-700 disabled:opacity-50">
            <Plus className="h-3 w-3" />Créer
          </button>
          {/* Associer à un commerce existant */}
          <button onClick={onLink} disabled={loading} className="flex items-center gap-1 rounded-md bg-indigo-50 px-2.5 py-1 text-[11px] font-medium text-indigo-700 transition hover:bg-indigo-100 disabled:opacity-50">
            <Link2 className="h-3 w-3" />Déjà créé
          </button>
          {/* Marquer contacté */}
          {lead.status !== "CONTACTED" && (
            <button onClick={onContacte} disabled={loading} className="flex items-center gap-1 rounded-md bg-orange-50 px-2.5 py-1 text-[11px] font-medium text-orange-700 transition hover:bg-orange-100 disabled:opacity-50">
              <Mail className="h-3 w-3" />Contacté
            </button>
          )}
          {/* Décliner */}
          <button onClick={onDeclined} disabled={loading} className="flex items-center gap-1 rounded-md bg-red-50 px-2.5 py-1 text-[11px] font-medium text-red-600 transition hover:bg-red-100 disabled:opacity-50">
            <XCircle className="h-3 w-3" />Décliné
          </button>
        </div>
      )}
    </div>
  );
}

// ── LinkBusinessDialog ────────────────────────────────────────────────────────

function LinkBusinessDialog({
  lead, onClose, onLinked,
}: {
  lead: ProspectLead;
  onClose: () => void;
  onLinked: (businessId: string) => void;
}) {
  const [businesses, setBusinesses] = useState<AdminBusiness[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [linkingId, setLinkingId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    fetch("/api/admin/businesses")
      .then((r) => r.json())
      .then((d) => { if (d.success) setBusinesses(d.data); })
      .catch(() => toast.error("Impossible de charger les commerces"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = businesses.filter((b) => {
    const q = search.toLowerCase();
    return (
      b.name.toLowerCase().includes(q) ||
      (b.businessType ?? "").toLowerCase().includes(q) ||
      b.user.email.toLowerCase().includes(q)
    );
  });

  async function handleLink(business: AdminBusiness) {
    setLinkingId(business.id);
    try {
      const res = await fetch(`/api/admin/prospection/leads/${lead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CONVERTED", businessId: business.id }),
      });
      if (!res.ok) { toast.error("Erreur lors de l'association"); return; }
      toast.success(`Lead lié à "${business.name}"`);
      onLinked(business.id);
    } catch {
      toast.error("Erreur réseau");
    } finally {
      setLinkingId(null);
    }
  }

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-4">
      <div className="flex w-full max-w-md flex-col rounded-xl bg-white shadow-xl" style={{ maxHeight: "90vh" }}>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <div>
            <h3 className="font-semibold text-slate-900">Commerce déjà créé</h3>
            <p className="text-xs text-slate-500 mt-0.5">Associer &quot;{lead.name}&quot; à un commerce existant</p>
          </div>
          <button onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Search */}
        <div className="border-b border-slate-100 px-4 py-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un commerce…"
              autoFocus
              className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Liste */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1.5">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-8 text-center">
              <Building2 className="mx-auto mb-2 h-8 w-8 text-slate-300" />
              <p className="text-sm text-slate-400">Aucun commerce trouvé</p>
            </div>
          ) : (
            filtered.map((b) => (
              <button
                key={b.id}
                onClick={() => handleLink(b)}
                disabled={linkingId === b.id}
                className="w-full rounded-lg border border-slate-200 p-3 text-left transition hover:border-indigo-300 hover:bg-indigo-50 disabled:opacity-50"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900">{b.name}</p>
                    <p className="text-xs text-slate-500">
                      {b.businessType ?? "—"}{b.city ? ` · ${b.city}` : ""}
                    </p>
                    <p className="text-xs text-slate-400">{b.user.name ?? b.user.email}</p>
                  </div>
                  {linkingId === b.id ? (
                    <Loader2 className="h-4 w-4 flex-shrink-0 animate-spin text-indigo-500" />
                  ) : (
                    <Link2 className="h-4 w-4 flex-shrink-0 text-slate-300" />
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
