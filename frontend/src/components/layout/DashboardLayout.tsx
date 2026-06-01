"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Bell,
  LogOut,
  MapPin,
  Menu,
  User,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getDashboardForRole } from "@/lib/auth";
import {
  ADMIN_NAV,
  CUSTOMER_NAV,
  MANAGER_NAV,
  type DashboardNavItem,
} from "@/lib/dashboard-config";
import { adminApi, managerApi } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

type DashboardVariant = "customer" | "admin" | "manager";

const VARIANT_CONFIG: Record<
  DashboardVariant,
  { nav: DashboardNavItem[]; portalLabel: string; requiredRoles: string[] }
> = {
  customer: {
    nav: [...CUSTOMER_NAV, { href: "/dashboard/profile", label: "Profile", icon: User }],
    portalLabel: "Customer Portal",
    requiredRoles: ["CUSTOMER"],
  },
  admin: {
    nav: ADMIN_NAV,
    portalLabel: "Admin Portal",
    requiredRoles: ["ADMIN"],
  },
  manager: {
    nav: MANAGER_NAV,
    portalLabel: "Manager Portal",
    requiredRoles: ["ADMIN", "MANAGER"],
  },
};

export function DashboardLayout({
  children,
  variant = "customer",
}: {
  children: React.ReactNode;
  variant?: DashboardVariant;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [mobileOpen, setMobileOpen] = useState(false);

  const config = VARIANT_CONFIG[variant];

  const { data: adminDash } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: async () => (await adminApi.getDashboard()).data,
    enabled: variant === "admin" && user?.role === "ADMIN",
    staleTime: 30_000,
    refetchInterval: 60_000,
  });

  const { data: managerDash } = useQuery({
    queryKey: ["manager-dashboard"],
    queryFn: async () => (await managerApi.getDashboard()).data,
    enabled:
      variant === "manager" &&
      (user?.role === "MANAGER" || user?.role === "ADMIN"),
    staleTime: 30_000,
    refetchInterval: 60_000,
  });

  const pendingCount =
    variant === "admin"
      ? adminDash?.stats.pendingBookings ?? 0
      : variant === "manager"
        ? managerDash?.stats.pendingBookings ?? 0
        : 0;

  useEffect(() => {
    if (!user) return;
    if (!config.requiredRoles.includes(user.role)) {
      router.replace(getDashboardForRole(user.role));
    }
  }, [user, config.requiredRoles, router]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const sidebarContent = (
    <>
      <div className="border-b border-tsl-forest/10 px-5 py-5">
        <Link href="/" className="font-serif text-xl font-bold text-tsl-forest">
          Tour Sri Lanka
        </Link>
        <p className="mt-0.5 text-xs text-muted-foreground">{config.portalLabel}</p>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {config.nav.map(({ href, label, icon: Icon, showPendingBadge }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          const badge =
            showPendingBadge && pendingCount > 0 ? pendingCount : null;

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition",
                active
                  ? "bg-tsl-teal/10 text-tsl-teal"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <span className="flex items-center gap-3">
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </span>
              {badge != null && (
                <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
                  {badge}
                </span>
              )}
            </Link>
          );
        })}
        {variant === "customer" && (
          <Link
            href="/plan"
            className="mt-3 flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-3 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            <MapPin className="h-4 w-4" />
            Plan New Trip
          </Link>
        )}
      </nav>

      <div className="border-t p-3">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-tsl-sand/20">
      <aside className="hidden w-60 shrink-0 flex-col border-r bg-white lg:flex">
        {sidebarContent}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
            aria-hidden
          />
          <aside className="relative flex h-full w-60 flex-col bg-white shadow-xl">
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-4 rounded-lg p-2 hover:bg-muted"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
            {sidebarContent}
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b bg-white/95 px-4 py-3 backdrop-blur lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="rounded-lg p-2 hover:bg-muted lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <p className="hidden text-sm text-muted-foreground sm:block">
              Welcome back,{" "}
              <span className="font-semibold text-foreground">
                {user?.fullName ?? "User"}
              </span>
            </p>
            <p className="text-sm font-semibold sm:hidden">
              {user?.fullName?.split(" ")[0] ?? "User"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="rounded-full p-2 text-muted-foreground hover:bg-muted"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
            </button>
            {user?.profileImageUrl ? (
              <img
                src={user.profileImageUrl}
                alt=""
                className="h-9 w-9 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-tsl-teal text-sm font-bold text-white">
                {getInitials(user?.fullName ?? "T")}
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
