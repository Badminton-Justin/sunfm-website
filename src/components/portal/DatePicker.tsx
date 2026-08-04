"use client";

import { useEffect, useRef, useState } from "react";
import { addDays, addMonths, isSameDay, monthGridDays } from "@/lib/portal/date-utils";

interface DatePickerProps {
  value: Date;
  onChange: (date: Date) => void;
  ariaLabel?: string;
}

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

function formatTrigger(date: Date) {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// "Today" / "Tomorrow" reads faster than a date when it applies, so it rides
// alongside the full date rather than replacing it.
function relativeHint(date: Date) {
  const today = new Date();
  if (isSameDay(date, today)) return "Today";
  if (isSameDay(date, addDays(today, 1))) return "Tomorrow";
  if (isSameDay(date, addDays(today, -1))) return "Yesterday";
  return null;
}

export function DatePicker({ value, onChange, ariaLabel = "Date" }: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const [monthAnchor, setMonthAnchor] = useState(value);
  const [focusedDate, setFocusedDate] = useState(value);

  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const closeAndRefocus = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };

  const openPopover = () => {
    setMonthAnchor(value);
    setFocusedDate(value);
    setOpen(true);
  };

  // Dismiss on an outside click or Escape from anywhere inside the popover.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation(); // don't let the modal behind us close too
        closeAndRefocus();
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown, true);
    };
  }, [open]);

  // Move real DOM focus with the roving day, so arrow keys read out correctly
  // and the popover is usable without a mouse.
  useEffect(() => {
    if (!open) return;
    const day = popoverRef.current?.querySelector<HTMLButtonElement>(
      '[data-day-focus="true"]'
    );
    day?.focus({ preventScroll: true });
  }, [open, focusedDate]);

  // The modal body scrolls, so nudge the calendar into view when it opens
  // near the bottom of the viewport instead of letting it hang off-screen.
  useEffect(() => {
    if (!open) return;
    popoverRef.current?.scrollIntoView({ block: "nearest" });
  }, [open]);

  const moveFocus = (next: Date) => {
    setFocusedDate(next);
    if (
      next.getMonth() !== monthAnchor.getMonth() ||
      next.getFullYear() !== monthAnchor.getFullYear()
    ) {
      setMonthAnchor(next);
    }
  };

  const handleGridKeyDown = (e: React.KeyboardEvent) => {
    const moves: Record<string, () => Date> = {
      ArrowLeft: () => addDays(focusedDate, -1),
      ArrowRight: () => addDays(focusedDate, 1),
      ArrowUp: () => addDays(focusedDate, -7),
      ArrowDown: () => addDays(focusedDate, 7),
      Home: () => addDays(focusedDate, -focusedDate.getDay()),
      End: () => addDays(focusedDate, 6 - focusedDate.getDay()),
      PageUp: () => addMonths(focusedDate, -1),
      PageDown: () => addMonths(focusedDate, 1),
    };
    const move = moves[e.key];
    if (!move) return;
    e.preventDefault();
    moveFocus(move());
  };

  const select = (day: Date) => {
    onChange(day);
    closeAndRefocus();
  };

  const days = monthGridDays(monthAnchor);
  const weeks = Array.from({ length: 6 }, (_, i) => days.slice(i * 7, i * 7 + 7));
  const today = new Date();
  const hint = relativeHint(value);

  return (
    <div className="relative" ref={rootRef}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => (open ? closeAndRefocus() : openPopover())}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={`${ariaLabel}: ${formatTrigger(value)}`}
        className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border bg-white text-left transition-colors focus:outline-none focus-visible:border-[#CB4538] ${
          open ? "border-[#CB4538]" : "border-black/10 hover:border-black/25"
        }`}
      >
        <CalendarIcon />
        <span className="text-black">{formatTrigger(value)}</span>
        {hint && (
          <span className="ml-auto text-[11px] font-medium text-black/35">
            {hint}
          </span>
        )}
        <svg
          className={`text-black/40 shrink-0 transition-transform ${
            hint ? "" : "ml-auto"
          } ${open ? "rotate-180" : ""}`}
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div
          ref={popoverRef}
          role="dialog"
          aria-label={ariaLabel}
          className="absolute z-20 left-0 mt-2 w-full max-w-[22rem] rounded-2xl border border-black/10 bg-white shadow-xl shadow-black/10 p-3.5"
        >
          <div className="flex items-center justify-between mb-3">
            <p
              className="font-display text-lg text-black"
              aria-live="polite"
              aria-atomic="true"
            >
              {monthAnchor.toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </p>
            <div className="flex items-center gap-1">
              <MonthNavButton
                label="Previous month"
                onClick={() => setMonthAnchor(addMonths(monthAnchor, -1))}
                path="M15 18l-6-6 6-6"
              />
              <MonthNavButton
                label="Next month"
                onClick={() => setMonthAnchor(addMonths(monthAnchor, 1))}
                path="M9 18l6-6-6-6"
              />
            </div>
          </div>

          <div className="grid grid-cols-7 mb-1">
            {WEEKDAYS.map((d, i) => (
              <div
                key={i}
                aria-hidden="true"
                className="h-6 flex items-center justify-center text-[11px] font-semibold uppercase tracking-wide text-black/35"
              >
                {d}
              </div>
            ))}
          </div>

          <div
            role="grid"
            className="grid grid-cols-7 gap-y-0.5"
            onKeyDown={handleGridKeyDown}
          >
            {weeks.map((week, i) => (
              <div key={i} role="row" className="contents">
                {week.map((day) => {
                  const inMonth = day.getMonth() === monthAnchor.getMonth();
                  const isSelected = isSameDay(day, value);
                  const isToday = isSameDay(day, today);
                  const isFocused = isSameDay(day, focusedDate);

                  return (
                    <div key={day.toISOString()} role="gridcell" aria-selected={isSelected}>
                      <button
                        type="button"
                        tabIndex={isFocused ? 0 : -1}
                        data-day-focus={isFocused}
                        aria-current={isToday ? "date" : undefined}
                        aria-label={day.toLocaleDateString("en-US", {
                          weekday: "long",
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                        onClick={() => select(day)}
                        className={`w-full aspect-square rounded-full text-sm flex items-center justify-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#CB4538] focus-visible:ring-offset-1 focus-visible:ring-offset-white ${
                          isSelected
                            ? "bg-black text-white font-semibold"
                            : isToday
                            ? "text-[#CB4538] font-semibold hover:bg-[#CB4538]/10"
                            : inMonth
                            ? "text-black/75 hover:bg-black/5"
                            : "text-black/25 hover:bg-black/5"
                        }`}
                      >
                        {day.getDate()}
                      </button>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-black/[0.07]">
            <button
              type="button"
              onClick={() => select(new Date())}
              className="text-xs font-semibold text-[#CB4538] hover:opacity-70 transition-opacity"
            >
              Today
            </button>
            <button
              type="button"
              onClick={closeAndRefocus}
              className="text-xs font-medium text-black/45 hover:text-black transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function MonthNavButton({
  label,
  onClick,
  path,
}: {
  label: string;
  onClick: () => void;
  path: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="w-7 h-7 flex items-center justify-center rounded-lg text-black/50 hover:bg-black/5 hover:text-black transition-colors"
    >
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d={path} />
      </svg>
    </button>
  );
}

function CalendarIcon() {
  return (
    <svg
      className="text-black/35 shrink-0"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="5" width="18" height="16" rx="2.5" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </svg>
  );
}
