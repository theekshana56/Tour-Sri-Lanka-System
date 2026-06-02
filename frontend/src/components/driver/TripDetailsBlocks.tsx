"use client";

import { format, parseISO } from "date-fns";
import { Car, MapPin, Users, Calendar, Route, Clock } from "lucide-react";
import { formatPickupTime } from "@/lib/booking-utils";
import { formatVehicleType } from "@/lib/finance-utils";
import type { AdminBooking, DriverTripBooking } from "@/types";

function DetailRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-3">
      <div className="mt-0.5 shrink-0 text-tsl-teal">{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <div className="text-base font-semibold text-foreground">{children}</div>
      </div>
    </div>
  );
}

/** Shared trip detail blocks for driver Today + Schedule views */
export function TripDetailsBlocks({
  booking,
}: {
  booking: AdminBooking | DriverTripBooking;
}) {
  const start = parseISO(booking.startDate);
  const end = parseISO(booking.endDate);
  const vehicleLabel =
    booking.vehicleName?.trim() ||
    (booking.vehicleType ? formatVehicleType(booking.vehicleType) : "Not assigned yet");
  const places =
    booking.selectedPlaceNames?.filter(Boolean).join(" → ") || "—";

  return (
    <div className="space-y-4">
      <DetailRow icon={<Route className="h-5 w-5" />} label="Route">
        {booking.fromDistrict} → {booking.toDistrict}
      </DetailRow>

      <DetailRow icon={<Calendar className="h-5 w-5" />} label="Pickup date">
        <p>{format(start, "EEEE, MMMM d, yyyy")}</p>
        <p className="mt-2 text-sm font-normal text-muted-foreground">
          Trip ends {format(end, "EEEE, MMMM d, yyyy")} ({booking.numberOfDays}{" "}
          {booking.numberOfDays === 1 ? "day" : "days"})
        </p>
      </DetailRow>

      <DetailRow icon={<Clock className="h-5 w-5" />} label="Pickup time">
        {formatPickupTime(booking.pickupTime)}
      </DetailRow>

      <DetailRow icon={<Car className="h-5 w-5" />} label="Your vehicle">
        {vehicleLabel}
        {booking.vehicleName && booking.vehicleType && (
          <span className="mt-1 block text-sm font-normal text-muted-foreground">
            {formatVehicleType(booking.vehicleType)}
          </span>
        )}
      </DetailRow>

      <DetailRow icon={<Users className="h-5 w-5" />} label="Passenger">
        {booking.customerName}
        <span className="mt-1 block text-sm font-normal text-muted-foreground">
          {booking.passengerCount}{" "}
          {booking.passengerCount === 1 ? "passenger" : "passengers"} total
        </span>
      </DetailRow>

      <DetailRow icon={<MapPin className="h-5 w-5" />} label="Places to visit">
        {places}
      </DetailRow>
    </div>
  );
}

export function TripLocationBlocks({
  booking,
  mapsPickup,
  mapsDrop,
}: {
  booking: AdminBooking | DriverTripBooking;
  mapsPickup: string;
  mapsDrop: string;
}) {
  return (
    <>
      <div className="space-y-1 rounded-lg bg-emerald-50/80 p-3">
        <p className="text-sm font-medium text-emerald-900">Pickup location</p>
        <p className="text-base font-bold">{booking.pickupLocation}</p>
        <a
          href={mapsPickup}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block min-h-[44px] py-2 text-base font-semibold text-tsl-teal underline"
        >
          Open pickup in Maps
        </a>
      </div>

      <div className="space-y-1 rounded-lg bg-slate-50 p-3">
        <p className="text-sm font-medium text-muted-foreground">Drop-off location</p>
        <p className="text-base font-bold">{booking.dropLocation}</p>
        <a
          href={mapsDrop}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block min-h-[44px] py-2 text-base font-semibold text-tsl-teal underline"
        >
          Open drop-off in Maps
        </a>
      </div>
    </>
  );
}
