"use client";

import type { TrainerAvailability } from "@/lib/supabase/types";
import {
  formatTimeOfDay,
  minutesToTime,
  timeToMinutes,
} from "@/lib/portal/availability";
import { useSlotSelect } from "@/components/portal/calendar/useSlotSelect";
import { SlotPreview } from "@/components/portal/calendar/SlotPreview";
import {
  GRID_HEIGHT,
  HEADER_HEIGHT,
  HOUR_END,
  HOUR_START,
  PX_PER_HOUR,
  hourLabel,
  minutesToHeightPx,
  minutesToOffsetPx,
} from "@/components/portal/calendar/grid-constants";

const DAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface WeeklyHoursGridProps {
  windows: TrainerAvailability[];
  onAdd: (dayOfWeek: number, startTime: string, endTime: string) => void;
  onRemove: (id: string) => void;
}

// The grid is the editor: drag a day column to paint the hours you work.
// Same gesture as blocking out an appointment on the schedule, rather than
// describing the change in a form somewhere else on the page.
export function WeeklyHoursGrid({
  windows,
  onAdd,
  onRemove,
}: WeeklyHoursGridProps) {
  const hours = Array.from(
    { length: HOUR_END - HOUR_START + 1 },
    (_, i) => HOUR_START + i
  );

  const { selection, startSelect, handleMove, endSelect, cancelSelect } =
    useSlotSelect({
      onSelect: (key, startMinutes, endMinutes) =>
        onAdd(Number(key), minutesToTime(startMinutes), minutesToTime(endMinutes)),
    });

  return (
    <div className="rounded-2xl border border-black/[0.06] bg-[#FDFCF8] overflow-hidden">
      <div className="flex" style={{ height: HEADER_HEIGHT }}>
        <div className="w-14 shrink-0 border-r border-b border-black/[0.06]" />
        <div className="flex-1 grid grid-cols-7 border-b border-black/[0.06]">
          {DAYS_SHORT.map((day) => (
            <div
              key={day}
              className="flex items-center justify-center text-[11px] font-semibold uppercase tracking-wide text-black/45 border-r border-black/[0.06] last:border-r-0"
            >
              {day}
            </div>
          ))}
        </div>
      </div>

      <div className="flex">
        <div className="w-14 shrink-0 border-r border-black/[0.06] relative">
          {hours.map((h) => (
            <div
              key={h}
              className={`absolute right-2 text-[11px] text-black/35 ${
                h === HOUR_START ? "" : "-translate-y-1/2"
              }`}
              style={{ top: (h - HOUR_START) * PX_PER_HOUR }}
            >
              {h !== HOUR_END && hourLabel(h)}
            </div>
          ))}
        </div>

        <div className="flex-1 grid grid-cols-7">
          {DAYS_SHORT.map((day, dayIndex) => {
            const dayWindows = windows
              .filter((w) => w.day_of_week === dayIndex)
              .sort(
                (a, b) => timeToMinutes(a.start_time) - timeToMinutes(b.start_time)
              );

            return (
              <div
                key={day}
                // pan-y so a touch drag still scrolls the page; the
                // pointercancel that produces abandons the selection.
                className="relative border-r border-black/[0.06] last:border-r-0 cursor-pointer touch-pan-y"
                style={{
                  height: GRID_HEIGHT,
                  backgroundImage: `repeating-linear-gradient(to bottom, transparent 0, transparent ${
                    PX_PER_HOUR - 1
                  }px, rgba(26,26,26,0.07) ${PX_PER_HOUR - 1}px, rgba(26,26,26,0.07) ${PX_PER_HOUR}px)`,
                }}
                onPointerDown={(e) => startSelect(e, String(dayIndex))}
                onPointerMove={handleMove}
                onPointerUp={endSelect}
                onPointerCancel={cancelSelect}
              >
                {selection?.key === String(dayIndex) && (
                  <SlotPreview
                    compact
                    startMinutes={selection.startMinutes}
                    endMinutes={selection.endMinutes}
                    top={minutesToOffsetPx(selection.startMinutes)}
                    height={minutesToHeightPx(
                      selection.endMinutes - selection.startMinutes
                    )}
                  />
                )}

                {dayWindows.map((w) => {
                  const start = timeToMinutes(w.start_time);
                  const end = timeToMinutes(w.end_time);
                  return (
                    <div
                      key={w.id}
                      className="group absolute left-0.5 right-0.5 rounded-lg bg-[#3F6E52]/15 border border-[#3F6E52]/25 px-1.5 py-1 overflow-hidden"
                      style={{
                        top: minutesToOffsetPx(start),
                        height: Math.max(minutesToHeightPx(end - start), 20),
                      }}
                    >
                      <p className="text-[10px] font-semibold leading-tight text-[#2F5540] pr-4">
                        {formatTimeOfDay(w.start_time)}
                      </p>
                      <p className="text-[10px] leading-tight text-[#2F5540]/70">
                        {formatTimeOfDay(w.end_time)}
                      </p>
                      <button
                        type="button"
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={() => onRemove(w.id)}
                        aria-label={`Remove ${DAYS_SHORT[dayIndex]} ${formatTimeOfDay(
                          w.start_time
                        )} to ${formatTimeOfDay(w.end_time)}`}
                        className="absolute top-0.5 right-0.5 w-5 h-5 flex items-center justify-center rounded text-[#2F5540]/40 hover:text-[#CB4538] hover:bg-white/60 transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
