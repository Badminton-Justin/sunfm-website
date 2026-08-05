import type {
  AvailabilityOverride,
  TrainerAvailability,
} from "@/lib/supabase/types";

export interface AvailabilityWindow {
  start_time: string; // "HH:MM:SS"
  end_time: string;
}

export interface EffectiveAvailability {
  windows: AvailabilityWindow[];
  // The date carries overrides, so the weekly pattern was set aside.
  isOverridden: boolean;
  // Overridden with nothing bookable — vacation, a day off, an emergency.
  isUnavailable: boolean;
  note: string | null;
}

// "YYYY-MM-DD" in local time. Not toISOString().slice(0, 10), which converts
// to UTC first and lands on the wrong date all evening in a western timezone.
export function toDateKey(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function parseDateKey(key: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key);
  if (!match) return null;
  return new Date(+match[1], +match[2] - 1, +match[3]);
}

// The one place that decides what a trainer's hours are on a given day.
// Overrides replace the weekly pattern rather than trimming it: a date with
// any override rows is defined entirely by them.
export function effectiveAvailability(
  date: Date,
  trainerId: string,
  recurring: TrainerAvailability[],
  overrides: AvailabilityOverride[]
): EffectiveAvailability {
  const key = toDateKey(date);
  const forDate = overrides.filter(
    (o) => o.trainer_id === trainerId && o.date === key
  );

  if (forDate.length) {
    const windows = forDate
      .filter((o) => o.start_time && o.end_time)
      .map((o) => ({ start_time: o.start_time!, end_time: o.end_time! }));
    return {
      windows,
      isOverridden: true,
      isUnavailable: windows.length === 0,
      note: forDate.find((o) => o.note)?.note ?? null,
    };
  }

  const day = date.getDay();
  return {
    windows: recurring
      .filter((a) => a.trainer_id === trainerId && a.day_of_week === day)
      .map((a) => ({ start_time: a.start_time, end_time: a.end_time })),
    isOverridden: false,
    isUnavailable: false,
    note: null,
  };
}

export function timeToMinutes(time: string) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + (m || 0);
}

export function minutesToTime(minutes: number) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}:00`;
}

export function formatTimeOfDay(time: string) {
  const [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${String(m).padStart(2, "0")} ${period}`;
}

// Whether an appointment sits inside the trainer's hours for its own day.
// A session must fall entirely within a single window to count as covered —
// one that starts inside a window and runs past its end is worth warning about.
export function coverageFor(
  start: Date,
  end: Date,
  trainerId: string,
  recurring: TrainerAvailability[],
  overrides: AvailabilityOverride[]
): { covered: boolean; availability: EffectiveAvailability } {
  const availability = effectiveAvailability(
    start,
    trainerId,
    recurring,
    overrides
  );
  const startMin = start.getHours() * 60 + start.getMinutes();
  // Same-day minutes; an appointment running past midnight can't be covered
  // by a window that ends at the day boundary anyway.
  const endMin = start.getDate() === end.getDate()
    ? end.getHours() * 60 + end.getMinutes()
    : 24 * 60;

  const covered = availability.windows.some(
    (w) =>
      timeToMinutes(w.start_time) <= startMin &&
      timeToMinutes(w.end_time) >= endMin
  );

  return { covered, availability };
}
