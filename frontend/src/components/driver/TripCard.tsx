"use client";



import { useState } from "react";

import { isWithinInterval, parseISO } from "date-fns";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { MessageCircle, Phone } from "lucide-react";

import toast from "react-hot-toast";

import { StatusBadge } from "@/components/common/StatusBadge";

import { TripCommunicationDialog } from "@/components/communication/TripCommunicationDialog";

import { Button } from "@/components/ui/button";

import {

  Dialog,

  DialogClose,

  DialogContent,

  DialogHeader,

  DialogTitle,

} from "@/components/ui/dialog";

import {

  TripDetailsBlocks,

  TripLocationBlocks,

} from "@/components/driver/TripDetailsBlocks";

import { driverApi } from "@/lib/api";

import { getApiErrorMessage } from "@/lib/api-errors";

import type { DriverTripBooking } from "@/types";



interface TripCardProps {

  booking: DriverTripBooking;

}



export function TripCard({ booking }: TripCardProps) {

  const queryClient = useQueryClient();

  const [confirmOpen, setConfirmOpen] = useState(false);

  const [commOpen, setCommOpen] = useState(false);



  const mapsPickup = `https://maps.google.com/?q=${encodeURIComponent(booking.pickupLocation)}`;

  const mapsDrop = `https://maps.google.com/?q=${encodeURIComponent(booking.dropLocation)}`;



  const today = new Date();

  const inTripWindow =

    booking.status === "APPROVED" &&

    isWithinInterval(today, {

      start: parseISO(booking.startDate),

      end: parseISO(booking.endDate),

    });



  const canContact =

    booking.status === "APPROVED" && !!booking.conversationId;



  const completeMutation = useMutation({

    mutationFn: () => driverApi.completeBooking(booking.id),

    onSuccess: () => {

      toast.success("Trip marked complete");

      queryClient.invalidateQueries({ queryKey: ["driver-today"] });

      queryClient.invalidateQueries({ queryKey: ["driver-bookings"] });

      setConfirmOpen(false);

    },

    onError: (err) => toast.error(getApiErrorMessage(err)),

  });



  return (

    <>

      <article className="rounded-xl border border-l-4 border-l-emerald-600 bg-white p-5 shadow-sm">

        <div className="flex items-start justify-between gap-3">

          <p className="font-mono text-lg font-bold">{booking.bookingNumber}</p>

          <StatusBadge status={booking.status} className="text-sm" />

        </div>



        <div className="mt-4">

          <TripDetailsBlocks booking={booking} />

        </div>



        {booking.customerNotes && (

          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3">

            <p className="text-sm font-medium text-amber-900">Customer notes</p>

            <p className="mt-1 text-base">{booking.customerNotes}</p>

          </div>

        )}



        {canContact && (

          <div className="mt-4 grid grid-cols-2 gap-2">

            <Button

              type="button"

              className="min-h-[48px] bg-tsl-teal text-base font-semibold hover:bg-tsl-teal/90"

              onClick={() => setCommOpen(true)}

            >

              <MessageCircle className="mr-2 h-5 w-5" />

              Message

            </Button>

            <Button

              type="button"

              variant="outline"

              className="min-h-[48px] border-2 border-tsl-teal text-base font-semibold text-tsl-teal"

              onClick={() => setCommOpen(true)}

            >

              <Phone className="mr-2 h-5 w-5" />

              Call

            </Button>

          </div>

        )}



        {booking.status === "APPROVED" && !booking.conversationId && (

          <p className="mt-4 text-sm text-muted-foreground">

            Secure chat opens when this trip is fully confirmed.

          </p>

        )}



        <hr className="my-4 border-dashed" />



        <div className="space-y-3">

          <TripLocationBlocks

            booking={booking}

            mapsPickup={mapsPickup}

            mapsDrop={mapsDrop}

          />

        </div>



        <p className="mt-4 inline-block rounded-lg bg-emerald-100 px-4 py-2 text-lg font-bold text-emerald-900">

          LKR {Number(booking.totalPriceLKR).toLocaleString()}

        </p>



        {inTripWindow && (

          <Button

            variant="outline"

            className="mt-4 min-h-[48px] w-full border-2 border-emerald-600 text-base font-semibold text-emerald-700"

            onClick={() => setConfirmOpen(true)}

          >

            Mark as completed

          </Button>

        )}

      </article>



      {booking.conversationId && (

        <TripCommunicationDialog

          open={commOpen}

          onOpenChange={setCommOpen}

          conversationId={booking.conversationId}

          bookingNumber={booking.bookingNumber}

          peerLabel={booking.customerName}

        />

      )}



      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>

        <DialogContent>

          <DialogHeader>

            <DialogTitle>Confirm completion</DialogTitle>

            <DialogClose onClose={() => setConfirmOpen(false)} />

          </DialogHeader>

          <p className="px-4 pb-2 text-base">

            Confirm trip completion for {booking.bookingNumber}?

          </p>

          <div className="flex gap-3 p-4 pt-0">

            <Button

              variant="outline"

              className="min-h-[48px] flex-1 text-base"

              onClick={() => setConfirmOpen(false)}

            >

              Cancel

            </Button>

            <Button

              className="min-h-[48px] flex-1 bg-emerald-600 text-base hover:bg-emerald-700"

              disabled={completeMutation.isPending}

              onClick={() => completeMutation.mutate()}

            >

              {completeMutation.isPending ? "Saving…" : "Confirm"}

            </Button>

          </div>

        </DialogContent>

      </Dialog>

    </>

  );

}


