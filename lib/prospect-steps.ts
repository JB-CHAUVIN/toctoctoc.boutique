import type { PrismaClient } from "@prisma/client";

export const PROSPECT_STEPS = [
  { key: "created", label: "Cree" },
  { key: "contacted", label: "Contacte" },
  { key: "page_viewed", label: "Page vue" },
  { key: "claimed", label: "Inscrit" },
  { key: "demo_viewed", label: "Demo vue" },
  { key: "configured", label: "Configure" },
  { key: "product_used", label: "Produit utilise" },
] as const;

const TRACKED_ACTIONS = ["claim.page_viewed", "walkthrough.completed", "dashboard.configured"] as const;

interface ProspectStepInput {
  hasClaimToken: boolean;
  prospectedAt: Date | string | null;
  claimedAt: Date | string | null;
  logActions: Set<string>;
  hasProductUsed: boolean;
}

export function computeProspectStep(input: ProspectStepInput): number {
  let step = 0; // created (has claimToken)
  if (input.prospectedAt) step = 1; // contacted
  if (input.logActions.has("claim.page_viewed")) step = 2; // page viewed
  if (input.claimedAt) step = 3; // claimed
  if (input.logActions.has("walkthrough.completed")) step = 4; // demo viewed
  // Steps 5-6 only count after the prospect has claimed
  if (input.claimedAt && input.logActions.has("dashboard.configured")) step = 5; // configured
  if (input.claimedAt && input.hasProductUsed) step = 6; // product used
  return step;
}

interface ProspectData {
  logActions: Set<string>;
  hasProductUsed: boolean;
}

export async function batchGetProspectData(
  businessIds: string[],
  prisma: PrismaClient,
): Promise<Record<string, ProspectData>> {
  if (businessIds.length === 0) return {};

  const result: Record<string, ProspectData> = {};
  for (const id of businessIds) {
    result[id] = { logActions: new Set(), hasProductUsed: false };
  }

  // 1. Log actions
  const logs = await prisma.log.findMany({
    where: { action: { in: [...TRACKED_ACTIONS] } },
    select: { action: true, meta: true },
  });
  for (const log of logs) {
    const meta = log.meta as Record<string, unknown> | null;
    const businessId = meta?.businessId as string | undefined;
    if (businessId && result[businessId]) {
      result[businessId].logActions.add(log.action);
    }
  }

  // 2. Product used: has at least 1 review OR 1 loyalty card with stamps
  const [reviewCounts, stampedCards] = await Promise.all([
    prisma.review.groupBy({
      by: ["businessId"],
      where: { businessId: { in: businessIds } },
      _count: true,
    }),
    prisma.loyaltyCard.groupBy({
      by: ["businessId"],
      where: { businessId: { in: businessIds }, totalStamps: { gt: 0 } },
      _count: true,
    }),
  ]);
  for (const r of reviewCounts) {
    if (r._count > 0 && result[r.businessId]) {
      result[r.businessId].hasProductUsed = true;
    }
  }
  for (const c of stampedCards) {
    if (c._count > 0 && result[c.businessId]) {
      result[c.businessId].hasProductUsed = true;
    }
  }

  return result;
}
