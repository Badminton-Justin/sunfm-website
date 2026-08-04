"use client";

import { useEffect, useState } from "react";
import type { Appointment, Trainer, TrainerAvailability } from "@/lib/supabase/types";
import { isSameDay } from "@/lib/portal/date-utils";
import { compactClientName } from "@/lib/portal/client-display";
import { layoutTimedItems } from "@/lib/portal/event-layout";
import { getChipStyle } from "./colors";
import { useEventDrag } from "./useEventDrag";
import { useSlotSelect } from "./useSlotSelect";
import { SlotPreview } from "./SlotPreview";
import {
  GRID_HEIGHT,
  HEADER_HEIGHT,
  HOUR_END,
  HOUR_START,
  PX_PER_HOUR,
  durationToHeightPx,
  hourLabel,
  minutesToHeightPx,
  minutesToOffsetPx,
  timeToOffsetPx,
} from "./grid-constants";

interface DayViewProps {
  date: Date;
  trainers: Trainer[];
  currentTrainer: Trainer;
  appointments: Appointment[];
  availability: TrainerAvailability[];
  trainerColorMap: Map<string, string>;
  onSlotSelect: (trainerId: string, start: Date, end: Date) => void;
  onEventClick: (appt: Appointment) => void;
  onMoveAppointment: (appt: Appointment, newStart: Date) => void;
}

