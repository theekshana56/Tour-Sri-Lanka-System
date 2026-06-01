import { useQuery } from "@tanstack/react-query";
import { placesApi } from "@/lib/api";
import type { PlaceFilters } from "@/types";

export function usePlaces(filters: PlaceFilters) {
  return useQuery({
    queryKey: ["places", filters],
    queryFn: async () => {
      const { data } = await placesApi.list(filters);
      return data;
    },
  });
}

export function useFeaturedPlaces() {
  return useQuery({
    queryKey: ["places", "featured"],
    queryFn: async () => {
      const { data } = await placesApi.featured();
      return data;
    },
  });
}

export function usePlace(id: string | null) {
  return useQuery({
    queryKey: ["places", id],
    queryFn: async () => {
      const { data } = await placesApi.getById(id!);
      return data;
    },
    enabled: !!id,
  });
}

export function useDistricts() {
  return useQuery({
    queryKey: ["places", "districts"],
    queryFn: async () => {
      const { data } = await placesApi.districts();
      return data;
    },
    staleTime: 5 * 60_000,
  });
}
