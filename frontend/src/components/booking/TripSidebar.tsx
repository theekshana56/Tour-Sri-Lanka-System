"use client";

import { useState } from "react";
import Link from "next/link";
import { GripVertical, MapPin, X } from "lucide-react";
import type { Place } from "@/types";
import { useTripStore } from "@/store/tripStore";
import { getPlaceImageUrl } from "@/lib/place-utils";
import { cn } from "@/lib/utils";

function TripList({
  places,
  onRemove,
  onReorder,
}: {
  places: Place[];
  onRemove: (id: string) => void;
  onReorder: (order: Place[]) => void;
}) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const handleDrop = (targetIndex: number) => {
    if (dragIndex === null || dragIndex === targetIndex) return;
    const next = [...places];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(targetIndex, 0, moved);
    onReorder(next);
    setDragIndex(null);
  };

  return (
    <ul className="space-y-2">
      {places.map((place, index) => {
        const thumb = getPlaceImageUrl(place.thumbnailUrl, place.imageUrls);
        return (
          <li
            key={place.id}
            draggable
            onDragStart={() => setDragIndex(index)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(index)}
            className="flex items-center gap-2 rounded-lg border bg-white p-2"
          >
            <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-muted-foreground" />
            {thumb ? (
              <img src={thumb} alt="" className="h-10 w-14 shrink-0 rounded object-cover" />
            ) : (
              <div className="flex h-10 w-14 shrink-0 items-center justify-center rounded bg-tsl-forest/10 text-xs font-bold text-tsl-forest">
                {place.name.slice(0, 2)}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{place.name}</p>
              <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                {place.district}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onRemove(place.id)}
              className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              aria-label="Remove"
            >
              <X className="h-4 w-4" />
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function TripPanelContent({ onCloseMobile }: { onCloseMobile?: () => void }) {
  const { selectedPlaces, removePlace, reorderPlaces, clearTrip } = useTripStore();
  const count = selectedPlaces.length;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-tsl-forest/10 p-4">
        <div>
          <h2 className="font-serif text-lg font-bold text-tsl-forest">Your Trip</h2>
          <span className="mt-1 inline-block rounded-full bg-tsl-teal/10 px-2 py-0.5 text-xs font-medium text-tsl-teal">
            {count} place{count !== 1 ? "s" : ""} selected
          </span>
        </div>
        {onCloseMobile && (
          <button type="button" onClick={onCloseMobile} className="rounded p-2 lg:hidden">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {count === 0 ? (
          <p className="text-center text-sm text-muted-foreground">
            Select places from the grid to build your itinerary.
          </p>
        ) : (
          <TripList
            places={selectedPlaces}
            onRemove={removePlace}
            onReorder={reorderPlaces}
          />
        )}
      </div>

      <div className="space-y-3 border-t border-tsl-forest/10 p-4">
        {count === 0 ? (
          <span className="flex h-11 w-full items-center justify-center rounded-lg bg-muted text-sm text-muted-foreground">
            Add places to continue
          </span>
        ) : (
          <Link
            href="/plan/details"
            className="flex h-11 w-full items-center justify-center rounded-lg bg-emerald-600 text-base font-medium text-white hover:bg-emerald-700"
          >
            Continue to Trip Details →
          </Link>
        )}
        {count > 0 && (
          <button
            type="button"
            onClick={clearTrip}
            className="w-full text-center text-xs text-destructive hover:underline"
          >
            Clear All
          </button>
        )}
      </div>
    </div>
  );
}

export function TripSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const count = useTripStore((s) => s.selectedPlaces.length);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="fixed right-0 top-16 z-40 hidden h-[calc(100vh-4rem)] w-80 border-l border-tsl-forest/10 bg-tsl-sand/30 lg:block">
        <TripPanelContent />
      </aside>

      {/* Mobile floating button */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 z-40 flex h-14 items-center gap-2 rounded-full bg-tsl-teal px-5 text-white shadow-lg lg:hidden",
          count === 0 && "opacity-90"
        )}
      >
        <MapPin className="h-5 w-5" />
        Your Trip {count > 0 && `(${count})`}
      </button>

      {/* Mobile bottom sheet */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute bottom-0 max-h-[85vh] w-full animate-in slide-in-from-bottom rounded-t-2xl bg-background shadow-xl">
            <TripPanelContent onCloseMobile={() => setMobileOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
