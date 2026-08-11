/**
 * Utility functions for explicit UTC <-> Local Timezone conversions.
 *
 * POLICY & ARCHITECTURE DECISION:
 * - All sessions and teacher availability slots are persisted strictly in UTC ISO 8601 format.
 * - The parent's browser timezone is auto-detected via Intl.DateTimeFormat().resolvedOptions().timeZone.
 * - The browser native Intl API transforms UTC ISO timestamps into the parent's local timezone
 *   for display without manual UTC offset math or hardcoded timezone offsets.
 */

export function getUserTimezone(): string {
  if (typeof window === "undefined") {
    return "UTC";
  }
  return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
}

/**
 * Formats a UTC ISO string into full parent local date and time.
 * Example output: "Aug 13, 2026, 6:30 PM"
 */
export function formatParentLocalTime(datetimeUtc: string): string {
  if (!datetimeUtc) return "";
  const date = new Date(datetimeUtc);
  if (isNaN(date.getTime())) return "Invalid Date";

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

/**
 * Formats a UTC ISO string into short parent local time only.
 * Example output: "6:30 PM"
 */
export function formatLocalTime(datetimeUtc: string): string {
  if (!datetimeUtc) return "";
  const date = new Date(datetimeUtc);
  if (isNaN(date.getTime())) return "Invalid Time";

  return new Intl.DateTimeFormat(undefined, {
    timeStyle: "short",
  }).format(date);
}

/**
 * Formats a UTC ISO string explicitly into UTC representation.
 * Example output: "Aug 13, 2026, 1:00 PM UTC"
 */
export function formatUtcTime(datetimeUtc: string): string {
  if (!datetimeUtc) return "";
  const date = new Date(datetimeUtc);
  if (isNaN(date.getTime())) return "Invalid UTC Date";

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(date) + " UTC";
}

/**
 * Formats date object to ISO Date key (YYYY-MM-DD) in local timezone.
 */
export function toLocalDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
