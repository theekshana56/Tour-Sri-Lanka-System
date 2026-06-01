"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { differenceInCalendarDays, format, isBefore, startOfDay } from "date-fns";
import { BookingProgressStepper } from "@/components/booking/BookingProgressStepper";
import { AvailabilityCalendar } from "@/components/booking/AvailabilityCalendar";
import { AvailabilityCheckResult } from "@/components/booking/AvailabilityCheckResult";
import { PriceQuoteCard } from "@/components/booking/PriceQuote";
import {
  getSelectedVehicleCapacity,
  PassengerCounter,
  VehicleSelector,
} from "@/components/booking/VehicleSelector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useDistricts } from "@/hooks/usePlaces";
import { useAvailabilityCheck, useVehicles, usePriceQuote } from "@/hooks/useAvailability";
import { useDebouncedValue } from "@/hooks/useDebounce";
import {
  tripDetailsSchema,
  type TripDetailsFormValues,
} from "@/lib/schemas/tripDetails";
import { useTripStore } from "@/store/tripStore";
import type { Place, VehicleType } from "@/types";
import { cn } from "@/lib/utils";

const CURRENCIES = [
  { code: "USD", label: "🇺🇸 USD" },
  { code: "EUR", label: "🇪🇺 EUR" },
  { code: "GBP", label: "🇬🇧 GBP" },
  { code: "AUD", label: "🇦🇺 AUD" },
  { code: "JPY", label: "🇯🇵 JPY" },
  { code: "INR", label: "🇮🇳 INR" },
  { code: "CAD", label: "🇨🇦 CAD" },
  { code: "SGD", label: "🇸🇬 SGD" },
  { code: "CNY", label: "🇨🇳 CNY" },
  { code: "AED", label: "🇦🇪 AED" },
];

function inferDistricts(places: Place[]) {
  if (places.length === 0) return { from: "", to: "" };
  const from = places[0].district;
  const to = places[places.length - 1].district;
  const allSame = places.every((p) => p.district === from);
  return {
    from: allSame ? from : from,
    to: allSame && places.length === 1 ? "" : to,
  };
}

