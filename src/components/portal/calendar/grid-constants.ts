export const HOUR_START = 5; // 5 AM
export const HOUR_END = 22; // 10 PM
export const TOTAL_HOURS = HOUR_END - HOUR_START;
export const PX_PER_HOUR = 56;
export const GRID_HEIGHT = TOTAL_HOURS * PX_PER_HOUR;
export const HEADER_HEIGHT = 40;

export function hourLabel(hour: number) {
  const period = hour >= 12 ? "PM" : "AM";
  const h = hour % 12 === 0 ? 12 : hour % 12;
  return `${h} ${period}`;
}

// Vertical offset in px from the top of the grid for a given Date.
export function timeToOffsetPx(date: Date) {
  const hours = date.getHours() + date.getMinutes() / 60;
  return (hours - HOUR_START) * PX_PER_HOUR;
}

export function durationToHeightPx(start: Date, end: Date) {
  const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
  return hours * PX_PER_HOUR;
}

// Percentage-based equivalents, for grids that fill a responsive container
// height (e.g. Week view) instead of a fixed pixels-per-hour grid.
export function timeToOffsetPercent(date: Date) {
  const hours = date.getHours() + date.getMinutes() / 60;
  return ((hours - HOUR_START) / TOTAL_HOURS) * 100;
}

export function durationToHeightPercent(start: Date, end: Date) {
  const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
  return (hours / TOTAL_HOURS) * 100;
}
