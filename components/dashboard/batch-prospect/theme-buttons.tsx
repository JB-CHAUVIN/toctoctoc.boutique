"use client";

import { PRINT_THEMES, type PrintThemeId } from "@/lib/constants";

interface ThemeButtonsProps {
  value: PrintThemeId;
  onChange: (t: PrintThemeId) => void;
  hasLogo?: boolean;
}

export function ThemeButtons({
  value,
  onChange,
  hasLogo = false,
}: ThemeButtonsProps) {
  return (
    <div className="flex items-center gap-0.5 rounded-lg bg-slate-100 p-0.5">
      {PRINT_THEMES.map((t) => {
        const disabled = t.requiresLogo && !hasLogo;
        return (
          <button
            key={t.id}
            onClick={() => !disabled && onChange(t.id)}
            disabled={disabled}
            title={
              disabled
                ? "Nécessite un logo pour le commerce"
                : t.description
            }
            className={`rounded-md px-2 py-1 text-xs font-medium transition-all ${
              value === t.id
                ? "bg-white text-violet-700 shadow-sm"
                : disabled
                  ? "cursor-not-allowed text-slate-300"
                  : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {t.name}
          </button>
        );
      })}
    </div>
  );
}
