"use client";

import type { Appointment, Trainer } from "@/lib/supabase/types";
import { addDays, isSameDay, startOfWeek } from "@/lib/portal/date-utils";
import { compactClientName } from "@/lib/portal/client-display";
import { layoutTimedItems } from "@/lib/portal/event-layout";
import { getChipStyle } from "./colors";
import { useEventDrag } from "./useEventDrag";
import {
  HEADER_HEIGHT,
  HOUR_END,
  HOUR_START,
  TOTAL_HOURS,
  durationToHeightPercent,
  hourLabel,
  timeToOffsetPercent,
} from "./grid-constants";

interface WeekViewProps {
  anchorDate: Date;
  trainers: Trainer[];
  appointments: Appointment[];
  trainerColorMap: Map<string, string>;
  onDayHeaderClick: (date: Date) => void;
  onEventClick: (appt: Appointment) => void;
  onMoveAppointment: (appt: Appointment, newStart: Date) => void;
  canEdit: (appt: Appointment) => boolean;
}

export function WeekView({
  anchorDate,
  trainers,
  appointments,
  trainerColorMap,
  onDayHeaderClick,
  onEventClick,
  onMoveAppointment,
  canEdit,
}: WeekViewProps) {
  const weekStart = startOfWeek(anchorDate);
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const today = new Date();
  const hours = Array.from(
    { length: HOUR_END - HOUR_START + 1 },
    (_, i) => HOUR_START + i
  );
  const visibleTrainerIds = new Set(trainers.map((t) => t.id));

  // Columns are days here, so dragging sideways reschedules to another day —
  // same trainer, same Google calendar.
  const { drag, startDrag, handleMove, endDrag, wasDragged } = useEventDrag({
    columnCount: days.length,
    canDrag: (appt) => appt.status !== "canceled" && canEdit(appt),
    onMove: (appt, deltaMinutes, columnIndex) => {
      const start = new Date(appt.start_time);
      const fromIndex = days.findIndex((d) => isSameDay(d, start));
      const moved = new Date(start.getTime() + deltaMinutes * 60000);
      moved.setDate(moved.getDate() + (columnIndex - fromIndex));
      onMoveAppointment(appt, moved);
    },
  });

  return (
    <div
      className="rounded-2xl border border-black/[0.06] bg-[#FDFCF8] overflow-hidden flex flex-col"
      style={{ height: "calc(100vh - 300px)", minHeight: 440 }}
    >
      {/* Day header row */}
      <div className="flex shrink-0" style={{ height: HEADER_HEIGHT }}>
        <div className="w-14 shrink-0 border-r border-b border-black/[0.06]" />
        <div className="flex-1 grid grid-cols-7 border-b border-black/[0.06]">
          {days.map((day) => {
            const isToday = isSameDay(day, today);
            return (
              <button
                key={day.toISOString()}
                onClick={() => onDayHeaderClick(day)}
                className="flex flex-col items-center justify-center gap-0.5 hover:bg-black/[0.02] transition-colors border-r border-black/[0.06] last:border-r-0"
              >
                <span className="text-[10px] font-medium text-black/40 uppercase tracking-wide">
                  {day.toLocaleDateString("en-US", { weekday: "short" })}
                </span>
                <span
                  className={`text-xs font-bold leading-none ${
                    isToday
                      ? "text-white bg-[#CB4538] w-5 h-5 rounded-full flex items-center justify-center"
                      : "text-black/70"
                  }`}
                >
                  {day.getDate()}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Time grid, fills remaining height — no vertical scroll */}
      <div className="flex flex-1 min-h-0">
        <div className="w-14 shrink-0 border-r border-black/[0.06] relative">
          {hours.map((h) => (
            <div
              key={h}
              className={`absolute right-2 text-[11px] text-black/35 ${
                h === HOUR_START ? "" : "-translate-y-1/2"
              }`}
              style={{ top: `${((h - HOUR_START) / TOTAL_HOURS) * 100}%` }}
            >
              {h !== HOUR_END && hourLabel(h)}
            </div>
          ))}
        </div>

        <div className="flex-1 grid grid-cols-7">
          {days.map((day, dayIndex) => {
            const dayAppointments = appointments.filter(
              (a) =>
                visibleTrainerIds.has(a.trainer_id) &&
                isSameDay(new Date(a.start_time), day)
            );
            const laidOut = layoutTimedItems(
              dayAppointments.map((a) => ({
                start: new Date(a.start_time),
                end: new Date(a.end_time),
                appt: a,
              }))
            );

            return (
              <div
                key={day.toISOString()}
                className="relative border-r border-black/[0.06] last:border-r-0"
                style={{
                  // No line at 0% — the header row's own bottom border already
                  // marks the top edge, so a line there just doubles it up.
                  backgroundImage: `repeating-linear-gradient(to bottom, transparent 0, transparent calc(100% / ${TOTAL_HOURS} - 1px), rgba(26,26,26,0.07) calc(100% / ${TOTAL_HOURS} - 1px), rgba(26,26,26,0.07) calc(100% / ${TOTAL_HOURS}))`,
                }}
              >
                {laidOut.map(({ item, lane, laneCount }) => {
                  const top = timeToOffsetPercent(item.start);
                  const height = Math.max(
                    durationToHeightPercent(item.start, item.end),
                    2.2
                  );
                  const widthPct = 100 / laneCount;
                  const color =
                    trainerColorMap.get(item.appt.trainer_id) ?? "#1a1a1a";
                  const canceled = item.appt.status === "canceled";
                  const chipStyle = getChipStyle(item.appt.client_name, color);
                  const dragging = drag?.id === item.appt.id;
                  const draggable = !canceled && canEdit(item.appt);
                  return (
                    <button
                      key={item.appt.id}
                      onClick={() => {
                        if (wasDragged()) return;
                        onEventClick(item.appt);
                      }}
                      onPointerDown={(e) => startDrag(e, item.appt, dayIndex)}
                      onPointerMove={handleMove}
                      onPointerUp={endDrag}
                      onPointerCancel={endDrag}
                      className={`absolute rounded-md px-1 py-0.5 text-left overflow-hidden shadow-sm hover:brightness-110 transition-[filter] touch-none ${
                        draggable ? "cursor-grab active:cursor-grabbing" : ""
                      }`}
                      style={{
                        top: `${top}%`,
                        height: `${height}%`,
                        left: `${lane * widthPct}%`,
                        width: `calc(${widthPct}% - 2px)`,
                        background: canceled ? "rgba(26,26,26,0.12)" : chipStyle.background,
                        opacity: canceled ? 0.7 : 1,
                        transform: dragging
                          ? `translate(${drag.offsetX}px, ${drag.offsetY}px)`
                          : undefined,
                        zIndex: dragging ? 30 : undefined,
                        boxShadow: dragging
                          ? "0 8px 20px rgba(26,26,26,0.25)"
                          : undefined,
                      }}
                    >
                      <p
                        className={`text-[10px] font-semibold leading-tight truncate ${
                          canceled ? "text-black/50 line-through" : chipStyle.textClass
                        }`}
                      >
                        {compactClientName(item.appt.client_name)}
                      </p>
                    </button>
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
