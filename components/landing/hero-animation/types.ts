export interface Character {
  x: number;
  y: number;
  targetX: number;
  speed: number;
  state: "walking" | "scanning" | "celebrating" | "idle" | "entering" | "exiting";
  stateTime: number;
  hasPhone: boolean;
  skinColor: string;
  shirtColor: string;
  pantsColor: string;
  direction: 1 | -1;
  scale: number;
  scanned: boolean;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export interface FloatingText {
  x: number;
  y: number;
  text: string;
  life: number;
  maxLife: number;
  color: string;
  fontSize: number;
}

export const SCENE = {
  W: 1400,
  H: 650,
  GROUND_Y: 480,
  SHOP_X: 510,
  SHOP_W: 336,
  SHOP_TOP: 296,
  QR_X: 500,
  QR_Y: 440,
  STAR_Y: 210,
  CYCLE_DURATION: 20,
} as const;

export const COLORS = {
  sky1: "#F8FAFC",
  sky2: "#EEF2FF",
  ground: "#E2E8F0",
  sidewalk: "#F1F5F9",
  shopWall: "#FAFAF9",
  shopWallLit: "#FEFCE8",
  awning: "#4F46E5",
  awningDark: "#3730A3",
  door: "#1E1B4B",
  doorLight: "#4338CA",
  window: "#DBEAFE",
  windowFrame: "#94A3B8",
  sign: "#1E293B",
  signText: "#FFFFFF",
  starFull: "#F59E0B",
  starEmpty: "#E2E8F0",
  starGlow: "#FDE68A",
  scanBeam: "#818CF8",
  gridDot: "#E2E8F0",
} as const;

// Muted, professional person colors (skin + clothing)
export const PERSON_STYLES = [
  { skin: "#F5D0B0", shirt: "#4F46E5", pants: "#1E293B" },
  { skin: "#D4A574", shirt: "#0F766E", pants: "#334155" },
  { skin: "#F5D0B0", shirt: "#BE185D", pants: "#1E293B" },
  { skin: "#C68642", shirt: "#1D4ED8", pants: "#374151" },
  { skin: "#F5D0B0", shirt: "#7C3AED", pants: "#1E293B" },
  { skin: "#D4A574", shirt: "#059669", pants: "#334155" },
  { skin: "#F5D0B0", shirt: "#DC2626", pants: "#374151" },
  { skin: "#C68642", shirt: "#2563EB", pants: "#1E293B" },
];
