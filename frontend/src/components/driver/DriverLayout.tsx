"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Calendar, Home, MessageCircle, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { getDashboardForRole } from "@/lib/auth";
import { usersApi } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import toast from "react-hot-toast";
import { getApiErrorMessage } from "@/lib/api-errors";

const TABS = [
  { href: "/driver/dashboard", label: "Today", icon: Home },
  { href: "/driver/messages", label: "Messages", icon: MessageCircle },
  { href: "/driver/schedule", label: "Schedule", icon: Calendar },
  { href: "/driver/profile", label: "Profile", icon: User },
] as const;

export function DriverLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    if (user && user.role !== "DRIVER") {
      router.replace(getDashboardForRole(user.role));
    }
  }, [user, router]);

  const isOnline = user?.isAvailable !== false;

  const toggleOnline = async () => {
    if (!user) return;
    setToggling(true);
    try {
      const next = !isOnline;
      const { data } = await usersApi.updateProfile({
        fullName: user.fullName,
        phone: user.phone,
        preferredCurrency: user.preferredCurrency ?? "USD",
        isAvailable: next,
      });
      setUser(data);
      toast.success(next ? "You are now available" : "You are now unavailable");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setToggling(false);
    }
  };

  const firstName = user?.fullName?.split(" ")[0] ?? "Driver";

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="sticky top-0 z-40 border-b bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="font-serif text-lg font-bold text-tsl-forest">TSL Driver</p>
            <p className="text-sm font-medium text-foreground">{firstName}</p>
          </div>
          <button
            type="button"
            onClick={toggleOnline}
            disabled={toggling}
            className={cn(
              "min-h-[44px] min-w-[44px] rounded-full px-4 py-2 text-sm font-semibold transition",
              isOnline
                ? "bg-emerald-100 text-emerald-800 ring-2 ring-emerald-500"
                : "bg-slate-200 text-slate-600"
            )}
            aria-label={isOnline ? "Set offline" : "Set online"}
          >
            {isOnline ? "Online" : "Offline"}
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-4 pb-24">{children}</main>

      <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-[60px] border-t bg-white shadow-[0_-4px_12px_rgba(0,0,0,0.08)]">
        {TABS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex min-h-[60px] flex-1 flex-col items-center justify-center gap-0.5 text-xs font-semibold transition",
                active ? "text-tsl-teal" : "text-muted-foreground"
              )}
            >
              <Icon className="h-6 w-6" aria-hidden />
              {label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
