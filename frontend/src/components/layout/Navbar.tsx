"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { getDashboardForRole } from "@/lib/auth";
import { getProfileHref } from "@/lib/profile-routes";
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

type NavDropdownItem = {
  label: string;
  href: string;
};

type NavItem =
  | { label: string; href: string; children?: never }
  | { label: string; children: NavDropdownItem[]; href?: never };

const PRIMARY_NAV: NavItem[] = [
  {
    label: "Destinations",
    children: [
      { href: "/plan", label: "Browse All Places" },
      { href: "/#destinations", label: "Popular Destinations" },
    ],
  },
  {
    label: "About",
    children: [
      { href: "/#how-it-works", label: "How It Works" },
      { href: "/#destinations", label: "Featured Places" },
    ],
  },
  {
    label: "Plan a Trip",
    children: [
      { href: "/plan", label: "Start Planning" },
      { href: "/plan/details", label: "Trip Details" },
    ],
  },
  { label: "Track Booking", href: "/track" },
  { label: "How It Works", href: "/#how-it-works" },
];

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
        className="h-9 w-full pl-8 text-sm"
        aria-label="Booking reference"
      />
    </form>
  );
}

function NavDropdown({
  label,
  items,
  onNavigate,
}: {
  label: string;
  items: NavDropdownItem[];
  onNavigate?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex items-center gap-0.5 text-[15px] font-normal text-foreground transition hover:opacity-70"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        {label}
        <span aria-hidden className="text-sm leading-none">
          +
        </span>
      </button>
      {open && (
        <div
          role="menu"
          className="absolute left-0 top-full z-50 min-w-[200px] pt-3"
        >
          <div className="overflow-hidden rounded-md border bg-white py-1 shadow-md">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                role="menuitem"
                className="block px-4 py-2.5 text-sm text-foreground transition hover:bg-muted"
                onClick={() => {
                  setOpen(false);
                  onNavigate?.();
                }}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function NavLink({
  item,
  onNavigate,
}: {
  item: NavItem;
  onNavigate?: () => void;
}) {
  if (item.children) {
    return (
      <NavDropdown
        label={item.label}
        items={item.children}
        onNavigate={onNavigate}
      />
    );
  }

  const isExternal = item.href.startsWith("mailto:");

  if (isExternal) {
    return (
      <a
        href={item.href}
        className="text-[15px] font-normal text-foreground transition hover:opacity-70"
      >
        {item.label}
      </a>
    );
  }

  return (
    <Link
      href={item.href}
      className="text-[15px] font-normal text-foreground transition hover:opacity-70"
      onClick={onNavigate}
    >
      {item.label}
    </Link>
  );
}

export function Navbar() {
  const router = useRouter();
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
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border/40 bg-white">
      <nav className="mx-auto flex h-[88px] max-w-[1400px] items-center justify-between gap-8 px-10 xl:px-14">
        <Link href="/" className="flex shrink-0 items-center gap-4">
          <span className="font-serif text-[2rem] font-bold leading-none tracking-tight text-foreground">
            TSL
          </span>
          <span className="hidden max-w-[9rem] text-[11px] leading-snug text-foreground sm:block">
            Discover the Pearl of
            <br />
            the Indian Ocean
          </span>
        </Link>

        <div className="hidden flex-1 items-center justify-end gap-10 lg:flex xl:gap-14">
          <div className="flex items-center gap-8 xl:gap-10">
            {PRIMARY_NAV.map((item) => (
              <NavLink key={item.label} item={item} />
            ))}
          </div>

          <div className="flex items-center gap-8 xl:gap-10">
            {isAuthenticated && user ? (
              <>
                <Link
                  href={getDashboardForRole(user.role)}
                  className="text-[15px] font-normal text-foreground transition hover:opacity-70"
                >
                  Dashboard
                </Link>
                <div className="relative" ref={menuRef}>
                  <button
                    type="button"
                    onClick={() => setMenuOpen((open) => !open)}
                    className="inline-flex items-center gap-0.5 text-[15px] font-normal text-foreground transition hover:opacity-70"
                    aria-expanded={menuOpen}
                    aria-haspopup="menu"
                  >
                    Account
                    <span aria-hidden className="text-sm leading-none">
                      +
                    </span>
                  </button>
                  {menuOpen && (
                    <div
                      role="menu"
                      className="absolute right-0 top-full z-50 min-w-[200px] pt-3"
                    >
                      <div className="overflow-hidden rounded-md border bg-white py-1 shadow-md">
                        <Link
                          href={getProfileHref(user.role)}
                          className="block px-4 py-2.5 text-sm hover:bg-muted"
                          onClick={() => setMenuOpen(false)}
                        >
                          Profile
                        </Link>
                        <button
                          type="button"
                          className="block w-full px-4 py-2.5 text-left text-sm hover:bg-muted"
                          onClick={handleLogout}
                        >
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <NavDropdown
                label="Account"
                items={[
                  { href: "/login", label: "Login" },
                  { href: "/plan", label: "Create a Trip" },
                ]}
              />
            )}
            <a
              href="mailto:support@tsl.lk"
              className="text-[15px] font-normal text-foreground transition hover:opacity-70"
            >
              Contact
            </a>
          </div>
        </div>

        <button
          type="button"
          className="rounded-lg p-2 text-foreground lg:hidden"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
        >
          <Menu className="h-6 w-6" />
        </button>
      </nav>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle className="font-serif text-2xl font-bold">TSL</SheetTitle>
            <SheetClose onClose={closeMobile} />
          </SheetHeader>
          <SheetBody className="space-y-6">
            <TrackSearchInput onNavigate={closeMobile} />
            <div className="flex flex-col gap-1">
              {PRIMARY_NAV.flatMap((item) =>
                item.children
                  ? item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-muted"
                        onClick={closeMobile}
                      >
                        {child.label}
                      </Link>
                    ))
                  : [
                      <Link
                        key={item.href}
                        href={item.href}
                        className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-muted"
                        onClick={closeMobile}
                      >
                        {item.label}
                      </Link>,
                    ]
              )}
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
            <a
              href="mailto:support@tsl.lk"
              className="block rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-muted"
              onClick={closeMobile}
            >
              Contact
            </a>
          </SheetBody>
        </SheetContent>
      </Sheet>
    </header>
  );
}
