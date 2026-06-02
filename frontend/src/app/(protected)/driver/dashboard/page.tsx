"use client";

import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { TripCard } from "@/components/driver/TripCard";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { driverApi } from "@/lib/api";

export default function DriverTodayPage() {
  const { data: trips = [], isLoading } = useQuery({
    queryKey: ["driver-today"],
    queryFn: async () => (await driverApi.getTodayBookings()).data,
    refetchInterval: 60_000,
  });

  const todayLabel = format(new Date(), "EEEE · MMMM d");

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (trips.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
        <span className="text-6xl" role="img" aria-label="palm tree">
          🌴
        </span>
        <h1 className="mt-6 text-2xl font-bold text-foreground">No trips today</h1>
        <p className="mt-2 text-lg text-muted-foreground">Enjoy your day!</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-foreground">Today · {todayLabel}</h1>
      <div className="space-y-4">
        {trips.map((trip) => (
          <TripCard key={trip.id} booking={trip} />
        ))}
      </div>
    </div>
  );
}
