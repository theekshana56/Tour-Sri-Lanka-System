"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetBody,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { authApi, usersApi, vehiclesApi } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api-errors";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Required"),
    newPassword: z.string().min(8, "At least 8 characters"),
    confirmPassword: z.string().min(1, "Required"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type PasswordForm = z.infer<typeof passwordSchema>;

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function DriverProfilePage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const logout = useAuthStore((s) => s.logout);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [savingAvail, setSavingAvail] = useState(false);

  const { data: vehicles = [] } = useQuery({
    queryKey: ["vehicles-list"],
    queryFn: async () => (await vehiclesApi.list(1)).data,
  });

  const assignedVehicle = vehicles.find((v) => v.assignedDriverId === user?.id);

  const passwordForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const isAvailable = user?.isAvailable !== false;

  const toggleAvailability = async () => {
    if (!user) return;
    setSavingAvail(true);
    try {
      const { data } = await usersApi.updateProfile({
        fullName: user.fullName,
        phone: user.phone,
        preferredCurrency: user.preferredCurrency ?? "USD",
        isAvailable: !isAvailable,
      });
      setUser(data);
      toast.success(data.isAvailable ? "Available for trips" : "Not available");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setSavingAvail(false);
    }
  };

  const onPasswordSubmit = async (values: PasswordForm) => {
    try {
      await authApi.changePassword(values);
      toast.success("Password updated");
      passwordForm.reset();
      setPasswordOpen(false);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  if (!user) return null;

  return (
    <div className="space-y-8 pb-8">
      <div className="flex flex-col items-center pt-4">
        {user.profileImageUrl ? (
          <img
            src={user.profileImageUrl}
            alt=""
            className="h-24 w-24 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-tsl-teal text-3xl font-bold text-white">
            {getInitials(user.fullName)}
          </div>
        )}
        <h1 className="mt-4 text-center text-2xl font-bold">{user.fullName}</h1>
      </div>

      <div className="rounded-xl border bg-white p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p
              className={cn(
                "text-base font-semibold",
                isAvailable ? "text-emerald-700" : "text-red-700"
              )}
            >
              {isAvailable ? "Available for trips" : "Not available"}
            </p>
            <p className="text-sm text-muted-foreground">
              Admins see this when assigning drivers
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={isAvailable}
            disabled={savingAvail}
            onClick={toggleAvailability}
            className={cn(
              "relative min-h-[44px] w-14 shrink-0 rounded-full transition",
              isAvailable ? "bg-emerald-500" : "bg-slate-300"
            )}
          >
            <span
              className={cn(
                "absolute top-1 h-9 w-9 rounded-full bg-white shadow transition",
                isAvailable ? "left-7" : "left-1"
              )}
            />
          </button>
        </div>
      </div>

      <div className="space-y-4 rounded-xl border bg-white p-5 text-base">
        <InfoRow label="Email" value={user.email} />
        <InfoRow label="Phone" value={user.phone} />
        <InfoRow label="License" value={user.licenseNumber ?? "—"} />
        <InfoRow
          label="Assigned vehicle"
          value={assignedVehicle?.name ?? user.assignedVehicleId ?? "—"}
        />
      </div>

      <Button
        className="min-h-[48px] w-full text-base"
        variant="outline"
        onClick={() => setPasswordOpen(true)}
      >
        Change password
      </Button>

      <Button
        variant="outline"
        className="min-h-[48px] w-full border-2 border-red-500 text-base font-semibold text-red-600"
        onClick={handleLogout}
      >
        Logout
      </Button>

      <Sheet open={passwordOpen} onOpenChange={setPasswordOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Change password</SheetTitle>
            <SheetClose onClose={() => setPasswordOpen(false)} />
          </SheetHeader>
          <SheetBody>
            <form
              className="space-y-4"
              onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
            >
              <div>
                <Label>Current password</Label>
                <Input
                  type="password"
                  className="mt-1 min-h-[48px] text-base"
                  {...passwordForm.register("currentPassword")}
                />
              </div>
              <div>
                <Label>New password</Label>
                <Input
                  type="password"
                  className="mt-1 min-h-[48px] text-base"
                  {...passwordForm.register("newPassword")}
                />
              </div>
              <div>
                <Label>Confirm password</Label>
                <Input
                  type="password"
                  className="mt-1 min-h-[48px] text-base"
                  {...passwordForm.register("confirmPassword")}
                />
                {passwordForm.formState.errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">
                    {passwordForm.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>
              <Button type="submit" className="min-h-[48px] w-full text-base">
                Update password
              </Button>
            </form>
          </SheetBody>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  );
}
