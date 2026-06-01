"use client";

import { useQueries } from "@tanstack/react-query";
import { type ReactNode } from "react";
import { Car, Crown, Minus, Plus, Truck, Users } from "lucide-react";
import type { Vehicle, VehicleType } from "@/types";
import { pricingApi } from "@/lib/api";
import { cn } from "@/lib/utils";

const VEHICLE_ICONS: Record<VehicleType, ReactNode> = {
  SEDAN: <Car className="h-6 w-6" />,
  SUV: <Truck className="h-6 w-6" />,
  VAN: <Users className="h-6 w-6" />,
  MINIBUS: <Users className="h-6 w-6" />,
  LUXURY_SUV: <Crown className="h-6 w-6" />,
};

interface VehicleSelectorProps {
  vehicles: Vehicle[];
  passengerCount: number;
  selectedType: string;
  onSelect: (type: VehicleType) => void;
  fromDistrict: string;
  toDistrict: string;
  preferredCurrency: string;
  isLoading?: boolean;
}

export function VehicleSelector({
  vehicles,
  passengerCount,
  selectedType,
  onSelect,
  fromDistrict,
  toDistrict,
  preferredCurrency,
  isLoading,
}: VehicleSelectorProps) {
  const uniqueTypes = Array.from(
    new Map(vehicles.map((v) => [v.type, v])).values()
  );

  const canQuote = !!fromDistrict && !!toDistrict && !!preferredCurrency;

  const quoteQueries = useQueries({
    queries: uniqueTypes.map((v) => ({
      queryKey: [
        "pricing",
        "daily",
        v.type,
        fromDistrict,
        toDistrict,
        preferredCurrency,
        passengerCount,
      ],
      queryFn: async () => {
        const { data } = await pricingApi.quote({
          vehicleType: v.type,
          from: fromDistrict,
          to: toDistrict,
          days: 1,
          passengers: passengerCount,
          currency: preferredCurrency,
        });
        return { type: v.type, total: data.totalForeignCurrency, currency: data.preferredCurrency };
      },
      enabled: canQuote,
      staleTime: 60_000,
    })),
  });

  const priceByType = Object.fromEntries(
    quoteQueries
      .filter((q) => q.data)
      .map((q) => [q.data!.type, q.data!])
  );

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
    );
  }

  if (uniqueTypes.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No vehicles available for {passengerCount} passenger
        {passengerCount !== 1 ? "s" : ""}.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {uniqueTypes.map((vehicle) => {
        const selected = selectedType === vehicle.type;
        const overCapacity = passengerCount > vehicle.capacity;
        const daily = priceByType[vehicle.type];

        return (
          <button
            key={vehicle.id}
            type="button"
            onClick={() => onSelect(vehicle.type)}
            className={cn(
              "flex w-full items-start gap-3 rounded-xl border p-4 text-left transition",
              selected
                ? "border-tsl-teal bg-tsl-teal/5 ring-2 ring-tsl-teal"
                : "border-border hover:border-tsl-teal/50 hover:bg-muted/30"
            )}
          >
            <div className="rounded-lg bg-tsl-sand/60 p-2 text-tsl-forest">
              {VEHICLE_ICONS[vehicle.type]}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold">{vehicle.name}</span>
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
                  {vehicle.capacity} seats
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{vehicle.type.replace("_", " ")}</p>
              {daily && (
                <p className="mt-1 text-sm font-medium text-tsl-teal">
                  {daily.currency} {daily.total.toFixed(2)}/day
                </p>
              )}
              {overCapacity && (
                <p className="mt-1 text-xs text-amber-700">
                  ⚠ Needs {passengerCount} seats, this vehicle fits {vehicle.capacity}
                </p>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}

interface PassengerCounterProps {
  value: number;
  onChange: (n: number) => void;
}

export function PassengerCounter({ value, onChange }: PassengerCounterProps) {
  return (
    <div className="inline-flex items-center gap-3 rounded-xl border bg-muted/30 p-1">
      <button
        type="button"
        onClick={() => onChange(Math.max(1, value - 1))}
        disabled={value <= 1}
        className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm hover:bg-muted disabled:opacity-40"
        aria-label="Decrease passengers"
      >
        <Minus className="h-4 w-4" />
      </button>
      <span className="min-w-[2rem] text-center text-lg font-semibold">{value}</span>
      <button
        type="button"
        onClick={() => onChange(Math.min(20, value + 1))}
        disabled={value >= 20}
        className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm hover:bg-muted disabled:opacity-40"
        aria-label="Increase passengers"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}

export function getSelectedVehicleCapacity(
  vehicles: Vehicle[],
  vehicleType: string
): number | null {
  const match = vehicles.find((v) => v.type === vehicleType);
  return match?.capacity ?? null;
}
