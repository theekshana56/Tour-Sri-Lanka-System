import type { UserRole } from "@/types";

export function getDashboardForRole(role: UserRole | string): string {
  switch (role) {
    case "ADMIN":
      return "/admin/dashboard";
    case "MANAGER":
      return "/manager/dashboard";
    case "FINANCE_MANAGER":
      return "/finance/dashboard";
    case "DRIVER":
      return "/driver/dashboard";
    default:
      return "/dashboard";
  }
}

export function setAuthCookies(role: UserRole | string): void {
  if (typeof document === "undefined") return;
  document.cookie = `tsl-role=${role}; path=/`;
  document.cookie = "tsl-authenticated=true; path=/";
}

export function clearAuthCookies(): void {
  if (typeof document === "undefined") return;
  document.cookie = "tsl-role=; path=/; max-age=0";
  document.cookie = "tsl-authenticated=; path=/; max-age=0";
}
