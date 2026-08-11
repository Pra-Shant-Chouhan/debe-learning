"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Calendar, AlertCircle, RefreshCw } from "lucide-react";
import type { TutoringSession } from "@/types/session";
import { SessionCard } from "./session-card";
import { RescheduleDialog } from "./reschedule-dialog";

async function fetchUpcomingSessions(): Promise<TutoringSession[]> {
  const res = await fetch("/api/sessions");
  if (!res.ok) {
    throw new Error("Failed to fetch upcoming sessions.");
  }
  return res.json();
}

export function UpcomingSessions() {
  const [selectedSession, setSelectedSession] = useState<TutoringSession | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    data: sessions,
    isLoading,
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

        <button
          onClick={() => refetch()}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white text-xs font-medium text-slate-700 border border-slate-200 hover:bg-slate-50 transition-colors shadow-xs self-start sm:self-auto"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
          Refresh Data
        </button>
      </div>

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
            onClick={() => refetch()}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-rose-600 text-white text-xs font-medium hover:bg-rose-700 transition-colors shadow-xs"
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
