"use client";

import { PRINT_THEMES, type PrintThemeId } from "@/lib/constants";

interface ThemeButtonsProps {
  value: PrintThemeId;
  onChange: (t: PrintThemeId) => void;
  hasBrandStyle?: boolean;
}

export function ThemeButtons({
  value,
  onChange,
  hasBrandStyle = true,
}: ThemeButtonsProps) {
  return (
    <div className="flex items-center gap-0.5 rounded-lg bg-slate-100 p-0.5">
      {PRINT_THEMES.map((t) => {
        const disabled = t.requiresBrandStyle && !hasBrandStyle;
        return (
          <button
            key={t.id}
            onClick={() => !disabled && onChange(t.id)}
            disabled={disabled}
            title={
              disabled
                ? "Necessite l'extraction des couleurs du site web"
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
