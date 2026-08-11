import type { RescheduleRequest, RescheduleResponse } from "@/types/session";

const TWO_HOURS_MS = 2 * 60 * 60 * 1000;

/**
 * Firebase Cloud Function Stub: requestReschedule
 *
 * ARCHITECTURAL CONSTRAINTS & SERVER VALIDATION BOUNDARY:
 * 1. Simulates latency of an asynchronous Firebase Callable Function (500ms).
 * 2. Mandatory Server Validation:
 *    Client-side disabled states can be bypassed by malicious actors or modified DOM elements.
 *    Therefore, this server boundary re-validates:
 *    - Valid ISO date parsing.
 *    - Requested slot is not in the past.
 *    - Requested slot satisfies the 2-hour minimum lead-time policy.
 *    - Requested slot is not identical to current session slot.
 */
export async function requestReschedule(
  request: RescheduleRequest
): Promise<RescheduleResponse> {
  // Simulate network latency for Firebase Callable Function
  await new Promise<void>((resolve) => setTimeout(resolve, 500));

  // Validate required request payload
  if (!request.sessionId || !request.existingDatetimeUtc || !request.newDatetimeUtc) {
    return {
      success: false,
      error: "Missing required reschedule parameter fields.",
    };
  }

  const existingTime = new Date(request.existingDatetimeUtc).getTime();
  const requestedTime = new Date(request.newDatetimeUtc).getTime();
  const now = Date.now();

  if (Number.isNaN(existingTime)) {
    return {
      success: false,
      error: "Current session timestamp format is invalid.",
    };
  }

  if (Number.isNaN(requestedTime)) {
    return {
      success: false,
      error: "Requested session timestamp format is invalid.",
    };
  }

  // Server Validation 1: Prevent past dates
  if (requestedTime < now) {
    return {
      success: false,
      error: "Reschedule request failed: Requested slot date/time is in the past.",
    };
  }

  // Server Validation 2: Enforce 2-hour lead time policy
  if (requestedTime < now + TWO_HOURS_MS) {
    return {
      success: false,
      error: "Reschedule request failed: Debe tutoring policy requires at least 2 hours advance notice before session start time.",
    };
  }

  // Server Validation 3: Prevent duplicate booking
  if (requestedTime === existingTime) {
    return {
      success: false,
      error: "Reschedule request failed: Requested slot is identical to the current session slot.",
    };
  }

  // Validation passed
  return {
    success: true,
  };
}
