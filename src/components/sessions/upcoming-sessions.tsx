"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Calendar, AlertCircle, RefreshCw, Globe, ArrowRightLeft } from "lucide-react";
import type { TutoringSession } from "@/types/session";
import { saveSessionsToStorage } from "@/lib/storage/session-storage";
import { getUserTimezone } from "@/lib/time/timezone";
import { SessionCard } from "./session-card";
import { RescheduleDialog } from "./reschedule-dialog";
import { RescheduleHistory } from "./reschedule-history";

async function fetchUpcomingSessions(): Promise<TutoringSession[]> {
  // Cache-busting parameter and headers to force fresh server data read
  const res = await fetch(`/api/sessions?t=${Date.now()}`, {
    cache: "no-store",
    headers: {
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch upcoming sessions.");
  }

  const serverSessions = (await res.json()) as TutoringSession[];
  
  // Sync latest fetched sessions into localStorage
  saveSessionsToStorage(serverSessions);

  return serverSessions;
}

export function UpcomingSessions() {
  const [selectedSession, setSelectedSession] = useState<TutoringSession | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showTimezoneExplanation, setShowTimezoneExplanation] = useState<boolean>(false);

  const userTimezone = getUserTimezone();

  const {
    data: sessions,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useQuery<TutoringSession[], Error>({
    queryKey: ["upcoming-sessions"],
    queryFn: fetchUpcomingSessions,
  });

  const handleOpenReschedule = (session: TutoringSession) => {
    setSelectedSession(session);
    setIsModalOpen(true);
  };

  const handleRefresh = async () => {
    await refetch();
  };

  return (
    <div className="w-full space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Upcoming Tutoring Sessions
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Student&apos;s next 3 scheduled tutoring sessions.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setShowTimezoneExplanation(!showTimezoneExplanation)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-orange-50 text-xs font-semibold text-orange-800 border border-orange-200 hover:bg-orange-100 transition-all cursor-pointer"
          >
            <Globe className="h-3.5 w-3.5 text-orange-600" />
            <span>Timezone Info</span>
          </button>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={isFetching}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white text-xs font-medium text-slate-700 border border-slate-200 hover:bg-slate-50 disabled:opacity-50 transition-all shadow-xs cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin text-orange-600" : ""}`} />
            <span>{isFetching ? "Refreshing..." : "Refresh Data"}</span>
          </button>
        </div>
      </div>

      {/* Timezone Explanation Visual Banner */}
      {showTimezoneExplanation && (
        <div className="rounded-xl border border-orange-200 bg-gradient-to-r from-orange-50/90 via-amber-50/50 to-white p-5 space-y-3 shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2 font-bold text-orange-950 text-sm">
            <ArrowRightLeft className="h-4 w-4 text-orange-600" />
            How Timezone Conversion Works in Debe Learning
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="rounded-lg border border-orange-200/80 bg-white p-3 space-y-1">
              <p className="font-bold text-orange-900">1. Stored in Universal UTC</p>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                All session dates are saved on server in UTC ISO format: <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800">2026-08-13T13:00:00.000Z</code>.
              </p>
            </div>

            <div className="rounded-lg border border-orange-200/80 bg-white p-3 space-y-1">
              <p className="font-bold text-orange-900">2. Auto Local Browser Display</p>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Browser detects your timezone (<strong>{userTimezone}</strong>) and uses native <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800">Intl.DateTimeFormat</code> to render local time.
              </p>
            </div>

            <div className="rounded-lg border border-orange-200/80 bg-white p-3 space-y-1">
              <p className="font-bold text-orange-900">3. Safe Reschedule Submits</p>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                When picking a new slot, the local selection converts back to UTC before sending to server: <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800">date.toISOString()</code>.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-64 rounded-xl border border-slate-200 bg-white p-6 animate-pulse space-y-4 shadow-xs"
            >
              <div className="flex justify-between items-center">
                <div className="h-5 w-20 bg-slate-200 rounded" />
                <div className="h-5 w-16 bg-slate-200 rounded-full" />
              </div>
              <div className="h-10 w-full bg-slate-100 rounded" />
              <div className="h-16 w-full bg-slate-100 rounded" />
              <div className="h-9 w-full bg-slate-200 rounded" />
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-center space-y-3">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 text-rose-600">
            <AlertCircle className="h-5 w-5" />
          </div>
          <h3 className="text-base font-semibold text-rose-900">Unable to Load Sessions</h3>
          <p className="text-xs text-rose-700 max-w-md mx-auto">
            {error?.message || "An error occurred while fetching sessions."}
          </p>
          <button
            type="button"
            onClick={handleRefresh}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-rose-600 text-white text-xs font-medium hover:bg-rose-700 transition-colors shadow-xs cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Try Again
          </button>
        </div>
      )}

      {/* Sessions Grid */}
      {!isLoading && !isError && sessions && (
        <>
          {sessions.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-12 text-center space-y-2">
              <Calendar className="mx-auto h-8 w-8 text-slate-400" />
              <h3 className="text-base font-medium text-slate-700">No Sessions Found</h3>
              <p className="text-xs text-slate-500">There are no upcoming sessions scheduled.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sessions.map((session) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  onRescheduleClick={handleOpenReschedule}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Local Reschedule Request History Section */}
      <RescheduleHistory />

      {/* Reschedule Modal */}
      {selectedSession && (
        <RescheduleDialog
          session={selectedSession}
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
        />
      )}
    </div>
  );
}
