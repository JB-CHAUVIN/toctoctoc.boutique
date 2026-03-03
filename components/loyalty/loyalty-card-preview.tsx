"use client";

import { cn } from "@/lib/utils";
import type { LoyaltyConfig } from "@prisma/client";

interface Props {
  config: LoyaltyConfig;
  businessName: string;
  customerName?: string;
  totalStamps?: number;
  compact?: boolean;
  logoUrl?: string | null;
  logoBackground?: string | null;
}

export function LoyaltyCardPreview({
  config,
  businessName,
  customerName = "Votre prénom",
  totalStamps = 0,
  compact = false,
  logoUrl,
  logoBackground,
}: Props) {
  const stampsRequired = config.stampsRequired;
  const activeStamps = totalStamps % stampsRequired;

  return (
    <div
      className={cn(
        "loyalty-card relative overflow-hidden",
        compact ? "max-w-xs" : "max-w-md"
      )}
      style={{
        background: `linear-gradient(135deg, ${config.cardColor} 0%, ${config.cardColor}dd 100%)`,
      }}
    >
      {/* Décoration de fond */}
      <div
        className="absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-20"
        style={{ backgroundColor: config.stampColor }}
      />
      <div
        className="absolute -bottom-4 -left-4 h-20 w-20 rounded-full opacity-10"
        style={{ backgroundColor: config.stampColor }}
      />

      {/* Header */}
      <div className="relative z-10 mb-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          {logoUrl && (
            <div
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl"
              style={{ backgroundColor: logoBackground ?? "rgba(255,255,255,0.2)" }}
            >
              <img src={logoUrl} alt={businessName} className="h-10 w-10 object-contain p-1" />
            </div>
          )}
          <div>
            <div className="text-xs font-medium uppercase tracking-wider opacity-70" style={{ color: config.cardTextColor }}>
              Carte de fidélité
            </div>
            <div className="text-lg font-bold" style={{ color: config.cardTextColor }}>
              {businessName}
            </div>
          </div>
        </div>
        <div className="text-2xl">{config.stampIcon}</div>
      </div>

      {/* Grille de tampons */}
      <div className="relative z-10 mb-4">
        <div
          className="grid gap-2"
          style={{ gridTemplateColumns: `repeat(${Math.min(stampsRequired, 5)}, 1fr)` }}
        >
          {Array.from({ length: stampsRequired }).map((_, i) => {
            const isStamped = i < activeStamps;
            return (
              <div
                key={i}
                className={cn(
                  "flex aspect-square items-center justify-center rounded-lg text-sm transition-all",
                  isStamped ? "opacity-100" : "opacity-30"
                )}
                style={{
                  backgroundColor: isStamped ? config.stampColor : "transparent",
                  border: `2px solid ${isStamped ? config.stampColor : config.cardTextColor}`,
                }}
              >
                {isStamped && <span className="text-white text-xs">{config.stampIcon}</span>}
              </div>
            );
          })}
        </div>
        <div className="mt-2 text-xs opacity-70" style={{ color: config.cardTextColor }}>
          {activeStamps}/{stampsRequired} tampons — Récompense : {config.rewardName}
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 border-t border-white/20 pt-3">
        <div className="text-sm font-medium" style={{ color: config.cardTextColor }}>
          {customerName}
        </div>
      </div>
    </div>
  );
}
