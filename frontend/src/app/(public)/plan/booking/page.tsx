"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
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
import { authApi, bookingApi } from "@/lib/api";
import {
  bookingFormSchema,
  COUNTRY_CODES,
  combineWhatsapp,
  getBookingContactDefaultsFromUser,
  type BookingFormValues,
} from "@/lib/schemas/bookingForm";
import { useTripStore } from "@/store/tripStore";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";

const BOOKING_LOGIN_REDIRECT = "/plan/booking";

export default function BookingPage() {
  const router = useRouter();
  const { selectedPlaces, tripConfig, priceQuote, clearTrip } = useTripStore();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const storedUser = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const [submitting, setSubmitting] = useState(false);
  const prefillApplied = useRef(false);

  const { data: profileUser, isLoading: profileLoading } = useQuery({
    queryKey: ["auth", "me", "booking-prefill"],
    queryFn: async () => {
      const { data } = await authApi.me();
      return data;
    },
    enabled: isAuthenticated,
    staleTime: 60_000,
    retry: false,
  });

  const accountUser = profileUser ?? storedUser;

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      customerName: "",
      customerEmail: "",
      countryCode: "+94",
      whatsappNumber: "",
      customerNotes: tripConfig?.customerNotes ?? "",
      agreeToTerms: false,
    },
  });

  const {
    register,
    handleSubmit,
    watch,
    reset,
    getValues,
    formState: { errors },
  } = form;

  const notes = watch("customerNotes") ?? "";
  const notesLength = notes.length;

  useEffect(() => {
    if (!isAuthenticated || prefillApplied.current || profileLoading) return;
    if (!accountUser) return;

    const contact = getBookingContactDefaultsFromUser(
      accountUser,
      tripConfig?.customerNotes
    );
    reset({
      ...contact,
      agreeToTerms: getValues("agreeToTerms"),
    });
    prefillApplied.current = true;
  }, [
    isAuthenticated,
    accountUser,
    profileLoading,
    reset,
    getValues,
    tripConfig?.customerNotes,
  ]);

  useEffect(() => {
    if (profileUser) {
      setUser(profileUser);
    }
  }, [profileUser, setUser]);

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
        pickupTime: tripConfig.pickupTime,
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

  const showProfileLoading = isAuthenticated && profileLoading && !storedUser;
  const firstName = accountUser?.fullName?.split(/\s+/)[0];

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

            {showProfileLoading ? (
              <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
                <LoadingSpinner size="sm" />
                Loading your account details…
              </div>
            ) : isAuthenticated && accountUser ? (
              <div
                className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50/80 p-4 text-sm"
                role="status"
              >
                <p className="font-medium text-emerald-900">
                  Welcome back{firstName ? `, ${firstName}` : ""}!
                </p>
                <p className="mt-1 text-emerald-800">
                  Your name, email, and WhatsApp are filled in from your account.
                  Edit any field if you need different contact details for this trip.
                </p>
              </div>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">
                Already registered?{" "}
                <Link
                  href={`/login?redirect=${encodeURIComponent(BOOKING_LOGIN_REDIRECT)}`}
                  className="font-medium text-tsl-teal hover:underline"
                >
                  Sign in
                </Link>{" "}
                to fill your details automatically.
              </p>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
              <Field label="Full Name" error={errors.customerName?.message}>
                <Input
                  {...register("customerName")}
                  autoComplete="name"
                  placeholder="Your full name"
                />
              </Field>

              <Field label="Email Address" error={errors.customerEmail?.message}>
                <Input
                  {...register("customerEmail")}
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                />
              </Field>

              <Field label="WhatsApp Number" error={errors.whatsappNumber?.message}>
                <div className="flex gap-2">
                  <select
                    {...register("countryCode")}
                    className="h-10 w-32 shrink-0 rounded-md border bg-background px-2 text-sm"
                    aria-label="Country code"
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
                    autoComplete="tel-national"
                    inputMode="numeric"
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
                disabled={submitting || showProfileLoading}
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
