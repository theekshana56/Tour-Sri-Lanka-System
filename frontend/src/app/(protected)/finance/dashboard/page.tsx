"use client";

import { useMemo } from "react";
import { format, startOfMonth, startOfWeek, subMonths } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { RevenueOverview } from "@/components/finance/RevenueOverview";
import { financeApi } from "@/lib/api";
import { toNumber } from "@/lib/finance-utils";

export default function FinanceDashboardPage() {
  const today = format(new Date(), "yyyy-MM-dd");
  const twelveMonthsAgo = format(subMonths(new Date(), 12), "yyyy-MM-dd");
  const monthStart = format(startOfMonth(new Date()), "yyyy-MM-dd");
  const weekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd");
  const allTimeStart = "2020-01-01";

  const { data: yearData, isLoading: yearLoading } = useQuery({
    queryKey: ["finance-revenue-year", twelveMonthsAgo, today],
    queryFn: async () =>
      (await financeApi.getRevenueSummary(twelveMonthsAgo, today)).data,
  });

  const { data: allTimeData } = useQuery({
    queryKey: ["finance-revenue-all", allTimeStart, today],
    queryFn: async () =>
      (await financeApi.getRevenueSummary(allTimeStart, today)).data,
  });

  const { data: monthData } = useQuery({
    queryKey: ["finance-revenue-month", monthStart, today],
    queryFn: async () =>
      (await financeApi.getRevenueSummary(monthStart, today)).data,
  });

  const { data: weekData } = useQuery({
    queryKey: ["finance-revenue-week", weekStart, today],
    queryFn: async () =>
      (await financeApi.getRevenueSummary(weekStart, today)).data,
  });

  const kpi = useMemo(
    () => ({
      totalRevenue: toNumber(allTimeData?.totalRevenueLKR),
      thisMonth: toNumber(monthData?.totalRevenueLKR),
      thisWeek: toNumber(weekData?.totalRevenueLKR),
      avgBooking: toNumber(yearData?.avgBookingValueLKR),
    }),
    [allTimeData, monthData, weekData, yearData]
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-tsl-forest md:text-3xl">
          Finance Overview
        </h1>
        <p className="mt-1 text-muted-foreground">
          Revenue performance and booking economics
        </p>
      </div>

      <RevenueOverview summary={yearData} loading={yearLoading} kpi={kpi} />
    </div>
  );
}
