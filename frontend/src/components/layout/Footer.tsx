import Link from "next/link";

const FOOTER_LINKS = [
  { href: "/", label: "Home" },
  { href: "/plan", label: "Plan a Trip" },
  { href: "/track", label: "Track Booking" },
  { href: "mailto:support@tsl.lk", label: "Contact" },
] as const;

export function Footer() {
  return (
    <footer className="border-t bg-zinc-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-6">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <p className="font-serif text-2xl font-bold">TSL</p>
            <p className="mt-2 max-w-xs text-sm text-white/80">
              Your trusted partner for unforgettable journeys across the Pearl of
              the Indian Ocean.
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-white/70">
              Quick links
            </p>
            <ul className="mt-4 space-y-2">
              {FOOTER_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/90 transition hover:text-zinc-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-white/70">
              Contact
            </p>
            <p className="mt-4 text-sm text-white/90">
              <a href="mailto:support@tsl.lk" className="hover:text-zinc-300">
                support@tsl.lk
              </a>
            </p>
            <p className="mt-1 text-sm text-white/90">+94 11 234 5678</p>
          </div>
        </div>
        <p className="mt-10 border-t border-white/20 pt-6 text-center text-xs text-white/60">
          © {new Date().getFullYear()} TSL Tourism Sri Lanka. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
