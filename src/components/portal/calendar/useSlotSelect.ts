"use client";

import { useRef, useState } from "react";
import { HOUR_END, HOUR_START, TOTAL_HOURS } from "./grid-constants";

const SNAP_MINUTES = 15;
const DRAG_THRESHOLD_PX = 4;
// What a plain click books, matching what clicking a slot did before drag.
const CLICK_MINUTES = 60;

export interface SlotSelection {
  key: string;
  startMinutes: number;
  endMinutes: number;
}

interface UseSlotSelectOptions {
  // key identifies the column: a trainer in Day view, a day in Week view.
  onSelect: (key: string, startMinutes: number, endMinutes: number) => void;
  canSelect?: (key: string) => boolean;
}

const GRID_START = HOUR_START * 60;
const GRID_END = HOUR_END * 60;

const clamp = (m: number) => Math.max(GRID_START, Math.min(GRID_END, m));

// Drag across empty grid to block out a time, or click for a default hour.
// Both views hand back minutes-from-midnight and convert to their own
// geometry, since Day view is a fixed pixel grid and Week view a percentage one.
export function useSlotSelect({ onSelect, canSelect }: UseSlotSelectOptions) {
  const [selection, setSelection] = useState<SlotSelection | null>(null);
  const origin = useRef<{
    key: string;
    top: number;
    height: number;
    anchor: number;
    y: number;
  } | null>(null);
  const latest = useRef<SlotSelection | null>(null);
  const moved = useRef(false);

  const minutesAt = (
    o: { top: number; height: number },
    clientY: number
  ) => clamp(GRID_START + ((clientY - o.top) / o.height) * TOTAL_HOURS * 60);

  const startSelect = (e: React.PointerEvent<HTMLElement>, key: string) => {
    if (e.button !== 0) return;
    if (canSelect && !canSelect(key)) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const raw = minutesAt({ top: rect.top, height: rect.height }, e.clientY);
    // Floor, so pressing anywhere inside a quarter hour starts at its top.
    const anchor = Math.min(
      Math.floor(raw / SNAP_MINUTES) * SNAP_MINUTES,
      GRID_END - SNAP_MINUTES
    );

    origin.current = {
      key,
      top: rect.top,
      height: rect.height,
      anchor,
      y: e.clientY,
    };
    latest.current = null;
    moved.current = false;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handleMove = (e: React.PointerEvent<HTMLElement>) => {
    const o = origin.current;
    if (!o) return;
    if (!moved.current && Math.abs(e.clientY - o.y) < DRAG_THRESHOLD_PX) return;
    moved.current = true;

    const raw = minutesAt(o, e.clientY);
    const current = clamp(Math.round(raw / SNAP_MINUTES) * SNAP_MINUTES);
    const start = Math.min(o.anchor, current);
    const end = Math.max(o.anchor, current);

    const next: SlotSelection = {
      key: o.key,
      startMinutes: start,
      // Dragging up past the anchor selects upward; either way the block
      // never collapses to nothing.
      endMinutes: Math.max(end, start + SNAP_MINUTES),
    };
    latest.current = next;
    setSelection(next);
  };

  const endSelect = (e: React.PointerEvent<HTMLElement>) => {
    const o = origin.current;
    const result = latest.current;
    origin.current = null;
    latest.current = null;
    setSelection(null);
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    if (!o) return;

    if (!moved.current || !result) {
      onSelect(o.key, o.anchor, o.anchor + CLICK_MINUTES);
      return;
    }
    onSelect(result.key, result.startMinutes, result.endMinutes);
  };

  const cancelSelect = () => {
    origin.current = null;
    latest.current = null;
    moved.current = false;
    setSelection(null);
  };

  return { selection, startSelect, handleMove, endSelect, cancelSelect };
}
