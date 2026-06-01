"use client";

import { useEffect, useMemo, useState } from "react";
import { formatDistanceToNow, parseISO } from "date-fns";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { financeApi, pricingApi } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api-errors";
import type { CurrencyInfo } from "@/types";

const FLAG: Record<string, string> = {
  USD: "🇺🇸",
  EUR: "🇪🇺",
  GBP: "🇬🇧",
  AUD: "🇦🇺",
  JPY: "🇯🇵",
  INR: "🇮🇳",
  CAD: "🇨🇦",
  SGD: "🇸🇬",
  CNY: "🇨🇳",
  AED: "🇦🇪",
  CHF: "🇨🇭",
  KRW: "🇰🇷",
};

export default function FinanceRatesPage() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [draftRates, setDraftRates] = useState<Record<string, string>>({});

  const { data: ratesDoc, isLoading } = useQuery({
    queryKey: ["finance-exchange-rates"],
    queryFn: async () => (await financeApi.getExchangeRates()).data,
  });

  const { data: currencies = [] } = useQuery({
    queryKey: ["currencies"],
    queryFn: async () => (await pricingApi.currencies()).data,
  });

  useEffect(() => {
    if (ratesDoc?.rates) {
      const next: Record<string, string> = {};
      for (const [code, rate] of Object.entries(ratesDoc.rates)) {
        next[code] = String(rate);
      }
      setDraftRates(next);
    }
  }, [ratesDoc]);

  const saveMutation = useMutation({
    mutationFn: (rates: Record<string, number>) =>
      financeApi.updateExchangeRates(rates),
    onSuccess: () => {
      toast.success("Exchange rates updated");
      queryClient.invalidateQueries({ queryKey: ["finance-exchange-rates"] });
      setDialogOpen(false);
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const rows = useMemo(() => {
    return currencies.map((c: CurrencyInfo) => {
      const ratePerLkr = Number(ratesDoc?.rates?.[c.code] ?? 0);
      const lkrPerUnit = ratePerLkr > 0 ? 1 / ratePerLkr : 0;
      return { ...c, ratePerLkr, lkrPerUnit };
    });
  }, [currencies, ratesDoc]);

  const preview = useMemo(() => {
    const base = 10_000;
    return rows.map((r) => ({
      code: r.code,
      symbol: r.symbol,
      amount: (base * r.ratePerLkr).toFixed(2),
    }));
  }, [rows]);

  const lastUpdated = ratesDoc?.lastUpdated
    ? formatDistanceToNow(parseISO(ratesDoc.lastUpdated), { addSuffix: true })
    : "—";

  const openDialog = () => {
    const next: Record<string, string> = {};
    for (const [code, rate] of Object.entries(ratesDoc?.rates ?? {})) {
      next[code] = String(rate);
    }
    setDraftRates(next);
    setDialogOpen(true);
  };

  const saveAll = () => {
    const rates: Record<string, number> = {};
    for (const [code, val] of Object.entries(draftRates)) {
      rates[code] = Number(val);
    }
    saveMutation.mutate(rates);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-tsl-forest">
            Exchange Rates
          </h1>
          <p className="mt-1 text-muted-foreground">
            Manual currency rates (base: LKR)
          </p>
        </div>
        <Button onClick={openDialog}>Update all rates</Button>
      </div>

      <div className="overflow-x-auto rounded-xl border bg-white">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="border-b bg-muted/40 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Currency</th>
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">Symbol</th>
              <th className="px-4 py-3">Rate (per 1 LKR)</th>
              <th className="px-4 py-3">LKR per 1 unit</th>
              <th className="px-4 py-3">Last updated</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.code} className="border-b">
                <td className="px-4 py-3">
                  {FLAG[r.code] ?? "💱"} {r.name}
                </td>
                <td className="px-4 py-3 font-mono">{r.code}</td>
                <td className="px-4 py-3">{r.symbol}</td>
                <td className="px-4 py-3">{r.ratePerLkr.toFixed(5)}</td>
                <td className="px-4 py-3">{r.lkrPerUnit.toFixed(2)}</td>
                <td className="px-4 py-3 text-muted-foreground">{lastUpdated}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Card className="p-5">
        <h2 className="font-serif text-lg font-bold">
          With current rates, LKR 10,000 equals:
        </h2>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {preview.map((p) => (
            <div
              key={p.code}
              className="rounded-lg border bg-muted/20 px-3 py-2 text-sm"
            >
              <span className="font-medium">
                {p.symbol}
                {p.amount}
              </span>
              <span className="ml-2 text-muted-foreground">{p.code}</span>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          Last updated: {lastUpdated}. Rates are updated manually. Consider
          checking rates at xe.com.
        </p>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Update exchange rates</DialogTitle>
            <DialogClose onClose={() => setDialogOpen(false)} />
          </DialogHeader>
          <div className="max-h-[60vh] space-y-3 overflow-y-auto p-4 pt-0">
            {currencies.map((c: CurrencyInfo) => (
              <div key={c.code} className="flex items-center gap-3">
                <span className="w-16 font-mono text-sm">{c.code}</span>
                <Input
                  type="number"
                  step="any"
                  value={draftRates[c.code] ?? ""}
                  onChange={(e) =>
                    setDraftRates((d) => ({ ...d, [c.code]: e.target.value }))
                  }
                />
              </div>
            ))}
            <Button
              className="mt-4 w-full"
              disabled={saveMutation.isPending}
              onClick={saveAll}
            >
              {saveMutation.isPending ? "Saving…" : "Save all"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
