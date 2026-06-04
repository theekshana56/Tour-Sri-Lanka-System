"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  BedDouble,
  MapPin,
  Search,
  Sparkles,
  UtensilsCrossed,
} from "lucide-react";
import type { Place, PlaceCategory, PlaceFilters, PriceRange } from "@/types";
import { useDistricts, useFeaturedPlaces, usePlaces } from "@/hooks/usePlaces";
import { PlaceCard } from "@/components/places/PlaceCard";
import { PlaceDetailModal } from "@/components/places/PlaceDetailModal";
import { PlaceCardSkeleton } from "@/components/common/PlaceCardSkeleton";
import { TripSidebar } from "@/components/booking/TripSidebar";
import { useTripStore } from "@/store/tripStore";
import { collectPopularTags } from "@/lib/place-utils";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 12;

const CATEGORIES: {
  id: PlaceCategory | "ALL";
  label: string;
  icon: ReactNode;
}[] = [
  { id: "ALL", label: "All", icon: <Sparkles className="h-4 w-4" /> },
  { id: "DESTINATION", label: "Destinations", icon: <MapPin className="h-4 w-4" /> },
  { id: "ACCOMMODATION", label: "Accommodations", icon: <BedDouble className="h-4 w-4" /> },
  { id: "RESTAURANT", label: "Restaurants", icon: <UtensilsCrossed className="h-4 w-4" /> },
  { id: "ACTIVITY", label: "Activities", icon: <Sparkles className="h-4 w-4" /> },
];

const PRICE_RANGES: { id: PriceRange; label: string }[] = [
  { id: "BUDGET", label: "Budget" },
  { id: "MID_RANGE", label: "Mid-Range" },
  { id: "LUXURY", label: "Luxury" },
];

