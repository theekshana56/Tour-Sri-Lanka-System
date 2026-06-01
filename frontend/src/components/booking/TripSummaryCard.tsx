"use client";

import Link from "next/link";
import { format, parseISO } from "date-fns";
import { useVehicles } from "@/hooks/useAvailability";
import { getSelectedVehicleCapacity } from "@/components/booking/VehicleSelector";
import type { Place, PriceQuote, TripConfig } from "@/types";
import { getPlaceImageUrl } from "@/lib/place-utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TripSummaryCardProps {
  places: Place[];
  tripConfig: TripConfig;
  priceQuote: PriceQuote | null;
}

export function TripSummaryCard({
  places,
  tripConfig,
  priceQuote,
}: TripSummaryCardProps) {
  const { data: vehicles = [] } = useVehicles(tripConfig.passengerCount);
  const vehicleCapacity = getSelectedVehicleCapacity(
    vehicles,
    tripConfig.vehicleType
  );
  const shown = places.slice(0, 5);
  const extra = places.length - shown.length;
  const start = parseISO(tripConfig.startDate);
  const end = parseISO(tripConfig.endDate);
  const days =
    Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  return (
    <Card className="sticky top-24 border-tsl-teal/20 bg-white/95 shadow-md">
      <CardHeader>
        <CardTitle className="font-serif text-lg text-tsl-forest">
          Your Trip Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <ul className="space-y-2">
          {shown.map((place) => {
            const thumb = getPlaceImageUrl(place.thumbnailUrl, place.imageUrls);
            return (
              <li key={place.id} className="flex items-center gap-2">
                {thumb ? (
                  <img
                    src={thumb}
                    alt=""
                    className="h-10 w-14 shrink-0 rounded object-cover"
                  />
                ) : (
                  <div className="flex h-10 w-14 shrink-0 items-center justify-center rounded bg-tsl-sand text-xs font-bold text-tsl-forest">
                    {place.name.slice(0, 2)}
                  </div>
                )}
                <span className="line-clamp-2 font-medium">{place.name}</span>
              </li>
            );
          })}
          {extra > 0 && (
            <li className="text-xs text-muted-foreground">and {extra} more</li>
          )}
        </ul>

        <div className="space-y-1.5 border-t pt-3">
          <Row label="Route" value={`${tripConfig.fromDistrict} → ${tripConfig.toDistrict}`} />
          <Row
            label="Dates"
            value={`${format(start, "MMM d")} – ${format(end, "MMM d, yyyy")} (${days} days)`}
          />
          <Row
            label="Vehicle"
            value={
              vehicleCapacity
                ? `${tripConfig.vehicleType.replace("_", " ")} · Up to ${vehicleCapacity} passengers`
                : `${tripConfig.vehicleType.replace("_", " ")}`
            }
          />
          <Row label="Passengers" value={`${tripConfig.passengerCount} people`} />
        </div>

        {priceQuote && (
          <>
            <div className="border-t pt-3">
              <p className="text-2xl font-bold text-tsl-teal">
                {priceQuote.preferredCurrency}{" "}
                {priceQuote.totalForeignCurrency.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
              <p className="text-xs text-muted-foreground">
                ≈ LKR{" "}
                {priceQuote.totalLKR.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
          </>
        )}

        <Link
          href="/plan/details"
          className="inline-block text-xs text-tsl-teal hover:underline"
        >
          ← Edit Trip
        </Link>
      </CardContent>
    </Card>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-muted-foreground">{label}: </span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
