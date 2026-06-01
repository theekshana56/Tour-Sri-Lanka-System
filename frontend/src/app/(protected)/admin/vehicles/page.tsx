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
import type { User, Vehicle, VehicleType } from "@/types";

const TYPES: VehicleType[] = ["SEDAN", "SUV", "VAN", "MINIBUS", "LUXURY_SUV"];

const emptyForm = {
  name: "",
  type: "SUV" as VehicleType,
  capacity: 4,
  description: "",
  registrationNumber: "",
  assignedDriverId: "",
};

export default function AdminVehiclesPage() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Vehicle | null>(null);
  const [form, setForm] = useState(emptyForm);

  const { data: vehicles = [], isLoading } = useQuery({
    queryKey: ["admin-vehicles"],
    queryFn: async () => (await adminApi.listVehicles()).data,
  });

  const { data: driversData } = useQuery({
    queryKey: ["admin-drivers-list"],
    queryFn: async () =>
      (await adminApi.listUsers({ role: "DRIVER", size: 100 })).data,
  });

  const drivers = driversData?.content ?? [];

  const driverName = (id?: string | null) =>
    drivers.find((d) => d.id === id)?.fullName ?? "—";

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        ...form,
        assignedDriverId: form.assignedDriverId || null,
      };
      if (editing) return adminApi.updateVehicle(editing.id, payload);
      return adminApi.createVehicle(payload);
    },
    onSuccess: () => {
      toast.success(editing ? "Vehicle updated" : "Vehicle created");
      queryClient.invalidateQueries({ queryKey: ["admin-vehicles"] });
      setDialogOpen(false);
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteVehicle(id),
    onSuccess: () => {
      toast.success("Vehicle deactivated");
      queryClient.invalidateQueries({ queryKey: ["admin-vehicles"] });
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (v: Vehicle) => {
    setEditing(v);
    setForm({
      name: v.name,
      type: v.type,
      capacity: v.capacity,
      description: v.description ?? "",
      registrationNumber: v.registrationNumber ?? "",
      assignedDriverId: v.assignedDriverId ?? "",
    });
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-tsl-forest">Vehicles</h1>
          <p className="mt-1 text-muted-foreground">Fleet management and driver assignment</p>
        </div>
        <Button onClick={openCreate}>Add Vehicle</Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-white">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead className="border-b bg-muted/40 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Capacity</th>
                <th className="px-4 py-3">Registration</th>
                <th className="px-4 py-3">Assigned Driver</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((v) => (
                <tr key={v.id} className="border-b">
                  <td className="px-4 py-3 font-medium">{v.name}</td>
                  <td className="px-4 py-3">{v.type.replace("_", " ")}</td>
                  <td className="px-4 py-3">{v.capacity}</td>
                  <td className="px-4 py-3">{v.registrationNumber ?? "—"}</td>
                  <td className="px-4 py-3">{driverName(v.assignedDriverId)}</td>
                  <td className="px-4 py-3">
                    {v.isActive !== false ? "Active" : "Inactive"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => openEdit(v)}>
                        Edit
                      </Button>
                      {v.isActive !== false && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600"
                          onClick={() => {
                            if (confirm("Deactivate this vehicle?")) {
                              deleteMutation.mutate(v.id);
                            }
                          }}
                        >
                          Delete
                        </Button>
                      )}
                    </div>
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
            <DialogTitle>{editing ? "Edit Vehicle" : "Add Vehicle"}</DialogTitle>
            <DialogClose onClose={() => setDialogOpen(false)} />
          </DialogHeader>
          <div className="space-y-3 p-4 pt-0">
            <div>
              <Label>Name</Label>
              <Input
                className="mt-1"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <Label>Type</Label>
              <select
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                value={form.type}
                onChange={(e) =>
                  setForm({ ...form, type: e.target.value as VehicleType })
                }
              >
                {TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t.replace("_", " ")}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Capacity</Label>
              <Input
                type="number"
                className="mt-1"
                value={form.capacity}
                onChange={(e) =>
                  setForm({ ...form, capacity: Number(e.target.value) })
                }
              />
            </div>
            <div>
              <Label>Registration</Label>
              <Input
                className="mt-1"
                value={form.registrationNumber}
                onChange={(e) =>
                  setForm({ ...form, registrationNumber: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Assign driver</Label>
              <select
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                value={form.assignedDriverId}
                onChange={(e) =>
                  setForm({ ...form, assignedDriverId: e.target.value })
                }
              >
                <option value="">None</option>
                {drivers.map((d: User) => (
                  <option key={d.id} value={d.id}>
                    {d.fullName}
                  </option>
                ))}
              </select>
            </div>
            <Button
              className="w-full"
              disabled={saveMutation.isPending}
              onClick={() => saveMutation.mutate()}
            >
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
