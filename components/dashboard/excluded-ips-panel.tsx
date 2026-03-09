"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";

interface ExcludedIp {
  id: string;
  ip: string;
  label: string | null;
  createdAt: string;
}

interface ExcludedIpsPanelProps {
  initialIps: ExcludedIp[];
}

export function ExcludedIpsPanel({ initialIps }: ExcludedIpsPanelProps) {
  const [ips, setIps] = useState(initialIps);
  const [newIp, setNewIp] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [adding, setAdding] = useState(false);

  async function handleAdd() {
    if (!newIp.trim()) return;
    setAdding(true);
    try {
      const res = await fetch("/api/admin/excluded-ips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ip: newIp.trim(), label: newLabel.trim() || null }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Erreur");
        return;
      }
      setIps((prev) => [data.data, ...prev]);
      setNewIp("");
      setNewLabel("");
      toast.success("IP ajoutée");
    } catch {
      toast.error("Erreur réseau");
    } finally {
      setAdding(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await fetch(`/api/admin/excluded-ips/${id}`, { method: "DELETE" });
      setIps((prev) => prev.filter((ip) => ip.id !== id));
      toast.success("IP supprimée");
    } catch {
      toast.error("Erreur");
    }
  }

  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
        IPs exclues des statistiques
      </h3>

      {ips.length === 0 ? (
        <p className="mb-3 text-sm text-slate-400">Aucune IP exclue.</p>
      ) : (
        <div className="mb-4 space-y-1.5">
          {ips.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2"
            >
              <div className="min-w-0">
                <span className="font-mono text-sm text-slate-700">{item.ip}</span>
                {item.label && (
                  <span className="ml-2 text-xs text-slate-400">({item.label})</span>
                )}
              </div>
              <button
                onClick={() => handleDelete(item.id)}
                className="ml-3 shrink-0 text-xs text-red-500 hover:text-red-700"
              >
                Supprimer
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <Input
          placeholder="Adresse IP"
          value={newIp}
          onChange={(e) => setNewIp(e.target.value)}
          className="w-40"
        />
        <Input
          placeholder="Label (optionnel)"
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          className="flex-1"
        />
        <Button onClick={handleAdd} disabled={adding || !newIp.trim()} size="sm">
          {adding ? "..." : "Ajouter"}
        </Button>
      </div>
    </div>
  );
}
