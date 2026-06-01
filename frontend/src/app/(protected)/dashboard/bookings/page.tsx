"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { BookingCard } from "@/components/booking/BookingCard";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { computeBookingStats, useMyBookings } from "@/hooks/useMyBookings";
import type { BookingStatus } from "@/types";
import { cn } from "@/lib/utils";

type FilterTab = "ALL" | BookingStatus;

const TABS: { id: FilterTab; label: string }[] = [
  { id: "ALL", label: "All" },
  { id: "PENDING", label: "Pending" },
  { id: "APPROVED", label: "Approved" },
  { id: "COMPLETED", label: "Completed" },
  { id: "REJECTED", label: "Rejected" },
  { id: "CANCELLED", label: "Cancelled" },
];

export default function MyBookingsPage() {
  const [activeTab, setActiveTab] = useState<FilterTab>("ALL");
  const { data, isLoading } = useMyBookings({
    size: 100,
    refetchInterval: 30_000,
  });

  const allBookings = data?.content ?? [];
  const stats = computeBookingStats(allBookings);

  const filtered = useMemo(() => {
    if (activeTab === "ALL") return allBookings;
    return allBookings.filter((b) => b.status === activeTab);
  }, [allBookings, activeTab]);

  const tabCount = (tab: FilterTab) => {
    if (tab === "ALL") return stats.total;
    if (tab === "PENDING") return stats.pending;
    if (tab === "APPROVED") return stats.confirmed;
    if (tab === "COMPLETED") return stats.completed;
    if (tab === "REJECTED") return stats.rejected;
    if (tab === "CANCELLED") return stats.cancelled;
    return 0;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-tsl-forest md:text-3xl">
          My Bookings
        </h1>
        <p className="mt-1 text-muted-foreground">
          Track and manage your trip reservations
        </p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition",
              activeTab === tab.id
                ? "border-tsl-teal bg-tsl-teal text-white"
                : "border-border bg-white hover:bg-muted"
            )}
          >
            {tab.label}
            <span
              className={cn(
                "rounded-full px-1.5 py-0.5 text-xs",
                activeTab === tab.id ? "bg-white/20" : "bg-muted"
              )}
            >
              {tabCount(tab.id)}
            </span>
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border bg-white py-16 text-center">
          <p className="text-lg font-medium text-tsl-forest">
            No bookings yet. Ready to explore Sri Lanka?
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {activeTab !== "ALL"
              ? `No ${activeTab.toLowerCase()} bookings at the moment.`
              : "Your reservations will appear here after you book a trip."}
          </p>
          <Link
            href="/plan"
            className="mt-6 inline-flex h-10 items-center justify-center rounded-lg bg-emerald-600 px-4 text-sm font-medium text-white hover:bg-emerald-700"
          >
            Plan a Trip
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((booking) => (
            <BookingCard key={booking.id} booking={booking} />
          ))}
        </div>
      )}
    </div>
  );
}
