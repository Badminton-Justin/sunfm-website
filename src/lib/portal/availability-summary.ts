import type { TrainerAvailability } from "@/lib/supabase/types";

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
