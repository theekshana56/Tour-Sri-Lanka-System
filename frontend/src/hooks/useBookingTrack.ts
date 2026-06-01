import { useQuery } from "@tanstack/react-query";
import { bookingApi } from "@/lib/api";

export function useBookingTrack(bookingNumber: string | null) {
  return useQuery({
    queryKey: ["booking", "track", bookingNumber],
    queryFn: async () => {
      const { data } = await bookingApi.trackByNumber(bookingNumber!);
      return data;
    },
    enabled: !!bookingNumber,
  });
}

export function useBookingTrackPoll(
  bookingNumber: string | null,
  options: { enabled: boolean; refetchInterval?: number }
) {
  return useQuery({
    queryKey: ["booking", "track", bookingNumber, "poll"],
    queryFn: async () => {
      const { data } = await bookingApi.trackByNumber(bookingNumber!);
      return data;
    },
    enabled: !!bookingNumber && options.enabled,
    refetchInterval: options.refetchInterval,
  });
}
