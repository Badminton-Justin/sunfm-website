import type { Trainer } from "@/lib/supabase/types";
import { appointmentTypeFromName } from "@/lib/portal/client-display";

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

function lightenHex(hex: string, amount: number) {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = (num >> 16) & 0xff;
  const g = (num >> 8) & 0xff;
  const b = num & 0xff;
  const mix = (channel: number) => Math.round(channel + (255 - channel) * amount);
  return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`;
}

export interface ChipStyle {
  background: string;
  textClass: string;
  subtleTextClass: string;
}

// Sessions render as a lighter tint of the trainer's color, consultations
// (and anything without a recognized [Type] prefix) stay at the full/darker
// shade — same hue per trainer, just a shade apart so the two are
// distinguishable at a glance without adding another color to track.
export function getChipStyle(clientName: string, baseColor: string): ChipStyle {
  if (appointmentTypeFromName(clientName) === "session") {
    return {
      background: lightenHex(baseColor, 0.55),
      textClass: "text-black/80",
      subtleTextClass: "text-black/50",
    };
  }
  return {
    background: baseColor,
    textClass: "text-white",
    subtleTextClass: "text-white/80",
  };
}
