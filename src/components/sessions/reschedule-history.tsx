"use client";

import React, { useState, useEffect } from "react";
import { Clock, History, Calendar, Globe, CheckCircle, Trash2 } from "lucide-react";
import type { RescheduleHistoryItem } from "@/types/session";
import { loadRescheduleHistoryFromStorage } from "@/lib/storage/session-storage";
import { formatParentLocalTime, formatUtcTime, getUserTimezone } from "@/lib/time/timezone";
import { Badge } from "@/components/ui/badge";

export function RescheduleHistory() {
  const [history, setHistory] = useState<RescheduleHistoryItem[]>([]);
  const userTimezone = getUserTimezone();

  const reloadHistory = () => {
    setHistory(loadRescheduleHistoryFromStorage());
  };

  useEffect(() => {
    reloadHistory();
    // Poll or listen for window storage events
    window.addEventListener("storage", reloadHistory);
    return () => window.removeEventListener("storage", reloadHistory);
  }, []);

  const handleClearHistory = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("debe_reschedule_history_v1");
      setHistory([]);
    }
  };

  if (history.length === 0) {
    return null;
  }

  return (
    <div className="w-full space-y-4 border-t border-slate-200 pt-8 mt-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-orange-600" />
          <h3 className="text-lg font-bold text-slate-900 tracking-tight">
            Reschedule Request History (Saved Locally)
          </h3>
          <span className="text-xs font-semibold text-orange-800 bg-orange-100 px-2 py-0.5 rounded-full border border-orange-200">
            {history.length} Saved
          </span>
        </div>

        <button
          type="button"
          onClick={handleClearHistory}
          className="text-xs text-slate-500 hover:text-rose-600 flex items-center gap-1 transition-colors cursor-pointer"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Clear Local Log
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {history.map((item) => (
          <div
            key={item.id}
            className="rounded-xl border border-orange-200/80 bg-white p-4 space-y-3 shadow-xs"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-orange-900 bg-orange-100 px-2 py-0.5 rounded border border-orange-200">
                  {item.subject}
                </span>
                <span className="text-xs text-slate-600 font-medium">{item.teacherName}</span>
              </div>
              <Badge variant="warning">
                <Clock className="h-3 w-3 mr-1" />
                Pending Tutor Approval
              </Badge>
            </div>

            <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 space-y-1 text-xs">
              <div className="flex justify-between text-slate-500 font-medium">
                <span>Requested Slot ({userTimezone}):</span>
                <span className="text-slate-800 font-bold">{formatParentLocalTime(item.newDatetimeUtc)}</span>
              </div>

              <div className="flex justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                <span>Stored UTC ISO:</span>
                <code className="font-mono text-slate-700">{formatUtcTime(item.newDatetimeUtc)}</code>
              </div>

              <div className="flex justify-between text-[11px] text-slate-500 pt-1">
                <span>Reschedule Reason:</span>
                <span className="font-semibold text-orange-900">{item.reason}</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span>Submitted: {formatParentLocalTime(item.submittedAtUtc)}</span>
              <span className="flex items-center gap-1 text-emerald-600 font-medium">
                <CheckCircle className="h-3 w-3" /> Saved in LocalStorage
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
