import type { Trainer } from "@/lib/supabase/types";

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
