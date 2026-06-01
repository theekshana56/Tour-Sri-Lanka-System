"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { getApiErrorMessage } from "@/lib/api-errors";
import { BookingProgressStepper } from "@/components/booking/BookingProgressStepper";
import { TripSummaryCard } from "@/components/booking/TripSummaryCard";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { bookingApi } from "@/lib/api";
import {
  bookingFormSchema,
  COUNTRY_CODES,
  combineWhatsapp,
  type BookingFormValues,
} from "@/lib/schemas/bookingForm";
import { useTripStore } from "@/store/tripStore";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";

export default function BookingPage() {
  const router = useRouter();
  const { selectedPlaces, tripConfig, priceQuote, clearTrip } = useTripStore();
  const { user } = useAuthStore();
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      customerName: user?.fullName ?? "",
      customerEmail: user?.email ?? "",
      countryCode: "+94",
      whatsappNumber: user?.phone?.replace(/^\+\d+/, "") ?? "",
      customerNotes: tripConfig?.customerNotes ?? "",
      agreeToTerms: false,
    },
  });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = form;

  const notes = watch("customerNotes") ?? "";
  const notesLength = notes.length;

  useEffect(() => {
    if (!tripConfig) {
      router.replace("/plan/details");
    } else if (selectedPlaces.length === 0) {
      router.replace("/plan");
    }
  }, [tripConfig, selectedPlaces.length, router]);

  const onSubmit = async (values: BookingFormValues) => {
    if (!tripConfig || submitting) return;
    setSubmitting(true);

    try {
      const payload = {
        customerName: values.customerName,
        customerEmail: values.customerEmail,
        customerWhatsapp: combineWhatsapp(values.countryCode, values.whatsappNumber),
        selectedPlaceIds: selectedPlaces.map((p) => p.id),
        fromDistrict: tripConfig.fromDistrict,
        toDistrict: tripConfig.toDistrict,
        pickupLocation: tripConfig.pickupLocation,
        dropLocation: tripConfig.dropLocation,
        startDate: tripConfig.startDate,
        endDate: tripConfig.endDate,
        passengerCount: tripConfig.passengerCount,
        vehicleType: tripConfig.vehicleType,
        preferredCurrency: tripConfig.preferredCurrency,
        customerNotes: values.customerNotes || tripConfig.customerNotes,
      };

      const { data } = await bookingApi.create(payload);
      clearTrip();
      router.push(
        `/plan/confirmed?booking=${encodeURIComponent(data.bookingNumber)}`
      );
    } catch (err) {
      setSubmitting(false);
      toast.error(getApiErrorMessage(err, "Booking failed. Please try again."));
    }
  };

  if (!tripConfig || selectedPlaces.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-tsl-sand/30 to-white py-8">
      <div className="mx-auto max-w-6xl px-4">
        <BookingProgressStepper currentStep={3} />

        <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
          <div>
            <h1 className="font-serif text-2xl font-bold text-tsl-forest md:text-3xl">
              Almost there! Enter your details
            </h1>
            <p className="mt-2 text-muted-foreground">
              We&apos;ll send confirmation to your email and WhatsApp.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
              <Field label="Full Name" error={errors.customerName?.message}>
                <Input {...register("customerName")} autoComplete="name" />
              </Field>

              <Field label="Email Address" error={errors.customerEmail?.message}>
                <Input
                  {...register("customerEmail")}
                  type="email"
                  autoComplete="email"
                />
              </Field>

              <Field label="WhatsApp Number" error={errors.whatsappNumber?.message}>
                <div className="flex gap-2">
                  <select
                    {...register("countryCode")}
                    className="h-10 w-32 shrink-0 rounded-md border bg-background px-2 text-sm"
                  >
                    {COUNTRY_CODES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.flag} {c.code}
                      </option>
                    ))}
                  </select>
                  <Input
                    {...register("whatsappNumber")}
                    placeholder="771234567"
                    className="flex-1"
                  />
                </div>
              </Field>

              <Field label="Special Requests (optional)">
                <textarea
                  {...register("customerNotes")}
                  rows={4}
                  maxLength={500}
                  className="flex w-full rounded-md border bg-background px-3 py-2 text-sm"
                  placeholder="Dietary requirements, pickup time preferences..."
                />
                <p className="mt-1 text-right text-xs text-muted-foreground">
                  {notesLength}/500
                </p>
              </Field>

              <label className="flex items-start gap-3 text-sm">
                <input
                  type="checkbox"
                  {...register("agreeToTerms")}
                  className="mt-1 h-4 w-4 rounded border"
                />
                <span>
                  I agree to TSL&apos;s Terms of Service and understand this booking
                  is subject to availability confirmation.
                </span>
              </label>
              {errors.agreeToTerms && (
                <p className="text-sm text-destructive">
                  {errors.agreeToTerms.message}
                </p>
              )}

              <Button
                type="submit"
                disabled={submitting}
                className={cn(
                  "h-12 w-full text-base",
                  submitting
                    ? "bg-emerald-600/80"
                    : "bg-emerald-600 hover:bg-emerald-700"
                )}
              >
                {submitting ? (
                  <span className="inline-flex items-center gap-2">
                    <LoadingSpinner size="sm" className="border-white border-t-transparent" />
                    Confirming...
                  </span>
                ) : (
                  "Confirm Booking"
                )}
              </Button>
            </form>
          </div>

          <TripSummaryCard
            places={selectedPlaces}
            tripConfig={tripConfig}
            priceQuote={priceQuote}
          />
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
