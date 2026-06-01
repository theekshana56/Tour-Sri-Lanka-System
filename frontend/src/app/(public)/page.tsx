import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Home() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col items-center px-4 py-24 text-center">
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
        Discover Sri Lanka
      </h1>
      <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
        Plan your perfect trip — explore places, build itineraries, and book
        tours with Tourism Sri Lanka.
      </p>
      <div className="mt-8 flex gap-4">
        <Link href="/planner" className={cn(buttonVariants())}>
          Start Planning
        </Link>
        <Link
          href="/places"
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          Browse Places
        </Link>
      </div>
    </div>
  );
}
