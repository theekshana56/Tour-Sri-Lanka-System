import Link from "next/link";

const links = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/bookings", label: "Bookings" },
  { href: "/dashboard/profile", label: "Profile" },
];

export function Sidebar() {
  return (
    <aside className="w-56 shrink-0 border-r bg-muted/30 p-4">
      <nav className="flex flex-col gap-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-md px-3 py-2 text-sm hover:bg-muted"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
