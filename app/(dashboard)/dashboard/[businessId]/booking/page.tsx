import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatsCard } from "@/components/dashboard/stats-card";
import { BookingManager } from "@/components/booking/booking-manager";
import { Settings, Calendar } from "lucide-react";

export const metadata = { title: "Réservations" };

export default async function BookingDashboardPage({ params }: { params: { businessId: string } }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const business = await prisma.business.findFirst({
    where: { id: params.businessId, userId: session.user.id },
    include: {
      bookingConfig: { include: { services: true } },
      bookings: {
        include: { service: true },
        orderBy: { date: "desc" },
      },
      modules: true,
    },
  });

  if (!business) notFound();

  const bookingModule = business.modules.find((m) => m.module === "BOOKING");
  if (!bookingModule?.isActive) {
    return (
      <div className="flex flex-col items-center justify-center py-20 p-8">
        <Calendar className="mb-4 h-12 w-12 text-slate-300" />
        <h2 className="text-lg font-semibold text-slate-700">Module réservations non activé</h2>
        <p className="mt-2 text-sm text-slate-400">Activez ce module depuis la page Modules.</p>
        <Link href={`/dashboard/${params.businessId}/modules`}>
          <Button className="mt-4">Activer le module</Button>
        </Link>
      </div>
    );
  }

  const pending = business.bookings.filter((b) => b.status === "PENDING").length;
  const confirmed = business.bookings.filter((b) => b.status === "CONFIRMED").length;
  const completed = business.bookings.filter((b) => b.status === "COMPLETED").length;
  const cancelled = business.bookings.filter((b) => b.status === "CANCELLED").length;

  // Serialize for client component (dates → strings)
  const serializedBookings = business.bookings.map((b) => ({
    ...b,
    date: b.date.toISOString(),
    endDate: b.endDate?.toISOString() ?? null,
    createdAt: b.createdAt.toISOString(),
    updatedAt: b.updatedAt.toISOString(),
  }));

  const services = (business.bookingConfig?.services ?? []).map((s) => ({
    id: s.id,
    name: s.name,
    duration: s.duration,
    price: s.price,
    isActive: s.isActive,
  }));

  return (
    <div className="p-4 sm:p-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Réservations</h1>
          <p className="mt-1 text-sm text-slate-500">Gérez vos rendez-vous et prestations</p>
        </div>
        <div className="flex gap-3">
          <Link href={`/${business.slug}/booking`} target="_blank">
            <Button variant="outline" size="sm">Page de réservation</Button>
          </Link>
          <Link href={`/dashboard/${params.businessId}/booking/settings`}>
            <Button variant="outline" size="sm" leftIcon={<Settings className="h-4 w-4" />}>
              Configurer
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatsCard label="En attente" value={pending} icon="🕐" color="amber" />
        <StatsCard label="Confirmées" value={confirmed} icon="✅" color="emerald" />
        <StatsCard label="Terminées" value={completed} icon="🏁" color="indigo" />
        <StatsCard label="Annulées" value={cancelled} icon="❌" color="rose" />
      </div>

      {/* Booking manager with full CRUD */}
      <Card padding="none">
        <CardHeader className="px-6 pt-6">
          <CardTitle>Toutes les réservations ({business.bookings.length})</CardTitle>
        </CardHeader>
        <div className="p-6 pt-4">
          <BookingManager
            businessId={params.businessId}
            initialBookings={serializedBookings as Parameters<typeof BookingManager>[0]["initialBookings"]}
            services={services}
          />
        </div>
      </Card>
    </div>
  );
}
