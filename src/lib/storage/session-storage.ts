import type { TutoringSession, PendingReschedule } from "@/types/session";

const SESSIONS_STORAGE_KEY = "debe_upcoming_sessions_v1";
const PENDING_RESCHEDULE_KEY = "debe_pending_reschedule_v1";

/**
 * Saves sessions array to browser localStorage.
 */
export function saveSessionsToStorage(sessions: TutoringSession[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
  } catch (error) {
    console.error("Failed to save sessions to localStorage:", error);
  }
}

/**
 * Reads sessions array from browser localStorage.
 */
export function loadSessionsFromStorage(): TutoringSession[] | null {
  if (typeof window === "undefined") return null;
  try {
    const data = localStorage.getItem(SESSIONS_STORAGE_KEY);
    if (!data) return null;
    return JSON.parse(data) as TutoringSession[];
  } catch (error) {
    console.error("Failed to parse sessions from localStorage:", error);
    localStorage.removeItem(SESSIONS_STORAGE_KEY);
    return null;
  }
}

/**
 * Saves a pending reschedule request selection to localStorage.
 */
export function savePendingRescheduleToStorage(pending: PendingReschedule): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PENDING_RESCHEDULE_KEY, JSON.stringify(pending));
  } catch (error) {
    console.error("Failed to save pending reschedule:", error);
  }
}

/**
 * Reads pending reschedule selection from localStorage.
 */
export function loadPendingRescheduleFromStorage(): PendingReschedule | null {
  if (typeof window === "undefined") return null;
  try {
    const data = localStorage.getItem(PENDING_RESCHEDULE_KEY);
    if (!data) return null;
    return JSON.parse(data) as PendingReschedule;
  } catch (error) {
    localStorage.removeItem(PENDING_RESCHEDULE_KEY);
    return null;
  }
}

/**
 * Clears pending reschedule from localStorage upon completion.
 */
export function clearPendingRescheduleFromStorage(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(PENDING_RESCHEDULE_KEY);
}
