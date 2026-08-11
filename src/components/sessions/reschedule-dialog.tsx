"use client";

import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Clock, Calendar as CalendarIcon, Globe, AlertCircle, CheckCircle2, ShieldAlert, Info } from "lucide-react";
import type { TutoringSession, TeacherAvailability, RescheduleReason, TeacherSlot } from "@/types/session";
import { getSlotState, getDisabledReasonMessage } from "@/lib/slots/generate-slots";
import { formatParentLocalTime, formatLocalTime, formatUtcTime, getUserTimezone, toLocalDateKey } from "@/lib/time/timezone";
import { useRescheduleSession } from "@/hooks/use-reschedule-session";
import { savePendingRescheduleToStorage } from "@/lib/storage/session-storage";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface RescheduleDialogProps {
  session: TutoringSession;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

async function fetchTeacherSlots(teacherId: string): Promise<TeacherAvailability> {
  const res = await fetch(`/api/teacher-slots?teacherId=${teacherId}`);
  if (!res.ok) {
    throw new Error("Failed to fetch teacher availability slots.");
  }
  return res.json();
}

export function RescheduleDialog({ session, open, onOpenChange }: RescheduleDialogProps) {
  const userTimezone = getUserTimezone();
  const mutation = useRescheduleSession();

  const [selectedSlotUtc, setSelectedSlotUtc] = useState<string>("");
  const [reason, setReason] = useState<RescheduleReason>("Conflict");
  const [selectedDateKey, setSelectedDateKey] = useState<string>("");
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Fetch teacher slot availability
  const {
    data: availability,
    isLoading: isLoadingSlots,
    isError: isSlotsError,
    error: slotsError,
  } = useQuery<TeacherAvailability, Error>({
    queryKey: ["teacher-slots", session.teacherId],
    queryFn: () => fetchTeacherSlots(session.teacherId),
    enabled: open,
  });

  // Group slots by parent's local date (YYYY-MM-DD)
  const groupedSlots = React.useMemo(() => {
    if (!availability?.slots) return {};
    const groups: Record<string, TeacherSlot[]> = {};

    availability.slots.forEach((slot) => {
      const date = new Date(slot.startsAtUtc);
      if (!isNaN(date.getTime())) {
        const dateKey = toLocalDateKey(date);
        if (!groups[dateKey]) {
          groups[dateKey] = [];
        }
        groups[dateKey].push(slot);
      }
    });

    return groups;
  }, [availability]);

  // Set default selected date key when availability loads
  useEffect(() => {
    const dates = Object.keys(groupedSlots);
    if (dates.length > 0 && (!selectedDateKey || !groupedSlots[selectedDateKey])) {
      setSelectedDateKey(dates[0]);
    }
  }, [groupedSlots, selectedDateKey]);

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setSelectedSlotUtc("");
      setReason("Conflict");
      setSubmitError(null);
    }
  }, [open]);

  const handleSlotSelect = (slot: TeacherSlot) => {
    const slotState = getSlotState(slot, session.datetimeUtc);
    if (slotState.disabled) return;

    setSelectedSlotUtc(slot.startsAtUtc);
    setSubmitError(null);

    // Save transient pending state to localStorage
    savePendingRescheduleToStorage({
      sessionId: session.id,
      newDatetimeUtc: slot.startsAtUtc,
      reason,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlotUtc) {
      setSubmitError("Please select an available time slot.");
      return;
    }

    setSubmitError(null);

    try {
      await mutation.mutateAsync({
        sessionId: session.id,
        existingDatetimeUtc: session.datetimeUtc,
        newDatetimeUtc: selectedSlotUtc,
        reason,
      });

      // Close modal on clean success
      onOpenChange(false);
    } catch (err) {
      // Safe error handling without unhandled promise rejections
      const errorMessage = err instanceof Error ? err.message : "Failed to reschedule session.";
      setSubmitError(errorMessage);
    }
  };

  const availableDates = Object.keys(groupedSlots);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <div className="flex items-center gap-2">
          <Badge variant="default">{session.subject}</Badge>
          <span className="text-xs text-slate-500">Tutor: {session.teacherName}</span>
        </div>
        <DialogTitle className="mt-1">Request Reschedule</DialogTitle>
        <DialogDescription>
          Select a new slot for your student. All available slots enforce Debe&apos;s 2-hour minimum lead-time policy.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Error Alert Box */}
        {(submitError || mutation.isError) && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 p-3.5 flex items-start gap-3 text-rose-800 text-xs font-medium animate-in fade-in">
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold">Reschedule Request Failed</p>
              <p>{submitError || mutation.error?.message}</p>
            </div>
          </div>
        )}

        {/* Current Session Time Summary */}
        <div className="rounded-lg border border-amber-200/80 bg-amber-50/50 p-3 text-xs space-y-1">
          <p className="font-semibold text-amber-900 flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-amber-700" /> Current Session Schedule:
          </p>
          <p className="text-amber-800 font-medium pl-5">
            {formatParentLocalTime(session.datetimeUtc)} ({userTimezone})
          </p>
        </div>

        {/* Step 1: Select Date */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            1. Select Date
          </label>
          {isLoadingSlots ? (
            <div className="h-10 w-full bg-slate-100 animate-pulse rounded-lg" />
          ) : isSlotsError ? (
            <p className="text-xs text-rose-600">Error loading availability: {slotsError.message}</p>
          ) : availableDates.length === 0 ? (
            <p className="text-xs text-slate-500">No dates available for this tutor.</p>
          ) : (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {availableDates.map((dateKey) => {
                const dateObj = new Date(`${dateKey}T00:00:00`);
                const formattedDate = new Intl.DateTimeFormat(undefined, {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                }).format(dateObj);

                const isSelected = selectedDateKey === dateKey;

                return (
                  <button
                    key={dateKey}
                    type="button"
                    onClick={() => setSelectedDateKey(dateKey)}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold shrink-0 border transition-all ${
                      isSelected
                        ? "bg-orange-600 text-white border-orange-600 shadow-xs"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-orange-50 hover:border-orange-200"
                    }`}
                  >
                    {formattedDate}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Step 2: Select Time Slot */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              2. Select Available Slot
            </label>
            <span className="text-[11px] text-slate-500 flex items-center gap-1">
              <ShieldAlert className="h-3 w-3 text-orange-600" />
              2-hour lead time enforced
            </span>
          </div>

          {selectedDateKey && groupedSlots[selectedDateKey] && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-48 overflow-y-auto p-1">
              {groupedSlots[selectedDateKey].map((slot) => {
                const slotState = getSlotState(slot, session.datetimeUtc);
                const isSelected = selectedSlotUtc === slot.startsAtUtc;

                return (
                  <div key={slot.id} className="relative group">
                    <button
                      type="button"
                      disabled={slotState.disabled}
                      onClick={() => handleSlotSelect(slot)}
                      className={`w-full px-3 py-2 rounded-lg text-xs font-semibold border transition-all text-center ${
                        isSelected
                          ? "bg-orange-600 text-white border-orange-600 shadow-xs ring-2 ring-orange-500/30"
                          : slotState.disabled
                          ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-60"
                          : "bg-white text-slate-800 border-slate-200 hover:bg-orange-50 hover:border-orange-300"
                      }`}
                    >
                      {formatLocalTime(slot.startsAtUtc)}
                      {slotState.disabled && (
                        <span className="block text-[9px] font-normal text-slate-500 mt-0.5">
                          {slotState.disabledReason === "too_soon"
                            ? "< 2h lead"
                            : slotState.disabledReason === "same_slot"
                            ? "Current"
                            : "Unavailable"}
                        </span>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-1">
            <Info className="h-3 w-3 text-slate-400 shrink-0" />
            <span>Slots within 2 hours of current time are disabled per Debe lead-time policy.</span>
          </p>
        </div>

        {/* Step 3: Reschedule Reason */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            3. Reason for Reschedule
          </label>
          <Select
            value={reason}
            onChange={(e) => setReason(e.target.value as RescheduleReason)}
            required
          >
            <option value="Conflict">Conflict (Schedule overlap)</option>
            <option value="Illness">Illness</option>
            <option value="Time zone">Time zone difference</option>
            <option value="Other">Other reason</option>
          </Select>
        </div>

        {/* Explicit Timezone Reason Banner (Requirement Highlight) */}
        {selectedSlotUtc && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50/80 p-3.5 space-y-2 text-xs text-emerald-950 animate-in fade-in">
            <div className="flex items-center gap-1.5 font-bold text-emerald-900">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              Timezone Conversion & Persisted UTC Confirmation
            </div>
            <div className="space-y-1 pl-5 text-emerald-800">
              <p>
                <span className="font-semibold">Parent Local Time:</span>{" "}
                {formatParentLocalTime(selectedSlotUtc)} ({userTimezone})
              </p>
              <p className="flex items-center gap-1 text-[11px]">
                <Globe className="h-3 w-3 text-emerald-700 shrink-0" />
                <span className="font-semibold">Stored on server as UTC:</span>{" "}
                <code className="bg-white/80 px-1.5 py-0.5 rounded border border-emerald-300 font-mono text-emerald-950">
                  {selectedSlotUtc}
                </code>
              </p>
            </div>
          </div>
        )}

        {/* Modal Actions */}
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={mutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={mutation.isPending}
            disabled={!selectedSlotUtc || mutation.isPending}
          >
            {mutation.isPending ? "Submitting Request..." : "Confirm Reschedule"}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
