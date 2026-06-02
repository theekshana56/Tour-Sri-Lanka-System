"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDown, Menu, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { getDashboardForRole } from "@/lib/auth";
import { getProfileHref } from "@/lib/profile-routes";
import { useScrollY } from "@/hooks/useScrollY";
import { useAuthStore } from "@/store/authStore";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetBody,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/plan", label: "Destinations" },
  { href: "/plan", label: "Plan a Trip" },
  { href: "/track", label: "Track Booking" },
] as const;

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function normalizeBookingNumber(raw: string) {
  return raw.trim().toUpperCase().replace(/\s+/g, "");
}

function TrackSearchInput({
  className,
  onNavigate,
}: {
  className?: string;
  onNavigate?: () => void;
}) {
  const router = useRouter();
  const [value, setValue] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = normalizeBookingNumber(value);
    if (!num) return;
    onNavigate?.();
    router.push(`/track/${encodeURIComponent(num)}`);
  };

  return (
    <form onSubmit={submit} className={cn("relative", className)}>
      <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Track TSL-V-XX"
        className="h-9 w-40 pl-8 text-sm lg:w-44"
        aria-label="Booking reference"
      />
    </form>
  );
}

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const scrolled = useScrollY();
  const onHomeHero = pathname === "/" && !scrolled;
  const { isAuthenticated, user, logout } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [menuOpen]);

  const handleLogout = useCallback(async () => {
    setMenuOpen(false);
    setMobileOpen(false);
    await logout();
    router.push("/login");
  }, [logout, router]);

  const closeMobile = () => setMobileOpen(false);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled || pathname !== "/"
          ? "border-b border-border/60 bg-white/95 shadow-sm backdrop-blur-md"
          : "border-b border-transparent bg-transparent"
      )}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 lg:px-6">
        <Link
          href="/"
          className={cn(
            "shrink-0 font-serif text-xl font-bold lg:text-2xl",
            onHomeHero ? "text-white drop-shadow-sm" : "text-tsl-forest"
          )}
        >
          🌿 TSL
        </Link>

        <div
          className={cn(
            "hidden items-center gap-6 text-sm font-medium md:flex",
            onHomeHero ? "text-white" : "text-foreground"
          )}
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="transition hover:text-tsl-teal"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <TrackSearchInput />
          {isAuthenticated && user ? (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((o) => !o)}
                className="flex items-center gap-2 rounded-full border bg-white/90 py-1 pl-1 pr-2 text-sm shadow-sm"
                aria-expanded={menuOpen}
                aria-haspopup="menu"
              >
                {user.profileImageUrl ? (
                  <img
                    src={user.profileImageUrl}
                    alt=""
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-tsl-teal text-xs font-bold text-white">
                    {getInitials(user.fullName)}
                  </span>
                )}
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </button>
              {menuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-48 overflow-hidden rounded-lg border bg-white py-1 shadow-lg"
                >
                  <Link
                    href={getDashboardForRole(user.role)}
                    className="block px-4 py-2 text-sm hover:bg-muted"
                    onClick={() => setMenuOpen(false)}
                  >
                    My Dashboard
                  </Link>
                  <Link
                    href={getProfileHref(user.role)}
                    className="block px-4 py-2 text-sm hover:bg-muted"
                    onClick={() => setMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <button
                    type="button"
                    className="block w-full px-4 py-2 text-left text-sm hover:bg-muted"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  onHomeHero
                    ? "border-white/80 bg-white/10 text-white hover:bg-white/20"
                    : ""
                )}
              >
                Login
              </Link>
              <Link
                href="/plan"
                className={cn(
                  buttonVariants({ size: "sm" }),
                  "bg-tsl-teal text-white hover:bg-tsl-teal/90"
                )}
              >
                Start Planning
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className={cn(
            "rounded-lg p-2 md:hidden",
            onHomeHero ? "text-white" : "text-foreground"
          )}
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
        >
          <Menu className="h-6 w-6" />
        </button>
      </nav>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>🌿 TSL</SheetTitle>
            <SheetClose onClose={closeMobile} />
          </SheetHeader>
          <SheetBody className="space-y-6">
            <TrackSearchInput className="w-full" onNavigate={closeMobile} />
            <div className="flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-muted"
                  onClick={closeMobile}
                >
                  {link.label}
                </Link>
              ))}
            </div>
            {isAuthenticated && user ? (
              <div className="space-y-2 border-t pt-4">
                <p className="px-3 text-xs text-muted-foreground">{user.fullName}</p>
                <Link
                  href={getDashboardForRole(user.role)}
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-muted"
                  onClick={closeMobile}
                >
                  My Dashboard
                </Link>
                <Link
                  href={getProfileHref(user.role)}
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-muted"
                  onClick={closeMobile}
                >
                  Profile
                </Link>
                <Button variant="outline" className="w-full" onClick={handleLogout}>
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-2 border-t pt-4">
                <Link
                  href="/login"
                  className={cn(buttonVariants({ variant: "outline" }), "w-full")}
                  onClick={closeMobile}
                >
                  Login
                </Link>
                <Link
                  href="/plan"
                  className={cn(
                    buttonVariants(),
                    "w-full bg-tsl-teal hover:bg-tsl-teal/90"
                  )}
                  onClick={closeMobile}
                >
                  Start Planning
                </Link>
              </div>
            )}
          </SheetBody>
        </SheetContent>
      </Sheet>
    </header>
  );
}
