"use client";

import React from "react";
import type { TutoringSession } from "@/types/session";
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface RescheduleDialogProps {
  session: TutoringSession;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RescheduleDialog({ session, open, onOpenChange }: RescheduleDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle>Request Session Reschedule</DialogTitle>
        <DialogDescription>
          Select a new date and time slot for {session.subject} with {session.teacherName}.
        </DialogDescription>
      </DialogHeader>

      <div className="py-4 text-sm text-slate-300">
        <p>Reschedule dialog engine initializing...</p>
      </div>
    </Dialog>
  );
}
