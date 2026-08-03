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

const CONSULTATION_COLOR = "#6B4E9E"; // fixed purple, regardless of trainer

export interface ChipStyle {
  background: string;
  textClass: string;
  subtleTextClass: string;
}

// Sessions use the trainer's normal color (same as any untyped appointment).
// Consultations are always this one purple, regardless of which trainer —
// a distinct color rather than a shade of the trainer's own.
export function getChipStyle(clientName: string, baseColor: string): ChipStyle {
  const background =
    appointmentTypeFromName(clientName) === "consultation"
      ? CONSULTATION_COLOR
      : baseColor;
  return {
    background,
    textClass: "text-white",
    subtleTextClass: "text-white/80",
  };
}
