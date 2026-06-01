import { useQuery } from "@tanstack/react-query";
import { availabilityApi, pricingApi, vehiclesApi } from "@/lib/api";

export function useAvailabilityCalendar(year: number, month: number) {
  return useQuery({
    queryKey: ["availability", "calendar", year, month],
    queryFn: async () => {
      const { data } = await availabilityApi.calendar(year, month);
      return data;
    },
  });
}

export function useAvailabilityCheck(from: string | null, to: string | null) {
  return useQuery({
    queryKey: ["availability", "check", from, to],
    queryFn: async () => {
      const { data } = await availabilityApi.check(from!, to!);
      return data;
    },
    enabled: !!from && !!to,
  });
}

export function useVehicles(capacity: number) {
  return useQuery({
    queryKey: ["vehicles", capacity],
    queryFn: async () => {
      const { data } = await vehiclesApi.list(capacity);
      return data;
    },
  });
}

export function usePriceQuote(
  params: Record<string, string | number> | null,
  enabled: boolean
) {
  return useQuery({
    queryKey: ["pricing", "quote", params],
    queryFn: async () => {
      const { data } = await pricingApi.quote(params!);
      return data;
    },
    enabled: enabled && !!params,
  });
}

export function useCurrencies() {
  return useQuery({
    queryKey: ["pricing", "currencies"],
    queryFn: async () => {
      const { data } = await pricingApi.currencies();
      return data;
    },
    staleTime: 10 * 60_000,
  });
}
