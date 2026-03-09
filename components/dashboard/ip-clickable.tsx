"use client";

import { useState, useCallback } from "react";
import { IpActionModal } from "./ip-action-modal";

interface IpClickableProps {
  ip: string;
  excludedIps: string[];
}

export function IpClickable({ ip, excludedIps: initialExcluded }: IpClickableProps) {
  const [excluded, setExcluded] = useState(initialExcluded);

  const handleExclude = useCallback((newIp: string) => {
    setExcluded((prev) => [...prev, newIp]);
  }, []);

  return (
    <IpActionModal
      ip={ip}
      isExcluded={excluded.includes(ip)}
      onExclude={handleExclude}
    />
  );
}
