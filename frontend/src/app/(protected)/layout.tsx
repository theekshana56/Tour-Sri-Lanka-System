"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { Sidebar } from "@/components/layout/Sidebar";
import { useAuthStore } from "@/store/authStore";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const refreshToken = useAuthStore((state) => state.refreshToken);
  const refreshAccessToken = useAuthStore((state) => state.refreshAccessToken);
  const [checking, setChecking] = useState(true);

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

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 p-6">{children}</div>
    </div>
  );
}
