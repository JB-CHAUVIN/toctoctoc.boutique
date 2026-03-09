"use client";

// ── Inline SVG icons for print cards ────────────────────────────────────────
// Extracted to keep PrintCardGoogle and PrintCard under 300 lines.

/** Google "G" logo (4-color official palette) */
export function GoogleLogo({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59a14.5 14.5 0 0 1 0-9.18l-7.98-6.19a24.09 24.09 0 0 0 0 21.56l7.98-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
      <path fill="none" d="M0 0h48v48H0z" />
    </svg>
  );
}

/** Star badge icon for loyalty cards */
export function LoyaltyIcon({ size = 40, color = "#fff" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="22" fill={color} opacity={0.15} />
      <path
        d="M24 10l3.5 7.1 7.8 1.1-5.65 5.5 1.33 7.8L24 27.7l-6.98 3.8 1.33-7.8-5.65-5.5 7.8-1.1L24 10z"
        fill={color}
      />
    </svg>
  );
}

/** Smooth curve to separate top/bottom sections */
export function CurveSeparator({ width, color }: { width: number; color: string }) {
  const h = Math.round(width * 0.08);
  return (
    <svg
      width={width}
      height={h}
      viewBox={`0 0 ${width} ${h}`}
      preserveAspectRatio="none"
      style={{ display: "block", flexShrink: 0 }}
    >
      <path
        d={`M0,0 C${width * 0.3},${width * 0.07} ${width * 0.7},${width * 0.02} ${width},${width * 0.06} L${width},${h} L0,${h} Z`}
        fill={color}
      />
    </svg>
  );
}

/** Compact NFC phone illustration for bottom section */
export function NfcIllustrationCompact({ size = 44 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" fill="none">
      <rect x="12" y="2" width="20" height="28" rx="4" fill="#e2e8f0" />
      <rect x="14.5" y="5" width="15" height="19" rx="1.5" fill="#f1f5f9" />
      <rect x="18" y="25" width="8" height="1.2" rx="0.6" fill="#cbd5e1" />
      <line x1="22" y1="31" x2="22" y2="35" stroke="#94a3b8" strokeWidth="1.2" strokeLinecap="round" />
      <polyline points="19.5,33.5 22,36 24.5,33.5" stroke="#94a3b8" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M16 39 Q22 37 28 39" stroke="#cbd5e1" strokeWidth="0.8" strokeLinecap="round" />
      <path d="M18 40.5 Q22 39 26 40.5" stroke="#94a3b8" strokeWidth="0.8" strokeLinecap="round" />
      <rect x="8" y="41" width="28" height="3" rx="1.5" fill="#e2e8f0" />
    </svg>
  );
}
