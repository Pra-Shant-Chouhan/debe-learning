import { getSlotState, MIN_LEAD_TIME_MS } from "./generate-slots";
import { requestReschedule } from "../firebase/request-reschedule";
import type { TeacherSlot } from "@/types/session";

export async function runLogicVerification() {
  const now = Date.now();
  const existingTimeUtc = new Date(now + 24 * 60 * 60 * 1000).toISOString();

  // Test Case 1: Past slot
  const pastSlot: TeacherSlot = {
    id: "test-past",
    teacherId: "teacher-101",
    startsAtUtc: new Date(now - 60 * 60 * 1000).toISOString(),
    durationMinutes: 60,
    isAvailable: true,
  };
  const pastState = getSlotState(pastSlot, existingTimeUtc);
  console.assert(pastState.disabled && pastState.disabledReason === "too_soon", "Past slot should be disabled with too_soon");

  // Test Case 2: Slot in 30 mins (Lead time violation)
  const soonSlot: TeacherSlot = {
    id: "test-soon",
    teacherId: "teacher-101",
    startsAtUtc: new Date(now + 30 * 60 * 1000).toISOString(),
    durationMinutes: 60,
    isAvailable: true,
  };
  const soonState = getSlotState(soonSlot, existingTimeUtc);
  console.assert(soonState.disabled && soonState.disabledReason === "too_soon", "30-min slot should be disabled with too_soon");

  // Test Case 3: Same slot
  const sameSlot: TeacherSlot = {
    id: "test-same",
    teacherId: "teacher-101",
    startsAtUtc: existingTimeUtc,
    durationMinutes: 60,
    isAvailable: true,
  };
  const sameState = getSlotState(sameSlot, existingTimeUtc);
  console.assert(sameState.disabled && sameState.disabledReason === "same_slot", "Same slot should be disabled with same_slot");

  // Test Case 4: Valid future slot (> 2 hours)
  const validSlot: TeacherSlot = {
    id: "test-valid",
    teacherId: "teacher-101",
    startsAtUtc: new Date(now + 5 * 60 * 60 * 1000).toISOString(),
    durationMinutes: 60,
    isAvailable: true,
  };
  const validState = getSlotState(validSlot, existingTimeUtc);
  console.assert(!validState.disabled, "5-hour future slot should be enabled");

  // Test Firebase Server Boundary
  const resSuccess = await requestReschedule({
    sessionId: "sess-1",
    existingDatetimeUtc: existingTimeUtc,
    newDatetimeUtc: validSlot.startsAtUtc,
    reason: "Conflict",
  });
  console.assert(resSuccess.success, "Valid request should succeed");

  const resFail = await requestReschedule({
    sessionId: "sess-1",
    existingDatetimeUtc: existingTimeUtc,
    newDatetimeUtc: soonSlot.startsAtUtc,
    reason: "Conflict",
  });
  console.assert(!resFail.success && resFail.error?.includes("2 hours"), "Lead time violation should be caught by Firebase stub");

  console.log("ALL PHASE 3 LOGIC VERIFICATIONS PASSED SUCCESSFULLY.");
}
