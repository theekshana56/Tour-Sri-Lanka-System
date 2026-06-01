import { formatDistanceToNow, parseISO } from "date-fns";
import type { AdminBooking } from "@/types";

export function formatBookingActivity(booking: AdminBooking): string {
  const when = booking.reviewedAt ?? booking.createdAt;
  const timeAgo = when
    ? formatDistanceToNow(parseISO(when), { addSuffix: true })
    : "";

  if (booking.status === "APPROVED" && booking.reviewedByName) {
    return `${booking.reviewedByName} approved ${booking.bookingNumber} · ${timeAgo}`;
  }
  if (booking.status === "REJECTED" && booking.reviewedByName) {
    return `${booking.reviewedByName} rejected ${booking.bookingNumber} · ${timeAgo}`;
  }
  if (booking.status === "PENDING") {
    return `New booking ${booking.bookingNumber} from ${booking.customerName} · ${timeAgo}`;
  }
  if (booking.status === "COMPLETED") {
    return `${booking.bookingNumber} marked complete · ${timeAgo}`;
  }
  if (booking.status === "CANCELLED") {
    return `${booking.bookingNumber} cancelled · ${timeAgo}`;
  }
  return `${booking.bookingNumber} · ${timeAgo}`;
}

export function formatWaitingTime(createdAt?: string): string {
  if (!createdAt) return "";
  return formatDistanceToNow(parseISO(createdAt), { addSuffix: false });
}
