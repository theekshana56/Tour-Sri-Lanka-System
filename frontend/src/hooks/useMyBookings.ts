import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { bookingApi } from "@/lib/api";
import type { BookingStatus, CustomerBooking } from "@/types";

export function useMyBookings(options?: {
  status?: BookingStatus | null;
  page?: number;
  size?: number;
  refetchInterval?: number;
}) {
  const status = options?.status ?? undefined;
  return useQuery({
    queryKey: ["bookings", "my", status, options?.page, options?.size],
    queryFn: async () => {
      const { data } = await bookingApi.my({
        status: status ?? undefined,
        page: options?.page ?? 0,
        size: options?.size ?? 50,
      });
      return data;
    },
    refetchInterval: options?.refetchInterval,
  });
}

export function useCancelBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await bookingApi.cancel(id);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings", "my"] });
    },
  });
}

export function computeBookingStats(bookings: CustomerBooking[]) {
  return {
    total: bookings.length,
    pending: bookings.filter((b) => b.status === "PENDING").length,
    confirmed: bookings.filter((b) => b.status === "APPROVED").length,
    completed: bookings.filter((b) => b.status === "COMPLETED").length,
    rejected: bookings.filter((b) => b.status === "REJECTED").length,
    cancelled: bookings.filter((b) => b.status === "CANCELLED").length,
  };
}
