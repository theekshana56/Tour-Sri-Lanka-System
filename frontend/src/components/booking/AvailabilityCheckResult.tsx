"use client";

import type { RangeAvailability } from "@/types";

interface AvailabilityCheckResultProps {
  data: RangeAvailability | undefined;
  isLoading: boolean;
  hasRange: boolean;
}

export function AvailabilityCheckResult({
  data,
  isLoading,
  hasRange,
}: AvailabilityCheckResultProps) {
  if (!hasRange) return null;

  if (isLoading) {
    return (
      <div className="mt-4 h-16 animate-pulse rounded-xl bg-muted" />
    );
  }

  if (!data) return null;

  if (!data.available || data.minAvailableDrivers === 0) {
    return (
      <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
        ❌ Not available for selected dates. Please choose different dates.
      </div>
    );
  }

  if (data.minAvailableDrivers <= 2) {
    return (
      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        ⚠ {data.minAvailableDrivers} driver{data.minAvailableDrivers !== 1 ? "s" : ""}{" "}
        available — limited slots for your dates.
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
      ✅ Available for your dates! {data.minAvailableDrivers} drivers ready.
    </div>
  );
}
