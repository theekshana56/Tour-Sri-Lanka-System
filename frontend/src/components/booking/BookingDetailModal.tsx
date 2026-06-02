"use client";

import { format, parseISO } from "date-fns";
import { StatusBadge } from "@/components/common/StatusBadge";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatPickupTime } from "@/lib/booking-utils";
import type { CustomerBooking } from "@/types";

interface BookingDetailModalProps {
  booking: CustomerBooking | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BookingDetailModal({
  booking,
  open,
  onOpenChange,
}: BookingDetailModalProps) {
  if (!booking) return null;

  const start = parseISO(booking.startDate);
  const end = parseISO(booking.endDate);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-mono">{booking.bookingNumber}</DialogTitle>
          <DialogClose onClose={() => onOpenChange(false)} />
        </DialogHeader>
        <div className="space-y-4 p-4 pt-0 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Status</span>
            <StatusBadge status={booking.status} />
          </div>
          <Row label="Route" value={`${booking.fromDistrict} → ${booking.toDistrict}`} />
          <Row label="Pickup" value={booking.pickupLocation} />
          <Row label="Pickup time" value={formatPickupTime(booking.pickupTime)} />
          <Row label="Drop-off" value={booking.dropLocation} />
          <Row
            label="Dates"
            value={`${format(start, "MMM d")} – ${format(end, "MMM d, yyyy")} (${booking.numberOfDays} days)`}
          />
          <Row
            label="Vehicle"
            value={`${booking.vehicleType.replace("_", " ")} · ${booking.passengerCount} passengers`}
          />
          {booking.selectedPlaceNames?.length > 0 && (
            <Row label="Places" value={booking.selectedPlaceNames.join(" → ")} />
          )}
          <Row
            label="Price"
            value={`LKR ${Number(booking.totalPriceLKR).toLocaleString()} · ${booking.preferredCurrency} ${Number(booking.totalPriceForeign).toFixed(2)}`}
          />
          {booking.assignedDriverName && (
            <Row
              label="Driver"
              value={`${booking.assignedDriverName}${booking.assignedDriverPhone ? ` · ${booking.assignedDriverPhone}` : ""}`}
            />
          )}
          {booking.rejectionReason && (
            <div className="rounded-lg bg-red-50 p-3 text-red-800">
              <p className="font-medium">Rejection reason</p>
              <p className="mt-1">{booking.rejectionReason}</p>
            </div>
          )}
          {booking.customerNotes && (
            <Row label="Notes" value={booking.customerNotes} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b py-2 last:border-0">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}
