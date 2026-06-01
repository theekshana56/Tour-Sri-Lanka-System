"use client";

import { useState } from "react";
import { format, parseISO, startOfWeek, endOfWeek, isWithinInterval } from "date-fns";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { adminApi } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api-errors";
import type { AdminBooking, User } from "@/types";

export default function AdminDriversPage() {
  const queryClient = useQueryClient();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: driversData, isLoading } = useQuery({
    queryKey: ["admin-drivers"],
    queryFn: async () =>
      (await adminApi.listUsers({ role: "DRIVER", size: 100 })).data,
  });

  const { data: bookingsData } = useQuery({
    queryKey: ["admin-bookings-drivers"],
    queryFn: async () =>
      (await adminApi.listBookings({ size: 200 })).data,
  });

  const { data: vehicles = [] } = useQuery({
    queryKey: ["admin-vehicles"],
    queryFn: async () => (await adminApi.listVehicles()).data,
  });

  const drivers = driversData?.content ?? [];
  const allBookings = bookingsData?.content ?? [];

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });

  const blockMutation = useMutation({
    mutationFn: ({ driverId, date }: { driverId: string; date: string }) =>
      adminApi.blockDriverDate(driverId, date),
    onSuccess: () => {
      toast.success("Date blocked");
      queryClient.invalidateQueries({
        queryKey: ["driver-availability", expandedId],
      });
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const unblockMutation = useMutation({
    mutationFn: ({ driverId, date }: { driverId: string; date: string }) =>
      adminApi.unblockDriverDate(driverId, date),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["driver-availability", expandedId],
      }),
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const vehicleForDriver = (driver: User) =>
    vehicles.find((v) => v.assignedDriverId === driver.id)?.name ?? "—";

  const weekBookings = (driverId: string): AdminBooking[] =>
    allBookings.filter(
      (b) =>
        b.assignedDriverId === driverId &&
        b.status === "APPROVED" &&
        isWithinInterval(parseISO(b.startDate), {
          start: weekStart,
          end: weekEnd,
        })
    );

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-tsl-forest">Drivers</h1>
        <p className="mt-1 text-muted-foreground">
          Availability, assignments, and blocked dates
        </p>
      </div>

      <div className="space-y-3">
        {drivers.map((driver) => {
          const expanded = expandedId === driver.id;
          return (
            <DriverRow
              key={driver.id}
              driver={driver}
              expanded={expanded}
              vehicleName={vehicleForDriver(driver)}
              weekBookings={weekBookings(driver.id)}
              onToggle={() =>
                setExpandedId(expanded ? null : driver.id)
              }
              onBlock={(date) =>
                blockMutation.mutate({ driverId: driver.id, date })
              }
              onUnblock={(date) =>
                unblockMutation.mutate({ driverId: driver.id, date })
              }
            />
          );
        })}
        {drivers.length === 0 && (
          <p className="text-center text-muted-foreground py-10">No drivers found</p>
        )}
      </div>
    </div>
  );
}

function DriverRow({
  driver,
  expanded,
  vehicleName,
  weekBookings,
  onToggle,
  onBlock,
  onUnblock,
}: {
  driver: User;
  expanded: boolean;
  vehicleName: string;
  weekBookings: AdminBooking[];
  onToggle: () => void;
  onBlock: (date: string) => void;
  onUnblock: (date: string) => void;
}) {
  const [blockDate, setBlockDate] = useState("");
  const { data: availability } = useQuery({
    queryKey: ["driver-availability", driver.id],
    queryFn: async () => (await adminApi.getDriverAvailability(driver.id)).data,
    enabled: expanded,
  });

  const blocked = availability?.blockedDates ?? [];

  return (
    <div className="rounded-xl border bg-white">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between px-4 py-4 text-left"
      >
        <div>
          <p className="font-semibold">{driver.fullName}</p>
          <p className="text-sm text-muted-foreground">
            {driver.email} · Vehicle: {vehicleName}
          </p>
        </div>
        {expanded ? (
          <ChevronUp className="h-5 w-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
        )}
      </button>

      {expanded && (
        <div className="space-y-4 border-t px-4 py-4 text-sm">
          <div>
            <p className="font-medium">This week&apos;s assignments</p>
            {weekBookings.length === 0 ? (
              <p className="mt-1 text-muted-foreground">No approved trips this week</p>
            ) : (
              <ul className="mt-2 space-y-1">
                {weekBookings.map((b) => (
                  <li key={b.id} className="font-mono text-xs">
                    {b.bookingNumber} · {b.fromDistrict} → {b.toDistrict} ·{" "}
                    {format(parseISO(b.startDate), "MMM d")}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <p className="font-medium">Blocked dates</p>
            {blocked.length === 0 ? (
              <p className="mt-1 text-muted-foreground">None</p>
            ) : (
              <ul className="mt-2 space-y-1">
                {blocked.map((d) => (
                  <li key={d} className="flex items-center justify-between gap-2">
                    <span>{format(parseISO(d), "MMM d, yyyy")}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onUnblock(d)}
                    >
                      Remove block
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex flex-wrap items-end gap-2">
            <div>
              <Label>Block a date</Label>
              <Input
                type="date"
                className="mt-1 w-44"
                value={blockDate}
                onChange={(e) => setBlockDate(e.target.value)}
              />
            </div>
            <Button
              size="sm"
              disabled={!blockDate}
              onClick={() => onBlock(blockDate)}
            >
              Block date
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
