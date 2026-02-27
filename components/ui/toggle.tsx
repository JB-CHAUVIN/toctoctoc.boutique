"use client";

import { cn } from "@/lib/utils";

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  size?: "sm" | "md";
}

export function Toggle({ checked, onChange, label, description, disabled, size = "md" }: ToggleProps) {
  const trackSize = size === "sm" ? "h-5 w-9" : "h-6 w-11";
  const thumbSize = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";
  const thumbTranslate = size === "sm" ? "translate-x-4" : "translate-x-5";
  const thumbOff = size === "sm" ? "translate-x-0.5" : "translate-x-1";

  return (
    <label className={cn("flex cursor-pointer items-start gap-3", disabled && "cursor-not-allowed opacity-60")}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative mt-0.5 flex flex-shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2",
          trackSize,
          checked ? "bg-indigo-600" : "bg-slate-200"
        )}
      >
        <span
          className={cn(
            "inline-block rounded-full bg-white shadow-sm transition-transform",
            thumbSize,
            checked ? thumbTranslate : thumbOff
          )}
        />
      </button>
      {(label || description) && (
        <div>
          {label && <div className="text-sm font-medium text-slate-700">{label}</div>}
          {description && <div className="text-xs text-slate-500">{description}</div>}
        </div>
      )}
    </label>
  );
}
