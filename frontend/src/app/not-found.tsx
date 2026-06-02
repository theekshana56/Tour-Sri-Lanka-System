import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-tsl-sand/40 to-white px-4 text-center">
      <p className="text-6xl" aria-hidden>
        🌿
      </p>
      <h1 className="mt-4 font-serif text-3xl font-bold text-tsl-forest">
        404 — Lost in the Jungle
      </h1>
      <p className="mt-3 max-w-md text-muted-foreground">
        This trail doesn&apos;t exist on our map. Maybe a wild elephant moved the
        signpost — let&apos;s get you back to familiar ground.
      </p>
      <Link
        href="/"
        className={cn(buttonVariants({ size: "lg" }), "mt-8 bg-tsl-teal hover:bg-tsl-teal/90")}
      >
        Back to Home
      </Link>
    </div>
  );
}
