"use client";

import { useState } from "react";
import { format, parseISO } from "date-fns";
import { ArrowRight, FileDown, MessageCircle, Users } from "lucide-react";
import { TripCommunicationDialog } from "@/components/communication/TripCommunicationDialog";
import { communicationApi } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { StatusBadge } from "@/components/common/StatusBadge";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { BookingDetailModal } from "@/components/booking/BookingDetailModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCancelBooking } from "@/hooks/useMyBookings";
import { getApiErrorMessage } from "@/lib/api-errors";
import type { CustomerBooking } from "@/types";

interface BookingCardProps {
  booking: CustomerBooking;
}

export function BookingCard({ booking }: BookingCardProps) {
  const [detailOpen, setDetailOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [commOpen, setCommOpen] = useState(false);
  const cancelMutation = useCancelBooking();

  const { data: conversation } = useQuery({
    queryKey: ["booking-conversation", booking.id],
    queryFn: async () => {
      const { data } = await communicationApi.getByBooking(booking.id);
      return data;
    },
    enabled: booking.status === "APPROVED" && !!booking.assignedDriverId,
    retry: false,
  });

  const start = parseISO(booking.startDate);
  const end = parseISO(booking.endDate);

  const handleCancel = async () => {
    try {
      await cancelMutation.mutateAsync(booking.id);
      toast.success("Booking cancelled");
      setCancelOpen(false);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Could not cancel booking"));
    }
  };

  return (
    <>
      <Card className="overflow-hidden border-tsl-teal/10 shadow-sm">
        <CardContent className="space-y-3 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-mono text-lg font-bold text-tsl-forest">
              {booking.bookingNumber}
            </span>
            <StatusBadge status={booking.status} />
          </div>

          <div className="flex items-center gap-2 text-sm font-medium">
            <span>{booking.fromDistrict}</span>
            <ArrowRight className="h-4 w-4 text-tsl-teal" />
            <span>{booking.toDistrict}</span>
          </div>

          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
            <span>
              📅 {format(start, "MMM d")}–{format(end, "MMM d")} ({booking.numberOfDays}{" "}
              days)
            </span>
            <span className="inline-flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {booking.passengerCount} passengers
            </span>
            <span>🚗 {booking.vehicleType.replace("_", " ")}</span>
          </div>

          <div className="text-sm">
            <span className="font-semibold text-foreground">
              LKR {Number(booking.totalPriceLKR).toLocaleString()}
            </span>
            <span className="ml-2 text-muted-foreground">
              ≈ {booking.preferredCurrency}{" "}
              {Number(booking.totalPriceForeign).toFixed(2)}
            </span>
          </div>

          {booking.status === "APPROVED" && booking.assignedDriverName && (
            <div className="space-y-2 rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-900">
              <p>
                Your driver: <strong>{booking.assignedDriverName}</strong>
              </p>
              {conversation && (
                <Button
                  type="button"
                  size="sm"
                  className="w-full bg-tsl-teal hover:bg-tsl-teal/90"
                  onClick={() => setCommOpen(true)}
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Message or call driver (secure)
                </Button>
              )}
            </div>
          )}

          {booking.status === "REJECTED" && booking.rejectionReason && (
            <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">
              Reason: {booking.rejectionReason}
            </div>
          )}

          <div className="flex flex-wrap gap-2 border-t pt-3">
            {booking.pdfUrl && (
              <a
                href={booking.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-8 items-center gap-1 rounded-lg border border-input bg-background px-3 text-xs font-medium hover:bg-muted"
              >
                <FileDown className="h-4 w-4" />
                Download PDF
              </a>
            )}
            {booking.status === "PENDING" && (
              <Button
                variant="outline"
                size="sm"
                className="border-red-200 text-red-700 hover:bg-red-50"
                onClick={() => setCancelOpen(true)}
              >
                Cancel Booking
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDetailOpen(true)}
            >
              View Details
            </Button>
          </div>
        </CardContent>
      </Card>

      <BookingDetailModal
        booking={booking}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />

      {conversation && (
        <TripCommunicationDialog
          open={commOpen}
          onOpenChange={setCommOpen}
          conversationId={conversation.id}
          bookingNumber={booking.bookingNumber}
          peerLabel={booking.assignedDriverName ?? "Your driver"}
        />
      )}

      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Cancel booking?</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 p-4 pt-0">
            <p className="text-sm text-muted-foreground">
              Cancel <span className="font-mono font-medium">{booking.bookingNumber}</span>?
              This cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setCancelOpen(false)}>
                Keep booking
              </Button>
              <Button
                variant="destructive"
                disabled={cancelMutation.isPending}
                onClick={handleCancel}
              >
                {cancelMutation.isPending ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  "Yes, cancel"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
