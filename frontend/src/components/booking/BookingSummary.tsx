import type { Booking, TripPlan } from "@/types";
import { StatusBadge } from "@/components/common/StatusBadge";

interface BookingSummaryProps {
  tripPlan: TripPlan;
  totalPrice: number;
  booking?: Booking;
}

export function BookingSummary({ tripPlan, totalPrice, booking }: BookingSummaryProps) {
  return (
    <div className="rounded-lg border bg-card p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{tripPlan.title}</h3>
        {booking && <StatusBadge status={booking.status} />}
      </div>
      <dl className="mt-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Duration</dt>
          <dd>
            {tripPlan.startDate} &mdash; {tripPlan.endDate}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Days planned</dt>
          <dd>{tripPlan.days.length}</dd>
        </div>
        <div className="flex justify-between border-t pt-2 font-semibold">
          <dt>Total</dt>
          <dd>LKR {totalPrice.toLocaleString()}</dd>
        </div>
      </dl>
    </div>
  );
}
