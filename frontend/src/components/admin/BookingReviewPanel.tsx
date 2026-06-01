"use client";

import { useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetBody,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { adminApi, availabilityApi } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api-errors";
import type { AdminBooking } from "@/types";

interface BookingReviewPanelProps {
  booking: AdminBooking | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated?: () => void;
  canComplete?: boolean;
}

export function BookingReviewPanel({
  booking,
  open,
  onOpenChange,
  onUpdated,
  canComplete = true,
}: BookingReviewPanelProps) {
  const queryClient = useQueryClient();
  const [vehicleId, setVehicleId] = useState("");
  const [driverId, setDriverId] = useState("");
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    setVehicleId("");
    setDriverId("");
    setRejectReason("");
  }, [booking?.id]);

  const from = booking?.startDate ?? "";
  const to = booking?.endDate ?? "";
  const capacity = booking?.passengerCount ?? 1;

  const { data: vehicles = [] } = useQuery({
    queryKey: ["avail-vehicles", from, to, capacity],
    queryFn: async () =>
      (await availabilityApi.vehicles(from, to, capacity)).data,
    enabled: open && !!booking && booking.status === "PENDING" && !!from && !!to,
  });

  const { data: drivers = [] } = useQuery({
    queryKey: ["avail-drivers", from, to],
    queryFn: async () => (await availabilityApi.drivers(from, to)).data,
    enabled: open && !!booking && booking.status === "PENDING" && !!from && !!to,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-bookings"] });
    queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
    onUpdated?.();
  };

  const approveMutation = useMutation({
    mutationFn: () =>
      adminApi.approveBooking(booking!.id, { vehicleId, driverId }),
    onSuccess: () => {
      toast.success("Booking approved and assigned");
      invalidate();
      onOpenChange(false);
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const rejectMutation = useMutation({
    mutationFn: () =>
      adminApi.rejectBooking(booking!.id, {
        rejectionReason: rejectReason.trim(),
      }),
    onSuccess: () => {
      toast.success("Booking rejected");
      setRejectOpen(false);
      invalidate();
      onOpenChange(false);
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const completeMutation = useMutation({
    mutationFn: () => adminApi.completeBooking(booking!.id),
    onSuccess: () => {
      toast.success("Booking marked complete");
      invalidate();
      onOpenChange(false);
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  if (!booking) return null;

  const whatsappDigits = booking.customerWhatsapp?.replace(/\D/g, "") ?? "";
  const canApprove =
    booking.status === "PENDING" && vehicleId && driverId && !approveMutation.isPending;

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle className="font-mono">{booking.bookingNumber}</SheetTitle>
            <SheetClose onClose={() => onOpenChange(false)} />
          </SheetHeader>
          <SheetBody className="space-y-5">
            <div className="flex items-center justify-between">
              <StatusBadge status={booking.status} />
              <span className="text-sm text-muted-foreground">
                Submitted{" "}
                {booking.createdAt
                  ? format(parseISO(booking.createdAt), "MMM d, yyyy HH:mm")
                  : "—"}
              </span>
            </div>

            <Section title="Customer">
              <p className="font-medium">{booking.customerName}</p>
              <p className="mt-2 text-sm">
                <a
                  href={`mailto:${booking.customerEmail}`}
                  className="text-tsl-teal hover:underline"
                >
                  {booking.customerEmail}
                </a>
              </p>
              {whatsappDigits && (
                <p className="mt-1 text-sm">
                  <a
                    href={`https://wa.me/${whatsappDigits}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-tsl-teal hover:underline"
                  >
                    WhatsApp: {booking.customerWhatsapp}
                  </a>
                </p>
              )}
            </Section>

            <Section title="Trip">
              <DetailRow
                label="Route"
                value={`${booking.fromDistrict} → ${booking.toDistrict}`}
              />
              <DetailRow label="Pickup" value={booking.pickupLocation} />
              <DetailRow label="Drop-off" value={booking.dropLocation} />
              <DetailRow
                label="Dates"
                value={`${format(parseISO(booking.startDate), "MMM d")} – ${format(parseISO(booking.endDate), "MMM d, yyyy")} (${booking.numberOfDays} days)`}
              />
              <DetailRow
                label="Passengers"
                value={String(booking.passengerCount)}
              />
              <DetailRow
                label="Vehicle type"
                value={booking.vehicleType.replace("_", " ")}
              />
              {booking.selectedPlaceNames?.length > 0 && (
                <DetailRow
                  label="Places"
                  value={booking.selectedPlaceNames.join(" → ")}
                />
              )}
              <DetailRow
                label="Price"
                value={`LKR ${Number(booking.totalPriceLKR).toLocaleString()}`}
              />
              {booking.customerNotes && (
                <DetailRow label="Notes" value={booking.customerNotes} />
              )}
            </Section>

            {booking.status === "APPROVED" && (
              <Section title="Assignment">
                <DetailRow label="Vehicle" value={booking.vehicleName ?? "—"} />
                <DetailRow
                  label="Driver"
                  value={
                    booking.assignedDriverName
                      ? `${booking.assignedDriverName}${booking.assignedDriverPhone ? ` · ${booking.assignedDriverPhone}` : ""}`
                      : "—"
                  }
                />
              </Section>
            )}

            {booking.status === "REJECTED" && booking.rejectionReason && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800">
                <p className="font-medium">Rejection reason</p>
                <p className="mt-1">{booking.rejectionReason}</p>
              </div>
            )}

            {booking.pdfUrl && (
              <a
                href={booking.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-sm font-medium text-tsl-teal hover:underline"
              >
                Download PDF
              </a>
            )}

            {booking.status === "PENDING" && (
              <div className="space-y-4 border-t pt-4">
                <div>
                  <Label htmlFor="vehicle">Assign vehicle</Label>
                  <select
                    id="vehicle"
                    value={vehicleId}
                    onChange={(e) => setVehicleId(e.target.value)}
                    className="mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm"
                  >
                    <option value="">Select vehicle…</option>
                    {vehicles.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name} · {v.type} · {v.capacity} seats
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="driver">Assign driver</Label>
                  <select
                    id="driver"
                    value={driverId}
                    onChange={(e) => setDriverId(e.target.value)}
                    className="mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm"
                  >
                    <option value="">Select driver…</option>
                    {drivers.map((d) => (
                      <option key={d.driverId} value={d.driverId}>
                        {d.driverName}
                        {d.vehicleName ? ` · ${d.vehicleName}` : ""}
                      </option>
                    ))}
                  </select>
                </div>
                <Button
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                  disabled={!canApprove}
                  onClick={() => approveMutation.mutate()}
                >
                  {approveMutation.isPending ? "Approving…" : "Approve & Assign"}
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-red-300 text-red-600 hover:bg-red-50"
                  onClick={() => setRejectOpen(true)}
                >
                  Reject Booking
                </Button>
              </div>
            )}

            {canComplete && booking.status === "APPROVED" && (
              <Button
                className="w-full"
                disabled={completeMutation.isPending}
                onClick={() => completeMutation.mutate()}
              >
                {completeMutation.isPending ? "Updating…" : "Mark Complete"}
              </Button>
            )}
          </SheetBody>
        </SheetContent>
      </Sheet>

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject booking</DialogTitle>
            <DialogClose onClose={() => setRejectOpen(false)} />
          </DialogHeader>
          <div className="space-y-4 p-4 pt-0">
            <div>
              <Label htmlFor="reason">Rejection reason (min 10 characters)</Label>
              <textarea
                id="reason"
                rows={4}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                placeholder="Explain why this booking cannot be fulfilled…"
              />
            </div>
            <Button
              className="w-full bg-red-600 hover:bg-red-700"
              disabled={
                rejectReason.trim().length < 10 || rejectMutation.isPending
              }
              onClick={() => rejectMutation.mutate()}
            >
              {rejectMutation.isPending ? "Rejecting…" : "Confirm Rejection"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h3>
      <div className="mt-2 space-y-1 text-sm">{children}</div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <p>
      <span className="text-muted-foreground">{label}: </span>
      {value}
    </p>
  );
}
