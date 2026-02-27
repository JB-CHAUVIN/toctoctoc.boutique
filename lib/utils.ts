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
