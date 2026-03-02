import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/dashboard/sidebar";
import { MobileMenuButton } from "@/components/dashboard/mobile-menu-button";
import Image from "next/image";
import { PLAN_LIMITS } from "@/lib/constants";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, subscription: { select: { plan: true } } },
  });

  const isAdmin = user?.role === "ADMIN";
  const plan = user?.subscription?.plan ?? "FREE";
  const maxBusinesses = isAdmin ? -1 : PLAN_LIMITS[plan].maxBusinesses;
  const planLabel = PLAN_LIMITS[plan].label;

  const businesses = await prisma.business.findMany({
    where: isAdmin ? { deletedAt: null } : { userId: session.user.id, deletedAt: null },
    select: {
      id: true, name: true, slug: true, primaryColor: true,
      modules: { select: { module: true, isActive: true } },
      user: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar
        businesses={businesses}
        maxBusinesses={maxBusinesses}
        businessCount={businesses.length}
        planLabel={planLabel}
        isAdmin={isAdmin}
      />
      <main className="flex flex-1 flex-col overflow-hidden">
        {/* Topbar mobile */}
        <div className="flex h-14 flex-shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-4 md:hidden">
          <MobileMenuButton />
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-slate-900">
              <Image src="/logo.png" alt="TocTocToc.boutique" width={20} height={20} priority />
            </div>
            <span className="font-brand text-sm font-bold text-slate-900">TocTocToc.boutique</span>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
