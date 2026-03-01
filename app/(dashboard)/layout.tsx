import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/dashboard/sidebar";
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
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
