import type { Place } from "@/types";
import { cn } from "@/lib/utils";

interface PlaceCardProps {
  place: Place;
  selected?: boolean;
  onSelect?: (place: Place) => void;
  className?: string;
}

export function PlaceCard({ place, selected, onSelect, className }: PlaceCardProps) {
  return (
    <article
      className={cn(
        "cursor-pointer rounded-lg border bg-card p-4 shadow-sm transition hover:shadow-md",
        selected && "ring-2 ring-primary",
        className
      )}
      onClick={() => onSelect?.(place)}
      onKeyDown={(e) => e.key === "Enter" && onSelect?.(place)}
      role="button"
      tabIndex={0}
    >
      <h3 className="font-semibold">{place.name}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{place.district}</p>
      <p className="mt-2 line-clamp-2 text-sm">{place.description}</p>
    </article>
  );
}
