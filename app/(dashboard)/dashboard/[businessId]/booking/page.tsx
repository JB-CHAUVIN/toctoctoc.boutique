import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookingStatusWidget } from "@/components/booking/booking-status-widget";
import { formatDateTime, formatPrice, formatDuration } from "@/lib/utils";
import { BOOKING_STATUS_LABELS } from "@/lib/constants";
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
        take: 20,
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

  const bookingsByStatus = {
    PENDING: business.bookings.filter((b) => b.status === "PENDING"),
    CONFIRMED: business.bookings.filter((b) => b.status === "CONFIRMED"),
    COMPLETED: business.bookings.filter((b) => b.status === "COMPLETED"),
    CANCELLED: business.bookings.filter((b) => b.status === "CANCELLED"),
  };

  return (
    <div className="p-8">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Réservations</h1>
          <p className="mt-1 text-sm text-slate-500">Gérez vos rendez-vous et prestations</p>
        </div>
        <div className="flex gap-3">
          <Link href={`/${business.slug}/booking`} target="_blank">
            <Button variant="outline" size="sm">Voir page de réservation</Button>
          </Link>
          <Link href={`/dashboard/${params.businessId}/booking/settings`}>
            <Button variant="outline" size="sm" leftIcon={<Settings className="h-4 w-4" />}>
              Configurer
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats rapides */}
      <div className="mb-6 grid grid-cols-4 gap-4">
        {Object.entries(bookingsByStatus).map(([status, bookings]) => {
          const info = BOOKING_STATUS_LABELS[status];
          return (
            <Card key={status} padding="sm" className="text-center">
              <div className="text-2xl font-bold text-slate-900">{bookings.length}</div>
              <div className="text-xs text-slate-500">{info.label}</div>
            </Card>
          );
        })}
      </div>

      {/* Services configurés */}
      {business.bookingConfig?.services && business.bookingConfig.services.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Services disponibles</CardTitle>
          </CardHeader>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {business.bookingConfig.services.filter((s) => s.isActive).map((service) => (
              <div key={service.id} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <div className="font-medium text-slate-800">{service.name}</div>
                <div className="mt-1 flex gap-3 text-xs text-slate-500">
                  <span>{formatDuration(service.duration)}</span>
                  {service.price !== null && <span>·</span>}
                  {service.price !== null && <span>{formatPrice(service.price)}</span>}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Liste des réservations */}
      <Card padding="none">
        <CardHeader className="px-6 pt-6">
          <CardTitle>Toutes les réservations</CardTitle>
        </CardHeader>
        {business.bookings.length === 0 ? (
          <div className="px-6 pb-6 text-center text-sm text-slate-400">
            Aucune réservation pour le moment
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-medium text-slate-500">
                  <th className="px-6 py-3">Client</th>
                  <th className="px-6 py-3">Service</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Statut</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {business.bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-800">{booking.customerName}</div>
                      <div className="text-xs text-slate-400">{booking.customerEmail}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{booking.service?.name ?? "—"}</td>
                    <td className="px-6 py-4 text-slate-600 whitespace-nowrap">
                      {formatDateTime(booking.date)}
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant={
                          booking.status === "CONFIRMED" ? "success" :
                          booking.status === "CANCELLED" ? "danger" :
                          booking.status === "PENDING" ? "warning" : "default"
                        }
                      >
                        {BOOKING_STATUS_LABELS[booking.status].label}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <BookingStatusWidget bookingId={booking.id} currentStatus={booking.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
