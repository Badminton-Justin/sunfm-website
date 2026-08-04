"use client";

import { formatMinuteOfDay } from "@/lib/portal/time-options";

interface SlotPreviewProps {
  startMinutes: number;
  endMinutes: number;
  // Day view positions in px, Week view in %, so the caller supplies both.
  top: string | number;
  height: string | number;
  compact?: boolean;
}

// The block that follows the pointer while dragging out a new appointment.
export function SlotPreview({
  startMinutes,
  endMinutes,
  top,
  height,
  compact,
}: SlotPreviewProps) {
  return (
    <div
      className="absolute left-0 right-0 z-20 pointer-events-none rounded-lg border-2 border-dashed border-[#CB4538]/60 bg-[#CB4538]/10 px-1.5 py-0.5 overflow-hidden"
      style={{ top, height }}
    >
      <p
        className={`font-semibold text-[#CB4538] leading-tight ${
          compact ? "text-[10px]" : "text-[11px]"
        }`}
      >
        {formatMinuteOfDay(startMinutes)} – {formatMinuteOfDay(endMinutes)}
      </p>
    </div>
  );
}
