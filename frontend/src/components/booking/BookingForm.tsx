"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const bookingSchema = z.object({
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  notes: z.string().optional(),
});

type BookingFormValues = z.infer<typeof bookingSchema>;

interface BookingFormProps {
  onSubmit: (values: BookingFormValues) => void;
  isLoading?: boolean;
}

export function BookingForm({ onSubmit, isLoading }: BookingFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="startDate" className="text-sm font-medium">
          Start Date
        </label>
        <input
          id="startDate"
          type="date"
          className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
          {...register("startDate")}
        />
        {errors.startDate && (
          <p className="mt-1 text-sm text-destructive">{errors.startDate.message}</p>
        )}
      </div>
      <div>
        <label htmlFor="endDate" className="text-sm font-medium">
          End Date
        </label>
        <input
          id="endDate"
          type="date"
          className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
          {...register("endDate")}
        />
        {errors.endDate && (
          <p className="mt-1 text-sm text-destructive">{errors.endDate.message}</p>
        )}
      </div>
      <div>
        <label htmlFor="notes" className="text-sm font-medium">
          Notes
        </label>
        <textarea
          id="notes"
          rows={3}
          className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
          {...register("notes")}
        />
      </div>
      <button
        type="submit"
        disabled={isLoading}
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
      >
        {isLoading ? "Submitting..." : "Request Booking"}
      </button>
    </form>
  );
}
