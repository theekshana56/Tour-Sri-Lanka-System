"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import confetti from "canvas-confetti";
import { format, parseISO } from "date-fns";
import toast from "react-hot-toast";
import { SuccessCheckmark } from "@/components/booking/SuccessCheckmark";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { useBookingTrack } from "@/hooks/useBookingTrack";
import { useAuthStore } from "@/store/authStore";
import { bookingApi } from "@/lib/api";

function ConfirmedContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const bookingNumber = searchParams.get("booking");
  const { isAuthenticated } = useAuthStore();
  const [pollAttempts, setPollAttempts] = useState(0);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const { data: booking, isLoading, refetch } = useBookingTrack(bookingNumber);

  useEffect(() => {
    if (!bookingNumber) {
      router.replace("/plan");
    }
  }, [bookingNumber, router]);

  useEffect(() => {
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#000000", "#52525b", "#e4e4e7", "#ffd700"],
    });
  }, []);

  useEffect(() => {
    if (booking?.pdfUrl) {
      setPdfUrl(booking.pdfUrl);
    }
  }, [booking?.pdfUrl]);

  useEffect(() => {
    if (pdfUrl || pollAttempts >= 6 || !bookingNumber) return;

    const timer = setInterval(async () => {
      setPollAttempts((n) => n + 1);
      try {
        const { data } = await bookingApi.trackByNumber(bookingNumber);
        if (data.pdfUrl) {
          setPdfUrl(data.pdfUrl);
        }
      } catch {
        /* ignore poll errors */
      }
      refetch();
    }, 8000);

    return () => clearInterval(timer);
  }, [pdfUrl, pollAttempts, bookingNumber, refetch]);

  const copyBookingNumber = async () => {
    if (!bookingNumber) return;
    await navigator.clipboard.writeText(bookingNumber);
    toast.success("Copied!");
  };

  if (!bookingNumber) return null;

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-muted-foreground">Booking not found.</p>
        <Link href="/plan" className="mt-4 inline-block text-tsl-teal hover:underline">
          Plan a new trip
        </Link>
      </div>
    );
  }

  const start = parseISO(booking.startDate);
  const end = parseISO(booking.endDate);
  const pdfPending = !pdfUrl && pollAttempts < 6;
  const pdfFailed = !pdfUrl && pollAttempts >= 6;

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <SuccessCheckmark />

      <h1 className="text-center font-serif text-2xl font-bold text-black md:text-3xl">
        Booking Received! 🎉
      </h1>
      <p className="mt-2 text-center text-muted-foreground">
        We&apos;ll review and confirm your booking within 24 hours.
      </p>

      <div className="mt-8 rounded-xl border bg-white p-6 text-center shadow-sm">
        <p className="text-sm text-muted-foreground">Your Booking Number</p>
        <button
          type="button"
          onClick={copyBookingNumber}
          className="mt-2 font-mono text-3xl font-bold text-tsl-forest hover:text-tsl-teal"
          title="Click to copy"
        >
          {booking.bookingNumber}
        </button>
        <p className="mt-1 text-xs text-muted-foreground">Click to copy</p>
      </div>

      <div className="mt-6 space-y-2 rounded-xl border bg-zinc-50 p-6 text-sm">
        <SummaryRow label="Name" value={booking.customerName} />
        {booking.customerEmail && (
          <SummaryRow label="Email" value={booking.customerEmail} />
        )}
        {booking.customerWhatsapp && (
          <SummaryRow label="WhatsApp" value={booking.customerWhatsapp} />
        )}
        <SummaryRow
          label="Dates"
          value={`${format(start, "MMM d")} – ${format(end, "MMM d, yyyy")} (${booking.numberOfDays} days)`}
        />
        <SummaryRow
          label="Route"
          value={`${booking.fromDistrict} → ${booking.toDistrict}`}
        />
        <SummaryRow
          label="Vehicle"
          value={`${booking.vehicleType.replace("_", " ")} · ${booking.passengerCount} passengers`}
        />
        {booking.totalPriceForeign != null && booking.preferredCurrency && (
          <SummaryRow
            label="Price"
            value={`${booking.preferredCurrency} ${Number(booking.totalPriceForeign).toFixed(2)} (≈ LKR ${Number(booking.totalPriceLKR ?? 0).toLocaleString()})`}
          />
        )}
      </div>

      <div className="mt-6 text-center">
        {pdfPending && (
          <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <LoadingSpinner size="sm" />
            Generating your PDF receipt...
          </p>
        )}
        {pdfUrl && (
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-10 items-center justify-center rounded-lg bg-tsl-teal px-6 text-sm font-medium text-white hover:bg-tsl-teal/90"
          >
            ⬇ Download Booking PDF
          </a>
        )}
        {pdfFailed && (
          <p className="text-sm text-muted-foreground">
            PDF will be emailed to you shortly.
          </p>
        )}
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link
          href={`/track/${booking.bookingNumber}`}
          className="inline-flex h-10 items-center justify-center rounded-lg border border-input bg-background px-4 text-sm font-medium hover:bg-muted"
        >
          Track Your Booking
        </Link>
        <Link
          href="/plan"
          className="inline-flex h-10 items-center justify-center rounded-lg px-4 text-sm font-medium hover:bg-muted"
        >
          Plan Another Trip
        </Link>
        {isAuthenticated && (
          <Link
            href="/dashboard"
            className="inline-flex h-10 items-center justify-center rounded-lg px-4 text-sm font-medium hover:bg-muted"
          >
            Go to My Dashboard
          </Link>
        )}
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-tsl-forest/5 py-2 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}

export default function ConfirmedPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      }
    >
      <ConfirmedContent />
    </Suspense>
  );
}
