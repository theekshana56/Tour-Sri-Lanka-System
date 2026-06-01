import { z } from "zod";

export const bookingFormSchema = z.object({
  customerName: z.string().min(2, "Enter your full name"),
  customerEmail: z.string().email("Enter a valid email"),
  countryCode: z.string().min(2),
  whatsappNumber: z
    .string()
    .min(7, "Enter WhatsApp number")
    .regex(/^[\d\s-]+$/, "Enter digits only"),
  customerNotes: z.string().max(500, "Maximum 500 characters").optional(),
  agreeToTerms: z.boolean().refine((val) => val === true, {
    message: "You must agree to continue",
  }),
});

export type BookingFormValues = z.infer<typeof bookingFormSchema>;

export const COUNTRY_CODES = [
  { code: "+94", flag: "🇱🇰", label: "Sri Lanka" },
  { code: "+1", flag: "🇺🇸", label: "United States" },
  { code: "+44", flag: "🇬🇧", label: "United Kingdom" },
  { code: "+91", flag: "🇮🇳", label: "India" },
  { code: "+61", flag: "🇦🇺", label: "Australia" },
  { code: "+49", flag: "🇩🇪", label: "Germany" },
  { code: "+33", flag: "🇫🇷", label: "France" },
  { code: "+971", flag: "🇦🇪", label: "UAE" },
  { code: "+65", flag: "🇸🇬", label: "Singapore" },
  { code: "+81", flag: "🇯🇵", label: "Japan" },
  { code: "+86", flag: "🇨🇳", label: "China" },
  { code: "+39", flag: "🇮🇹", label: "Italy" },
  { code: "+34", flag: "🇪🇸", label: "Spain" },
  { code: "+31", flag: "🇳🇱", label: "Netherlands" },
  { code: "+41", flag: "🇨🇭", label: "Switzerland" },
] as const;

export function combineWhatsapp(countryCode: string, number: string) {
  const digits = number.replace(/\D/g, "");
  return `${countryCode}${digits}`;
}
