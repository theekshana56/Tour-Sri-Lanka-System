import type { LucideIcon } from "lucide-react";
import {
  Calendar,
  Car,
  Home,
  History,
  ClipboardList,
  MapPin,
  UserCog,
  Users,
} from "lucide-react";

export type DashboardNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  showPendingBadge?: boolean;
};

export const CUSTOMER_NAV: DashboardNavItem[] = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/dashboard/bookings", label: "My Bookings", icon: Calendar },
];

export const ADMIN_NAV: DashboardNavItem[] = [
  { href: "/admin/dashboard", label: "Dashboard Overview", icon: Home },
  {
    href: "/admin/bookings",
    label: "Bookings",
    icon: Calendar,
    showPendingBadge: true,
  },
  { href: "/admin/places", label: "Places Management", icon: MapPin },
  { href: "/admin/vehicles", label: "Vehicles Management", icon: Car },
  { href: "/admin/users", label: "Users Management", icon: Users },
  { href: "/admin/drivers", label: "Drivers Management", icon: UserCog },
];

export const MANAGER_NAV: DashboardNavItem[] = [
  { href: "/manager/dashboard", label: "Overview", icon: Home },
  {
    href: "/manager/dashboard",
    label: "Booking Queue",
    icon: ClipboardList,
    showPendingBadge: true,
  },
  { href: "/manager/bookings", label: "All Bookings", icon: Calendar },
  { href: "/manager/actions", label: "My Actions Log", icon: History },
];
