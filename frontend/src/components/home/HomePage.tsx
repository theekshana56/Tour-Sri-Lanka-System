"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  ArrowRight,
  Star,
  Compass,
  ShieldCheck,
  Clock,
  Sparkles,
  Car,
} from "lucide-react";
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
    title: "Select Destinations",
    description: "Browse handpicked locations across the island and add them to your map.",
  },
  {
    step: 2,
    emoji: "📅",
    title: "Customize & Quote",
    description: "Pick your travel dates, choose a vehicle type, and see real-time price breakdowns.",
  },
  {
    step: 3,
    emoji: "🚗",
    title: "Chauffeur Assigned",
    description: "Your professional driver and vehicle are confirmed for your entire journey.",
  },
] as const;

const TESTIMONIALS = [
  {
    name: "Emma Watson",
    country: "United Kingdom",
    rating: 5,
    text: "Booking through TSL made our Sri Lanka trip completely stress-free. The driver was exceptionally professional, and the custom planner let us see Sigiriya and Galle at our own pace.",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120",
  },
  {
    name: "Marc Depont",
    country: "France",
    rating: 5,
    text: "The SUV assigned to us was pristine, and our chauffeur guide knew the best scenic routes. Having instant transparent pricing and automated approval is a game-changer.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120",
  },
  {
    name: "Aiko Tanaka",
    country: "Japan",
    rating: 5,
    text: "Highly recommend the trip planner! We bundled our custom route, private vehicle, and tour stops. The 24/7 service and simplicity of the platform exceeded our expectations.",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=120",
  },
];

const EXPERIENCES = [
  {
    icon: Car,
    title: "Premium Fleet",
    description: "Comfortable, clean, and fully air-conditioned sedans, SUVs, and vans suited for all terrains.",
  },
  {
    icon: ShieldCheck,
    title: "Expert Chauffeurs",
    description: "Verified English-speaking drivers who serve as your local guides throughout the island tour.",
  },
  {
    icon: Compass,
    title: "Optimized Routes",
    description: "Our system automatically calculates efficient routes, saving time and keeping pricing transparent.",
  },
  {
    icon: Clock,
    title: "24/7 Local Support",
    description: "Dedicated assistance team available around the clock to support you during your entire stay.",
  },
];

