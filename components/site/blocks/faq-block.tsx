"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FaqContent } from "./types";

interface FaqBlockProps {
  content: FaqContent;
  business: {
    primaryColor: string;
  };
}

export function FaqBlock({ content, business }: FaqBlockProps) {
  const [open, setOpen] = useState<number | null>(null);
  const items = content.items ?? [];
  if (items.length === 0) return null;

  const title = content.title || "Questions fréquentes";

  return (
    <section className="mx-auto max-w-6xl px-6 py-20 md:py-28">
      <div className="grid gap-12 md:grid-cols-[1fr_2fr] md:gap-20">
        <div>
          <span
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: business.primaryColor }}
          >
            {title}
          </span>
          <div className="mt-4 h-px w-12" style={{ backgroundColor: business.primaryColor }} />
        </div>

        <div className="divide-y divide-slate-100">
          {items.map((item, i) => (
            <div key={i}>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="flex w-full items-start justify-between gap-4 py-5 text-left"
              >
                <span className="text-base font-semibold text-slate-900">{item.q}</span>
                <ChevronDown
                  className={cn(
                    "mt-0.5 h-5 w-5 flex-shrink-0 text-slate-400 transition-transform",
                    open === i && "rotate-180"
                  )}
                />
              </button>
              {open === i && (
                <div className="pb-5 pr-8 text-sm leading-relaxed text-slate-500">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
