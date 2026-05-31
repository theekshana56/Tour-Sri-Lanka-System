"use client";

import type { Place } from "@/types";

interface PlaceModalProps {
  place: Place | null;
  open: boolean;
  onClose: () => void;
}

export function PlaceModal({ place, open, onClose }: PlaceModalProps) {
  if (!open || !place) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg bg-background p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-xl font-semibold">{place.name}</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Close"
          >
            &times;
          </button>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {place.district} &middot; {place.category}
        </p>
        <p className="mt-4 text-sm">{place.description}</p>
      </div>
    </div>
  );
}
