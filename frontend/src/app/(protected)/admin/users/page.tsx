"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { adminApi } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api-errors";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types";

const ROLES: UserRole[] = [
  "ADMIN",
  "MANAGER",
  "FINANCE_MANAGER",
  "DRIVER",
  "CUSTOMER",
];

const ROLE_TABS: Array<UserRole | "ALL"> = [
  "ALL",
  "ADMIN",
  "MANAGER",
  "FINANCE_MANAGER",
  "DRIVER",
  "CUSTOMER",
];

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [roleTab, setRoleTab] = useState<UserRole | "ALL">("ALL");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    temporaryPassword: "",
    phone: "",
    role: "MANAGER" as UserRole,
    licenseNumber: "",
  });

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users", roleTab],
    queryFn: async () =>
      (
        await adminApi.listUsers({
          role: roleTab === "ALL" ? undefined : roleTab,
          size: 100,
        })
      ).data,
  });

  const users = data?.content ?? [];

  const createMutation = useMutation({
    mutationFn: () =>
      adminApi.createUser({
        fullName: form.fullName,
        email: form.email,
        temporaryPassword: form.temporaryPassword,
        phone: form.phone,
        role: form.role,
        licenseNumber:
          form.role === "DRIVER" ? form.licenseNumber : undefined,
      }),
    onSuccess: () => {
      toast.success("User created");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setDialogOpen(false);
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const toggleMutation = useMutation({
    mutationFn: (id: string) => adminApi.toggleUserStatus(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-users"] }),
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-tsl-forest">Users</h1>
          <p className="mt-1 text-muted-foreground">Staff and customer accounts</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>Create User</Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {ROLE_TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setRoleTab(tab)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-sm font-medium",
              roleTab === tab
                ? "border-tsl-teal bg-tsl-teal text-white"
                : "bg-white hover:bg-muted"
            )}
          >
            {tab === "ALL" ? "All" : tab.replace("_", " ")}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-white">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="border-b bg-muted/40 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b">
                  <td className="px-4 py-3 font-medium">{u.fullName}</td>
                  <td className="px-4 py-3">{u.email}</td>
                  <td className="px-4 py-3">{u.role.replace("_", " ")}</td>
                  <td className="px-4 py-3">
                    {u.isActive !== false ? "Active" : "Inactive"}
                  </td>
                  <td className="px-4 py-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleMutation.mutate(u.id)}
                    >
                      {u.isActive !== false ? "Deactivate" : "Activate"}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create User</DialogTitle>
            <DialogClose onClose={() => setDialogOpen(false)} />
          </DialogHeader>
          <div className="space-y-3 p-4 pt-0">
            <div>
              <Label>Full name</Label>
              <Input
                className="mt-1"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                className="mt-1"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div>
              <Label>Temporary password</Label>
              <Input
                type="password"
                className="mt-1"
                value={form.temporaryPassword}
                onChange={(e) =>
                  setForm({ ...form, temporaryPassword: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Phone</Label>
              <Input
                className="mt-1"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div>
              <Label>Role</Label>
              <select
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                value={form.role}
                onChange={(e) =>
                  setForm({ ...form, role: e.target.value as UserRole })
                }
              >
                {ROLES.filter((r) => r !== "CUSTOMER").map((r) => (
                  <option key={r} value={r}>
                    {r.replace("_", " ")}
                  </option>
                ))}
              </select>
            </div>
            {form.role === "DRIVER" && (
              <div>
                <Label>License number</Label>
                <Input
                  className="mt-1"
                  value={form.licenseNumber}
                  onChange={(e) =>
                    setForm({ ...form, licenseNumber: e.target.value })
                  }
                />
              </div>
            )}
            <Button
              className="w-full"
              disabled={createMutation.isPending}
              onClick={() => createMutation.mutate()}
            >
              Create
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
