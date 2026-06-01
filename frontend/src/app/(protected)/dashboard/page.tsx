"use client";

import { useAuthStore } from "@/store/authStore";

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);

  return (
    <div>
      <h1 className="text-2xl font-bold">Customer Dashboard</h1>
      <p className="mt-2 text-muted-foreground">
        Welcome back, {user?.fullName ?? "Traveler"}.
      </p>
    </div>
  );
}
