"use client";

import {
  Bar,
  BarChart,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import {
  formatLkr,
  formatLkrCompact,
  formatVehicleType,
  toNumber,
  vehicleColor,
} from "@/lib/finance-utils";
import type { RevenueSummary } from "@/types";
import { cn } from "@/lib/utils";

interface RevenueOverviewProps {
  summary: RevenueSummary | null | undefined;
  loading?: boolean;
  kpi?: {
    totalRevenue: number;
    thisMonth: number;
    thisWeek: number;
    avgBooking: number;
  };
}

export function RevenueOverview({ summary, loading, kpi }: RevenueOverviewProps) {
  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const monthly = (summary?.revenueByMonth ?? []).map((m) => ({
    month: m.month,
    revenue: toNumber(m.revenue),
  }));

  const byVehicle = (summary?.revenueByVehicleType ?? []).map((v) => ({
    name: formatVehicleType(v.type),
    type: v.type,
    value: toNumber(v.revenue),
    count: v.count,
  }));

  const topRoutes = (summary?.topRoutes ?? []).slice(0, 5).map((r) => ({
    route: `${r.from} → ${r.to}`,
    revenue: toNumber(r.revenue),
  }));

  const totalRevenue = kpi?.totalRevenue ?? toNumber(summary?.totalRevenueLKR);
  const thisMonth = kpi?.thisMonth ?? 0;
  const thisWeek = kpi?.thisWeek ?? 0;
  const avgBooking =
    kpi?.avgBooking ?? toNumber(summary?.avgBookingValueLKR);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard label="Total Revenue (LKR)" value={formatLkr(totalRevenue)} />
        <KpiCard label="This Month (LKR)" value={formatLkr(thisMonth)} />
        <KpiCard label="This Week (LKR)" value={formatLkr(thisWeek)} />
        <KpiCard label="Avg Booking Value" value={formatLkr(avgBooking)} />
      </div>

      <Card className="p-4">
        <h3 className="mb-4 font-serif text-lg font-bold">Revenue trend</h3>
        {monthly.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No revenue data for this period
          </p>
        ) : (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthly}>
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={(v) => formatLkrCompact(Number(v))} width={72} />
                <Tooltip
                  formatter={(value) => [formatLkr(Number(value ?? 0)), "Revenue"]}
                  labelFormatter={(label) => `Month: ${label}`}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#059669"
                  strokeWidth={2}
                  dot={{ fill: "#059669", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-4">
          <h3 className="mb-4 font-serif text-lg font-bold">By vehicle type</h3>
          {byVehicle.length === 0 ? (
            <p className="text-sm text-muted-foreground">No data</p>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={byVehicle}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="45%"
                    innerRadius={50}
                    outerRadius={80}
                  >
                    {byVehicle.map((entry) => (
                      <Cell key={entry.type} fill={vehicleColor(entry.type)} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => formatLkr(Number(v ?? 0))} />
                </PieChart>
              </ResponsiveContainer>
              <ul className="mt-2 flex flex-wrap justify-center gap-3 text-xs">
                {byVehicle.map((v) => (
                  <li key={v.type} className="flex items-center gap-1">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ background: vehicleColor(v.type) }}
                    />
                    {v.name}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>

        <Card className="p-4">
          <h3 className="mb-4 font-serif text-lg font-bold">Top routes by revenue</h3>
          {topRoutes.length === 0 ? (
            <p className="text-sm text-muted-foreground">No data</p>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topRoutes} layout="vertical" margin={{ left: 8 }}>
                  <XAxis type="number" tickFormatter={(v) => formatLkrCompact(Number(v))} />
                  <YAxis type="category" dataKey="route" width={110} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v) => formatLkr(Number(v ?? 0))} />
                  <Bar dataKey="revenue" fill="#0d9488" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function KpiCard({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className={cn("mt-1 text-xl font-bold text-tsl-forest lg:text-2xl")}>{value}</p>
    </Card>
  );
}
