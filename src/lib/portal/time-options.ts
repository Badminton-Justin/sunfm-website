const MINUTES_IN_DAY = 24 * 60;
const STEP = 15;
const MAX_DURATION = 12 * 60;

export interface TimeOption {
  value: number;
  label: string;
}

export function minuteOfDay(date: Date) {
  return date.getHours() * 60 + date.getMinutes();
}

export function formatMinuteOfDay(minutes: number) {
  const wrapped = ((minutes % MINUTES_IN_DAY) + MINUTES_IN_DAY) % MINUTES_IN_DAY;
  const d = new Date(2000, 0, 1, Math.floor(wrapped / 60), wrapped % 60);
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

export function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (!hours) return `${mins} min`;
  if (!mins) return `${hours} hr`;
  return `${hours} hr ${mins} min`;
}

// Every quarter hour, plus the current value when it sits off the grid — a
// Google-synced event starting at 6:07 shouldn't get silently snapped to 6:00.
export function startTimeOptions(selected: number): TimeOption[] {
  const values = new Set<number>();
  for (let m = 0; m < MINUTES_IN_DAY; m += STEP) values.add(m);
  values.add(selected);
  return [...values]
    .sort((a, b) => a - b)
    .map((value) => ({ value, label: formatMinuteOfDay(value) }));
}

// End times are keyed by duration rather than clock time, so the range can
// never invert and the session length is visible without doing the math.
export function endTimeOptions(
  startMinutes: number,
  selectedDuration: number
): TimeOption[] {
  const values = new Set<number>();
  for (let d = STEP; d <= MAX_DURATION; d += STEP) values.add(d);
  if (selectedDuration > 0) values.add(selectedDuration);
  return [...values]
    .sort((a, b) => a - b)
    .map((value) => {
      const dayOffset = Math.floor((startMinutes + value) / MINUTES_IN_DAY);
      const nextDay = dayOffset > 0 ? ` +${dayOffset}d` : "";
      return {
        value,
        label: `${formatMinuteOfDay(startMinutes + value)}${nextDay} · ${formatDuration(value)}`,
      };
    });
}
