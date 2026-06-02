"use client";

import { useMemo, useState } from "react";
import {
  addDays,
  format,
  isSameDay,
  parseISO,
  startOfWeek,
  endOfWeek,
  isWithinInterval,
} from "date-fns";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { driverApi } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api-errors";
import { cn } from "@/lib/utils";
import { TripCard } from "@/components/driver/TripCard";
import type { DriverTripBooking } from "@/types";

export default function DriverSchedulePage() {
  const queryClient = useQueryClient();
  const [weekStart, setWeekStart] = useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [showBlockPicker, setShowBlockPicker] = useState(false);

  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const { data: bookingsPage, isLoading: bookingsLoading } = useQuery({
    queryKey: ["driver-bookings"],
    queryFn: async () =>
      (await driverApi.getMyBookings({ page: 0, size: 200 })).data,
  });

  const { data: blockedData } = useQuery({
    queryKey: ["driver-blocked"],
    queryFn: async () => (await driverApi.getBlockedDates()).data,
  });

  const blockedSet = useMemo(() => {
    return new Set(blockedData?.blockedDates ?? []);
  }, [blockedData]);

  const bookings = bookingsPage?.content ?? [];

  const bookingsForDay = (day: Date): DriverTripBooking[] =>
    bookings.filter((b) => {
      if (b.status !== "APPROVED" && b.status !== "COMPLETED") return false;
      const start = parseISO(b.startDate);
      const end = parseISO(b.endDate);
      return isWithinInterval(day, { start, end });
    });

  const isBlocked = (day: Date) => {
    const key = format(day, "yyyy-MM-dd");
    return blockedSet.has(key);
  };

  const upcomingBlocked = useMemo(() => {
    const today = format(new Date(), "yyyy-MM-dd");
    return (blockedData?.blockedDates ?? [])
      .filter((d) => d >= today)
      .sort();
  }, [blockedData]);

  const blockMutation = useMutation({
    mutationFn: (date: string) => driverApi.blockDate(date),
    onSuccess: () => {
      toast.success("Date blocked");
      queryClient.invalidateQueries({ queryKey: ["driver-blocked"] });
      setShowBlockPicker(false);
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const unblockMutation = useMutation({
    mutationFn: (date: string) => driverApi.unblockDate(date),
    onSuccess: () => {
      toast.success("Date unblocked");
      queryClient.invalidateQueries({ queryKey: ["driver-blocked"] });
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const selectedBookings = selectedDay ? bookingsForDay(selectedDay) : [];
  const selectedBlocked = selectedDay ? isBlocked(selectedDay) : false;
  const selectedKey = selectedDay ? format(selectedDay, "yyyy-MM-dd") : "";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-2">
        <Button
          type="button"
          variant="outline"
          className="min-h-[48px] min-w-[48px] p-0"
          onClick={() => setWeekStart((d) => addDays(d, -7))}
          aria-label="Previous week"
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <p className="text-center text-base font-bold">
          {format(weekStart, "MMM d")} – {format(weekEnd, "MMM d, yyyy")}
        </p>
        <Button
          type="button"
          variant="outline"
          className="min-h-[48px] min-w-[48px] p-0"
          onClick={() => setWeekStart((d) => addDays(d, 7))}
          aria-label="Next week"
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      </div>

      {bookingsLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-1">
          {weekDays.map((day) => {
            const count = bookingsForDay(day).length;
            const blocked = isBlocked(day);
            const isToday = isSameDay(day, new Date());
            const isSelected = selectedDay && isSameDay(day, selectedDay);

            return (
              <button
                key={day.toISOString()}
                type="button"
                onClick={() => setSelectedDay(day)}
                className={cn(
                  "flex min-h-[88px] flex-col items-center rounded-lg border p-1 transition",
                  isToday && "ring-2 ring-blue-500 ring-offset-1",
                  isSelected && "border-tsl-teal bg-tsl-teal/10",
                  blocked && !count && "bg-slate-200"
                )}
              >
                <span className="text-xs font-bold uppercase text-muted-foreground">
                  {format(day, "EEE")}
                </span>
                <span className="text-2xl font-bold">{format(day, "d")}</span>
                {count > 0 && (
                  <span className="mt-1 rounded-full bg-emerald-600 px-1.5 py-0.5 text-xs font-bold text-white">
                    {count}
                  </span>
                )}
                {blocked && count === 0 && (
                  <span className="mt-1 text-[10px] font-bold text-slate-600">
                    BLOCKED
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {selectedDay && (
        <section className="rounded-xl border bg-white p-4">
          <h2 className="text-lg font-bold">{format(selectedDay, "EEEE, MMM d")}</h2>
          {selectedBlocked && selectedBookings.length === 0 ? (
            <div className="mt-4 space-y-3">
              <p className="text-base text-muted-foreground">You blocked this day</p>
              <Button
                className="min-h-[48px] w-full text-base"
                variant="outline"
                onClick={() => unblockMutation.mutate(selectedKey)}
                disabled={unblockMutation.isPending}
              >
                Unblock
              </Button>
            </div>
          ) : selectedBookings.length > 0 ? (
            <div className="mt-3 space-y-4">
              {selectedBookings.map((b) => (
                <TripCard key={b.id} booking={b} />
              ))}
            </div>
          ) : (
            <div className="mt-4">
              <p className="mb-3 text-base text-muted-foreground">Available</p>
              <Button
                className="min-h-[48px] w-full text-base"
                variant="outline"
                onClick={() => blockMutation.mutate(selectedKey)}
                disabled={blockMutation.isPending}
              >
                Block this day
              </Button>
            </div>
          )}
        </section>
      )}

      <section className="space-y-3">
        <h2 className="text-lg font-bold">My blocked dates</h2>
        <div className="flex flex-wrap gap-2">
          {upcomingBlocked.length === 0 ? (
            <p className="text-base text-muted-foreground">No upcoming blocks</p>
          ) : (
            upcomingBlocked.map((d) => (
              <span
                key={d}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-full border bg-white px-3 py-2 text-base font-medium"
              >
                {format(parseISO(d), "MMM d")}
                <button
                  type="button"
                  className="min-h-[32px] min-w-[32px] rounded-full hover:bg-muted"
                  onClick={() => unblockMutation.mutate(d)}
                  aria-label={`Unblock ${d}`}
                >
                  <X className="h-4 w-4" />
                </button>
              </span>
            ))
          )}
        </div>
        <Button
          className="min-h-[48px] w-full text-base"
          onClick={() => setShowBlockPicker((v) => !v)}
        >
          Block a date
        </Button>
        {showBlockPicker && (
          <div className="rounded-xl border bg-white p-3">
            <DayPicker
              mode="single"
              disabled={{ before: new Date() }}
              onSelect={(day) => {
                if (day) {
                  blockMutation.mutate(format(day, "yyyy-MM-dd"));
                }
              }}
            />
          </div>
        )}
      </section>
    </div>
  );
}
