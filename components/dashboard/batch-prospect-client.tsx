"use client";

import { useState, useEffect, useCallback } from "react";
import { BusinessSelector } from "./batch-prospect/business-selector";
import { ConfigureAndExport } from "./batch-prospect/configure-export";
import type { BusinessData, BusinessConfig } from "./batch-prospect/types";

const STORAGE_KEY = "batch-prospect-state";

interface PersistedState {
  step: "select" | "configure";
  selectedIds: string[];
  configs: Record<string, BusinessConfig>;
}

function loadState(): PersistedState | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PersistedState;
  } catch {
    return null;
  }
}

function saveState(state: PersistedState) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch { /* quota exceeded — ignore */ }
}

interface Props {
  businesses: BusinessData[];
  appUrl: string;
}

export function BatchProspectClient({ businesses, appUrl }: Props) {
  const [ready, setReady] = useState(false);
  const [step, setStep] = useState<"select" | "configure">("select");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [configs, setConfigs] = useState<Record<string, BusinessConfig>>({});

  // Restore from sessionStorage on mount
  useEffect(() => {
    const saved = loadState();
    if (saved) {
      // Only restore IDs that still exist in the business list
      const validIds = new Set(businesses.map((b) => b.id));
      const restoredIds = saved.selectedIds.filter((id) => validIds.has(id));
      if (restoredIds.length > 0) {
        setSelected(new Set(restoredIds));
        setConfigs(saved.configs);
        setStep(saved.step);
      }
    }
    setReady(true);
  }, [businesses]);

  // Persist on every change
  const persist = useCallback(() => {
    saveState({
      step,
      selectedIds: Array.from(selected),
      configs,
    });
  }, [step, selected, configs]);

  useEffect(() => {
    if (ready) persist();
  }, [ready, persist]);

  function handleToggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleSelectAll() {
    if (selected.size === businesses.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(businesses.map((b) => b.id)));
    }
  }

  function handleContinue() {
    const newConfigs: Record<string, BusinessConfig> = {};
    selected.forEach((id) => {
      const biz = businesses.find((b) => b.id === id);
      const hasLogo = !!biz?.logoUrl;
      newConfigs[id] = configs[id] ?? {
        tractTheme: hasLogo ? "logo" : "gradient",
        supportTheme: hasLogo ? "logo" : "gradient",
        showAvatar: hasLogo,
        cardVariant: "nfc",
      };
    });
    setConfigs(newConfigs);
    setStep("configure");
  }

  // Don't render until state is restored to avoid flash
  if (!ready) return null;

  const selectedBusinesses = businesses.filter((b) => selected.has(b.id));

  if (step === "configure") {
    return (
      <ConfigureAndExport
        businesses={selectedBusinesses}
        configs={configs}
        setConfigs={setConfigs}
        appUrl={appUrl}
        onBack={() => setStep("select")}
      />
    );
  }

  return (
    <BusinessSelector
      businesses={businesses}
      selected={selected}
      onToggle={handleToggle}
      onSelectAll={handleSelectAll}
      onContinue={handleContinue}
    />
  );
}
