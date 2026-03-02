"use client";

import { Menu } from "lucide-react";

export function MobileMenuButton() {
  return (
    <button
      onClick={() => window.dispatchEvent(new CustomEvent("sidebar:open"))}
      className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white shadow-sm"
      aria-label="Ouvrir le menu"
    >
      <Menu className="h-4 w-4" />
    </button>
  );
}
