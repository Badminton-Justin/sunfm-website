import type { Trainer } from "@/lib/supabase/types";
import {
  appointmentTypeFromName,
  type ChipType,
} from "@/lib/portal/client-display";

export const TRAINER_PALETTE = [
  "#CB4538", // cherry red
  "#1a1a1a", // ink
  "#B8860B", // gold
  "#3F6E52", // pine
  "#4A5B8C", // indigo
  "#7A4B6B", // plum
];

export function buildTrainerColorMap(trainers: Trainer[]) {
  const map = new Map<string, string>();
  trainers.forEach((t, i) => {
    map.set(t.id, TRAINER_PALETTE[i % TRAINER_PALETTE.length]);
  });
  return map;
}

// Types that always carry their own color, whichever trainer owns them — a
// distinct hue rather than a shade of the trainer's. Sessions are deliberately
// absent: they keep the trainer color, so a multi-trainer week still reads as
// whose day is whose.
const TYPE_COLORS: Partial<Record<ChipType, string>> = {
  consultation: "#6B4E9E", // purple
  interview: "#B8500F", // deep burnt orange — kept well clear of the cherry
  // red sessions use, since that red is also a trainer color
};

export interface ChipStyle {
  background: string;
  textClass: string;
  subtleTextClass: string;
}

// Sessions use the trainer's normal color (same as any untyped appointment);
// anything in TYPE_COLORS overrides it.
export function getChipStyle(clientName: string, baseColor: string): ChipStyle {
  const type = appointmentTypeFromName(clientName);
  const background = (type && TYPE_COLORS[type]) ?? baseColor;
  return {
    background,
    textClass: "text-white",
    subtleTextClass: "text-white/80",
  };
}
