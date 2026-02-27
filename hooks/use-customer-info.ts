"use client";

import { useCallback } from "react";

const STORAGE_KEY = "toctoctoc_customer";

export interface CustomerInfo {
  name?: string;
  email?: string;
  phone?: string;
}

export function useCustomerInfo() {
  const load = useCallback((): CustomerInfo => {
    if (typeof window === "undefined") return {};
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
    } catch {
      return {};
    }
  }, []);

  const save = useCallback((info: CustomerInfo) => {
    if (typeof window === "undefined") return;
    const current = (() => {
      try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}"); } catch { return {}; }
    })();
    const merged: CustomerInfo = { ...current };
    if (info.name?.trim()) merged.name = info.name.trim();
    if (info.email?.trim()) merged.email = info.email.trim();
    if (info.phone?.trim()) merged.phone = info.phone.trim();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  }, []);

  return { load, save };
}
