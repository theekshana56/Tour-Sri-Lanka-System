import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Place, PriceQuote, TripConfig } from "@/types";

interface TripState {
  selectedPlaces: Place[];
  tripConfig: TripConfig | null;
  priceQuote: PriceQuote | null;
  addPlace: (place: Place) => void;
  removePlace: (placeId: string) => void;
  reorderPlaces: (newOrder: Place[]) => void;
  clearTrip: () => void;
  setTripConfig: (config: TripConfig) => void;
  setPriceQuote: (quote: PriceQuote | null) => void;
  isSelected: (placeId: string) => boolean;
}

export const useTripStore = create<TripState>()(
  persist(
    (set, get) => ({
      selectedPlaces: [],
      tripConfig: null,
      priceQuote: null,
      addPlace: (place) =>
        set((state) => ({
          selectedPlaces: state.selectedPlaces.some((p) => p.id === place.id)
            ? state.selectedPlaces
            : [...state.selectedPlaces, place],
        })),
      removePlace: (placeId) =>
        set((state) => ({
          selectedPlaces: state.selectedPlaces.filter((p) => p.id !== placeId),
        })),
      reorderPlaces: (newOrder) => set({ selectedPlaces: newOrder }),
      clearTrip: () =>
        set({ selectedPlaces: [], tripConfig: null, priceQuote: null }),
      setTripConfig: (config) => set({ tripConfig: config }),
      setPriceQuote: (quote) => set({ priceQuote: quote }),
      isSelected: (placeId) =>
        get().selectedPlaces.some((p) => p.id === placeId),
    }),
    {
      name: "tsl-trip",
      partialize: (state) => ({
        selectedPlaces: state.selectedPlaces,
        tripConfig: state.tripConfig,
      }),
    }
  )
);
