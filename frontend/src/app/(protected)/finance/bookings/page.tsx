"use client";

import { useEffect, useMemo, useState } from "react";
import { format, parseISO, isWithinInterval } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { financeApi } from "@/lib/api";
import { formatLkr, formatVehicleType } from "@/lib/finance-utils";
import type { BookingStatus, VehicleType } from "@/types";

const PAGE_SIZE = 20;
const VEHICLE_TYPES: VehicleType[] = [
  "SEDAN",
  "SUV",
  "VAN",
  "MINIBUS",
  "LUXURY_SUV",
];

export default function FinanceBookingsPage() {
  const [status, setStatus] = useState<BookingStatus | "ALL">("ALL");
  const [vehicleType, setVehicleType] = useState("");
  const [currency, setCurrency] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(0);

  useEffect(() => {
    setPage(0);
  }, [status, vehicleType, currency, dateFrom, dateTo]);

  const { data, isLoading } = useQuery({
    queryKey: [
      "finance-bookings",
      status,
      vehicleType,
      currency,
      dateFrom,
      dateTo,
      page,
    ],
    queryFn: async () =>
      (
        await financeApi.getBookings({
          status: status === "ALL" ? undefined : status,
          vehicleType: vehicleType || undefined,
          currency: currency || undefined,
          from: dateFrom || undefined,
          to: dateTo || undefined,
          page,
          size: PAGE_SIZE,
        })
      ).data,
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-tsl-forest">
          Financial Bookings
        </h1>
        <p className="mt-1 text-muted-foreground">
          Read-only view of booking financial data
        </p>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="text-xs text-muted-foreground">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as BookingStatus | "ALL")}
            className="mt-1 block rounded-lg border bg-white px-3 py-2 text-sm"
          >
            <option value="ALL">All</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="COMPLETED">Completed</option>
            <option value="REJECTED">Rejected</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Vehicle</label>
          <select
            value={vehicleType}
            onChange={(e) => setVehicleType(e.target.value)}
            className="mt-1 block rounded-lg border bg-white px-3 py-2 text-sm"
          >
            <option value="">All</option>
            {VEHICLE_TYPES.map((t) => (
              <option key={t} value={t}>
                {formatVehicleType(t)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Currency</label>
          <Input
            placeholder="USD"
            value={currency}
            onChange={(e) => setCurrency(e.target.value.toUpperCase())}
            className="mt-1 w-24"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">From</label>
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="mt-1 w-40"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">To</label>
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="mt-1 w-40"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-white">
          <table className="w-full min-w-[1100px] text-left text-sm">
            <thead className="border-b bg-muted/40 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Booking #</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Route</th>
                <th className="px-4 py-3">Dates</th>
                <th className="px-4 py-3">Days</th>
                <th className="px-4 py-3">Pax</th>
                <th className="px-4 py-3">Vehicle</th>
                <th className="px-4 py-3">LKR Total</th>
                <th className="px-4 py-3">Currency</th>
                <th className="px-4 py-3">Foreign</th>
                <th className="px-4 py-3">Rate</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-4 py-10 text-center text-muted-foreground">
                    No bookings found
                  </td>
                </tr>
              ) : (
                filtered.map((b) => (
                  <tr key={b.id} className="border-b">
                    <td className="px-4 py-3 font-mono text-xs">{b.bookingNumber}</td>
                    <td className="px-4 py-3">{b.customerName}</td>
                    <td className="px-4 py-3">
                      {b.fromDistrict} → {b.toDistrict}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {format(parseISO(b.startDate), "MMM d")} –{" "}
                      {format(parseISO(b.endDate), "MMM d")}
                    </td>
                    <td className="px-4 py-3">{b.numberOfDays}</td>
                    <td className="px-4 py-3">{b.passengerCount}</td>
                    <td className="px-4 py-3">{formatVehicleType(b.vehicleType)}</td>
                    <td className="px-4 py-3">{formatLkr(Number(b.totalPriceLKR))}</td>
                    <td className="px-4 py-3">{b.preferredCurrency}</td>
                    <td className="px-4 py-3">
                      {Number(b.totalPriceForeign).toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      {b.exchangeRateUsed != null
                        ? Number(b.exchangeRateUsed).toFixed(4)
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={b.status} />
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
    </div>
  );
}
