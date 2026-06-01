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
import type { Place, PlaceCategory, PriceRange } from "@/types";

const CATEGORIES: PlaceCategory[] = [
  "DESTINATION",
  "ACCOMMODATION",
  "RESTAURANT",
  "ACTIVITY",
];

const PRICE_RANGES: PriceRange[] = ["BUDGET", "MID_RANGE", "LUXURY"];

const emptyForm = {
  name: "",
  description: "",
  category: "DESTINATION" as PlaceCategory,
  district: "",
  province: "",
  latitude: 7.8731,
  longitude: 80.7718,
  priceRange: "MID_RANGE" as PriceRange,
  rating: 4,
  bestTimeToVisit: "",
};

export default function AdminPlacesPage() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Place | null>(null);
  const [form, setForm] = useState(emptyForm);
  const { data: places = [], isLoading } = useQuery({
    queryKey: ["admin-places"],
    queryFn: async () => (await adminApi.listPlaces()).data,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        ...form,
        tags: [],
        highlights: [],
      };
      if (editing) {
        return adminApi.updatePlace(editing.id, payload);
      }
      return adminApi.createPlace(payload);
    },
    onSuccess: () => {
      toast.success(editing ? "Place updated" : "Place created");
      queryClient.invalidateQueries({ queryKey: ["admin-places"] });
      setDialogOpen(false);
      setEditing(null);
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const toggleActiveMutation = useMutation({
    mutationFn: (id: string) => adminApi.togglePlaceActive(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-places"] }),
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const toggleFeatureMutation = useMutation({
    mutationFn: (id: string) => adminApi.togglePlaceFeature(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-places"] }),
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const uploadMutation = useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) =>
      adminApi.uploadPlaceImage(id, file),
    onSuccess: () => {
      toast.success("Image uploaded");
      queryClient.invalidateQueries({ queryKey: ["admin-places"] });
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (place: Place) => {
    setEditing(place);
    setForm({
      name: place.name,
      description: place.description,
      category: place.category,
      district: place.district,
      province: place.province ?? "",
      latitude: place.latitude,
      longitude: place.longitude,
      priceRange: place.priceRange ?? "MID_RANGE",
      rating: place.rating ?? 4,
      bestTimeToVisit: place.bestTimeToVisit ?? "",
    });
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-tsl-forest">Places</h1>
          <p className="mt-1 text-muted-foreground">Manage destinations and attractions</p>
        </div>
        <Button onClick={openCreate}>Add Place</Button>
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
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">District</th>
                <th className="px-4 py-3">Rating</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Featured</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {places.map((p) => (
                <tr key={p.id} className="border-b">
                  <td className="px-4 py-3 font-medium">{p.name}</td>
                  <td className="px-4 py-3">{p.category}</td>
                  <td className="px-4 py-3">{p.district}</td>
                  <td className="px-4 py-3">{p.rating?.toFixed(1) ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        p.isActive !== false
                          ? "text-emerald-600"
                          : "text-muted-foreground"
                      }
                    >
                      {p.isActive !== false ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3">{p.isFeatured ? "Yes" : "No"}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" variant="outline" onClick={() => openEdit(p)}>
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleActiveMutation.mutate(p.id)}
                      >
                        Toggle Active
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleFeatureMutation.mutate(p.id)}
                      >
                        Toggle Featured
                      </Button>
                      <label className="cursor-pointer">
                        <span className="inline-flex h-7 items-center rounded-lg border px-2.5 text-[0.8rem] hover:bg-muted">
                          Upload Images
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={(e) => {
                            const files = e.target.files;
                            if (!files?.length) return;
                            Array.from(files).forEach((file) =>
                              uploadMutation.mutate({ id: p.id, file })
                            );
                            e.target.value = "";
                          }}
                        />
                      </label>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Place" : "Add Place"}</DialogTitle>
            <DialogClose onClose={() => setDialogOpen(false)} />
          </DialogHeader>
          <div className="max-h-[70vh] space-y-3 overflow-y-auto p-4 pt-0">
            <Field label="Name">
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </Field>
            <Field label="Description">
              <textarea
                className="w-full rounded-lg border px-3 py-2 text-sm"
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </Field>
            <Field label="Category">
              <select
                className="w-full rounded-lg border px-3 py-2 text-sm"
                value={form.category}
                onChange={(e) =>
                  setForm({ ...form, category: e.target.value as PlaceCategory })
                }
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="District">
                <Input
                  value={form.district}
                  onChange={(e) => setForm({ ...form, district: e.target.value })}
                />
              </Field>
              <Field label="Province">
                <Input
                  value={form.province}
                  onChange={(e) => setForm({ ...form, province: e.target.value })}
                />
              </Field>
            </div>
            <Field label="Price range">
              <select
                className="w-full rounded-lg border px-3 py-2 text-sm"
                value={form.priceRange}
                onChange={(e) =>
                  setForm({ ...form, priceRange: e.target.value as PriceRange })
                }
              >
                {PRICE_RANGES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Latitude">
                <Input
                  type="number"
                  step="any"
                  value={form.latitude}
                  onChange={(e) =>
                    setForm({ ...form, latitude: Number(e.target.value) })
                  }
                />
              </Field>
              <Field label="Longitude">
                <Input
                  type="number"
                  step="any"
                  value={form.longitude}
                  onChange={(e) =>
                    setForm({ ...form, longitude: Number(e.target.value) })
                  }
                />
              </Field>
            </div>
            <Button
              className="w-full"
              disabled={saveMutation.isPending}
              onClick={() => saveMutation.mutate()}
            >
              {saveMutation.isPending ? "Saving…" : "Save"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="mt-1">{children}</div>
    </div>
  );
}
