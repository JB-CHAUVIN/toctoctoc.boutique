"use client";

import { useState } from "react";
import { BusinessSelector } from "./batch-prospect/business-selector";
import { ConfigureAndExport } from "./batch-prospect/configure-export";
import type { BusinessData, BusinessConfig } from "./batch-prospect/types";

interface Props {
  businesses: BusinessData[];
  appUrl: string;
}

export function BatchProspectClient({ businesses, appUrl }: Props) {
  const [step, setStep] = useState<"select" | "configure">("select");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [configs, setConfigs] = useState<Record<string, BusinessConfig>>({});

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
      newConfigs[id] = configs[id] ?? {
        tractTheme: "gradient",
        supportTheme: "gradient",
        showAvatar: true,
      };
    });
    setConfigs(newConfigs);
    setStep("configure");
  }

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
