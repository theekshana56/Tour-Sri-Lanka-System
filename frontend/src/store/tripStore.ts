import { create } from "zustand";
import type { Place, TripDay, TripPlan } from "@/types";

interface TripState {
  places: Place[];
  selectedPlaces: Place[];
  tripPlan: TripPlan | null;
  setPlaces: (places: Place[]) => void;
  addPlace: (place: Place) => void;
  removePlace: (placeId: string) => void;
  setTripPlan: (plan: TripPlan) => void;
  updateDay: (dayNumber: number, day: Partial<TripDay>) => void;
  clearTrip: () => void;
}

const emptyTripPlan = (): TripPlan => ({
  title: "My Sri Lanka Trip",
  startDate: "",
  endDate: "",
  days: [],
});

export const useTripStore = create<TripState>((set) => ({
  places: [],
  selectedPlaces: [],
  tripPlan: null,
  setPlaces: (places) => set({ places }),
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
  setTripPlan: (plan) => set({ tripPlan: plan }),
  updateDay: (dayNumber, day) =>
    set((state) => {
      if (!state.tripPlan) return state;
      const days = state.tripPlan.days.map((d) =>
        d.dayNumber === dayNumber ? { ...d, ...day } : d
      );
      return { tripPlan: { ...state.tripPlan, days } };
    }),
  clearTrip: () =>
    set({ selectedPlaces: [], tripPlan: emptyTripPlan() }),
}));
