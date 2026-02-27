import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/dashboard/sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const businesses = await prisma.business.findMany({
    where: { userId: session.user.id, deletedAt: null },
    select: {
      id: true, name: true, slug: true, primaryColor: true,
      modules: { select: { module: true, isActive: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar businesses={businesses} />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
