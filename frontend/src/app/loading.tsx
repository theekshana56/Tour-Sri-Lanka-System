import { LoadingSpinner } from "@/components/common/LoadingSpinner";

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <p className="animate-pulse font-serif text-2xl font-bold text-tsl-forest">
        🌿 TSL
      </p>
      <LoadingSpinner size="lg" />
    </div>
  );
}