export default function PlanPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState<PlaceCategory | "ALL">("ALL");
  const [district, setDistrict] = useState("");
  const [priceRange, setPriceRange] = useState<PriceRange | "">("");
  const [activeTag, setActiveTag] = useState("");
  const [page, setPage] = useState(0);
  const [accumulated, setAccumulated] = useState<Place[]>([]);
  const [detailPlace, setDetailPlace] = useState<Place | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const { addPlace, removePlace, isSelected } = useTripStore();
  const { data: districts = [] } = useDistricts();
  const { data: featured = [] } = useFeaturedPlaces();

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  const filters: PlaceFilters = useMemo(
    () => ({
      search: debouncedSearch || undefined,
      category: category === "ALL" ? undefined : category,
      district: district || undefined,
      priceRange: priceRange || undefined,
      tags: activeTag || undefined,
      page,
      size: PAGE_SIZE,
    }),
    [debouncedSearch, category, district, priceRange, activeTag, page]
  );

  const { data, isLoading, isFetching } = usePlaces(filters);

  useEffect(() => {
    setPage(0);
  }, [debouncedSearch, category, district, priceRange, activeTag]);

  useEffect(() => {
    if (!data?.content) return;
    if (page === 0) {
      setAccumulated(data.content);
    } else {
      setAccumulated((prev) => {
        const ids = new Set(prev.map((p) => p.id));
        const next = data.content.filter((p) => !ids.has(p.id));
        return [...prev, ...next];
      });
    }
  }, [data, page]);

  const popularTags = useMemo(
    () => collectPopularTags([...featured, ...accumulated]),
    [featured, accumulated]
  );

  const hasActiveFilters =
    category !== "ALL" ||
    !!district ||
    !!priceRange ||
    !!activeTag ||
    !!debouncedSearch;

  const clearFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setCategory("ALL");
    setDistrict("");
    setPriceRange("");
    setActiveTag("");
    setPage(0);
  };

  const togglePlace = useCallback(
    (place: Place) => {
      if (isSelected(place.id)) {
        removePlace(place.id);
      } else {
        addPlace(place);
      }
    },
    [addPlace, removePlace, isSelected]
  );

  const openDetails = (place: Place) => {
    setDetailPlace(place);
    setModalOpen(true);
  };

  const totalElements = data?.totalElements ?? 0;
  const hasMore = data ? page + 1 < data.totalPages : false;

  return (
    <div className="min-h-screen bg-gradient-to-b from-tsl-sand/40 to-white pb-24 lg:pb-8 lg:pr-80">
      {/* Hero */}
      <section
        className="relative flex h-[280px] flex-col items-center justify-center px-4 text-center text-white"
        style={{
          background: `
            radial-gradient(circle at 20% 30%, rgba(255,255,255,0.08) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(255,255,255,0.06) 0%, transparent 40%),
            linear-gradient(135deg, #09090b 0%, #27272a 100%)
          `,
        }}
      >
        <h1 className="font-serif text-3xl font-bold md:text-4xl">Discover Sri Lanka</h1>
        <p className="mt-2 max-w-lg text-sm text-white/90 md:text-base">
          Choose the places you want to visit and we&apos;ll plan everything
        </p>
        <div className="relative mt-6 w-full max-w-[600px]">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search destinations, beaches, temples..."
            className="h-12 w-full rounded-full border-0 bg-white pl-12 pr-4 text-foreground shadow-lg outline-none ring-tsl-teal focus:ring-2"
          />
        </div>
      </section>

      {/* Sticky filters */}
      <div className="sticky top-0 z-50 border-b border-tsl-forest/10 bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto max-w-7xl space-y-3 px-4 py-3">
          <div className="flex flex-wrap items-center gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategory(cat.id)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition",
                  category === cat.id
                    ? "bg-tsl-forest text-white"
                    : "bg-muted text-foreground hover:bg-tsl-sand"
                )}
              >
                {cat.icon}
                {cat.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="h-9 rounded-lg border bg-background px-3 text-sm"
            >
              <option value="">All districts</option>
              {districts.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>

            {PRICE_RANGES.map((pr) => (
              <button
                key={pr.id}
                type="button"
                onClick={() => setPriceRange(priceRange === pr.id ? "" : pr.id)}
                className={cn(
                  "rounded-full border px-3 py-1 text-sm transition",
                  priceRange === pr.id
                    ? "border-tsl-teal bg-tsl-teal text-white"
                    : "border-border hover:border-tsl-teal"
                )}
              >
                {pr.label}
              </button>
            ))}

            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-sm text-destructive hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1">
            {popularTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setActiveTag(activeTag === tag ? "" : tag)}
                className={cn(
                  "shrink-0 rounded-full px-3 py-1 text-xs transition",
                  activeTag === tag
                    ? "bg-tsl-forest text-white"
                    : "bg-tsl-sand text-tsl-forest hover:bg-tsl-sand/80"
                )}
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="mx-auto max-w-7xl px-4 py-6">
        <p className="mb-4 text-sm text-muted-foreground">
          Showing {accumulated.length} of {totalElements} places
        </p>

        {isLoading && page === 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <PlaceCardSkeleton key={i} />
            ))}
          </div>
        ) : accumulated.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <div className="mb-4 text-6xl">🌴</div>
            <h3 className="font-serif text-xl font-semibold">No places found</h3>
            <p className="mt-2 text-muted-foreground">
              Try different filters or search terms.
            </p>
            {hasActiveFilters && (
              <Button variant="outline" className="mt-4" onClick={clearFilters}>
                Clear all filters
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {accumulated.map((place) => (
                <PlaceCard
                  key={place.id}
                  place={place}
                  isSelected={isSelected(place.id)}
                  onToggle={() => togglePlace(place)}
                  onViewDetails={() => openDetails(place)}
                />
              ))}
            </div>

            {hasMore && (
              <div className="mt-8 flex justify-center">
                <Button
                  variant="outline"
                  size="lg"
                  disabled={isFetching}
                  onClick={() => setPage((p) => p + 1)}
                  className="border-tsl-teal text-tsl-teal hover:bg-tsl-teal/10"
                >
                  {isFetching ? "Loading..." : "Load more places"}
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      <TripSidebar />

      <PlaceDetailModal
        place={detailPlace}
        open={modalOpen}
        isSelected={detailPlace ? isSelected(detailPlace.id) : false}
        onOpenChange={setModalOpen}
        onToggleTrip={() => {
          if (detailPlace) togglePlace(detailPlace);
        }}
      />
    </div>
  );
}