export function DayView({
  date,
  trainers,
  currentTrainer,
  appointments,
  availability,
  trainerColorMap,
  onSlotSelect,
  onEventClick,
  onMoveAppointment,
}: DayViewProps) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const dayOfWeek = date.getDay();
  const hours = Array.from(
    { length: HOUR_END - HOUR_START + 1 },
    (_, i) => HOUR_START + i
  );

  const canEdit = (trainerId: string) =>
    currentTrainer.role === "owner" || trainerId === currentTrainer.id;

  // columnCount 1: the columns here are trainers, and reassigning one would
  // mean moving the event between two people's Google calendars.
  const { drag, startDrag, handleMove, endDrag, wasDragged } = useEventDrag({
    columnCount: 1,
    canDrag: (appt) => appt.status !== "canceled" && canEdit(appt.trainer_id),
    onMove: (appt, deltaMinutes) =>
      onMoveAppointment(
        appt,
        new Date(new Date(appt.start_time).getTime() + deltaMinutes * 60000)
      ),
  });

  const atMinutes = (minutes: number) => {
    const d = new Date(date);
    d.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0);
    return d;
  };

  const {
    selection,
    startSelect,
    handleMove: handleSlotMove,
    endSelect,
    cancelSelect,
  } = useSlotSelect({
    canSelect: canEdit,
    onSelect: (trainerId, startMinutes, endMinutes) =>
      onSlotSelect(trainerId, atMinutes(startMinutes), atMinutes(endMinutes)),
  });

  if (trainers.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-black/15 bg-[#FDFCF8]/60 px-8 py-16 text-center text-sm text-black/40">
        Select at least one coach to see their schedule.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-black/[0.06] bg-[#FDFCF8] overflow-hidden">
      <div className="flex overflow-x-auto">
        {/* Hour gutter */}
        <div className="w-14 shrink-0 border-r border-black/[0.06]">
          <div style={{ height: HEADER_HEIGHT }} />
          <div className="relative" style={{ height: GRID_HEIGHT }}>
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
        </div>

        {/* Trainer columns */}
        <div className="flex flex-1">
          {trainers.map((t) => {
            const color = trainerColorMap.get(t.id) ?? "#1a1a1a";
            const dayAppointments = appointments.filter(
              (a) => a.trainer_id === t.id && isSameDay(new Date(a.start_time), date)
            );
            const laidOut = layoutTimedItems(
              dayAppointments.map((a) => ({
                start: new Date(a.start_time),
                end: new Date(a.end_time),
                appt: a,
              }))
            );
            const windows = availability.filter(
              (a) => a.trainer_id === t.id && a.day_of_week === dayOfWeek
            );
            const editable = canEdit(t.id);

            return (
              <div
                key={t.id}
                className="flex-1 min-w-[170px] border-r border-black/[0.06] last:border-r-0"
              >
                <div
                  className="sticky top-0 z-10 bg-[#FDFCF8] border-b border-black/[0.06] flex items-center justify-center gap-1.5 px-2"
                  style={{ height: HEADER_HEIGHT }}
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ background: color }}
                  />
                  <span className="text-xs font-semibold text-black/75 truncate">
                    {t.name}
                  </span>
                </div>

                <div
                  // pan-y, not none: a touch drag over empty grid should still
                  // scroll the page. It arrives as a pointercancel, which
                  // abandons the selection rather than booking one.
                  className={`relative touch-pan-y ${
                    editable ? "cursor-pointer" : ""
                  }`}
                  style={{
                    height: GRID_HEIGHT,
                    // No line at 0 — the header row's own bottom border
                    // already marks the top edge, a line there doubles it up.
                    backgroundImage:
                      `repeating-linear-gradient(to bottom, transparent 0, transparent ${PX_PER_HOUR - 1}px, rgba(26,26,26,0.07) ${PX_PER_HOUR - 1}px, rgba(26,26,26,0.07) ${PX_PER_HOUR}px)`,
                  }}
                  onPointerDown={(e) => startSelect(e, t.id)}
                  onPointerMove={handleSlotMove}
                  onPointerUp={endSelect}
                  onPointerCancel={cancelSelect}
                >
                  {windows.map((w) => {
                    const [sh, sm] = w.start_time.split(":").map(Number);
                    const [eh, em] = w.end_time.split(":").map(Number);
                    const top = (sh + sm / 60 - HOUR_START) * PX_PER_HOUR;
                    const height = (eh + em / 60 - (sh + sm / 60)) * PX_PER_HOUR;
                    return (
                      <div
                        key={w.id}
                        className="absolute left-0 right-0 pointer-events-none"
                        style={{ top, height, background: `${color}12` }}
                      />
                    );
                  })}

                  {selection?.key === t.id && (
                    <SlotPreview
                      startMinutes={selection.startMinutes}
                      endMinutes={selection.endMinutes}
                      top={minutesToOffsetPx(selection.startMinutes)}
                      height={minutesToHeightPx(
                        selection.endMinutes - selection.startMinutes
                      )}
                    />
                  )}

                  {isSameDay(date, now) && (
                    <div
                      className="absolute left-0 right-0 flex items-center pointer-events-none z-20"
                      style={{ top: timeToOffsetPx(now) }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#CB4538] -ml-0.5" />
                      <span className="flex-1 h-px bg-[#CB4538]" />
                    </div>
                  )}

                  {laidOut.map(({ item, lane, laneCount }) => {
                    const top = timeToOffsetPx(item.start);
                    const height = Math.max(
                      durationToHeightPx(item.start, item.end),
                      20
                    );
                    const widthPct = 100 / laneCount;
                    const canceled = item.appt.status === "canceled";
                    const chipStyle = getChipStyle(item.appt.client_name, color);
                    const dragging = drag?.id === item.appt.id;
                    const draggable = !canceled && editable;
                    // While dragging, the chip reads out where it would land.
                    const shownStart = dragging
                      ? new Date(item.start.getTime() + drag.deltaMinutes * 60000)
                      : item.start;
                    return (
                      <button
                        key={item.appt.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (wasDragged()) return;
                          onEventClick(item.appt);
                        }}
                        onPointerDown={(e) => {
                          e.stopPropagation();
                          startDrag(e, item.appt, 0);
                        }}
                        onPointerMove={handleMove}
                        onPointerUp={endDrag}
                        onPointerCancel={endDrag}
                        className={`absolute rounded-lg px-1.5 py-1 text-left overflow-hidden shadow-sm hover:brightness-110 transition-[filter] touch-none ${
                          draggable ? "cursor-grab active:cursor-grabbing" : ""
                        }`}
                        style={{
                          top,
                          height,
                          left: `${lane * widthPct}%`,
                          width: `calc(${widthPct}% - 3px)`,
                          background: canceled ? "rgba(26,26,26,0.12)" : chipStyle.background,
                          opacity: canceled ? 0.7 : 1,
                          transform: dragging
                            ? `translateY(${drag.offsetY}px)`
                            : undefined,
                          zIndex: dragging ? 30 : undefined,
                          boxShadow: dragging
                            ? "0 8px 20px rgba(26,26,26,0.25)"
                            : undefined,
                        }}
                      >
                        <p
                          className={`text-[11px] font-semibold leading-tight truncate ${
                            canceled ? "text-black/50 line-through" : chipStyle.textClass
                          }`}
                        >
                          {compactClientName(item.appt.client_name)}
                        </p>
                        {height > 32 && (
                          <p
                            className={`text-[10px] leading-tight truncate ${
                              canceled ? "text-black/40" : chipStyle.subtleTextClass
                            }`}
                          >
                            {shownStart.toLocaleTimeString("en-US", {
                              hour: "numeric",
                              minute: "2-digit",
                            })}
                          </p>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
