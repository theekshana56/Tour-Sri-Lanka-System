"use client";

import { useEffect, useMemo, useState } from "react";
import { format, parseISO, isWithinInterval } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { BookingReviewPanel } from "@/components/admin/BookingReviewPanel";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AdminBooking, BookingStatus } from "@/types";
import { adminApi } from "@/lib/api";

const STATUSES: Array<BookingStatus | "ALL"> = [
  "ALL",
  "PENDING",
  "APPROVED",
  "REJECTED",
  "COMPLETED",
  "CANCELLED",
];

const PAGE_SIZE = 20;

export default function ManagerBookingsPage() {
  const [status, setStatus] = useState<BookingStatus | "ALL">("ALL");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(0);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selected, setSelected] = useState<AdminBooking | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(0);
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["manager-bookings", status, debouncedSearch, page],
    queryFn: async () =>
      (
        await adminApi.listBookings({
          status: status === "ALL" ? undefined : status,
          search: debouncedSearch || undefined,
          page,
          size: PAGE_SIZE,
        })
      ).data,
    refetchInterval: 30_000,
  });

  const filtered = useMemo(() => {
    const rows = data?.content ?? [];
    if (!dateFrom && !dateTo) return rows;
    return rows.filter((b) => {
      const start = parseISO(b.startDate);
      const from = dateFrom ? parseISO(dateFrom) : start;
      const to = dateTo ? parseISO(dateTo) : start;
      return isWithinInterval(start, { start: from, end: to });
    });
  }, [data?.content, dateFrom, dateTo]);

  const totalPages = data?.totalPages ?? 0;

  const openReview = (booking: AdminBooking) => {
    setSelected(booking);
    setPanelOpen(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-tsl-forest md:text-3xl">
          All Bookings
        </h1>
        <p className="mt-1 text-muted-foreground">
          Review pending bookings and manage your queue
        </p>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="text-xs font-medium text-muted-foreground">
            Status
          </label>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as BookingStatus | "ALL");
              setPage(0);
            }}
            className="mt-1 block rounded-lg border bg-white px-3 py-2 text-sm"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">From</label>
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="mt-1 w-40"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">To</label>
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="mt-1 w-40"
          />
        </div>
        <div className="min-w-[200px] flex-1">
          <label className="text-xs font-medium text-muted-foreground">
            Search
          </label>
          <Input
            placeholder="Booking # or customer name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mt-1"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-white">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="border-b bg-muted/40 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Booking #</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Route</th>
                <th className="px-4 py-3">Dates</th>
                <th className="px-4 py-3">Pax</th>
                <th className="px-4 py-3">Vehicle</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Submitted</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={10}
                    className="px-4 py-10 text-center text-muted-foreground"
                  >
                    No bookings found
                  </td>
                </tr>
              ) : (
                filtered.map((b) => (
                  <tr
                    key={b.id}
                    className="cursor-pointer border-b hover:bg-muted/30"
                    onClick={() => openReview(b)}
                  >
                    <td className="px-4 py-3 font-mono text-xs">
                      {b.bookingNumber}
                    </td>
                    <td className="px-4 py-3">{b.customerName}</td>
                    <td className="px-4 py-3">
                      {b.fromDistrict} → {b.toDistrict}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {format(parseISO(b.startDate), "MMM d")} –{" "}
                      {format(parseISO(b.endDate), "MMM d")}
                    </td>
                    <td className="px-4 py-3">{b.passengerCount}</td>
                    <td className="px-4 py-3">
                      {b.vehicleName ?? b.vehicleType.replace("_", " ")}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={b.status} />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      LKR {Number(b.totalPriceLKR).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                      {b.createdAt
                        ? format(parseISO(b.createdAt), "MMM d, yyyy")
                        : "—"}
                    </td>
                    <td
                      className="px-4 py-3"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openReview(b)}
                      >
                        Review
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page + 1} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}

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

