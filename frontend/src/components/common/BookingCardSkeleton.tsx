export function BookingCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
      <div className="space-y-3 p-4">
        <div className="flex justify-between">
          <div className="h-6 w-28 animate-pulse rounded bg-muted" />
          <div className="h-5 w-16 animate-pulse rounded-full bg-muted" />
        </div>
        <div className="h-4 w-48 animate-pulse rounded bg-muted" />
        <div className="h-4 w-36 animate-pulse rounded bg-muted" />
        <div className="flex gap-2 pt-2">
          <div className="h-9 w-24 animate-pulse rounded bg-muted" />
          <div className="h-9 w-20 animate-pulse rounded bg-muted" />
        </div>
      </div>
    </div>
  );
}
