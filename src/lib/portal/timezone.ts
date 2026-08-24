// The gym runs on Pacific time, so every schedule surface is pinned to it
// rather than to the viewer's device clock. A trainer checking the roster from
// a laptop still set to Central has to see the same 7 AM session the front
// desk sees — reading the grid off `getHours()` alone silently redraws the
// whole week at the device's offset, which looks exactly like a sync failure.
export const GYM_TIME_ZONE = "America/Los_Angeles";

const partsFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: GYM_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

function zonedParts(instant: Date) {
  const parts: Record<string, number> = {};
  for (const part of partsFormatter.formatToParts(instant)) {
    if (part.type !== "literal") parts[part.type] = Number(part.value);
  }
  // hour12:false still reports midnight as hour 24 on some ICU builds.
  if (parts.hour === 24) parts.hour = 0;
  return parts;
}

// How far ahead of UTC the gym's clock runs at `instant` (negative in Pacific).
// Derived from the formatted parts rather than a table, so DST is whatever the
// platform's tz database says it is.
function zoneOffsetMs(instant: Date) {
  const p = zonedParts(instant);
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  // zonedParts has no milliseconds, so compare against a whole-second instant.
  return asUtc - (instant.getTime() - instant.getMilliseconds());
}

/**
 * A Date whose *device-local* fields spell out the gym's wall clock at
 * `instant`. Positioning, day bucketing and time labels all read those fields,
 * so they land on the gym's clock whatever the viewer's device is set to.
 *
 * The result is deliberately not a real point in time — it only reads
 * correctly through the local getters. Never serialize one; send it back
 * through `instantFromWallClock` first.
 */
export function wallClockFromInstant(instant: Date): Date {
  const p = zonedParts(instant);
  return new Date(
    p.year,
    p.month - 1,
    p.day,
    p.hour,
    p.minute,
    p.second,
    instant.getMilliseconds()
  );
}

export function wallClockFromIso(iso: string): Date {
  return wallClockFromInstant(new Date(iso));
}

/**
 * Inverse of `wallClockFromInstant`: reads a wall-clock Date as gym-local and
 * returns the real instant it names.
 */
export function instantFromWallClock(wall: Date): Date {
  const target = Date.UTC(
    wall.getFullYear(),
    wall.getMonth(),
    wall.getDate(),
    wall.getHours(),
    wall.getMinutes(),
    wall.getSeconds(),
    wall.getMilliseconds()
  );
  // The offset depends on the very instant we're solving for, so guess using
  // the offset at the naive point and correct once. Two passes settle both DST
  // directions; the hour spring-forward skips has no valid instant to find and
  // lands on the shifted equivalent, which is what Google does with it too.
  let instant = target - zoneOffsetMs(new Date(target));
  instant = target - zoneOffsetMs(new Date(instant));
  return new Date(instant);
}

export function isoFromWallClock(wall: Date): string {
  return instantFromWallClock(wall).toISOString();
}

/** "Now", on the gym's clock. */
export function gymNow(): Date {
  return wallClockFromInstant(new Date());
}
