"use client";

import { useEffect } from "react";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import { BookingStatusProgress } from "@/components/booking/BookingStatusProgress";
import { StatusBadge } from "@/components/common/StatusBadge";
import { useBookingTrack } from "@/hooks/useBookingTrack";
import { formatPickupTime } from "@/lib/booking-utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TrackPageProps {
  params: { bookingNumber: string };
}

export default function TrackBookingPage({ params }: TrackPageProps) {
  const bookingNumber = decodeURIComponent(params.bookingNumber);
  const { data: booking, isLoading, isError } = useBookingTrack(bookingNumber);

  useEffect(() => {
    document.title = `Tracking Booking ${bookingNumber} | TSL`;
  }, [bookingNumber]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-tsl-sand/20 to-white py-10">
        <div className="mx-auto max-w-2xl animate-pulse space-y-6 px-4">
          <div className="h-4 w-32 rounded bg-muted" />
          <div className="h-8 w-48 rounded bg-muted" />
          <div className="flex justify-between gap-2 pt-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 w-10 rounded-full bg-muted" />
            ))}
          </div>
          <div className="h-24 rounded-xl bg-muted" />
          <div className="h-40 rounded-xl bg-muted" />
        </div>
      </div>
    );
  }

  if (isError || !booking) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <h1 className="font-serif text-2xl font-bold">Booking not found</h1>
        <p className="mt-2 text-muted-foreground">
          We couldn&apos;t find a booking with reference{" "}
          <span className="font-mono">{bookingNumber}</span>.
        </p>
        <Link href="/plan" className="mt-6 inline-block text-tsl-teal hover:underline">
          Plan a new trip
        </Link>
      </div>
    );
  }

  const start = parseISO(booking.startDate);
  const end = parseISO(booking.endDate);

  return (
    <div className="min-h-screen bg-gradient-to-b from-tsl-sand/20 to-white py-10">
      <div className="mx-auto max-w-2xl px-4">
        <p className="text-sm text-muted-foreground">Track your booking</p>
        <h1 className="font-serif text-2xl font-bold text-tsl-forest md:text-3xl">
          {booking.bookingNumber}
        </h1>

        <div className="mt-8">
          <BookingStatusProgress status={booking.status} />
        </div>

        <div className="mt-8 flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Status</span>
          <StatusBadge status={booking.status} className="text-sm px-3 py-1" />
        </div>

        {booking.status === "REJECTED" && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4">
            <h2 className="font-semibold text-red-800">Booking not approved</h2>
            <p className="mt-2 text-sm text-red-700">
              {booking.rejectionReason ?? "No reason provided."}
            </p>
          </div>
        )}

        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="font-serif text-lg">Trip details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <DetailRow
              label="Dates"
              value={`${format(start, "MMM d, yyyy")} – ${format(end, "MMM d, yyyy")} (${booking.numberOfDays} days)`}
            />
            {booking.pickupTime && (
              <DetailRow
                label="Pickup time"
                value={formatPickupTime(booking.pickupTime)}
              />
            )}
            <DetailRow
              label="Route"
              value={`${booking.fromDistrict} → ${booking.toDistrict}`}
            />
            <DetailRow
              label="Vehicle"
              value={`${booking.vehicleType.replace("_", " ")}${booking.vehicleName ? ` · ${booking.vehicleName}` : ""}`}
            />
            <DetailRow label="Passengers" value={String(booking.passengerCount)} />
            {booking.totalPriceForeign != null && booking.preferredCurrency && (
              <DetailRow
                label="Price"
                value={`${booking.preferredCurrency} ${Number(booking.totalPriceForeign).toFixed(2)}`}
              />
            )}
          </CardContent>
        </Card>

        {booking.status === "APPROVED" && booking.assignedDriverName && (
          <Card className="mt-6 border-zinc-200 bg-zinc-50/50">
            <CardHeader>
              <CardTitle className="text-base text-black">
                Your driver
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium">{booking.assignedDriverName}</p>
              <p className="text-xs text-muted-foreground">
                Contact details shared via email after confirmation.
              </p>
            </CardContent>
          </Card>
        )}

        {booking.pdfUrl && (
          <div className="mt-6">
            <a
              href={booking.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 items-center justify-center rounded-lg bg-tsl-teal px-4 text-sm font-medium text-white hover:bg-tsl-teal/90"
            >
              ⬇ Download Booking PDF
            </a>
          </div>
        )}

        <p className="mt-10 text-center text-sm text-muted-foreground">
          Need help?{" "}
          <a href="mailto:support@tsl.lk" className="text-tsl-teal hover:underline">
            Contact us: support@tsl.lk
          </a>
        </p>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b py-2 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
