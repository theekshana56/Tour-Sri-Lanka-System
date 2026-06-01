"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { getDashboardForRole } from "@/lib/auth";
import { useAuthStore } from "@/store/authStore";

export function Navbar() {
  const router = useRouter();
  const { isAuthenticated, user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <header className="border-b bg-background">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="text-lg font-semibold">
          TSL — Tourism Sri Lanka
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/plan" className="font-medium text-tsl-teal hover:underline">
            Plan Trip
          </Link>
          {isAuthenticated && user ? (
            <>
              <Link href={getDashboardForRole(user.role)}>Dashboard</Link>
              <button
                type="button"
                onClick={handleLogout}
                className="hover:underline"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login">Login</Link>
              <Link href="/register">Register</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
