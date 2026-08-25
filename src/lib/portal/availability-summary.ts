import type {
  AvailabilityOverride,
  TrainerAvailability,
} from "@/lib/supabase/types";
import { parseDateKey, toDateKey } from "@/lib/portal/availability";

const DAY_ABBR = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function formatClockTime(t: string) {
  const [h, m] = t.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return m === 0 ? `${hour} ${period}` : `${hour}:${String(m).padStart(2, "0")} ${period}`;
}

function windowsLabel(windows: TrainerAvailability[]) {
  return windows
    .slice()
    .sort((a, b) => a.start_time.localeCompare(b.start_time))
    .map((w) => `${formatClockTime(w.start_time)}–${formatClockTime(w.end_time)}`)
    .join(", ");
}

// Collapses a trainer's recurring weekly windows into compact human-readable
// lines, e.g. ["Mon–Fri 9 AM–5 PM", "Sat 10 AM–2 PM"].
export function summarizeWeeklyAvailability(
  windows: TrainerAvailability[]
): string[] {
  if (windows.length === 0) return ["No recurring availability set"];

  const byDay = new Map<number, TrainerAvailability[]>();
  for (const w of windows) {
    if (!byDay.has(w.day_of_week)) byDay.set(w.day_of_week, []);
    byDay.get(w.day_of_week)!.push(w);
  }

  const dayLabels: { day: number; label: string }[] = [];
  for (let day = 0; day <= 6; day++) {
    const dayWindows = byDay.get(day);
    if (dayWindows && dayWindows.length > 0) {
      dayLabels.push({ day, label: windowsLabel(dayWindows) });
    }
  }

  if (dayLabels.length === 0) return ["No recurring availability set"];

  const lines: string[] = [];
  let runStart = 0;

  for (let i = 1; i <= dayLabels.length; i++) {
    const prev = dayLabels[i - 1];
    const curr = dayLabels[i];
    const isConsecutiveDay =
      curr && curr.day === prev.day + 1 && curr.label === prev.label;

    if (!isConsecutiveDay) {
      const first = dayLabels[runStart];
      const last = dayLabels[i - 1];
      const dayRange =
        first.day === last.day
          ? DAY_ABBR[first.day]
          : `${DAY_ABBR[first.day]}–${DAY_ABBR[last.day]}`;
      lines.push(`${dayRange} ${first.label}`);
      runStart = i;
    }
  }

  return lines;
}


export interface OverrideRange {
  from: string;
  to: string;
  start_time: string | null;
  end_time: string | null;
  note: string | null;
}

// A week off is seven rows in the table but one decision to the person who
// booked it, so consecutive days that say the same thing collapse into a range.
export function groupOverrideRanges(
  overrides: AvailabilityOverride[]
): OverrideRange[] {
  const sorted = [...overrides].sort((a, b) => a.date.localeCompare(b.date));
  const ranges: OverrideRange[] = [];

  for (const o of sorted) {
    const last = ranges[ranges.length - 1];
    const previousDay = parseDateKey(last?.to ?? "");
    if (previousDay) previousDay.setDate(previousDay.getDate() + 1);

    const continues =
      last &&
      previousDay &&
      toDateKey(previousDay) === o.date &&
      last.start_time === o.start_time &&
      last.end_time === o.end_time &&
      last.note === o.note;

    if (continues) {
      last.to = o.date;
    } else {
      ranges.push({
        from: o.date,
        to: o.date,
        start_time: o.start_time,
        end_time: o.end_time,
        note: o.note,
      });
    }
  }

  return ranges;
}

function compactRange(range: OverrideRange) {
  const from = parseDateKey(range.from);
  const to = parseDateKey(range.to);
  if (!from || !to) return range.from;
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  if (range.from === range.to) return from.toLocaleDateString("en-US", opts);
  // Same month reads as "Aug 24–31"; across a boundary it needs both months.
  const toLabel =
    from.getMonth() === to.getMonth()
      ? String(to.getDate())
      : to.toLocaleDateString("en-US", opts);
  return `${from.toLocaleDateString("en-US", opts)}–${toLabel}`;
}

// The override lines for a trainer's At a Glance card: what's coming, so a
// vacation is visible from the schedule instead of only from the availability
// page with that trainer selected.
export function summarizeUpcomingOverrides(
  overrides: AvailabilityOverride[],
  today: Date,
  limit = 3
): string[] {
  const todayKey = toDateKey(today);
  return groupOverrideRanges(overrides)
    .filter((r) => r.to >= todayKey)
    .slice(0, limit)
    .map((r) => {
      const when = compactRange(r);
      if (!r.start_time || !r.end_time) {
        return `Away ${when}${r.note ? ` · ${r.note}` : ""}`;
      }
      const hours = `${formatClockTime(r.start_time)}–${formatClockTime(
        r.end_time
      )}`;
      return `${when} ${hours}${r.note ? ` · ${r.note}` : ""}`;
    });
}
