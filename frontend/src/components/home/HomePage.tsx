"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import heroBg from "@/assests/bg.jpg";
import { PlaceCard } from "@/components/places/PlaceCard";
import { PlaceModal } from "@/components/places/PlaceModal";
import { PlaceCardSkeleton } from "@/components/common/PlaceCardSkeleton";
import { AnimatedStat } from "@/components/home/AnimatedStat";
import { useFeaturedPlaces } from "@/hooks/usePlaces";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Place } from "@/types";

const STEPS = [
  {
    step: 1,
    emoji: "🗺",
    title: "Choose Your Places",
    description:
      "Browse and select Sri Lanka destinations you want to visit",
  },
  {
    step: 2,
    emoji: "📅",
    title: "Pick Your Dates",
    description:
      "Check real-time availability and get instant price quotes",
  },
  {
    step: 3,
    emoji: "✅",
    title: "We Handle Everything",
    description:
      "Confirm your booking, get a driver and vehicle assigned",
  },
] as const;

export function HomePage() {
  const { data: featured = [], isLoading } = useFeaturedPlaces();
  const [detailPlace, setDetailPlace] = useState<Place | null>(null);

  return (
    <>
      <section className="relative flex min-h-[calc(100vh-88px)] flex-col justify-center overflow-hidden">
        <Image
          src={heroBg}
          alt=""
          fill
          priority
          className="object-cover object-left"
          sizes="100vw"
        />
        <div
          className="absolute inset-0 bg-gradient-to-r from-tsl-forest/85 via-tsl-forest/60 to-tsl-forest/35"
          aria-hidden
        />

        <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center px-4 py-20 text-center">
          <span className="rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-sm text-white backdrop-blur-sm">
            🇱🇰 Discover the Pearl of the Indian Ocean
          </span>
          <h1 className="mt-6 font-serif text-4xl font-bold leading-tight text-white drop-shadow-md sm:text-5xl lg:text-6xl">
            Your Sri Lanka Adventure Starts Here
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-white/90 sm:text-xl">
            Plan your perfect trip, choose destinations, we handle drivers,
            vehicles, and accommodation recommendations.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/plan"
              className={cn(
                buttonVariants({ size: "lg" }),
                "min-w-[160px] bg-tsl-teal text-base text-white hover:bg-tsl-teal/90"
              )}
            >
              Start Planning
            </Link>
            <Link
              href="/track"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "min-w-[160px] border-white/80 bg-white/10 text-base text-white hover:bg-white/20"
              )}
            >
              Track Booking
            </Link>
          </div>
        </div>

        <a
          href="#destinations"
          className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-white/80 transition hover:text-white"
          aria-label="Scroll to destinations"
        >
          <ChevronDown className="h-8 w-8 animate-bounce" />
        </a>
      </section>

      <section id="destinations" className="bg-white py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-6">
          <div className="text-center">
            <h2 className="font-serif text-3xl font-bold text-tsl-forest md:text-4xl">
              Popular Destinations
            </h2>
            <p className="mt-2 text-muted-foreground">
              Handpicked places loved by travelers
            </p>
          </div>

          <div className="mt-10 flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory md:grid md:grid-cols-2 md:overflow-visible lg:grid-cols-4">
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-[280px] shrink-0 snap-start md:w-auto"
                  >
                    <PlaceCardSkeleton />
                  </div>
                ))
              : featured.map((place) => (
                  <div
                    key={place.id}
                    className="w-[280px] shrink-0 snap-start md:w-auto"
                  >
                    <PlaceCard
                      place={place}
                      variant="compact"
                      onViewDetails={() => setDetailPlace(place)}
                    />
                  </div>
                ))}
          </div>

          {!isLoading && featured.length === 0 && (
            <p className="mt-8 text-center text-muted-foreground">
              Featured destinations coming soon.{" "}
              <Link href="/plan" className="text-tsl-teal underline">
                Browse all places
              </Link>
            </p>
          )}
        </div>
      </section>

      <section id="how-it-works" className="bg-tsl-sand/30 py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-6">
          <h2 className="text-center font-serif text-3xl font-bold text-tsl-forest">
            How It Works
          </h2>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {STEPS.map((item) => (
              <div
                key={item.step}
                className="relative rounded-2xl border bg-white p-6 shadow-sm"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-tsl-teal text-sm font-bold text-white">
                  {item.step}
                </span>
                <span className="mt-4 block text-3xl" aria-hidden>
                  {item.emoji}
                </span>
                <h3 className="mt-3 font-serif text-xl font-semibold text-tsl-forest">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-tsl-forest py-14">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 px-4 md:grid-cols-4">
          <AnimatedStat value={500} suffix="+" label="Happy Travelers" />
          <AnimatedStat value={25} label="Destinations" />
          <AnimatedStat value={5} label="Vehicle Types" />
          <AnimatedStat value={24} suffix="hr" label="Confirmation" />
        </div>
      </section>

      <section className="cta-gradient py-20">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="font-serif text-3xl font-bold text-tsl-forest md:text-4xl">
            Ready to experience Sri Lanka?
          </h2>
          <Link
            href="/plan"
            className={cn(
              buttonVariants({ size: "lg" }),
              "mt-8 inline-flex bg-tsl-forest text-lg text-white hover:bg-tsl-forestLight"
            )}
          >
            Start Planning Your Trip →
          </Link>
        </div>
      </section>

      <PlaceModal
        place={detailPlace}
        open={!!detailPlace}
        onClose={() => setDetailPlace(null)}
      />
    </>
  );
}
