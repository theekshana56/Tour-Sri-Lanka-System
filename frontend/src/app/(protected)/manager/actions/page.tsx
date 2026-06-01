"use client";

import { format, parseISO } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { StatusBadge } from "@/components/common/StatusBadge";
import { useAuthStore } from "@/store/authStore";
import { adminApi } from "@/lib/api";
import type { AdminBooking } from "@/types";

const PAGE_SIZE = 100;

export default function ManagerActionsPage() {
  const user = useAuthStore((s) => s.user);

  const { data, isLoading } = useQuery({
    queryKey: ["manager-actions", user?.id],
    enabled: !!user,
    queryFn: async () =>
      (await adminApi.listBookings({
        reviewedBy: user?.id,
        page: 0,
        size: PAGE_SIZE,
      })).data,
  });

  const rows: AdminBooking[] = data?.content ?? [];

  const downloadCsv = () => {
    const header = [
      "Date",
      "Booking #",
      "Customer",
      "Action",
      "Reason",
      "Time",
    ];
    const csvRows = rows.map((b) => {
      const when = b.reviewedAt ?? b.createdAt;
      const dt = when ? parseISO(when) : null;
      const date = dt ? format(dt, "MMM d, yyyy") : "";
      const time = dt ? format(dt, "HH:mm") : "";
      const action =
        b.status === "APPROVED"
          ? "Approved"
          : b.status === "REJECTED"
            ? "Rejected"
            : b.status;
      return [
        date,
        b.bookingNumber,
        b.customerName,
        action,
        b.rejectionReason ?? "",
        time,
      ];
    });

    const escape = (v: string) =>
      `"${String(v ?? "").replaceAll('"', '""')}"`;
    const csv = [header, ...csvRows]
      .map((r) => r.map((v) => escape(v)).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "manager-actions.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-tsl-forest md:text-3xl">
          My Actions Log
        </h1>
        <p className="mt-1 text-muted-foreground">
          Accountability log for approvals and rejections
        </p>
      </div>

      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Showing {rows.length} recent actions
        </p>
        <Button variant="outline" size="sm" onClick={downloadCsv} disabled={rows.length === 0}>
          Export to CSV
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-xl border bg-white p-10 text-center text-muted-foreground">
          No actions yet.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-white">
          <table className="w-full min-w-[950px] text-left text-sm">
            <thead className="border-b bg-muted/40 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">Booking #</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Reason</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((b) => {
                const when = b.reviewedAt ?? b.createdAt;
                const dt = when ? parseISO(when) : null;
                const date = dt ? format(dt, "MMM d, yyyy") : "—";
                const time = dt ? format(dt, "HH:mm") : "—";
                const action =
                  b.status === "APPROVED"
                    ? "Approved"
                    : b.status === "REJECTED"
                      ? "Rejected"
                      : b.status;

                return (
                  <tr key={b.id} className="border-b hover:bg-muted/30">
                    <td className="px-4 py-3">{date}</td>
                    <td className="px-4 py-3 text-muted-foreground">{time}</td>
                    <td className="px-4 py-3 font-mono text-xs">
                      {b.bookingNumber}
                    </td>
                    <td className="px-4 py-3">{b.customerName}</td>
                    <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={b.status} />
                    <span className="text-sm font-medium">{action}</span>
                  </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {b.rejectionReason ?? "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

