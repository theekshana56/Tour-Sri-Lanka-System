import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const roleRoutes: Record<string, string[]> = {
  "/admin": ["ADMIN"],
  "/manager": ["ADMIN", "MANAGER"],
  "/finance": ["FINANCE_MANAGER"],
  "/driver": ["DRIVER"],
  "/dashboard": ["CUSTOMER", "ADMIN", "MANAGER", "FINANCE_MANAGER", "DRIVER"],
};

function getDashboardForRole(role: string): string {
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

function isProtectedPath(pathname: string): boolean {
  return Object.keys(roleRoutes).some((prefix) => pathname.startsWith(prefix));
}

function isAuthPath(pathname: string): boolean {
  return (
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/forgot-password")
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuthenticated = request.cookies.get("tsl-authenticated")?.value === "true";
  const role = request.cookies.get("tsl-role")?.value;

  if (isAuthPath(pathname) && isAuthenticated && role) {
    return NextResponse.redirect(new URL(getDashboardForRole(role), request.url));
  }

  if (isProtectedPath(pathname)) {
    if (!isAuthenticated || !role) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const matchedPrefix = Object.keys(roleRoutes).find((prefix) =>
      pathname.startsWith(prefix)
    );

    if (matchedPrefix) {
      const allowedRoles = roleRoutes[matchedPrefix];
      if (!allowedRoles.includes(role)) {
        return NextResponse.redirect(new URL(getDashboardForRole(role), request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
