"use client";

import { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";

interface IpActionModalProps {
  ip: string;
  isExcluded: boolean;
  onExclude: (ip: string, label: string) => void;
}

export function IpActionModal({ ip, isExcluded, onExclude }: IpActionModalProps) {
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleExclude() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/excluded-ips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ip, label: label || `IP admin` }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Erreur");
        return;
      }
      toast.success("IP exclue des stats");
      onExclude(ip, label);
      setOpen(false);
    } catch {
      toast.error("Erreur réseau");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`font-mono text-xs underline ${
          isExcluded
            ? "text-red-400 line-through"
            : "text-indigo-600 hover:text-indigo-800"
        }`}
      >
        {ip}
      </button>

      <Dialog open={open} onClose={() => setOpen(false)} title={`IP : ${ip}`}>
        <div className="space-y-4">
          <div className="space-y-2">
            <a
              href={`https://whatismyipaddress.com/ip/${ip}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Voir sur WhatIsMyIPAddress
              <span className="text-xs text-slate-400">&#8599;</span>
            </a>
          </div>

          {isExcluded ? (
            <p className="text-sm text-amber-600">
              Cette IP est déjà exclue des statistiques.
            </p>
          ) : (
            <div className="space-y-3 rounded-lg border border-slate-200 p-4">
              <p className="text-sm font-medium text-slate-700">
                Exclure cette IP des statistiques
              </p>
              <p className="text-xs text-slate-500">
                Les logs de cette IP ne seront plus comptabilisés dans les stats
                (pageviews, événements, etc.)
              </p>
              <Input
                placeholder="Label (ex: Mon IP bureau)"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
              />
              <Button
                onClick={handleExclude}
                disabled={loading}
                className="w-full"
              >
                {loading ? "..." : "Exclure cette IP"}
              </Button>
            </div>
          )}
        </div>
      </Dialog>
    </>
  );
}
