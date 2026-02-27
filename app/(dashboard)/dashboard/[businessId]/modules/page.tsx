"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";
import { Card } from "@/components/ui/card";
import { Toggle } from "@/components/ui/toggle";
import { Badge } from "@/components/ui/badge";
import { MODULES_INFO, PLAN_LIMITS } from "@/lib/constants";
import { Loader2, Lock } from "lucide-react";
import type { ModuleType, PlanType } from "@prisma/client";
import type { BusinessFull } from "@/types";

export default function ModulesPage() {
  const params = useParams<{ businessId: string }>();
  const [loading, setLoading] = useState(true);
  const [modules, setModules] = useState<Record<string, boolean>>({});
  const [plan, setPlan] = useState<PlanType>("FREE");
  const [toggling, setToggling] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const [bizRes, userRes] = await Promise.all([
        fetch(`/api/business/${params.businessId}`),
        fetch("/api/auth/session"),
      ]);

      const bizData = await bizRes.json();
      if (bizData.success) {
        const b = bizData.data as BusinessFull;
        const moduleMap: Record<string, boolean> = {};
        b.modules.forEach((m) => { moduleMap[m.module] = m.isActive; });
        setModules(moduleMap);
      }

      // Récupérer le plan depuis la session via l'API user
      const planRes = await fetch("/api/user/plan");
      const planData = await planRes.json();
      if (planData.success) setPlan(planData.data);

      setLoading(false);
    }
    load();
  }, [params.businessId]);

  async function toggleModule(module: string, newState: boolean) {
    setToggling(module);
    const res = await fetch(`/api/business/${params.businessId}/modules`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ module, isActive: newState }),
    });
    const data = await res.json();

    if (!res.ok) {
      toast.error(data.error || "Erreur lors de la modification");
    } else {
      setModules((m) => ({ ...m, [module]: newState }));
      toast.success(newState ? "Module activé" : "Module désactivé");
    }
    setToggling(null);
  }

  const allowedModules = PLAN_LIMITS[plan].modules as string[];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  const moduleEntries = Object.entries(MODULES_INFO) as [ModuleType, (typeof MODULES_INFO)[ModuleType]][];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Modules</h1>
        <p className="mt-1 text-sm text-slate-500">
          Activez ou désactivez les fonctionnalités selon vos besoins
        </p>
      </div>

      <div className="mb-6 rounded-xl bg-indigo-50 border border-indigo-100 px-5 py-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-indigo-800">
            Plan actuel : <strong>{PLAN_LIMITS[plan].label}</strong>
          </span>
          <Badge variant="info">{PLAN_LIMITS[plan].priceMonthly}€/mois</Badge>
        </div>
        <p className="mt-1 text-xs text-indigo-600">
          {PLAN_LIMITS[plan].maxBusinesses === -1
            ? "Commerces illimités"
            : `${PLAN_LIMITS[plan].maxBusinesses} commerce(s) inclus`}
          {" · "}{PLAN_LIMITS[plan].modules.length} module(s) disponible(s)
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {moduleEntries.map(([moduleKey, info]) => {
          const isAllowed = allowedModules.includes(moduleKey);
          const isActive = modules[moduleKey] ?? false;
          const isLoading = toggling === moduleKey;

          return (
            <Card
              key={moduleKey}
              className={`relative transition ${!isAllowed ? "opacity-60" : ""}`}
            >
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 text-2xl">{info.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-slate-800">{info.name}</h3>
                    {info.comingSoon && (
                      <Badge variant="outline">Bientôt</Badge>
                    )}
                    {!isAllowed && (
                      <Lock className="h-3.5 w-3.5 flex-shrink-0 text-slate-400" />
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-slate-400">{info.description}</p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                {!isAllowed ? (
                  <span className="text-xs text-slate-400">Upgrade requis</span>
                ) : isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
                ) : (
                  <Toggle
                    checked={isActive}
                    onChange={(v) => toggleModule(moduleKey, v)}
                    disabled={!isAllowed || info.comingSoon}
                    size="sm"
                    label={isActive ? "Activé" : "Désactivé"}
                  />
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
