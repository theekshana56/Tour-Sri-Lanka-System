import Link from "next/link";

export function Navbar() {
  return (
    <header className="border-b bg-background">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="text-lg font-semibold">
          TSL — Tourism Sri Lanka
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/places">Places</Link>
          <Link href="/planner">Trip Planner</Link>
          <Link href="/login">Login</Link>
        </div>
      </nav>
    </header>
  );
}
