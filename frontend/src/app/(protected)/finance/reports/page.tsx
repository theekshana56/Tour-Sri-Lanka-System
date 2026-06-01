"use client";

import { useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { RevenueOverview } from "@/components/finance/RevenueOverview";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { financeApi } from "@/lib/api";
import { formatLkr, formatVehicleType } from "@/lib/finance-utils";
import type { FinanceBooking } from "@/types";

export default function FinanceReportsPage() {
  const [from, setFrom] = useState(
    format(new Date(new Date().getFullYear(), 0, 1), "yyyy-MM-dd")
  );
  const [to, setTo] = useState(format(new Date(), "yyyy-MM-dd"));
  const [applied, setApplied] = useState({ from, to });
  const [sortKey, setSortKey] = useState<keyof FinanceBooking>("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ["finance-report-summary", applied.from, applied.to],
    queryFn: async () =>
      (await financeApi.getRevenueSummary(applied.from, applied.to)).data,
  });

  const { data: bookingsData, isLoading: bookingsLoading } = useQuery({
    queryKey: ["finance-report-bookings", applied.from, applied.to],
    queryFn: async () =>
      (
        await financeApi.getBookings({
          from: applied.from,
          to: applied.to,
          size: 500,
        })
      ).data,
  });

  const rows = useMemo(() => {
    const list = [...(bookingsData?.content ?? [])];
    list.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (av == null || bv == null) return 0;
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return list;
  }, [bookingsData?.content, sortKey, sortDir]);

  const toggleSort = (key: keyof FinanceBooking) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const exportCsv = () => {
    const header = [
      "Booking #",
      "Customer",
      "Route",
      "Start",
      "End",
      "Days",
      "Passengers",
      "Vehicle",
      "LKR Total",
      "Currency",
      "Foreign Total",
      "Rate Used",
      "Status",
    ];
    const lines = rows.map((b) => [
      b.bookingNumber,
      b.customerName,
      `${b.fromDistrict} → ${b.toDistrict}`,
      b.startDate,
      b.endDate,
      String(b.numberOfDays),
      String(b.passengerCount),
      b.vehicleType,
      String(b.totalPriceLKR),
      b.preferredCurrency,
      String(b.totalPriceForeign),
      b.exchangeRateUsed != null ? String(b.exchangeRateUsed) : "",
      b.status,
    ]);
    const escape = (v: string) => `"${String(v).replaceAll('"', '""')}"`;
    const csv = [header, ...lines]
      .map((r) => r.map(escape).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `TSL-Revenue-Report-${applied.from}-${applied.to}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-2xl font-bold text-tsl-forest">
          Revenue Reports
        </h1>
        <p className="mt-1 text-muted-foreground">
          Generate financial reports for any date range
        </p>
      </div>

      <div className="flex flex-wrap items-end gap-3 rounded-xl border bg-white p-4">
        <div>
          <label className="text-xs text-muted-foreground">From</label>
          <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="mt-1" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">To</label>
          <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="mt-1" />
        </div>
        <Button onClick={() => setApplied({ from, to })}>Generate report</Button>
        <Button variant="outline" onClick={exportCsv} disabled={rows.length === 0}>
          Export CSV
        </Button>
      </div>

      <RevenueOverview
        summary={summary}
        loading={summaryLoading}
        kpi={{
          totalRevenue: Number(summary?.totalRevenueLKR ?? 0),
          thisMonth: Number(summary?.totalRevenueLKR ?? 0),
          thisWeek: Number(summary?.totalRevenueLKR ?? 0),
          avgBooking: Number(summary?.avgBookingValueLKR ?? 0),
        }}
      />

      <div className="overflow-x-auto rounded-xl border bg-white">
        <table className="w-full min-w-[1100px] text-left text-sm">
          <thead className="border-b bg-muted/40 text-xs uppercase text-muted-foreground">
            <tr>
              <SortTh label="Booking #" onClick={() => toggleSort("bookingNumber")} />
              <SortTh label="Customer" onClick={() => toggleSort("customerName")} />
              <th className="px-3 py-3">Route</th>
              <th className="px-3 py-3">Dates</th>
              <SortTh label="Days" onClick={() => toggleSort("numberOfDays")} />
              <SortTh label="Pax" onClick={() => toggleSort("passengerCount")} />
              <th className="px-3 py-3">Vehicle</th>
              <SortTh label="LKR" onClick={() => toggleSort("totalPriceLKR")} />
              <th className="px-3 py-3">Currency</th>
              <th className="px-3 py-3">Foreign</th>
              <th className="px-3 py-3">Rate</th>
              <th className="px-3 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {bookingsLoading ? (
              <tr>
                <td colSpan={12} className="px-4 py-10 text-center text-muted-foreground">
                  Loading bookings…
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={12} className="px-4 py-10 text-center text-muted-foreground">
                  No bookings in range
                </td>
              </tr>
            ) : (
              rows.map((b) => (
                <tr key={b.id} className="border-b">
                  <td className="px-3 py-2 font-mono text-xs">{b.bookingNumber}</td>
                  <td className="px-3 py-2">{b.customerName}</td>
                  <td className="px-3 py-2">
                    {b.fromDistrict} → {b.toDistrict}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    {format(parseISO(b.startDate), "MMM d")} –{" "}
                    {format(parseISO(b.endDate), "MMM d")}
                  </td>
                  <td className="px-3 py-2">{b.numberOfDays}</td>
                  <td className="px-3 py-2">{b.passengerCount}</td>
                  <td className="px-3 py-2">{formatVehicleType(b.vehicleType)}</td>
                  <td className="px-3 py-2">{formatLkr(Number(b.totalPriceLKR))}</td>
                  <td className="px-3 py-2">{b.preferredCurrency}</td>
                  <td className="px-3 py-2">
                    {Number(b.totalPriceForeign).toFixed(2)}
                  </td>
                  <td className="px-3 py-2">
                    {b.exchangeRateUsed != null
                      ? Number(b.exchangeRateUsed).toFixed(4)
                      : "—"}
                  </td>
                  <td className="px-3 py-2">
                    <StatusBadge status={b.status} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SortTh({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <th className="px-3 py-3">
      <button type="button" onClick={onClick} className="hover:text-foreground">
        {label} ↕
      </button>
    </th>
  );
}
