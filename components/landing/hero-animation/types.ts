export interface Character {
  x: number;
  y: number;
  targetX: number;
  speed: number;
  state: "walking" | "scanning" | "celebrating" | "idle" | "entering" | "exiting";
  stateTime: number;
  hasPhone: boolean;
  headColor: string;
  bodyColor: string;
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
  sky1: "#EEF2FF",
  sky2: "#C7D2FE",
  ground: "#CBD5E1",
  sidewalk: "#E2E8F0",
  shopWall: "#EDE9FE",
  shopWallLit: "#DDD6FE",
  awning: "#4F46E5",
  awningStripe: "#4338CA",
  door: "#312E81",
  doorLight: "#6366F1",
  window: "#C7D2FE",
  windowFrame: "#6366F1",
  sign: "#4F46E5",
  signText: "#FFFFFF",
  starFull: "#F59E0B",
  starEmpty: "#D1D5DB",
  starGlow: "#FDE68A",
  scanBeam: "#60A5FA",
  particle: "#818CF8",
  gridDot: "#E2E8F0",
} as const;

export const PERSON_COLORS = [
  { head: "#FBBF24", body: "#3B82F6" },
  { head: "#F87171", body: "#10B981" },
  { head: "#A78BFA", body: "#F97316" },
  { head: "#34D399", body: "#8B5CF6" },
  { head: "#FB923C", body: "#06B6D4" },
  { head: "#F472B6", body: "#6366F1" },
];
