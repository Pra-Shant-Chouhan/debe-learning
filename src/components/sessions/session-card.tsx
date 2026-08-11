"use client";

import React from "react";
import { Clock, User, Calendar, Globe } from "lucide-react";
import type { TutoringSession } from "@/types/session";
import { formatParentLocalTime, formatUtcTime, getUserTimezone } from "@/lib/time/timezone";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface SessionCardProps {
  session: TutoringSession;
  onRescheduleClick: (session: TutoringSession) => void;
}

export function SessionCard({ session, onRescheduleClick }: SessionCardProps) {
  const userTimezone = getUserTimezone();

  const getStatusBadge = (status: TutoringSession["status"]) => {
    switch (status) {
      case "scheduled":
        return <Badge variant="success">Scheduled</Badge>;
      case "reschedule_requested":
        return <Badge variant="warning">Reschedule Pending</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
      case "completed":
        return <Badge variant="secondary">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card className="flex flex-col justify-between overflow-hidden border border-orange-200/80 bg-gradient-to-br from-orange-50/90 via-amber-50/40 to-emerald-50/70 hover:border-emerald-400/80 hover:shadow-md transition-all">
      <div>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-orange-900 bg-orange-100/90 px-3 py-1 rounded-md border border-orange-200 shadow-xs">
            {session.subject}
          </span>
          {getStatusBadge(session.status)}
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Teacher Info */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-200/80 border border-orange-300 text-orange-900 font-bold text-xs shadow-xs">
              <User className="h-4 w-4 text-orange-800" />
            </div>
            <div>
              <p className="text-xs text-slate-600 font-medium">Assigned Tutor</p>
              <p className="text-sm font-bold text-slate-900">{session.teacherName}</p>
            </div>
          </div>

          {/* Timezone Display Box */}
          <div className="rounded-xl border border-emerald-200/60 bg-white/90 p-3.5 space-y-2.5 shadow-xs backdrop-blur-xs">
            <div className="flex items-start gap-2.5">
              <Calendar className="h-4 w-4 text-orange-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-slate-500 font-medium">
                  Parent Local Time ({userTimezone})
                </p>
                <p className="text-sm font-bold text-slate-900 mt-0.5">
                  {formatParentLocalTime(session.datetimeUtc)}
                </p>
              </div>
            </div>

            {/* Stored UTC detail */}
            <div className="flex items-center gap-1.5 border-t border-slate-100 pt-2 text-[11px] text-slate-500">
              <Globe className="h-3 w-3 shrink-0 text-emerald-600" />
              <span>Stored UTC: <code className="font-mono text-slate-800 font-semibold">{formatUtcTime(session.datetimeUtc)}</code></span>
            </div>
          </div>
        </CardContent>
      </div>

      <CardFooter className="pt-2">
        <Button
          onClick={() => onRescheduleClick(session)}
          variant="outline"
          className="w-full flex items-center justify-center gap-2 text-orange-900 border-orange-300 bg-white/90 hover:bg-orange-100/80 font-semibold shadow-xs"
        >
          <Clock className="h-4 w-4 text-orange-600" />
          Request Reschedule
        </Button>
      </CardFooter>
    </Card>
  );
}
