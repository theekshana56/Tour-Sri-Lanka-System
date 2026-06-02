import type { UserRole } from "@/types";
import { getDashboardForRole } from "@/lib/auth";

export function getProfileHref(role: UserRole | string): string {
  if (role === "DRIVER") return "/driver/profile";
  if (role === "CUSTOMER") return "/dashboard/profile";
  return getDashboardForRole(role);
}
