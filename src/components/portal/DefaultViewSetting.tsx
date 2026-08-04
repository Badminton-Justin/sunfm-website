"use client";

import { useState } from "react";
import { CALENDAR_VIEWS, type CalendarView } from "@/lib/supabase/types";

interface DefaultViewSettingProps {
  current: CalendarView;
}

export function DefaultViewSetting({ current }: DefaultViewSettingProps) {
  const [view, setView] = useState(current);
  const [saving, setSaving] = useState<CalendarView | null>(null);
  const [error, setError] = useState("");

  const choose = async (next: CalendarView) => {
    if (next === view) return;
    const previous = view;
    setView(next); // the toggle answers immediately; roll back if the save fails
    setSaving(next);
    setError("");

    const res = await fetch("/api/portal/preferences", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ default_calendar_view: next }),
    });

    setSaving(null);
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      setView(previous);
      setError(json.error ?? "Could not save that. Try again.");
    }
  };

  return (
    <div className="bg-[#FDFCF8] rounded-2xl border border-black/[0.06] shadow-[0_1px_2px_rgba(26,26,26,0.04)] p-6">
      <p className="text-sm font-semibold text-black mb-1">Default view</p>
      <p className="text-sm text-black/50 leading-relaxed">
        Which view the schedule opens on.
      </p>

      {/* "Saving…" sits beside the control rather than under it — a reserved
          line below would leave the card padded out with dead space. */}
      <div className="mt-5 flex items-center gap-3">
        <div className="flex items-center rounded-full border border-black/10 p-0.5">
          {CALENDAR_VIEWS.map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => choose(v)}
              aria-pressed={view === v}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold capitalize transition-colors ${
                view === v
                  ? "bg-black text-white"
                  : "text-black/50 hover:text-black"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
        {saving && <span className="text-xs text-black/35">Saving…</span>}
      </div>

      {error && (
        <p className="text-sm font-medium text-[#CB4538] mt-3">{error}</p>
      )}
    </div>
  );
}
