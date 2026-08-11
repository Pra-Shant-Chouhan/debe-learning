export type SessionStatus =
  | "scheduled"
  | "reschedule_requested"
  | "cancelled"
  | "completed";

export type RescheduleReason =
  | "Conflict"
  | "Illness"
  | "Time zone"
  | "Other";

export interface TeacherSlot {
  id: string;
  teacherId: string;

  /**
   * The slot start time stored strictly in UTC ISO format.
   * Example: "2026-08-13T13:00:00.000Z"
   */
  startsAtUtc: string;

  /**
   * Duration of the slot in minutes.
   */
  durationMinutes: number;

  isAvailable: boolean;
}

export interface TeacherAvailability {
  teacherId: string;
  teacherName: string;

  /**
   * Primary IANA timezone of the teacher.
   * Example: "America/New_York", "Europe/London", "Asia/Kolkata".
   */
  timezone: string;

  slots: TeacherSlot[];
}

export interface TutoringSession {
  id: string;
  studentId: string;
  subject: string;
  teacherId: string;
  teacherName: string;

  /**
   * Session start time is ALWAYS persisted in UTC.
   */
  datetimeUtc: string;

  status: SessionStatus;
}

export interface RescheduleRequest {
  sessionId: string;

  /**
   * Current session start time in UTC.
   */
  existingDatetimeUtc: string;

  /**
   * Requested session start time in UTC.
   */
  newDatetimeUtc: string;

  reason: RescheduleReason;
}

export interface RescheduleResponse {
  success: boolean;
  error?: string;
}

export type SlotDisabledReason =
  | "unavailable"
  | "too_soon"
  | "same_slot";

export interface SlotOption {
  slot: TeacherSlot;
  disabled: boolean;
  disabledReason?: SlotDisabledReason;
}

export interface PendingReschedule {
  sessionId: string;
  newDatetimeUtc: string;
  reason: RescheduleReason;
}

export interface RescheduleHistoryItem {
  id: string;
  sessionId: string;
  subject: string;
  teacherName: string;
  existingDatetimeUtc: string;
  newDatetimeUtc: string;
  reason: RescheduleReason;
  submittedAtUtc: string;
  status: "pending_approval" | "approved" | "rejected";
}
