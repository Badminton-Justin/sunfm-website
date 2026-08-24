"use client";

import { useRef, useState } from "react";
import type { Appointment } from "@/lib/supabase/types";
import { HOUR_END, HOUR_START, TOTAL_HOURS } from "./grid-constants";
import { wallClockFromIso } from "@/lib/portal/timezone";

const SNAP_MINUTES = 15;
// Below this, the gesture is still a click — chips open the modal on tap, so a
// few pixels of finger or trackpad wobble must not count as a move.
const DRAG_THRESHOLD_PX = 4;

export interface EventDrag {
  id: string;
  offsetX: number;
  offsetY: number;
  deltaMinutes: number;
  columnIndex: number;
}

interface UseEventDragOptions {
  // 1 disables sideways movement (Day view columns are trainers, and moving an
  // appointment between trainers means moving it between Google calendars).
  columnCount: number;
  canDrag: (appt: Appointment) => boolean;
  onMove: (appt: Appointment, deltaMinutes: number, columnIndex: number) => void;
}

// Shared by Day and Week view. Both lay a column out as TOTAL_HOURS of height,
// so measuring the column at grab time covers the fixed-px grid and the
// percentage-based one without either view knowing which it is.
export function useEventDrag({
  columnCount,
  canDrag,
  onMove,
}: UseEventDragOptions) {
  const [drag, setDrag] = useState<EventDrag | null>(null);
  const origin = useRef<{
    appt: Appointment;
    columnIndex: number;
    x: number;
    y: number;
    pxPerMinute: number;
    columnWidth: number;
    minDelta: number;
    maxDelta: number;
  } | null>(null);
  const latest = useRef<EventDrag | null>(null);
  const moved = useRef(false);

  const startDrag = (
    e: React.PointerEvent<HTMLElement>,
    appt: Appointment,
    columnIndex: number
  ) => {
    if (e.button !== 0 || !canDrag(appt)) return;
    const column = e.currentTarget.offsetParent as HTMLElement | null;
    if (!column) return;

    const rect = column.getBoundingClientRect();
    // Both ends read on the gym's clock: mixing a wall-clock start with a raw
    // instant end would fold the device's UTC offset into the duration.
    const start = wallClockFromIso(appt.start_time);
    const durationMin =
      (wallClockFromIso(appt.end_time).getTime() - start.getTime()) / 60000;
    const startMin = start.getHours() * 60 + start.getMinutes();

    origin.current = {
      appt,
      columnIndex,
      x: e.clientX,
      y: e.clientY,
      pxPerMinute: rect.height / (TOTAL_HOURS * 60),
      columnWidth: rect.width,
      // Keep the whole appointment inside the visible grid.
      minDelta: HOUR_START * 60 - startMin,
      maxDelta: HOUR_END * 60 - durationMin - startMin,
    };
    latest.current = null;
    moved.current = false;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handleMove = (e: React.PointerEvent<HTMLElement>) => {
    const o = origin.current;
    if (!o) return;
    const dx = e.clientX - o.x;
    const dy = e.clientY - o.y;
    if (!moved.current && Math.hypot(dx, dy) < DRAG_THRESHOLD_PX) return;
    moved.current = true;

    const snapped =
      Math.round(dy / o.pxPerMinute / SNAP_MINUTES) * SNAP_MINUTES;
    const deltaMinutes = Math.max(o.minDelta, Math.min(o.maxDelta, snapped));
    const columnIndex =
      columnCount > 1
        ? Math.max(
            0,
            Math.min(
              columnCount - 1,
              o.columnIndex + Math.round(dx / o.columnWidth)
            )
          )
        : o.columnIndex;

    const next: EventDrag = {
      id: o.appt.id,
      offsetX: (columnIndex - o.columnIndex) * o.columnWidth,
      offsetY: deltaMinutes * o.pxPerMinute,
      deltaMinutes,
      columnIndex,
    };
    latest.current = next;
    setDrag(next);
  };

  const endDrag = (e: React.PointerEvent<HTMLElement>) => {
    const o = origin.current;
    const result = latest.current;
    origin.current = null;
    latest.current = null;
    setDrag(null);
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    if (!o || !moved.current || !result) return;
    if (result.deltaMinutes === 0 && result.columnIndex === o.columnIndex) return;
    onMove(o.appt, result.deltaMinutes, result.columnIndex);
  };

  // The click that follows a drag would otherwise open the modal on drop.
  const wasDragged = () => moved.current;

  return { drag, startDrag, handleMove, endDrag, wasDragged };
}
