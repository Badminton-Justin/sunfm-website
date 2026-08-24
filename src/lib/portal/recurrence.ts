import {
  instantFromWallClock,
  wallClockFromInstant,
} from "@/lib/portal/timezone";

const DAY_MS = 24 * 60 * 60 * 1000;

// How far ahead an open-ended weekly booking is materialised. Matches
// INITIAL_SYNC_FUTURE_WINDOW_DAYS in the Google sync — past this point an
// appointment would not reach the trainer's calendar anyway, so creating rows
// beyond it would only build a backlog nobody can see.
export const OPEN_ENDED_HORIZON_DAYS = 180;

export const MAX_FIXED_WEEKS = 52;

export interface RepeatSpec {
  weeks?: number;
  indefinite?: boolean;
}

export interface Occurrence {
  start_time: string;
  end_time: string;
}

export function horizonFrom(now = new Date()) {
  return new Date(now.getTime() + OPEN_ENDED_HORIZON_DAYS * DAY_MS);
}

// Weekly by calendar date, not by adding 7×24h, so a session keeps its
// wall-clock time across a daylight-saving change — what "same time every
// Tuesday" means to whoever booked it. The shift is taken on the gym's clock
// rather than the runtime's: this also runs server-side, where local time is
// UTC and has no DST of its own to preserve.
export function shiftWeeks(date: Date, weeks: number) {
  const wall = wallClockFromInstant(date);
  wall.setDate(wall.getDate() + weeks * 7);
  return instantFromWallClock(wall);
}

// Every occurrence a booking creates up front, the first included. A one-off
// returns a single entry, so callers have one path.
export function weeklyOccurrences(
  start: Date,
  end: Date,
  repeat?: RepeatSpec | null,
  now = new Date()
): Occurrence[] {
  let count = 1;

  if (repeat?.indefinite) {
    const horizon = horizonFrom(now);
    count = 0;
    while (shiftWeeks(start, count).getTime() <= horizon.getTime()) count++;
    count = Math.max(1, count);
  } else if (repeat?.weeks && repeat.weeks > 1) {
    count = Math.min(MAX_FIXED_WEEKS, Math.floor(repeat.weeks));
  }

  return Array.from({ length: count }, (_, i) => ({
    start_time: shiftWeeks(start, i).toISOString(),
    end_time: shiftWeeks(end, i).toISOString(),
  }));
}
