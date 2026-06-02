/** Format API time (HH:mm or HH:mm:ss) for display */
export function formatPickupTime(time?: string | null): string {
  if (!time?.trim()) return "Not specified";
  const [hourStr, minuteStr] = time.split(":");
  const hour = parseInt(hourStr, 10);
  const minute = minuteStr?.padStart(2, "0") ?? "00";
  if (Number.isNaN(hour)) return time;
  const period = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minute} ${period}`;
}

/** Normalize HTML time input value to HH:mm for API */
export function normalizePickupTimeForApi(time: string): string {
  const trimmed = time.trim();
  if (/^\d{2}:\d{2}:\d{2}$/.test(trimmed)) return trimmed.slice(0, 5);
  return trimmed;
}
