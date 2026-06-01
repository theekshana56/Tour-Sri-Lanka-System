"use client";

import dynamic from "next/dynamic";
import { Check, Star } from "lucide-react";
import type { Place } from "@/types";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  getCategoryBadgeClass,
  getCategoryLabel,
  getPlaceImageUrl,
} from "@/lib/place-utils";
import { cn } from "@/lib/utils";

const PlaceMap = dynamic(
  () => import("./PlaceMap").then((m) => m.PlaceMap),
  { ssr: false, loading: () => <div className="h-[300px] animate-pulse rounded-lg bg-muted" /> }
);

interface PlaceDetailModalProps {
  place: Place | null;
  open: boolean;
  isSelected: boolean;
  onOpenChange: (open: boolean) => void;
  onToggleTrip: () => void;
}

export function PlaceDetailModal({
  place,
  open,
  isSelected,
  onOpenChange,
  onToggleTrip,
}: PlaceDetailModalProps) {
  if (!place) return null;

  const images =
    place.imageUrls?.length
      ? place.imageUrls
      : getPlaceImageUrl(place.thumbnailUrl, place.imageUrls)
        ? [getPlaceImageUrl(place.thumbnailUrl, place.imageUrls)!]
        : [];

  const mainImage = images[0];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{place.name}</DialogTitle>
          <DialogClose onClose={() => onOpenChange(false)} />
        </DialogHeader>

        <div className="space-y-6 p-4 pt-0">
          <div className="space-y-2">
            {mainImage ? (
              <div className="aspect-video overflow-hidden rounded-xl">
                <img
                  src={mainImage}
                  alt={place.name}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="flex aspect-video items-center justify-center rounded-xl bg-gradient-to-br from-tsl-forest to-tsl-forestLight">
                <span className="font-serif text-4xl font-bold text-white">
                  {place.name.slice(0, 2).toUpperCase()}
                </span>
              </div>
            )}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((url, i) => (
                  <img
                    key={url + i}
                    src={url}
                    alt=""
                    className="h-16 w-24 shrink-0 rounded-lg object-cover"
                  />
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">{place.district}</span>
            <span
              className={cn(
                "rounded-full px-2.5 py-0.5 text-xs font-medium",
                getCategoryBadgeClass(place.category)
              )}
            >
              {getCategoryLabel(place.category)}
            </span>
          </div>

          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={cn(
                  "h-4 w-4",
                  i < Math.round(place.rating ?? 0)
                    ? "fill-amber-400 text-amber-400"
                    : "text-muted"
                )}
              />
            ))}
            <span className="ml-1 text-sm">{(place.rating ?? 0).toFixed(1)}</span>
          </div>

          <p className="text-sm leading-relaxed text-foreground">{place.description}</p>

          {place.highlights?.length ? (
            <div>
              <h4 className="mb-2 font-serif font-semibold">Highlights</h4>
              <ul className="space-y-1.5">
                {place.highlights.map((item) => (
                  <li key={item} className="flex gap-2 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {place.bestTimeToVisit && (
            <span className="inline-block rounded-full bg-tsl-sand px-3 py-1 text-sm text-tsl-forest">
              Best time: {place.bestTimeToVisit}
            </span>
          )}

          {place.tags?.length ? (
            <div className="flex flex-wrap gap-2">
              {place.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-tsl-teal/30 bg-tsl-sand/40 px-3 py-1 text-xs"
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : null}

          {place.latitude != null && place.longitude != null && (
            <PlaceMap
              latitude={place.latitude}
              longitude={place.longitude}
              name={place.name}
            />
          )}

          <Button
            className={cn(
              "h-11 w-full text-base",
              isSelected
                ? "bg-emerald-600 hover:bg-emerald-700"
                : "bg-tsl-teal hover:bg-tsl-teal/90"
            )}
            onClick={onToggleTrip}
          >
            {isSelected ? "Remove from Trip" : "Add to Trip"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
