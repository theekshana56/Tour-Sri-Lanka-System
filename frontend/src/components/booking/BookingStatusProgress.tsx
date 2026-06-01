"use client";

import type { BookingStatus } from "@/types";
import { cn } from "@/lib/utils";

const MAIN_STEPS: { status: BookingStatus; label: string }[] = [
  { status: "PENDING", label: "Pending" },
  { status: "APPROVED", label: "Approved" },
  { status: "COMPLETED", label: "Completed" },
];

interface BookingStatusProgressProps {
  status: BookingStatus;
}

function stepIndex(status: BookingStatus) {
  if (status === "APPROVED") return 1;
  if (status === "COMPLETED") return 2;
  if (status === "PENDING") return 0;
  return -1;
}

export function BookingStatusProgress({ status }: BookingStatusProgressProps) {
  const current = stepIndex(status);
  const isRejected = status === "REJECTED";
  const isCancelled = status === "CANCELLED";

  if (isCancelled) {
    return (
      <div className="rounded-lg bg-gray-100 px-4 py-3 text-center text-sm font-medium text-gray-600">
        Cancelled
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        {MAIN_STEPS.map((step, i) => {
          const done = !isRejected && current > i;
          const active = !isRejected && current === i;
          return (
            <div key={step.status} className="flex flex-1 items-center">
              <div className="flex flex-col items-center gap-1">
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold",
                    done && "bg-emerald-600 text-white",
                    active && "bg-blue-600 text-white ring-4 ring-blue-100",
                    !done && !active && "bg-muted text-muted-foreground",
                    isRejected && i === 0 && "bg-red-100 text-red-700 ring-4 ring-red-50"
                  )}
                >
                  {done ? "✓" : i + 1}
                </div>
                <span className="text-xs font-medium">{step.label}</span>
              </div>
              {i < MAIN_STEPS.length - 1 && (
                <div
                  className={cn(
                    "mx-1 h-0.5 flex-1",
                    done ? "bg-emerald-400" : "bg-muted"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
      {isRejected && (
        <div className="flex items-center gap-2 pl-2 text-sm text-red-600">
          <span className="h-2 w-2 rounded-full bg-red-500" />
          Rejected after Pending
        </div>
      )}
    </div>
  );
}
