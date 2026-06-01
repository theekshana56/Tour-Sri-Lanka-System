"use client";

import { useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { BookingReviewPanel } from "@/components/admin/BookingReviewPanel";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { managerApi } from "@/lib/api";
import { formatWaitingTime } from "@/lib/booking-activity";
import type { AdminBooking } from "@/types";
import { cn } from "@/lib/utils";
import { StatusBadge } from "@/components/common/StatusBadge";

export default function ManagerDashboardPage() {
  const [selected, setSelected] = useState<AdminBooking | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["manager-dashboard"],
    queryFn: async () => (await managerApi.getDashboard()).data,
    refetchInterval: 60_000,
  });

  const stats = data?.stats;
  const pending = data?.pendingQueue ?? [];

  const pendingBadgeCount = pending.length;

  const openReview = (booking: AdminBooking) => {
    setSelected(booking);
    setPanelOpen(true);
  };

  const oldestWait = useMemo(() => {
    if (!pending[0]?.createdAt) return "";
    return formatWaitingTime(pending[0].createdAt);
  }, [pending]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-2xl font-bold text-tsl-forest md:text-3xl">
          Manager Dashboard
        </h1>
        <p className="mt-1 text-muted-foreground">
          Review bookings and keep operations moving
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Pending Bookings"
          value={stats?.pendingBookings ?? 0}
          alert={(stats?.pendingBookings ?? 0) > 0}
        />
        <StatCard
          label="Approved Today"
          value={stats?.approvedToday ?? 0}
          alert={false}
        />
        <StatCard
          label="Rejected This Week"
          value={stats?.rejectedThisWeek ?? 0}
        />
        <StatCard
          label="Total Reviewed"
          value={stats?.totalReviewed ?? 0}
        />
      </div>

      <Card className="p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h2 className="font-serif text-lg font-bold">Needs Your Attention</h2>
            {pendingBadgeCount > 0 && (
              <span className="rounded-full bg-red-500 px-2.5 py-0.5 text-xs font-bold text-white">
                {pendingBadgeCount}
              </span>
            )}
          </div>
          {oldestWait && pendingBadgeCount > 0 && (
            <p className="text-xs text-amber-700">Oldest waiting: {oldestWait}</p>
          )}
        </div>

        {pendingBadgeCount === 0 ? (
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
                  <div className="flex items-center gap-3">
                    <p className="font-mono font-semibold">{b.bookingNumber}</p>
                    <StatusBadge status={b.status} />
                  </div>
                  <p className="mt-1 text-muted-foreground">
                    {b.customerName} · {b.fromDistrict} → {b.toDistrict}
                  </p>
                  <p className="text-muted-foreground">
                    {format(parseISO(b.startDate), "MMM d")} –{" "}
                    {format(parseISO(b.endDate), "MMM d, yyyy")} · LKR{" "}
                    {Number(b.totalPriceLKR).toLocaleString()}
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

      <BookingReviewPanel
        booking={selected}
        open={panelOpen}
        onOpenChange={setPanelOpen}
        canComplete={false}
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
    <Card className={cn("p-4", alert && "border-red-200 bg-red-50/50")}>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className={cn("mt-1 text-2xl font-bold", alert ? "text-red-600" : "text-tsl-forest")}>
        {value}
      </p>
    </Card>
  );
}
