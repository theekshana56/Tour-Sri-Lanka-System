"use client";

import { useRef, useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authApi, usersApi } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api-errors";
import { useAuthStore } from "@/store/authStore";

const CURRENCIES = [
  { code: "USD", label: "USD" },
  { code: "EUR", label: "EUR" },
  { code: "GBP", label: "GBP" },
  { code: "AUD", label: "AUD" },
  { code: "JPY", label: "JPY" },
  { code: "INR", label: "INR" },
  { code: "CAD", label: "CAD" },
  { code: "SGD", label: "SGD" },
  { code: "CNY", label: "CNY" },
  { code: "AED", label: "AED" },
];

const profileSchema = z.object({
  fullName: z.string().min(2, "Enter your full name"),
  phone: z.string().min(8, "Enter a valid phone number"),
  preferredCurrency: z.string().min(3),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter current password"),
    newPassword: z.string().min(8, "At least 8 characters"),
    confirmPassword: z.string().min(1, "Confirm your password"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ProfileForm = z.infer<typeof profileSchema>;
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

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user?.fullName ?? "",
      phone: user?.phone ?? "",
      preferredCurrency: user?.preferredCurrency ?? "USD",
    },
  });

  const passwordForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const saveProfile = async (values: ProfileForm) => {
    try {
      const { data } = await usersApi.updateProfile(values);
      setUser(data);
      toast.success("Profile updated");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Could not update profile"));
    }
  };

  const onPhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxBytes = 5 * 1024 * 1024;
    if (file.size > maxBytes) {
      toast.error("Image must be 5MB or smaller. Choose a smaller photo.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setUploadingPhoto(true);
    try {
      const { data } = await usersApi.uploadProfileImage(file);
      setUser(data);
      toast.success("Profile photo updated");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Could not upload photo"));
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const changePassword = async (values: PasswordForm) => {
    try {
      await authApi.changePassword(values);
      passwordForm.reset();
      toast.success("Password updated successfully");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Could not change password"));
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="font-serif text-2xl font-bold text-tsl-forest md:text-3xl">
          Profile Settings
        </h1>
        <p className="mt-1 text-muted-foreground">{user?.email}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-lg">Personal Info</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingPhoto}
              className="relative shrink-0"
            >
              {user?.profileImageUrl ? (
                <img
                  src={user.profileImageUrl}
                  alt=""
                  className="h-20 w-20 rounded-full object-cover ring-2 ring-tsl-teal/30"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-tsl-teal text-xl font-bold text-white">
                  {getInitials(user?.fullName ?? "T")}
                </div>
              )}
              {uploadingPhoto && (
                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40">
                  <LoadingSpinner size="sm" className="border-white border-t-transparent" />
                </div>
              )}
            </button>
            <div>
              <p className="text-sm font-medium">Profile photo</p>
              <p className="text-xs text-muted-foreground">Click to upload (max 5MB, JPG/PNG)</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onPhotoSelect}
            />
          </div>

          <form
            onSubmit={profileForm.handleSubmit(saveProfile)}
            className="space-y-4"
          >
            <Field label="Full Name" error={profileForm.formState.errors.fullName?.message}>
              <Input {...profileForm.register("fullName")} />
            </Field>
            <Field label="WhatsApp / Phone" error={profileForm.formState.errors.phone?.message}>
              <Input {...profileForm.register("phone")} placeholder="+94771234567" />
            </Field>
            <Field
              label="Preferred Currency"
              error={profileForm.formState.errors.preferredCurrency?.message}
            >
              <select
                {...profileForm.register("preferredCurrency")}
                className="flex h-10 w-full rounded-md border bg-background px-3 text-sm"
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.label}
                  </option>
                ))}
              </select>
            </Field>
            <Button
              type="submit"
              disabled={profileForm.formState.isSubmitting}
              className="bg-tsl-teal hover:bg-tsl-teal/90"
            >
              {profileForm.formState.isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-lg">Change Password</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={passwordForm.handleSubmit(changePassword)}
            className="space-y-4"
          >
            <Field
              label="Current Password"
              error={passwordForm.formState.errors.currentPassword?.message}
            >
              <Input type="password" {...passwordForm.register("currentPassword")} />
            </Field>
            <Field
              label="New Password"
              error={passwordForm.formState.errors.newPassword?.message}
            >
              <Input type="password" {...passwordForm.register("newPassword")} />
            </Field>
            <Field
              label="Confirm New Password"
              error={passwordForm.formState.errors.confirmPassword?.message}
            >
              <Input type="password" {...passwordForm.register("confirmPassword")} />
            </Field>
            <Button
              type="submit"
              variant="outline"
              disabled={passwordForm.formState.isSubmitting}
            >
              {passwordForm.formState.isSubmitting ? "Updating..." : "Update Password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
