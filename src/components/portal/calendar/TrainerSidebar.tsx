"use client";

import type {
  AvailabilityOverride,
  Trainer,
  TrainerAvailability,
} from "@/lib/supabase/types";
import {
  summarizeUpcomingOverrides,
  summarizeWeeklyAvailability,
} from "@/lib/portal/availability-summary";
import { gymNow } from "@/lib/portal/timezone";

interface TrainerSidebarProps {
  trainers: Trainer[];
  currentTrainerId: string;
  visibleIds: Set<string>;
  onToggle: (id: string) => void;
  onShowAll: () => void;
  onShowNone: () => void;
  trainerColorMap: Map<string, string>;
  availability: TrainerAvailability[];
  // Vacation lives on the availability page behind a trainer switcher, which
  // is nowhere near where you book. Surface it next to the weekly hours.
  overrides: AvailabilityOverride[];
}

export function TrainerSidebar({
  trainers,
  currentTrainerId,
  visibleIds,
  onToggle,
  onShowAll,
  onShowNone,
  trainerColorMap,
  availability,
  overrides,
}: TrainerSidebarProps) {
  const today = gymNow();
  return (
    <aside className="w-full lg:w-64 shrink-0 space-y-6">
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="portal-kicker">Coaches</p>
          <div className="flex gap-2 text-xs font-medium">
            <button
              onClick={onShowAll}
              className="text-black/45 hover:text-[#CB4538] transition-colors"
            >
              All
            </button>
            <span className="text-black/20">·</span>
            <button
              onClick={onShowNone}
              className="text-black/45 hover:text-[#CB4538] transition-colors"
            >
              None
            </button>
          </div>
        </div>
        <div className="bg-[#FDFCF8] rounded-2xl border border-black/[0.06] shadow-[0_1px_2px_rgba(26,26,26,0.04)] divide-y divide-black/[0.05]">
          {trainers.map((t) => {
            const isVisible = visibleIds.has(t.id);
            const color = trainerColorMap.get(t.id) ?? "#1a1a1a";
            return (
              <label
                key={t.id}
                className="flex items-center gap-3 px-3.5 py-2.5 cursor-pointer select-none"
              >
                <input
                  type="checkbox"
                  checked={isVisible}
                  onChange={() => onToggle(t.id)}
                  className="sr-only peer"
                />
                <span
                  className="w-4 h-4 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors"
                  style={{
                    borderColor: color,
                    background: isVisible ? color : "transparent",
                  }}
                >
                  {isVisible && (
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="white"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  )}
                </span>
                <span
                  className={`text-sm ${
                    isVisible ? "text-black font-medium" : "text-black/40"
                  }`}
                >
                  {t.name}
                  {t.id === currentTrainerId && (
                    <span className="text-black/35 font-normal"> (you)</span>
                  )}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      <div>
        <p className="portal-kicker mb-3">At a Glance</p>
        <div className="space-y-3">
          {trainers
            .filter((t) => visibleIds.has(t.id))
            .map((t) => {
              const lines = summarizeWeeklyAvailability(
                availability.filter((a) => a.trainer_id === t.id)
              );
              const awayLines = summarizeUpcomingOverrides(
                overrides.filter((o) => o.trainer_id === t.id),
                today
              );
              const color = trainerColorMap.get(t.id) ?? "#1a1a1a";
              return (
                <div
                  key={t.id}
                  className="bg-[#FDFCF8] rounded-2xl border border-black/[0.06] px-3.5 py-3"
                >
                  <p className="text-sm font-semibold text-black flex items-center gap-2 mb-1">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ background: color }}
                    />
                    {t.name}
                  </p>
                  {lines.map((line) => (
                    <p key={line} className="text-xs text-black/50 leading-relaxed">
                      {line}
                    </p>
                  ))}
                  {awayLines.length > 0 && (
                    <div className="mt-1.5 pt-1.5 border-t border-black/[0.07] space-y-0.5">
                      {awayLines.map((line) => (
                        <p
                          key={line}
                          className="text-xs font-medium text-[#8A6508] leading-relaxed"
                        >
                          {line}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          {trainers.filter((t) => visibleIds.has(t.id)).length === 0 && (
            <p className="text-xs text-black/35">No coaches selected.</p>
          )}
        </div>
      </div>
    </aside>
  );
}
