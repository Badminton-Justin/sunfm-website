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
//
// The bar these have to clear is a grid that is overwhelmingly cherry red, so
// what matters is distance from that red rather than from white. A darker
// orange keeps white text but lands only ~21 ΔE from it and reads as a shade
// of red; this one is ~47 ΔE away and unmistakable. It's too bright to carry
// white text, hence `ink`.
interface TypeStyle {
  background: string;
  ink?: boolean;
}

const TYPE_STYLES: Partial<Record<ChipType, TypeStyle>> = {
  consultation: { background: "#6B4E9E" }, // purple
  interview: { background: "#FF8C00", ink: true }, // orange
};

export interface ChipStyle {
  background: string;
  textClass: string;
  subtleTextClass: string;
}

// Sessions use the trainer's normal color (same as any untyped appointment);
// anything in TYPE_STYLES overrides it.
export function getChipStyle(clientName: string, baseColor: string): ChipStyle {
  const type = appointmentTypeFromName(clientName);
  const style = type ? TYPE_STYLES[type] : undefined;
  const background = style?.background ?? baseColor;
  return style?.ink
    ? {
        background,
        textClass: "text-[#1a1a1a]",
        subtleTextClass: "text-[#1a1a1a]/75",
      }
    : {
        background,
        textClass: "text-white",
        subtleTextClass: "text-white/80",
      };
}
