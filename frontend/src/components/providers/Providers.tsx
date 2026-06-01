"use client";

import { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { useAuthStore } from "@/store/authStore";

function AuthBootstrap({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      await useAuthStore.persist.rehydrate();
      const { refreshToken, accessToken, refreshAccessToken } =
        useAuthStore.getState();

      if (refreshToken && !accessToken) {
        try {
          await refreshAccessToken();
        } catch {
          useAuthStore.getState().clearAuth();
        }
      }
      setReady(true);
    };

    init();
  }, []);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthBootstrap>
      {children}
      <Toaster position="top-right" />
    </AuthBootstrap>
  );
}
