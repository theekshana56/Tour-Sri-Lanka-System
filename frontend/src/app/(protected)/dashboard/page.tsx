"use client";

import type { ComponentType } from "react";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import { Archive, Calendar, CheckCircle, Clock } from "lucide-react";
import { StatusBadge } from "@/components/common/StatusBadge";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { Card, CardContent } from "@/components/ui/card";
import { computeBookingStats, useMyBookings } from "@/hooks/useMyBookings";

export default function DashboardPage() {
  const { data, isLoading } = useMyBookings({ size: 100 });
  const bookings = data?.content ?? [];
  const stats = computeBookingStats(bookings);
  const recent = bookings.slice(0, 3);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-2xl font-bold text-tsl-forest md:text-3xl">
          Dashboard
        </h1>
        <p className="mt-1 text-muted-foreground">
          Overview of your trips and bookings
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard
          label="Total Bookings"
          value={stats.total}
          icon={Calendar}
          className="border-blue-200 bg-blue-50 text-blue-900"
        />
        <StatCard
          label="Pending"
          value={stats.pending}
          icon={Clock}
          className="border-amber-200 bg-amber-50 text-amber-900"
        />
        <StatCard
          label="Confirmed"
          value={stats.confirmed}
          icon={CheckCircle}
          className="border-emerald-200 bg-emerald-50 text-emerald-900"
        />
        <StatCard
          label="Completed"
          value={stats.completed}
          icon={Archive}
          className="border-gray-200 bg-gray-50 text-gray-800"
        />
      </div>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-serif text-lg font-semibold">Recent Bookings</h2>
          <Link
            href="/dashboard/bookings"
            className="text-sm text-tsl-teal hover:underline"
          >
            View all →
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : recent.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              No bookings yet. Start planning your Sri Lanka adventure!
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {recent.map((booking) => {
              const start = parseISO(booking.startDate);
              const end = parseISO(booking.endDate);
              return (
                <Card key={booking.id} className="border-tsl-teal/10">
                  <CardContent className="space-y-2 p-4">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-sm font-bold">
                        {booking.bookingNumber}
                      </span>
                      <StatusBadge status={booking.status} />
                    </div>
                    <p className="text-sm font-medium">
                      {booking.fromDistrict} → {booking.toDistrict}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(start, "MMM d")} – {format(end, "MMM d, yyyy")}
                    </p>
                    <p className="text-sm font-semibold text-tsl-teal">
                      {booking.preferredCurrency}{" "}
                      {Number(booking.totalPriceForeign).toFixed(2)}
                    </p>
                    <Link
                      href="/dashboard/bookings"
                      className="inline-flex h-8 w-full items-center justify-center rounded-lg border border-input bg-background text-xs font-medium hover:bg-muted"
                    >
                      View Details
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      <Card className="border-0 bg-emerald-600 text-white">
        <CardContent className="flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold">Ready for your next adventure?</h3>
            <p className="mt-1 text-sm text-emerald-100">
              Explore destinations and build your perfect itinerary.
            </p>
          </div>
          <Link
            href="/plan"
            className="inline-flex h-10 items-center justify-center rounded-lg bg-white px-5 text-sm font-semibold text-emerald-700 hover:bg-emerald-50"
          >
            Plan a New Trip →
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  className,
}: {
  label: string;
  value: number;
  icon: ComponentType<{ className?: string }>;
  className: string;
}) {
  return (
    <Card className={className}>
      <CardContent className="flex items-center gap-3 p-4">
        <Icon className="h-8 w-8 shrink-0 opacity-80" />
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs font-medium opacity-80">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
