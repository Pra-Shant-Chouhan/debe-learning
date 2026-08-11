import type { TeacherSlot, SlotOption } from "@/types/session";

/**
 * Tutoring Policy Business Rule:
 * Minimum lead time required before a session can be scheduled or rescheduled.
 * 2 hours in milliseconds = 2 * 60 * 60 * 1000 = 7,200,000 ms.
 */
export const MIN_LEAD_TIME_MS = 2 * 60 * 60 * 1000;

/**
 * Evaluates the availability state and disabled reason for a teacher slot.
 *
 * BUSINESS CONSTRAINTS & REASONING:
 * 1. Unavailable Slots: Slots marked unavailable by teacher/system are disabled ("unavailable").
 * 2. Identical Slot: Selecting the current session time is redundant ("same_slot").
 * 3. 2-Hour Lead Time Policy: Sessions starting within 2 hours of current time (or past)
 *    are disabled ("too_soon") to allow tutors adequate preparation time.
 */
export function getSlotState(
  slot: TeacherSlot,
  existingDatetimeUtc: string
): SlotOption {
  // 1. Teacher availability check
  if (!slot.isAvailable) {
    return {
      slot,
      disabled: true,
      disabledReason: "unavailable",
    };
  }

  // 2. Redundant selection check
  if (slot.startsAtUtc === existingDatetimeUtc) {
    return {
      slot,
      disabled: true,
      disabledReason: "same_slot",
    };
  }

  // 3. Lead time requirement (Current UTC time + 2 hours)
  const minimumAllowedTime = Date.now() + MIN_LEAD_TIME_MS;
  const slotStartTime = new Date(slot.startsAtUtc).getTime();

  if (isNaN(slotStartTime) || slotStartTime < minimumAllowedTime) {
    return {
      slot,
      disabled: true,
      disabledReason: "too_soon",
    };
  }

  return {
    slot,
    disabled: false,
  };
}

/**
 * Helper predicate function returning boolean selectability for a slot.
 */
export function isSlotSelectable(
  slot: TeacherSlot,
  existingDatetimeUtc: string
): boolean {
  const slotState = getSlotState(slot, existingDatetimeUtc);
  return !slotState.disabled;
}

/**
 * Formats user-facing explanatory text for why a slot is disabled.
 */
export function getDisabledReasonMessage(reason?: SlotOption["disabledReason"]): string {
  switch (reason) {
    case "unavailable":
      return "Booked or marked unavailable by tutor";
    case "same_slot":
      return "Current session time";
    case "too_soon":
      return "Unavailable due to 2-hour tutoring lead-time policy";
    default:
      return "Slot unavailable";
  }
}
