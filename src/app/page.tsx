import { UpcomingSessions } from "@/components/sessions/upcoming-sessions";
import { GraduationCap, ShieldCheck } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Top Navbar with Debe Learning Orange Theme */}
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur-md sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-orange-600 flex items-center justify-center text-white shadow-sm shadow-orange-600/25">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <span className="text-base font-bold text-slate-900 tracking-tight">
                Debe Learning
              </span>
              <span className="ml-2 text-xs font-semibold text-orange-700 bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
                Parent Portal
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>Parent Verification Active</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Clean Header Info Banner */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-1">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Session Reschedule Management
          </h1>
          <p className="text-sm text-slate-600">
            Select an upcoming session below to request a time slot change. All requested slots are stored in UTC format while displayed in your local timezone.
          </p>
        </div>

        {/* Sessions Widget Component */}
        <UpcomingSessions />
      </main>
    </div>
  );
}
