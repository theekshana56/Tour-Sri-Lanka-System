"use client";

import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  isAfter,
  isBefore,
  isSameDay,
  startOfDay,
  startOfMonth,
  subMonths,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import type { DayAvailability } from "@/types";
import { useAvailabilityCalendar } from "@/hooks/useAvailability";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

interface AvailabilityCalendarProps {
  startDate?: Date | null;
  endDate?: Date | null;
  selectionTarget?: "start" | "end";
  onSelectionTargetChange?: (target: "start" | "end") => void;
  onRangeChange: (start: Date | null, end: Date | null) => void;
}

function resolveStatus(
  date: Date,
  dayData: DayAvailability | undefined
): "past" | "unavailable" | "limited" | "available" {
  const today = startOfDay(new Date());
  if (isBefore(date, today)) return "past";
  const drivers = dayData?.availableDrivers ?? 0;
  if (drivers === 0 || dayData?.isAvailable === false) return "unavailable";
  if (drivers <= 2) return "limited";
  return "available";
}

function isInRange(date: Date, start: Date | null, end: Date | null) {
  if (!start || !end) return false;
  return (
    (isAfter(date, start) || isSameDay(date, start)) &&
    (isBefore(date, end) || isSameDay(date, end))
  );
}

export function AvailabilityCalendar({
  startDate,
  endDate,
  selectionTarget = "start",
  onSelectionTargetChange,
  onRangeChange,
}: AvailabilityCalendarProps) {
  const [viewDate, setViewDate] = useState(() => startOfMonth(new Date()));
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth() + 1;

  const { data: calendarMap, isLoading } = useAvailabilityCalendar(year, month);

  const days = useMemo(() => {
    const start = startOfMonth(viewDate);
    const end = endOfMonth(viewDate);
    return eachDayOfInterval({ start, end });
  }, [viewDate]);

  const leadingBlanks = startOfMonth(viewDate).getDay();

  const handleDayClick = (date: Date, status: ReturnType<typeof resolveStatus>) => {
    if (status === "past" || status === "unavailable") return;

    if (selectionTarget === "start") {
      const keepEnd =
        endDate && !isBefore(endDate, date) ? endDate : null;
      onRangeChange(date, keepEnd);
      if (!keepEnd) {
        onSelectionTargetChange?.("end");
      }
      return;
    }

    if (!startDate || isBefore(date, startDate)) {
      onRangeChange(date, date);
      return;
    }

    onRangeChange(startDate, date);
  };

  const startLabel = startDate ? format(startDate, "MMM d, yyyy") : "Not set";
  const endLabel = endDate ? format(endDate, "MMM d, yyyy") : "Not set";

  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="mb-4 grid gap-2 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => onSelectionTargetChange?.("start")}
          className={cn(
            "rounded-lg border px-3 py-2 text-left text-sm transition",
            selectionTarget === "start"
              ? "border-blue-600 bg-blue-50 ring-2 ring-blue-100"
              : "border-border hover:bg-muted/50"
          )}
        >
          <span className="block text-xs font-medium text-muted-foreground">
            Start date
          </span>
          <span className="font-semibold text-foreground">{startLabel}</span>
        </button>
        <button
          type="button"
          onClick={() => onSelectionTargetChange?.("end")}
          className={cn(
            "rounded-lg border px-3 py-2 text-left text-sm transition",
            selectionTarget === "end"
              ? "border-blue-600 bg-blue-50 ring-2 ring-blue-100"
              : "border-border hover:bg-muted/50"
          )}
        >
          <span className="block text-xs font-medium text-muted-foreground">
            End date
          </span>
          <span className="font-semibold text-foreground">{endLabel}</span>
        </button>
      </div>
      <p className="mb-4 text-xs text-muted-foreground">
        {selectionTarget === "start"
          ? "Click a date on the calendar to set your start date."
          : "Click a date on the calendar to set your end date."}
      </p>

      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setViewDate((d) => subMonths(d, 1))}
          className="rounded-lg p-2 hover:bg-muted"
          aria-label="Previous month"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h3 className="font-serif text-lg font-semibold">
          {format(viewDate, "MMMM yyyy")}
        </h3>
        <button
          type="button"
          onClick={() => setViewDate((d) => addMonths(d, 1))}
          className="rounded-lg p-2 hover:bg-muted"
          aria-label="Next month"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <div className="mb-2 grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground">
        {WEEKDAYS.map((d, i) => (
          <div key={`${d}-${i}`}>{d}</div>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 35 }).map((_, i) => (
            <div key={i} className="h-10 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: leadingBlanks }).map((_, i) => (
            <div key={`blank-${i}`} className="h-10" />
          ))}
          {days.map((date) => {
            const key = format(date, "yyyy-MM-dd");
            const dayData = calendarMap?.[key];
            const status = resolveStatus(date, dayData);
            const isStart = startDate && isSameDay(date, startDate);
            const isEnd = endDate && isSameDay(date, endDate);
            const inRange = isInRange(date, startDate ?? null, endDate ?? null);

            return (
              <button
                key={key}
                type="button"
                disabled={status === "past" || status === "unavailable"}
                onClick={() => handleDayClick(date, status)}
                className={cn(
                  "relative flex h-10 w-full items-center justify-center rounded-lg text-sm transition",
                  status === "past" && "cursor-not-allowed text-muted-foreground/50",
                  status === "available" &&
                    "border border-transparent bg-white hover:bg-emerald-50",
                  status === "limited" && "bg-amber-50 text-amber-900 hover:bg-amber-100",
                  status === "unavailable" &&
                    "cursor-not-allowed bg-red-50 text-red-400 line-through",
                  inRange && !isStart && !isEnd && "bg-blue-100 text-blue-900",
                  (isStart || isEnd) && "bg-blue-700 font-semibold text-white hover:bg-blue-800"
                )}
              >
                {format(date, "d")}
                {status === "limited" && (
                  <span className="absolute right-0.5 top-0.5 text-[10px] font-bold">!</span>
                )}
              </button>
            );
          })}
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-3 text-xs text-muted-foreground">
        <span>🟢 Available</span>
        <span>🟡 Limited</span>
        <span>🔴 Unavailable</span>
      </div>
    </div>
  );
}
