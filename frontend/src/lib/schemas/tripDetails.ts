import { z } from "zod";

export const tripDetailsSchema = z
  .object({
    fromDistrict: z.string().min(1, "Select pickup district"),
    toDistrict: z.string().min(1, "Select main destination district"),
    pickupLocation: z.string().min(5, "Enter your pickup address"),
    pickupTime: z
      .string()
      .min(1, "Select pickup time")
      .regex(/^\d{2}:\d{2}(:\d{2})?$/, "Enter a valid pickup time"),
    dropLocation: z.string().min(5, "Enter drop-off address"),
    passengerCount: z.number().min(1).max(20),
    vehicleType: z.string().min(1, "Select a vehicle"),
    preferredCurrency: z.string().min(1, "Select a currency"),
    startDate: z.date().optional(),
    endDate: z.date().optional(),
    customerNotes: z.string().optional(),
  })
  .refine((data) => !!data.startDate, {
    message: "Select a start date",
    path: ["startDate"],
  })
  .refine((data) => !!data.endDate, {
    message: "Select an end date",
    path: ["endDate"],
  })
  .refine(
    (data) => !data.startDate || !data.endDate || data.endDate >= data.startDate,
    {
      message: "End date must be on or after start date",
      path: ["endDate"],
    }
  );

export type TripDetailsFormValues = z.infer<typeof tripDetailsSchema>;
