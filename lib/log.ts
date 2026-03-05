import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import type { LogLevel } from "@prisma/client";

function getGeo(h: Headers): { ip?: string; country?: string; city?: string } {
  const ip =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    undefined;
  const country = h.get("cf-ipcountry") || h.get("x-vercel-ip-country") || undefined;
  const city = h.get("cf-ipcity") || h.get("x-vercel-ip-city") || undefined;
  return { ip, country, city };
}

/**
 * Fire-and-forget log avec IP + géo automatiques.
 * Fonctionne dans les Server Components (utilise `headers()`) et les API routes (passer `req`).
 */
export function logAction(
  action: string,
  opts: {
    level?: LogLevel;
    userId?: string;
    meta?: Record<string, unknown>;
    req?: Request;
  } = {},
) {
  let geo: { ip?: string; country?: string; city?: string } = {};
  try {
    const h = opts.req ? opts.req.headers : headers();
    geo = getGeo(h instanceof Headers ? h : new Headers());
  } catch {
    // headers() peut échouer hors d'un contexte request (ex: génération statique)
  }

  prisma.log.create({
    data: {
      action,
      level: opts.level ?? "INFO",
      userId: opts.userId,
      meta: { ...geo, ...opts.meta },
    },
  }).catch(() => {});
}
