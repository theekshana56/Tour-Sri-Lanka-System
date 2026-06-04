import type { PlaceCategory, PriceRange } from "@/types";

const CATEGORY_STYLES: Record<PlaceCategory, string> = {
  DESTINATION: "bg-black text-white border border-black/10",
  ACCOMMODATION: "bg-zinc-800 text-zinc-100 border border-zinc-700/50",
  RESTAURANT: "bg-zinc-200 text-zinc-800 border border-zinc-300",
  ACTIVITY: "bg-zinc-100 text-zinc-700 border border-zinc-200",
};

const CATEGORY_LABELS: Record<PlaceCategory, string> = {
  DESTINATION: "Destination",
  ACCOMMODATION: "Accommodation",
  RESTAURANT: "Restaurant",
  ACTIVITY: "Activity",
};

export function getCategoryBadgeClass(category: PlaceCategory) {
  return CATEGORY_STYLES[category] ?? "bg-gray-600 text-white";
}

export function getCategoryLabel(category: PlaceCategory) {
  return CATEGORY_LABELS[category] ?? category;
}

export function getPriceRangeLevel(priceRange?: PriceRange) {
  switch (priceRange) {
    case "LUXURY":
      return 3;
    case "MID_RANGE":
      return 2;
    case "BUDGET":
    default:
      return 1;
  }
}

export function getPlaceImageUrl(
  thumbnailUrl?: string,
  imageUrls?: string[]
): string | null {
  if (thumbnailUrl) return thumbnailUrl;
  if (imageUrls?.length) return imageUrls[0];
  return null;
}

export function collectPopularTags(places: { tags?: string[] }[], limit = 12) {
  const counts = new Map<string, number>();
  for (const place of places) {
    for (const tag of place.tags ?? []) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([tag]) => tag);
}