export function HomePage() {
  const router = useRouter();
  const { data: featured = [], isLoading } = useFeaturedPlaces();
  const [detailPlace, setDetailPlace] = useState<Place | null>(null);
  const [activeFilter, setActiveFilter] = useState("All");
  const [isPlanning, setIsPlanning] = useState(false);
  const [planner, setPlanner] = useState({
    traveler: "Couple",
    vibe: "Beaches",
    duration: "6-10 Days",
  });

  const handleStartPlanning = (e: React.FormEvent) => {
    e.preventDefault();
    setIsPlanning(true);
    setTimeout(() => {
      router.push("/plan");
    }, 800);
  };

  const filteredPlaces = featured.filter((place) => {
    if (activeFilter === "All") return true;
    const tags = place.tags ?? [];
    if (activeFilter === "Beaches") {
      return tags.includes("beach");
    }
    if (activeFilter === "Heritage") {
      return tags.includes("heritage") || tags.includes("UNESCO");
    }
    if (activeFilter === "Wildlife & Nature") {
      return tags.includes("wildlife") || tags.includes("safari") || tags.includes("elephants");
    }
    if (activeFilter === "Adventure & Hiking") {
      return tags.includes("hiking") || tags.includes("mountain") || tags.includes("surfing");
    }
    return true;
  });

  return (
    <>
      {/* Hero Section */}
      <section className="relative flex min-h-[calc(100vh-88px)] flex-col justify-center overflow-hidden bg-black text-white">
        <Image
          src={heroBg}
          alt="Sri Lanka scenery"
          fill
          priority
          className="object-cover object-left opacity-35 grayscale brightness-75 contrast-125 transition-transform duration-1000"
          sizes="100vw"
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"
          aria-hidden
        />

        <div className="relative z-10 mx-auto flex max-w-6xl flex-col items-center px-6 py-20 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-1.5 text-xs uppercase tracking-widest text-white backdrop-blur-md">
            <Sparkles className="h-3 w-3" /> Sri Lanka&apos;s Premium Travel Platform
          </span>

          <h1 className="mt-6 font-serif text-4xl font-extrabold leading-tight text-white sm:text-5xl lg:text-7xl tracking-tight max-w-4xl">
            YOUR SRI LANKA <span className="block text-zinc-300">ADVENTURE, CURATED</span>
          </h1>

          <p className="mt-6 max-w-2xl text-base text-zinc-300 sm:text-lg font-light leading-relaxed">
            Create optimized custom itineraries. Book verified private chauffeurs, premium air-conditioned vehicles, and secure instant confirmation.
          </p>

          {/* Quick Planner Card */}
          <form
            onSubmit={handleStartPlanning}
            className="mt-12 w-full max-w-4xl rounded-2xl border border-white/10 bg-black/60 p-6 shadow-2xl backdrop-blur-xl text-left"
          >
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 md:grid-cols-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Traveler
                </label>
                <select
                  value={planner.traveler}
                  onChange={(e) => setPlanner({ ...planner, traveler: e.target.value })}
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2.5 text-sm text-white focus:border-white focus:outline-none focus:ring-1 focus:ring-white"
                >
                  <option>Solo Traveler</option>
                  <option>Couple</option>
                  <option>Family</option>
                  <option>Friends Group</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Vibe & Focus
                </label>
                <select
                  value={planner.vibe}
                  onChange={(e) => setPlanner({ ...planner, vibe: e.target.value })}
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2.5 text-sm text-white focus:border-white focus:outline-none focus:ring-1 focus:ring-white"
                >
                  <option>Beaches</option>
                  <option>Heritage</option>
                  <option>Wildlife & Nature</option>
                  <option>Adventure & Hiking</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Duration
                </label>
                <select
                  value={planner.duration}
                  onChange={(e) => setPlanner({ ...planner, duration: e.target.value })}
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2.5 text-sm text-white focus:border-white focus:outline-none focus:ring-1 focus:ring-white"
                >
                  <option>1-5 Days</option>
                  <option>6-10 Days</option>
                  <option>11+ Days</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={isPlanning}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200 active:scale-95 disabled:opacity-70"
                >
                  {isPlanning ? "Creating..." : "Start Planning"}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </form>

          {/* Floating Badges */}
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {["🌅 Golden Beaches", "⛰️ Ella Peaks", "🐘 Safari Tours", "🏛️ Ancient Temples"].map((badge) => (
              <span
                key={badge}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs text-zinc-300 transition duration-300 hover:scale-105 hover:bg-white/10"
              >
                {badge}
              </span>
            ))}
          </div>
        </div>

        <a
          href="#destinations"
          className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-white/50 transition hover:text-white"
          aria-label="Scroll to destinations"
        >
          <ChevronDown className="h-8 w-8 animate-bounce" />
        </a>
      </section>

      {/* Featured Places Section */}
      <section id="destinations" className="bg-white py-20 text-black">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col items-center justify-between gap-6 border-b pb-8 md:flex-row md:items-end">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                Curated Collections
              </span>
              <h2 className="mt-2 font-serif text-3xl font-bold tracking-tight md:text-5xl">
                POPULAR DESTINATIONS
              </h2>
            </div>

            {/* Category Filter Bar */}
            <div className="flex flex-wrap gap-2">
              {["All", "Beaches", "Heritage", "Wildlife & Nature", "Adventure & Hiking"].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={cn(
                    "rounded-full px-5 py-2 text-xs font-semibold tracking-wide transition border",
                    activeFilter === filter
                      ? "bg-black border-black text-white shadow-sm"
                      : "bg-white border-zinc-200 text-zinc-600 hover:border-black hover:text-black"
                  )}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* Place Cards Grid */}
          <div className="mt-12 flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory md:grid md:grid-cols-2 md:overflow-visible lg:grid-cols-4">
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="w-[280px] shrink-0 snap-start md:w-auto">
                    <PlaceCardSkeleton />
                  </div>
                ))
              : filteredPlaces.map((place) => (
                  <div key={place.id} className="w-[280px] shrink-0 snap-start md:w-auto transition duration-300 hover:-translate-y-1">
                    <PlaceCard
                      place={place}
                      variant="compact"
                      onViewDetails={() => setDetailPlace(place)}
                    />
                  </div>
                ))}
          </div>

          {!isLoading && filteredPlaces.length === 0 && (
            <p className="mt-12 text-center text-zinc-500">
              No matching destinations found.{" "}
              <Link href="/plan" className="font-semibold text-black underline">
                Explore all places
              </Link>
            </p>
          )}
        </div>
      </section>

      {/* Curated Experiences Section */}
      <section className="bg-zinc-50 py-20 text-black border-y">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">
              Why Tour Sri Lanka
            </span>
            <h2 className="mt-2 font-serif text-3xl font-bold tracking-tight md:text-5xl">
              THE TSL DIFFERENCE
            </h2>
            <p className="mt-4 text-zinc-600 font-light leading-relaxed">
              We coordinate all details, ensuring a seamless private journey across Sri Lanka.
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {EXPERIENCES.map((exp, idx) => {
              const Icon = exp.icon;
              return (
                <div
                  key={idx}
                  className="group rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm transition duration-300 hover:border-black hover:shadow-md"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-black text-white group-hover:scale-110 transition duration-300">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-6 font-serif text-lg font-bold text-black">
                    {exp.title}
                  </h3>
                  <p className="mt-3 text-sm text-zinc-600 font-light leading-relaxed">
                    {exp.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Step by Step Blueprint Section */}
      <section id="how-it-works" className="bg-white py-20 text-black">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">
              Process
            </span>
            <h2 className="mt-2 font-serif text-3xl font-bold tracking-tight md:text-5xl">
              HOW IT WORKS
            </h2>
          </div>

          <div className="relative mt-20 grid gap-10 md:grid-cols-3">
            {/* SVG Connecting Trail for Desktop */}
            <div className="absolute top-1/2 left-[12%] right-[12%] hidden -translate-y-1/2 border-t-2 border-dashed border-zinc-200 md:block" />

            {STEPS.map((item) => (
              <div
                key={item.step}
                className="relative flex flex-col items-center text-center bg-white border border-zinc-200 rounded-2xl p-8 shadow-sm z-10 transition duration-300 hover:border-black hover:-translate-y-1"
              >
                <span className="absolute -top-6 flex h-12 w-12 items-center justify-center rounded-full bg-black text-sm font-bold text-white shadow-lg">
                  {item.step}
                </span>
                <span className="mt-4 block text-4xl" aria-hidden>
                  {item.emoji}
                </span>
                <h3 className="mt-6 font-serif text-xl font-bold text-black">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm text-zinc-600 font-light leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Traveler Testimonials Section */}
      <section className="bg-zinc-50 py-20 text-black border-y">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">
              Reviews
            </span>
            <h2 className="mt-2 font-serif text-3xl font-bold tracking-tight md:text-5xl">
              TRAVELER STORIES
            </h2>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {TESTIMONIALS.map((item, idx) => (
              <div
                key={idx}
                className="relative rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm transition duration-300 hover:shadow-md hover:border-zinc-300"
              >
                <div className="flex gap-1">
                  {Array.from({ length: item.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-black text-black" />
                  ))}
                </div>
                <p className="mt-6 text-sm italic text-zinc-700 leading-relaxed font-light">
                  &ldquo;{item.text}&rdquo;
                </p>
                <div className="mt-8 flex items-center gap-4 border-t pt-6">
                  <img
                    src={item.avatar}
                    alt={item.name}
                    className="h-10 w-10 rounded-full object-cover border border-zinc-200 grayscale"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-black">{item.name}</h4>
                    <p className="text-xs text-zinc-500">{item.country}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Animated Stats Banner */}
      <section className="relative bg-black py-16 text-white overflow-hidden">
        {/* Background Mesh Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-black to-zinc-900 opacity-90" />
        
        <div className="relative z-10 mx-auto grid max-w-5xl grid-cols-2 gap-y-10 gap-x-8 px-6 md:grid-cols-4">
          <AnimatedStat value={500} suffix="+" label="Happy Travelers" />
          <AnimatedStat value={25} label="Destinations" />
          <AnimatedStat value={5} label="Vehicle Types" />
          <AnimatedStat value={24} suffix="hr" label="Confirmation" />
        </div>
      </section>

      {/* Stark B&W CTA Section */}
      <section className="relative bg-zinc-50 py-24 text-black overflow-hidden">
        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">
            Adventure Awaits
          </span>
          <h2 className="mt-4 font-serif text-3xl font-bold tracking-tight md:text-5xl">
            READY TO EXPERIENCE SRI LANKA?
          </h2>
          <p className="mt-4 max-w-lg mx-auto text-zinc-600 font-light text-sm md:text-base leading-relaxed">
            Build your itinerary, pick your private chauffeur, and receive your booking summary instantly.
          </p>
          <div className="mt-10 flex justify-center">
            <Link
              href="/plan"
              className={cn(
                buttonVariants({ size: "lg" }),
                "bg-black text-white hover:bg-zinc-800 transition px-8 py-6 rounded-full font-bold text-base shadow-lg tracking-wider"
              )}
            >
              START PLANNING YOUR TRIP →
            </Link>
          </div>
        </div>
      </section>

      {/* Details Place Modal */}
      <PlaceModal
        place={detailPlace}
        open={!!detailPlace}
        onClose={() => setDetailPlace(null)}
      />
    </>
  );
}
