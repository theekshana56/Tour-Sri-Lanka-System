"use client";

import type { PriceQuote } from "@/types";
import { useDebouncedValue } from "@/hooks/useDebounce";
import { usePriceQuote } from "@/hooks/useAvailability";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface PriceQuoteCardProps {
  fromDistrict: string;
  toDistrict: string;
  vehicleType: string;
  numberOfDays: number;
  passengerCount: number;
  preferredCurrency: string;
  className?: string;
}

function formatLkr(n: number) {
  return new Intl.NumberFormat("en-LK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

export function PriceQuoteCard({
  fromDistrict,
  toDistrict,
  vehicleType,
  numberOfDays,
  passengerCount,
  preferredCurrency,
  className,
}: PriceQuoteCardProps) {
  const ready =
    !!fromDistrict &&
    !!toDistrict &&
    !!vehicleType &&
    numberOfDays > 0 &&
    passengerCount > 0 &&
    !!preferredCurrency;

  const params = ready
    ? {
        vehicleType,
        from: fromDistrict,
        to: toDistrict,
        days: numberOfDays,
        passengers: passengerCount,
        currency: preferredCurrency,
      }
    : null;

  const debouncedParams = useDebouncedValue(params, 500);
  const { data: quote, isLoading, isFetching } = usePriceQuote(
    debouncedParams,
    ready
  );

  if (!ready) return null;

  return (
    <Card className={cn("mt-4 border-tsl-teal/20", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="font-serif text-lg text-tsl-forest">
          Price Estimate
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading || isFetching ? (
          <QuoteSkeleton />
        ) : quote ? (
          <QuoteBreakdown quote={quote} />
        ) : (
          <p className="text-sm text-muted-foreground">
            Unable to load price estimate.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function QuoteSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-4 animate-pulse rounded bg-muted" />
      ))}
    </div>
  );
}

function QuoteBreakdown({ quote }: { quote: PriceQuote }) {
  const { breakdown } = quote;
  const subtotal =
    (breakdown.baseCost + breakdown.passengerExtra) * breakdown.zoneMultiplier;
  const seasonalAmount = subtotal * (breakdown.seasonalMultiplier - 1);
  const lkrPerUnit =
    quote.exchangeRateUsed > 0
      ? (1 / quote.exchangeRateUsed).toFixed(2)
      : "—";

  return (
    <div className="space-y-3 text-sm">
      <table className="w-full">
        <tbody className="divide-y">
          <QuoteRow
            label={`Base rate (${quote.vehicleType} × ${quote.numberOfDays} days)`}
            value={`LKR ${formatLkr(breakdown.baseCost)}`}
          />
          <QuoteRow
            label="Passenger adjustment"
            value={`LKR ${formatLkr(breakdown.passengerExtra)}`}
          />
          <QuoteRow
            label={`Zone factor (×${breakdown.zoneMultiplier})`}
            value={`LKR ${formatLkr(subtotal - breakdown.baseCost - breakdown.passengerExtra)}`}
          />
          <QuoteRow
            label={`Seasonal rate (×${breakdown.seasonalMultiplier})`}
            value={`LKR ${formatLkr(Math.max(0, seasonalAmount))}`}
          />
        </tbody>
      </table>
      <div className="border-t pt-3">
        <div className="flex justify-between font-semibold">
          <span>TOTAL</span>
          <span>LKR {formatLkr(quote.totalLKR)}</span>
        </div>
      </div>
      <p className="text-xl font-bold text-tsl-teal">
        = {quote.preferredCurrency}{" "}
        {formatLkr(quote.totalForeignCurrency)}
      </p>
      <p className="text-xs text-muted-foreground">
        Exchange rate: 1 {quote.preferredCurrency} = {lkrPerUnit} LKR
      </p>
      <p className="text-xs italic text-muted-foreground">
        Prices are estimates and confirmed at booking.
      </p>
    </div>
  );
}

function QuoteRow({ label, value }: { label: string; value: string }) {
  return (
    <tr>
      <td className="py-2 pr-4 text-muted-foreground">{label}</td>
      <td className="py-2 text-right font-medium">{value}</td>
    </tr>
  );
}
