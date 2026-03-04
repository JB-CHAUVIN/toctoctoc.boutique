import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  if (user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const businessId = searchParams.get("businessId");

  // ── Per-business stats ──
  if (businessId) {
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      include: {
        user: { select: { email: true, name: true } },
        modules: true,
      },
    });
    if (!business) return NextResponse.json({ error: "Commerce introuvable" }, { status: 404 });

    const [
      showcaseBlocksCount,
      reviewConfig,
      rewardsCount,
      loyaltyConfig,
      loyaltyStatusesCount,
      bookingConfig,
      servicesCount,
      totalBookings,
      totalReviews,
      totalLoyaltyCards,
      logs,
      logCounts,
    ] = await Promise.all([
      prisma.showcaseBlock.count({ where: { businessId, isActive: true } }),
      prisma.reviewConfig.findUnique({ where: { businessId }, select: { googleUrl: true } }),
      prisma.reward.count({ where: { reviewConfig: { businessId }, isActive: true } }),
      prisma.loyaltyConfig.findUnique({ where: { businessId }, select: { rewardName: true } }),
      prisma.loyaltyStatus.count({ where: { businessId } }),
      prisma.bookingConfig.findUnique({ where: { businessId }, select: { id: true } }),
      prisma.service.count({ where: { bookingConfig: { businessId }, isActive: true } }),
      prisma.booking.count({ where: { businessId } }),
      prisma.review.count({ where: { businessId } }),
      prisma.loyaltyCard.count({ where: { businessId } }),
      prisma.$queryRawUnsafe<Array<{ id: string; action: string; meta: string; createdAt: Date }>>(
        `SELECT id, action, meta, createdAt FROM Log WHERE JSON_EXTRACT(meta, '$.businessId') = ? ORDER BY createdAt DESC LIMIT 30`,
        businessId
      ),
      // Count each action type for this business
      prisma.$queryRawUnsafe<Array<{ action: string; count: bigint }>>(
        `SELECT action, COUNT(*) as count FROM Log WHERE JSON_EXTRACT(meta, '$.businessId') = ? GROUP BY action`,
        businessId
      ),
    ]);

    const actionCounts: Record<string, number> = {};
    for (const row of logCounts) {
      actionCounts[row.action] = Number(row.count);
    }

    return NextResponse.json({
      success: true,
      data: {
        business: {
          id: business.id,
          name: business.name,
          businessType: business.businessType,
          city: business.city,
          createdAt: business.createdAt,
          isPublished: business.isPublished,
          claimToken: business.claimToken,
          claimedAt: business.claimedAt,
          owner: business.user,
          modules: business.modules,
        },
        config: {
          showcaseBlocksActive: showcaseBlocksCount,
          reviewConfigExists: !!reviewConfig,
          googleUrlSet: !!reviewConfig?.googleUrl,
          rewardsCount,
          loyaltyConfigExists: !!loyaltyConfig,
          loyaltyRewardCustom: loyaltyConfig ? loyaltyConfig.rewardName !== "Un produit offert" : false,
          loyaltyStatusesCount,
          bookingConfigExists: !!bookingConfig,
          servicesCount,
        },
        activity: {
          pageHome: actionCounts["page.home"] ?? 0,
          pageBooking: actionCounts["page.booking"] ?? 0,
          pageReviews: actionCounts["page.reviews"] ?? 0,
          pageLoyalty: actionCounts["page.loyalty"] ?? 0,
          reviewCreated: actionCounts["review.created"] ?? 0,
          reviewGoogleClicked: actionCounts["review.google_clicked"] ?? 0,
          reviewSpin: actionCounts["review.spin"] ?? 0,
          bookingCreated: actionCounts["booking.created"] ?? 0,
          loyaltyCardCreated: actionCounts["loyalty.card_created"] ?? 0,
        },
        totals: {
          bookings: totalBookings,
          reviews: totalReviews,
          loyaltyCards: totalLoyaltyCards,
        },
        recentLogs: logs.map((l) => ({
          ...l,
          meta: typeof l.meta === "string" ? JSON.parse(l.meta) : l.meta,
        })),
      },
    });
  }

  // ── Global stats (existing) ──
  const [
    totalBusinesses,
    prospectedBusinesses,
    claimedBusinesses,
    totalUsers,
    claimPageViews,
    claimFormSubmitted,
    claimSuccessCount,
    prospects,
    recentLogs,
  ] = await Promise.all([
    prisma.business.count({ where: { deletedAt: null } }),
    prisma.business.count({ where: { claimToken: { not: null }, deletedAt: null } }),
    prisma.business.count({ where: { claimedAt: { not: null }, deletedAt: null } }),
    prisma.user.count(),
    prisma.log.count({ where: { action: "claim.page_viewed" } }),
    prisma.log.count({ where: { action: "claim.form_submitted" } }),
    prisma.log.count({ where: { action: "claim.success" } }),
    prisma.business.findMany({
      where: { claimToken: { not: null }, deletedAt: null },
      select: {
        id: true,
        name: true,
        businessType: true,
        city: true,
        claimToken: true,
        claimedAt: true,
        createdAt: true,
        user: { select: { email: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.log.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ]);

  const prospectIds = prospects.map((p) => p.id);
  const prospectLogs = await prisma.log.findMany({
    where: {
      action: { in: ["claim.page_viewed", "claim.form_submitted", "claim.success"] },
    },
    select: { action: true, meta: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  const prospectStatusMap: Record<string, { status: string; date?: Date; email?: string }> = {};
  for (const log of prospectLogs) {
    const meta = log.meta as Record<string, unknown> | null;
    const businessId2 = meta?.businessId as string | undefined;
    if (!businessId2 || !prospectIds.includes(businessId2)) continue;

    const existing = prospectStatusMap[businessId2];
    if (!existing) {
      prospectStatusMap[businessId2] = {
        status: log.action,
        date: log.createdAt,
        email: (meta?.email as string) || undefined,
      };
    } else {
      const priority: Record<string, number> = {
        "claim.success": 3,
        "claim.form_submitted": 2,
        "claim.page_viewed": 1,
      };
      if ((priority[log.action] ?? 0) > (priority[existing.status] ?? 0)) {
        prospectStatusMap[businessId2] = {
          status: log.action,
          date: log.createdAt,
          email: (meta?.email as string) || existing.email,
        };
      }
    }
  }

  const conversionRate = prospectedBusinesses > 0
    ? Math.round((claimedBusinesses / prospectedBusinesses) * 100)
    : 0;

  return NextResponse.json({
    success: true,
    data: {
      kpis: {
        totalBusinesses,
        prospectedBusinesses,
        claimedBusinesses,
        conversionRate,
        totalUsers,
        claimPageViews,
      },
      funnel: {
        prospected: prospectedBusinesses,
        pageViewed: claimPageViews,
        formSubmitted: claimFormSubmitted,
        claimSuccess: claimSuccessCount,
      },
      prospects: prospects.map((p) => ({
        ...p,
        logStatus: prospectStatusMap[p.id] ?? null,
      })),
      recentLogs,
    },
  });
}
