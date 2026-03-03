import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** Fusionne les classes Tailwind sans conflits */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Génère un slug URL-safe depuis un nom */
export function slugify(text: string): string {
  return text
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // supprime les accents
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

/** Formate un prix en euros */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(price);
}

/** Formate une durée en minutes vers "Xh Xmin" */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

/** Formate une date en français */
export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "long",
  }).format(new Date(date));
}

/** Formate une date + heure en français */
export function formatDateTime(date: Date | string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(date));
}

/** Génère un code de récompense unique */
export function generateRewardCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

/** Obtient les initiales d'un nom */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/** Sélectionne une récompense en fonction des probabilités */
export function pickRewardByProbability<T extends { probability: number; isActive: boolean }>(
  rewards: T[]
): T | null {
  const activeRewards = rewards.filter((r) => r.isActive);
  if (activeRewards.length === 0) return null;

  const rand = Math.random();
  let cumulative = 0;

  for (const reward of activeRewards) {
    cumulative += reward.probability;
    if (rand <= cumulative) return reward;
  }

  // fallback sur le dernier reward actif
  return activeRewards[activeRewards.length - 1];
}

/** Vérifie si une URL est valide */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/** Truncate un texte */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + "...";
}

// ── Color helpers ────────────────────────────────────────────────────────────

/** Hex → { r, g, b } */
export function parseHex(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace("#", "");
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

/** Luminance relative (0 = noir, 1 = blanc) */
export function luminance(hex: string): number {
  const { r, g, b } = parseHex(hex);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

/** Retourne "#ffffff" ou "#1e293b" selon le contraste optimal sur un fond donné */
export function contrastColor(bgHex: string): string {
  try {
    return luminance(bgHex) > 0.55 ? "#1e293b" : "#ffffff";
  } catch {
    return "#ffffff";
  }
}

/** Hex → "r, g, b" pour usage dans rgba() */
export function hexToRgb(hex: string): string {
  const { r, g, b } = parseHex(hex);
  return `${r}, ${g}, ${b}`;
}

/** Couleur de fond opposée pour un logo (fond sombre si logo clair, fond clair si logo sombre) */
export function logoBackgroundColor(dominantHex: string): string {
  return luminance(dominantHex) > 0.55 ? "#1e293b" : "#f8fafc";
}

/** Assombrit une couleur hex d'un facteur (0-1, ex: 0.6 = 60% de la luminosité) */
export function darken(hex: string, factor: number): string {
  const { r, g, b } = parseHex(hex);
  const f = Math.max(0, Math.min(1, factor));
  return (
    "#" +
    [Math.round(r * f), Math.round(g * f), Math.round(b * f)]
      .map((v) => v.toString(16).padStart(2, "0"))
      .join("")
  );
}

/** Retourne une secondaryColor garantie sombre pour les gradients (cards, etc.) */
export function safeGradientEnd(primaryHex: string, secondaryHex: string): string {
  return luminance(secondaryHex) > 0.45 ? darken(primaryHex, 0.55) : secondaryHex;
}