export default function TripDetailsPage() {
  const router = useRouter();
  const { selectedPlaces, tripConfig, setTripConfig, setPriceQuote } = useTripStore();
  const { data: districts = [] } = useDistricts();

  const defaults = useMemo(() => {
    const inferred = inferDistricts(selectedPlaces);
    return {
      fromDistrict: tripConfig?.fromDistrict ?? inferred.from,
      toDistrict: tripConfig?.toDistrict ?? inferred.to,
      pickupLocation: tripConfig?.pickupLocation ?? "",
      dropLocation: tripConfig?.dropLocation ?? "",
      passengerCount: tripConfig?.passengerCount ?? 2,
      vehicleType: tripConfig?.vehicleType ?? "",
      preferredCurrency: tripConfig?.preferredCurrency ?? "USD",
      startDate: tripConfig?.startDate ? new Date(tripConfig.startDate) : undefined,
      endDate: tripConfig?.endDate ? new Date(tripConfig.endDate) : undefined,
      customerNotes: tripConfig?.customerNotes ?? "",
    };
  }, [selectedPlaces, tripConfig]);

  const form = useForm<TripDetailsFormValues>({
    resolver: zodResolver(tripDetailsSchema),
    defaultValues: {
      fromDistrict: defaults.fromDistrict,
      toDistrict: defaults.toDistrict,
      pickupLocation: defaults.pickupLocation,
      dropLocation: defaults.dropLocation,
      passengerCount: defaults.passengerCount,
      vehicleType: defaults.vehicleType,
      preferredCurrency: defaults.preferredCurrency,
      startDate: defaults.startDate,
      endDate: defaults.endDate,
      customerNotes: defaults.customerNotes,
    },
    mode: "onChange",
  });

  const {
    register,
    watch,
    setValue,
    resetField,
    handleSubmit,
    formState: { errors },
  } = form;

  useEffect(() => {
    if (selectedPlaces.length === 0) {
      router.replace("/plan");
    }
  }, [selectedPlaces.length, router]);

  const fromDistrict = watch("fromDistrict");
  const toDistrict = watch("toDistrict");
  const passengerCount = watch("passengerCount");
  const vehicleType = watch("vehicleType");
  const preferredCurrency = watch("preferredCurrency");
  const startDate = watch("startDate");
  const endDate = watch("endDate");

  const [dateSelectionTarget, setDateSelectionTarget] = useState<"start" | "end">(
    "start"
  );

  useEffect(() => {
    if (!startDate) {
      setDateSelectionTarget("start");
    } else if (!endDate) {
      setDateSelectionTarget("end");
    }
  }, [startDate, endDate]);

  const todayStr = format(startOfDay(new Date()), "yyyy-MM-dd");
  const startDateStr = startDate ? format(startDate, "yyyy-MM-dd") : "";
  const endDateStr = endDate ? format(endDate, "yyyy-MM-dd") : "";

  const handleStartDateInput = (value: string) => {
    if (!value) {
      resetField("startDate");
      resetField("endDate");
      setDateSelectionTarget("start");
      return;
    }
    const parsed = new Date(`${value}T12:00:00`);
    setValue("startDate", parsed, { shouldValidate: true });
    if (endDate && isBefore(endDate, parsed)) {
      resetField("endDate");
      setDateSelectionTarget("end");
    }
  };

  const handleEndDateInput = (value: string) => {
    if (!value) {
      resetField("endDate");
      setDateSelectionTarget("end");
      return;
    }
    const parsed = new Date(`${value}T12:00:00`);
    if (startDate && isBefore(parsed, startDate)) {
      setValue("startDate", parsed, { shouldValidate: true });
    }
    setValue("endDate", parsed, { shouldValidate: true });
  };

  const { data: vehicles = [], isLoading: vehiclesLoading } =
    useVehicles(passengerCount);

  const fromStr = startDate ? format(startDate, "yyyy-MM-dd") : null;
  const toStr = endDate ? format(endDate, "yyyy-MM-dd") : null;
  const { data: rangeCheck, isLoading: checkLoading } = useAvailabilityCheck(
    fromStr,
    toStr
  );

  const numberOfDays =
    startDate && endDate
      ? differenceInCalendarDays(endDate, startDate) + 1
      : 0;

  const vehicleCapacity = getSelectedVehicleCapacity(vehicles, vehicleType);
  const capacityWarning =
    vehicleCapacity != null && passengerCount > vehicleCapacity;

  const availabilityBlocked =
    !!fromStr &&
    !!toStr &&
    rangeCheck != null &&
    (!rangeCheck.available || rangeCheck.minAvailableDrivers === 0);

  const quoteParams = useMemo(() => {
    if (
      !fromDistrict ||
      !toDistrict ||
      !vehicleType ||
      numberOfDays < 1 ||
      !preferredCurrency
    ) {
      return null;
    }
    return {
      vehicleType,
      from: fromDistrict,
      to: toDistrict,
      days: numberOfDays,
      passengers: passengerCount,
      currency: preferredCurrency,
    };
  }, [
    fromDistrict,
    toDistrict,
    vehicleType,
    numberOfDays,
    passengerCount,
    preferredCurrency,
  ]);

  const debouncedQuoteParams = useDebouncedValue(quoteParams, 500);
  const { data: liveQuote } = usePriceQuote(
    debouncedQuoteParams,
    !!debouncedQuoteParams
  );

  const canContinue =
    !!fromDistrict &&
    !!toDistrict &&
    !!vehicleType &&
    !!startDate &&
    !!endDate &&
    numberOfDays > 0 &&
    !availabilityBlocked &&
    !capacityWarning;

  const onSubmit = (values: TripDetailsFormValues) => {
    if (!values.startDate || !values.endDate) return;
    const config = {
      fromDistrict: values.fromDistrict,
      toDistrict: values.toDistrict,
      pickupLocation: values.pickupLocation,
      dropLocation: values.dropLocation,
      passengerCount: values.passengerCount,
      vehicleType: values.vehicleType as VehicleType,
      preferredCurrency: values.preferredCurrency,
      startDate: format(values.startDate, "yyyy-MM-dd"),
      endDate: format(values.endDate, "yyyy-MM-dd"),
      customerNotes: values.customerNotes,
    };
    setTripConfig(config);
    if (liveQuote) setPriceQuote(liveQuote);
    router.push("/plan/booking");
  };

  if (selectedPlaces.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-tsl-sand/30 to-white py-8">
      <div className="mx-auto max-w-6xl px-4">
        <BookingProgressStepper currentStep={2} />

        <div className="mb-6 rounded-xl border border-tsl-forest/10 bg-white/80 p-4">
          <p className="text-sm text-muted-foreground">
            {selectedPlaces.length} place{selectedPlaces.length !== 1 ? "s" : ""} in your trip:{" "}
            <span className="font-medium text-foreground">
              {selectedPlaces.map((p) => p.name).join(" → ")}
            </span>
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Left — configuration */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif text-lg">Route</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Field label="From District" error={errors.fromDistrict?.message}>
                    <select
                      {...register("fromDistrict")}
                      className="flex h-10 w-full rounded-md border bg-background px-3 text-sm"
                    >
                      <option value="">Select district</option>
                      {districts.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="To District" error={errors.toDistrict?.message}>
                    <select
                      {...register("toDistrict")}
                      className="flex h-10 w-full rounded-md border bg-background px-3 text-sm"
                    >
                      <option value="">Select district</option>
                      {districts.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Pickup Address" error={errors.pickupLocation?.message}>
                    <Input
                      {...register("pickupLocation")}
                      placeholder="Hotel name, street, city..."
                    />
                  </Field>
                  <Field label="Drop-off Address" error={errors.dropLocation?.message}>
                    <Input
                      {...register("dropLocation")}
                      placeholder="Hotel name, street, city..."
                    />
                  </Field>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="font-serif text-lg">Passengers & Vehicle</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Field label="Passengers">
                    <PassengerCounter
                      value={passengerCount}
                      onChange={(n) => setValue("passengerCount", n, { shouldValidate: true })}
                    />
                  </Field>
                  <VehicleSelector
                    vehicles={vehicles}
                    passengerCount={passengerCount}
                    selectedType={vehicleType}
                    onSelect={(type) =>
                      setValue("vehicleType", type, { shouldValidate: true })
                    }
                    fromDistrict={fromDistrict}
                    toDistrict={toDistrict}
                    preferredCurrency={preferredCurrency}
                    isLoading={vehiclesLoading}
                  />
                  {errors.vehicleType && (
                    <p className="text-sm text-destructive">{errors.vehicleType.message}</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="font-serif text-lg">Currency & Notes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Field label="Preferred Currency" error={errors.preferredCurrency?.message}>
                    <select
                      {...register("preferredCurrency")}
                      className="flex h-10 w-full rounded-md border bg-background px-3 text-sm"
                    >
                      {CURRENCIES.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Notes (optional)">
                    <textarea
                      {...register("customerNotes")}
                      rows={3}
                      className="flex w-full rounded-md border bg-background px-3 py-2 text-sm"
                      placeholder="Special requests, dietary needs, accessibility..."
                    />
                  </Field>
                </CardContent>
              </Card>
            </div>

            {/* Right — calendar & pricing */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif text-lg">Trip Dates</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                  <Field label="Start Date" error={errors.startDate?.message}>
                    <Input
                      type="date"
                      min={todayStr}
                      value={startDateStr}
                      onChange={(e) => handleStartDateInput(e.target.value)}
                      onFocus={() => setDateSelectionTarget("start")}
                    />
                  </Field>
                  <Field label="End Date" error={errors.endDate?.message}>
                    <Input
                      type="date"
                      min={startDateStr || todayStr}
                      value={endDateStr}
                      onChange={(e) => handleEndDateInput(e.target.value)}
                      onFocus={() => setDateSelectionTarget("end")}
                    />
                  </Field>
                </CardContent>
              </Card>

              <AvailabilityCalendar
                startDate={startDate}
                endDate={endDate}
                selectionTarget={dateSelectionTarget}
                onSelectionTargetChange={setDateSelectionTarget}
                onRangeChange={(start, end) => {
                  if (start) {
                    setValue("startDate", start, { shouldValidate: true });
                  } else {
                    resetField("startDate");
                  }
                  if (end) {
                    setValue("endDate", end, { shouldValidate: true });
                  } else {
                    resetField("endDate");
                  }
                }}
              />

              <AvailabilityCheckResult
                data={rangeCheck}
                isLoading={checkLoading}
                hasRange={!!fromStr && !!toStr}
              />

              <PriceQuoteCard
                fromDistrict={fromDistrict}
                toDistrict={toDistrict}
                vehicleType={vehicleType}
                numberOfDays={numberOfDays}
                passengerCount={passengerCount}
                preferredCurrency={preferredCurrency}
              />

              <Button
                type="submit"
                disabled={!canContinue}
                className={cn(
                  "mt-6 h-12 w-full text-base",
                  canContinue
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-muted text-muted-foreground"
                )}
              >
                Continue to Booking →
              </Button>
            </div>
          </div>
        </form>
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
