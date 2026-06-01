"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Sidebar } from "@/components/layout/Sidebar";
import { useAuthStore } from "@/store/authStore";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const refreshToken = useAuthStore((state) => state.refreshToken);
  const refreshAccessToken = useAuthStore((state) => state.refreshAccessToken);
  const [checking, setChecking] = useState(true);

  const isCustomerDashboard = pathname.startsWith("/dashboard");
  const isAdminDashboard = pathname.startsWith("/admin");
  const isManagerDashboard = pathname.startsWith("/manager");
  const isFinanceDashboard = pathname.startsWith("/finance");

  useEffect(() => {
    const verifyAuth = async () => {
      if (!isAuthenticated && refreshToken) {
        try {
          await refreshAccessToken();
        } catch {
          router.replace("/login");
          return;
        }
      }

      if (!useAuthStore.getState().isAuthenticated) {
        router.replace("/login");
        return;
      }

      setChecking(false);
    };

    verifyAuth();
  }, [isAuthenticated, refreshToken, refreshAccessToken, router]);

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (isAdminDashboard) {
    return <DashboardLayout variant="admin">{children}</DashboardLayout>;
  }

  if (isManagerDashboard) {
    return <DashboardLayout variant="manager">{children}</DashboardLayout>;
  }

  if (isFinanceDashboard) {
    return <DashboardLayout variant="finance">{children}</DashboardLayout>;
  }

  if (isCustomerDashboard) {
    return <DashboardLayout variant="customer">{children}</DashboardLayout>;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 p-6">{children}</div>
    </div>
  );
}
