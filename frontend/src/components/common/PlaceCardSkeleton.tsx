export function PlaceCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
      <div className="aspect-video animate-pulse bg-muted" />
      <div className="space-y-3 p-4">
        <div className="h-3 w-20 animate-pulse rounded bg-muted" />
        <div className="h-5 w-3/4 animate-pulse rounded bg-muted" />
        <div className="h-4 w-24 animate-pulse rounded bg-muted" />
        <div className="flex gap-2">
          <div className="h-6 w-14 animate-pulse rounded-full bg-muted" />
          <div className="h-6 w-16 animate-pulse rounded-full bg-muted" />
        </div>
        <div className="flex justify-between pt-2">
          <div className="h-9 w-24 animate-pulse rounded bg-muted" />
          <div className="h-9 w-28 animate-pulse rounded bg-muted" />
        </div>
      </div>
    </div>
  );
}
