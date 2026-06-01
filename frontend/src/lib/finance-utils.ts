export function formatLkr(value: number): string {
  return `LKR ${Math.round(value).toLocaleString()}`;
}

export function formatLkrCompact(value: number): string {
  if (value >= 1_000_000) {
    return `LKR ${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `LKR ${(value / 1_000).toFixed(0)}K`;
  }
  return formatLkr(value);
}

export function toNumber(value: unknown): number {
  if (value == null) return 0;
  return Number(value);
}

export function formatVehicleType(type: string): string {
  return type.replace(/_/g, " ");
}

const VEHICLE_COLORS: Record<string, string> = {
  SEDAN: "#0d9488",
  SUV: "#2563eb",
  VAN: "#7c3aed",
  MINIBUS: "#ea580c",
  LUXURY_SUV: "#b45309",
};

export function vehicleColor(type: string): string {
  return VEHICLE_COLORS[type] ?? "#64748b";
}
