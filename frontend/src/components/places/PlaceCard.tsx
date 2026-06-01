"use client";

import { Check, Star } from "lucide-react";
import type { Place } from "@/types";
import { cn } from "@/lib/utils";
import {
  getCategoryBadgeClass,
  getCategoryLabel,
  getPlaceImageUrl,
  getPriceRangeLevel,
} from "@/lib/place-utils";
import { Button } from "@/components/ui/button";

interface PlaceCardProps {
  place: Place;
  isSelected: boolean;
  onToggle: () => void;
  onViewDetails: () => void;
}

function StarRating({ rating }: { rating?: number }) {
  const value = rating ?? 0;
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            "h-3.5 w-3.5",
            i < Math.round(value)
              ? "fill-amber-400 text-amber-400"
              : "fill-muted text-muted"
          )}
        />
      ))}
      <span className="ml-1 text-sm font-medium">{value.toFixed(1)}</span>
      <span className="text-xs text-muted-foreground">(128 reviews)</span>
    </div>
  );
}

function PriceDots({ level }: { level: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3].map((i) => (
        <span
          key={i}
          className={cn(
            "text-sm font-bold",
            i <= level ? "text-tsl-teal" : "text-muted-foreground/30"
          )}
        >
          ₹
        </span>
      ))}
    </div>
  );
}

export function PlaceCard({
  place,
  isSelected,
  onToggle,
  onViewDetails,
}: PlaceCardProps) {
  const imageUrl = getPlaceImageUrl(place.thumbnailUrl, place.imageUrls);

  return (
    <article className="overflow-hidden rounded-xl border bg-white shadow-sm transition hover:shadow-md">
      <div className="group relative aspect-video overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={place.name}
            loading="lazy"
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-tsl-forest to-tsl-forestLight">
            <span className="font-serif text-3xl font-bold text-white/90">
              {place.name.slice(0, 2).toUpperCase()}
            </span>
          </div>
        )}
        <span
          className={cn(
            "absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-medium",
            getCategoryBadgeClass(place.category)
          )}
        >
          {getCategoryLabel(place.category)}
        </span>
        {isSelected && (
          <div className="absolute inset-0 flex items-center justify-center bg-emerald-600/40">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-lg">
              <Check className="h-7 w-7 text-emerald-600" strokeWidth={3} />
            </div>
          </div>
        )}
      </div>

      <div className="space-y-2 p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {place.district}
        </p>
        <h3 className="line-clamp-2 font-serif text-lg font-semibold leading-snug">
          {place.name}
        </h3>
        <StarRating rating={place.rating} />
        <PriceDots level={getPriceRangeLevel(place.priceRange)} />
        <div className="flex flex-wrap gap-1.5 pt-1">
          {(place.tags ?? []).slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-tsl-sand/60 px-2 py-0.5 text-xs text-tsl-forest"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="flex items-center justify-between gap-2 pt-2">
          <Button variant="link" size="sm" onClick={onViewDetails} className="px-0">
            View Details
          </Button>
          <Button
            size="sm"
            variant={isSelected ? "default" : "outline"}
            className={cn(
              isSelected
                ? "bg-emerald-600 text-white hover:bg-emerald-700"
                : "border-emerald-600 text-emerald-700 hover:bg-emerald-50"
            )}
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
          >
            {isSelected ? (
              <>
                <Check className="mr-1 h-4 w-4" /> Added
              </>
            ) : (
              "Add to Trip"
            )}
          </Button>
        </div>
      </div>
    </article>
  );
}
