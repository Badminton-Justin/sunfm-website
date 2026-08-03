"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface GoogleCalendarConnectProps {
  isConnected: boolean;
  justConnected?: boolean;
  connectError?: string;
  connectWarning?: string;
}

const ERROR_MESSAGES: Record<string, string> = {
  denied: "Google sign-in was canceled before finishing.",
  invalid_state: "That connection attempt expired — try again.",
  no_refresh_token:
    "Google didn't grant lasting access. Try disconnecting any prior SunFM access in your Google Account settings, then reconnect.",
  calendar_in_use:
    "That Google account is already connected to another trainer here. Each trainer needs their own Google account, otherwise both schedules would write to the same calendar.",
  connect_failed: "Something went wrong connecting to Google. Try again.",
};

const WARNING_MESSAGES: Record<string, string> = {
  initial_sync:
    "Connected, but the first sync didn't finish. Your calendar is linked — use Sync now, or it'll catch up on its own overnight.",
};

export function GoogleCalendarConnect({
  isConnected,
  justConnected,
  connectError,
  connectWarning,
}: GoogleCalendarConnectProps) {
  const router = useRouter();
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const handleDisconnect = async () => {
    if (!confirm("Disconnect Google Calendar? Future changes will stop syncing.")) {
      return;
    }
    setIsDisconnecting(true);
    await fetch("/api/portal/google/disconnect", { method: "POST" });
    setIsDisconnecting(false);
    router.refresh();
  };

  return (
    <div className="max-w-lg">
      {justConnected && !connectWarning && (
        <div className="mb-4 rounded-xl bg-[#3F6E52]/10 text-[#3F6E52] text-sm font-medium px-4 py-3">
          Google Calendar connected — your schedule is now syncing both ways.
        </div>
      )}
      {connectWarning && (
        <div className="mb-4 rounded-xl bg-[#B8860B]/10 text-[#8A6508] text-sm font-medium px-4 py-3">
          {WARNING_MESSAGES[connectWarning] ??
            "Connected, but the first sync didn't finish."}
        </div>
      )}
      {connectError && (
        <div className="mb-4 rounded-xl bg-[#CB4538]/10 text-[#CB4538] text-sm font-medium px-4 py-3">
          {ERROR_MESSAGES[connectError] ?? "Something went wrong connecting to Google."}
        </div>
      )}

      <div className="bg-[#FDFCF8] rounded-2xl border border-black/[0.06] shadow-[0_1px_2px_rgba(26,26,26,0.04)] p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-black mb-1">
              Google Calendar
            </p>
            <p className="text-sm text-black/50 leading-relaxed">
              {isConnected
                ? "Connected. Appointments sync to a dedicated “SunFM Schedule” calendar on your Google account, both ways — new events added there show up here too."
                : "Connect your Google account to mirror your appointments onto a dedicated “SunFM Schedule” calendar, kept in sync in both directions."}
            </p>
          </div>
          <span
            className={`shrink-0 portal-chip ${
              isConnected
                ? "bg-[#3F6E52]/10 text-[#3F6E52]"
                : "bg-black/5 text-black/40"
            }`}
          >
            {isConnected ? "Connected" : "Not connected"}
          </span>
        </div>

        <div className="mt-5">
          {isConnected ? (
            <button
              onClick={handleDisconnect}
              disabled={isDisconnecting}
              className="text-sm font-medium text-[#CB4538]/70 hover:text-[#CB4538] transition-colors disabled:opacity-50"
            >
              {isDisconnecting ? "Disconnecting…" : "Disconnect"}
            </button>
          ) : (
            <a href="/api/portal/google/connect" className="btn-primary text-sm !py-2.5 inline-block">
              Connect Google Calendar
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
