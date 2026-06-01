"use client";

import { useState } from "react";
import { format, parseISO } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { BookingReviewPanel } from "@/components/admin/BookingReviewPanel";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { adminApi } from "@/lib/api";
import { formatBookingActivity, formatWaitingTime } from "@/lib/booking-activity";
import { cn } from "@/lib/utils";
import type { AdminBooking } from "@/types";

export default function AdminDashboardPage() {
  const [selected, setSelected] = useState<AdminBooking | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: async () => (await adminApi.getDashboard()).data,
    refetchInterval: 60_000,
  });

  const openReview = (booking: AdminBooking) => {
    setSelected(booking);
    setPanelOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const stats = data?.stats;
  const pending = data?.pendingQueue ?? [];
  const activity = data?.recentActivity ?? [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-2xl font-bold text-tsl-forest md:text-3xl">
          Admin Dashboard
        </h1>
        <p className="mt-1 text-muted-foreground">
          Overview of bookings, revenue, and operations
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Pending Bookings"
          value={stats?.pendingBookings ?? 0}
          alert={(stats?.pendingBookings ?? 0) > 0}
        />
        <StatCard label="Today's Bookings" value={stats?.todaysBookings ?? 0} />
        <StatCard
          label="This Month Revenue"
          value={`LKR ${Number(stats?.thisMonthRevenueLKR ?? 0).toLocaleString()}`}
        />
        <StatCard label="Active Drivers" value={stats?.activeDrivers ?? 0} />
      </div>

      <Card className="p-5">
        <div className="mb-4 flex items-center gap-2">
          <h2 className="font-serif text-lg font-bold">Needs Review</h2>
          {pending.length > 0 && (
            <span className="rounded-full bg-red-500 px-2.5 py-0.5 text-xs font-bold text-white">
              {pending.length}
            </span>
          )}
        </div>

        {pending.length === 0 ? (
          <div className="flex items-center gap-3 rounded-lg bg-emerald-50 px-4 py-6 text-emerald-800">
            <CheckCircle2 className="h-8 w-8 shrink-0" />
            <p className="font-medium">All clear! No pending bookings.</p>
          </div>
        ) : (
          <ul className="divide-y">
            {pending.map((b) => (
              <li
                key={b.id}
                className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 flex-1 text-sm">
                  <p className="font-mono font-semibold">{b.bookingNumber}</p>
                  <p className="text-muted-foreground">
                    {b.customerName} · {b.fromDistrict} → {b.toDistrict}
                  </p>
                  <p className="text-muted-foreground">
                    {format(parseISO(b.startDate), "MMM d")} –{" "}
                    {format(parseISO(b.endDate), "MMM d, yyyy")} · LKR{" "}
                    {Number(b.totalPriceLKR).toLocaleString()}
                  </p>
                  <p className="text-xs text-amber-700">
                    Waiting {formatWaitingTime(b.createdAt)}
                  </p>
                </div>
                <Button
                  size="sm"
                  className="shrink-0 gap-1"
                  onClick={() => openReview(b)}
                >
                  Review
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card className="p-5">
        <h2 className="mb-4 font-serif text-lg font-bold">Recent Activity</h2>
        <ul className="space-y-3 text-sm">
          {activity.map((b) => (
            <li
              key={`${b.id}-${b.status}`}
              className="flex items-start justify-between gap-4 border-b border-dashed pb-3 last:border-0"
            >
              <span>{formatBookingActivity(b)}</span>
              <button
                type="button"
                onClick={() => openReview(b)}
                className="shrink-0 text-xs font-medium text-tsl-teal hover:underline"
              >
                View
              </button>
            </li>
          ))}
        </ul>
      </Card>

      <BookingReviewPanel
        booking={selected}
        open={panelOpen}
        onOpenChange={setPanelOpen}
        onUpdated={() => refetch()}
      />
    </div>
  );
}

function StatCard({
  label,
  value,
  alert,
}: {
  label: string;
  value: string | number;
  alert?: boolean;
}) {
  return (
    <Card
      className={cn(
        "p-4",
        alert && "border-red-200 bg-red-50/50"
      )}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p
        className={cn(
          "mt-1 text-2xl font-bold",
          alert ? "text-red-600" : "text-tsl-forest"
        )}
      >
        {value}
      </p>
    </Card>
  );
}
