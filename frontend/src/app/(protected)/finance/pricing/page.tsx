"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Pencil, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { financeApi } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api-errors";
import { formatVehicleType } from "@/lib/finance-utils";
import type { PricingRule } from "@/types";

type EditDraft = {
  basePricePerDayLKR: string;
  pricePerExtraPassengerLKR: string;
  seasonalMultiplier: string;
};

export default function FinancePricingPage() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<EditDraft | null>(null);
  const [seasonalAll, setSeasonalAll] = useState(1);
  const [zoneRuleId, setZoneRuleId] = useState<string | null>(null);
  const [newZone, setNewZone] = useState({
    fromDistrict: "",
    toDistrict: "",
    multiplier: "1.2",
  });

  const { data: rules = [], isLoading } = useQuery({
    queryKey: ["finance-pricing-rules"],
    queryFn: async () => (await financeApi.getPricingRules()).data,
  });

  const saveMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: unknown }) =>
      financeApi.updatePricingRule(id, data),
    onSuccess: () => {
      toast.success("Pricing rule saved");
      queryClient.invalidateQueries({ queryKey: ["finance-pricing-rules"] });
      setEditingId(null);
      setDraft(null);
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const allZones = useMemo(() => {
    return rules.flatMap((rule) =>
      (rule.zoneMultipliers ?? []).map((z, idx) => ({
        key: `${rule.id}-${idx}`,
        ruleId: rule.id,
        vehicleType: rule.vehicleType,
        ...z,
      }))
    );
  }, [rules]);

  const startEdit = (rule: PricingRule) => {
    setEditingId(rule.id);
    setDraft({
      basePricePerDayLKR: String(rule.basePricePerDayLKR),
      pricePerExtraPassengerLKR: String(rule.pricePerExtraPassengerLKR),
      seasonalMultiplier: String(rule.seasonalMultiplier),
    });
  };

  const saveEdit = (rule: PricingRule) => {
    if (!draft) return;
    saveMutation.mutate({
      id: rule.id,
      data: {
        basePricePerDayLKR: Number(draft.basePricePerDayLKR),
        pricePerExtraPassengerLKR: Number(draft.pricePerExtraPassengerLKR),
        seasonalMultiplier: Number(draft.seasonalMultiplier),
        zoneMultipliers: rule.zoneMultipliers ?? [],
      },
    });
  };

  const applySeasonalToAll = async () => {
    for (const rule of rules) {
      await financeApi.updatePricingRule(rule.id, {
        basePricePerDayLKR: rule.basePricePerDayLKR,
        pricePerExtraPassengerLKR: rule.pricePerExtraPassengerLKR,
        seasonalMultiplier: seasonalAll,
        zoneMultipliers: rule.zoneMultipliers ?? [],
      });
    }
    toast.success("Seasonal multiplier applied to all rules");
    queryClient.invalidateQueries({ queryKey: ["finance-pricing-rules"] });
  };

  const removeZone = (ruleId: string, index: number) => {
    const rule = rules.find((r) => r.id === ruleId);
    if (!rule) return;
    const zones = [...(rule.zoneMultipliers ?? [])];
    zones.splice(index, 1);
    saveMutation.mutate({
      id: ruleId,
      data: {
        basePricePerDayLKR: rule.basePricePerDayLKR,
        pricePerExtraPassengerLKR: rule.pricePerExtraPassengerLKR,
        seasonalMultiplier: rule.seasonalMultiplier,
        zoneMultipliers: zones,
      },
    });
  };

  const addZone = () => {
    const ruleId = zoneRuleId ?? rules[0]?.id;
    const rule = rules.find((r) => r.id === ruleId);
    if (!rule) return;
    const mult = Number(newZone.multiplier);
    if (mult < 0.5 || mult > 3) {
      toast.error("Multiplier must be between 0.5 and 3.0");
      return;
    }
    const zones = [
      ...(rule.zoneMultipliers ?? []),
      {
        fromDistrict: newZone.fromDistrict.trim(),
        toDistrict: newZone.toDistrict.trim(),
        multiplier: mult,
      },
    ];
    saveMutation.mutate({
      id: rule.id,
      data: {
        basePricePerDayLKR: rule.basePricePerDayLKR,
        pricePerExtraPassengerLKR: rule.pricePerExtraPassengerLKR,
        seasonalMultiplier: rule.seasonalMultiplier,
        zoneMultipliers: zones,
      },
    });
    setNewZone({ fromDistrict: "", toDistrict: "", multiplier: "1.2" });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const seasonLabel =
    seasonalAll === 1 ? "Normal" : seasonalAll > 1 ? "Peak" : "Off-peak";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-2xl font-bold text-tsl-forest">Pricing Rules</h1>
        <p className="mt-1 text-muted-foreground">
          Vehicle rates, zone multipliers, and seasonal adjustments
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border bg-white">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead className="border-b bg-muted/40 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Vehicle Type</th>
              <th className="px-4 py-3">Base/Day (LKR)</th>
              <th className="px-4 py-3">Extra/Passenger</th>
              <th className="px-4 py-3">Seasonal ×</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Edit</th>
            </tr>
          </thead>
          <tbody>
            {rules.map((rule) => {
              const editing = editingId === rule.id;
              return (
                <tr key={rule.id} className="border-b">
                  <td className="px-4 py-3 font-medium">
                    {formatVehicleType(rule.vehicleType)}
                  </td>
                  <td className="px-4 py-3">
                    {editing ? (
                      <Input
                        type="number"
                        value={draft?.basePricePerDayLKR ?? ""}
                        onChange={(e) =>
                          setDraft((d) =>
                            d ? { ...d, basePricePerDayLKR: e.target.value } : d
                          )
                        }
                        className="w-28"
                      />
                    ) : (
                      Number(rule.basePricePerDayLKR).toLocaleString()
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {editing ? (
                      <Input
                        type="number"
                        value={draft?.pricePerExtraPassengerLKR ?? ""}
                        onChange={(e) =>
                          setDraft((d) =>
                            d
                              ? { ...d, pricePerExtraPassengerLKR: e.target.value }
                              : d
                          )
                        }
                        className="w-28"
                      />
                    ) : (
                      Number(rule.pricePerExtraPassengerLKR).toLocaleString()
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {editing ? (
                      <Input
                        type="number"
                        step="0.1"
                        value={draft?.seasonalMultiplier ?? ""}
                        onChange={(e) =>
                          setDraft((d) =>
                            d ? { ...d, seasonalMultiplier: e.target.value } : d
                          )
                        }
                        className="w-20"
                      />
                    ) : (
                      rule.seasonalMultiplier
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {rule.isActive ? "Active" : "Inactive"}
                  </td>
                  <td className="px-4 py-3">
                    {editing ? (
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => saveEdit(rule)}>
                          <Check className="h-4 w-4" />
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingId(null);
                            setDraft(null);
                          }}
                        >
                          <X className="h-4 w-4" />
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => startEdit(rule)}>
                        <Pencil className="h-4 w-4" />
                        Edit
                      </Button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Card className="space-y-4 p-5">
        <h2 className="font-serif text-lg font-bold">Zone multipliers</h2>
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/30 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-3 py-2">Vehicle</th>
                <th className="px-3 py-2">From</th>
                <th className="px-3 py-2">To</th>
                <th className="px-3 py-2">Multiplier</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {allZones.map((z) => (
                <tr key={z.key} className="border-b">
                  <td className="px-3 py-2">{formatVehicleType(z.vehicleType)}</td>
                  <td className="px-3 py-2">{z.fromDistrict}</td>
                  <td className="px-3 py-2">{z.toDistrict}</td>
                  <td className="px-3 py-2">×{z.multiplier}</td>
                  <td className="px-3 py-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const idx = rules
                          .find((r) => r.id === z.ruleId)
                          ?.zoneMultipliers?.findIndex(
                            (zm) =>
                              zm.fromDistrict === z.fromDistrict &&
                              zm.toDistrict === z.toDistrict
                          );
                        if (idx != null && idx >= 0) removeZone(z.ruleId, idx);
                      }}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-end gap-3 rounded-lg border bg-muted/20 p-4">
          <div>
            <label className="text-xs text-muted-foreground">Rule</label>
            <select
              className="mt-1 block rounded-lg border bg-white px-2 py-2 text-sm"
              value={zoneRuleId ?? rules[0]?.id ?? ""}
              onChange={(e) => setZoneRuleId(e.target.value)}
            >
              {rules.map((r) => (
                <option key={r.id} value={r.id}>
                  {formatVehicleType(r.vehicleType)}
                </option>
              ))}
            </select>
          </div>
          <Input
            placeholder="From district"
            value={newZone.fromDistrict}
            onChange={(e) =>
              setNewZone((z) => ({ ...z, fromDistrict: e.target.value }))
            }
          />
          <Input
            placeholder="To district"
            value={newZone.toDistrict}
            onChange={(e) =>
              setNewZone((z) => ({ ...z, toDistrict: e.target.value }))
            }
          />
          <div>
            <Input
              type="number"
              step="0.1"
              min={0.5}
              max={3}
              value={newZone.multiplier}
              onChange={(e) =>
                setNewZone((z) => ({ ...z, multiplier: e.target.value }))
              }
              className="w-24"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              ×{newZone.multiplier} ={" "}
              {((Number(newZone.multiplier) - 1) * 100).toFixed(0)}% adjustment
            </p>
          </div>
          <Button onClick={addZone}>Add zone</Button>
        </div>
      </Card>

      <Card className="space-y-4 p-5">
        <h2 className="font-serif text-lg font-bold">Seasonal multiplier</h2>
        <p className="text-sm text-muted-foreground">
          Current season: {seasonLabel} (×{seasonalAll.toFixed(1)})
        </p>
        <input
          type="range"
          min={0.8}
          max={2}
          step={0.1}
          value={seasonalAll}
          onChange={(e) => setSeasonalAll(Number(e.target.value))}
          className="w-full max-w-md"
        />
        <p className="text-xs text-muted-foreground">
          ×1.0 = standard pricing | ×1.5 = 50% peak season surcharge
        </p>
        <Button onClick={applySeasonalToAll}>Apply to all rules</Button>
      </Card>
    </div>
  );
}
