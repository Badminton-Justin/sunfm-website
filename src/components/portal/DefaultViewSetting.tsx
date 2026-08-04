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
    <section className="rounded-2xl border border-black/[0.06] bg-[#FDFCF8] p-6">
      <h2 className="font-display text-xl text-black mb-1">Default view</h2>
      <p className="text-sm text-black/55 mb-4">
        Which view the schedule opens on.
      </p>

      <div className="flex items-center rounded-full border border-black/10 p-0.5 w-fit">
        {CALENDAR_VIEWS.map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => choose(v)}
            aria-pressed={view === v}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold capitalize transition-colors ${
              view === v
                ? "bg-black text-white"
                : "text-black/50 hover:text-black"
            }`}
          >
            {v}
          </button>
        ))}
      </div>

      <p className="text-xs text-black/40 mt-3 h-4">
        {error ? (
          <span className="text-[#CB4538] font-medium">{error}</span>
        ) : saving ? (
          "Saving…"
        ) : (
          ""
        )}
      </p>
    </section>
  );
}
