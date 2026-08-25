"use client";

import { useMemo, useState } from "react";
import type { AvailabilityOverride } from "@/lib/supabase/types";
import {
  formatTimeOfDay,
  minutesToTime,
  parseDateKey,
  toDateKey,
} from "@/lib/portal/availability";
import { HOUR_END, HOUR_START } from "@/components/portal/calendar/grid-constants";
import { DatePicker } from "@/components/portal/DatePicker";
import { Select } from "@/components/portal/Select";

export interface OverrideRange {
  from: string;
  to: string;
  start_time: string | null;
  end_time: string | null;
  note: string | null;
}

interface DateOverridesProps {
  overrides: AvailabilityOverride[];
  onAdd: (range: {
    from: string;
    to: string;
    start_time: string | null;
    end_time: string | null;
    note: string;
  }) => Promise<string | null>;
  onRemove: (from: string, to: string) => void;
}

const TIME_OPTIONS = Array.from(
  { length: (HOUR_END - HOUR_START) * 4 + 1 },
  (_, i) => minutesToTime(HOUR_START * 60 + i * 15)
);

// A week off is seven rows in the table but one decision to the person who
// booked it, so consecutive days that say the same thing collapse into a range.
function groupIntoRanges(overrides: AvailabilityOverride[]): OverrideRange[] {
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

function formatRange(range: OverrideRange) {
  const from = parseDateKey(range.from);
  const to = parseDateKey(range.to);
  if (!from || !to) return range.from;

  const opts: Intl.DateTimeFormatOptions = {
    weekday: "short",
    month: "short",
    day: "numeric",
  };
  if (range.from === range.to) {
    return from.toLocaleDateString("en-US", { ...opts, year: "numeric" });
  }
  return `${from.toLocaleDateString("en-US", opts)} – ${to.toLocaleDateString(
    "en-US",
    { ...opts, year: "numeric" }
  )}`;
}

export function DateOverrides({
  overrides,
  onAdd,
  onRemove,
}: DateOverridesProps) {
  const [adding, setAdding] = useState(false);
  const [from, setFrom] = useState(() => new Date());
  const [to, setTo] = useState(() => new Date());
  const [unavailable, setUnavailable] = useState(true);
  const [startTime, setStartTime] = useState("12:00:00");
  const [endTime, setEndTime] = useState("16:00:00");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const ranges = useMemo(() => groupIntoRanges(overrides), [overrides]);
  const today = toDateKey(new Date());
  const upcoming = ranges.filter((r) => r.to >= today);
  const past = ranges.filter((r) => r.to < today);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    const err = await onAdd({
      from: toDateKey(from),
      to: toDateKey(to < from ? from : to),
      start_time: unavailable ? null : startTime,
      end_time: unavailable ? null : endTime,
      note,
    });
    setSaving(false);
    if (err) {
      setError(err);
      return;
    }
    setAdding(false);
    setNote("");
  };

  return (
    <div className="bg-[#FDFCF8] rounded-2xl border border-black/[0.06] shadow-[0_1px_2px_rgba(26,26,26,0.04)] p-5">
      <div className="flex items-start justify-between gap-4 mb-1">
        <p className="text-sm font-semibold text-black">Date overrides</p>
        {!adding && (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="text-sm font-medium text-[#CB4538] hover:opacity-70 transition-opacity shrink-0"
          >
            + Add
          </button>
        )}
      </div>
      <p className="text-sm text-black/50 leading-relaxed mb-4">
        Vacation, a day off, or different hours just this once. An override
        replaces your weekly hours for those dates entirely.
      </p>

      {adding && (
        <form
          onSubmit={submit}
          className="rounded-xl border border-black/10 bg-white p-4 mb-4 space-y-3.5"
        >
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-black/40 mb-1">
                From
              </label>
              <DatePicker
                value={from}
                onChange={(d) => {
                  setFrom(d);
                  // Otherwise picking a start past the end silently books a
                  // single day, since submit clamps to > from back to from.
                  if (toDateKey(d) > toDateKey(to)) setTo(d);
                }}
                ariaLabel="From date"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-black/40 mb-1">
                To
              </label>
              <DatePicker value={to} onChange={setTo} ariaLabel="To date" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="radio"
                name="override-kind"
                checked={unavailable}
                onChange={() => setUnavailable(true)}
                className="w-3.5 h-3.5 accent-[#CB4538]"
              />
              <span className="text-sm text-black/70">Unavailable all day</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer select-none flex-wrap">
              <input
                type="radio"
                name="override-kind"
                checked={!unavailable}
                onChange={() => setUnavailable(false)}
                className="w-3.5 h-3.5 accent-[#CB4538]"
              />
              <span className="text-sm text-black/70">Available</span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-28">
                  <Select
                    value={startTime}
                    onChange={(e) => {
                      setUnavailable(false);
                      setStartTime(e.target.value);
                    }}
                    className="!py-1.5 text-sm"
                  >
                    {TIME_OPTIONS.map((t) => (
                      <option key={t} value={t}>
                        {formatTimeOfDay(t)}
                      </option>
                    ))}
                  </Select>
                </span>
                <span className="text-sm text-black/40">to</span>
                <span className="w-28">
                  <Select
                    value={endTime}
                    onChange={(e) => {
                      setUnavailable(false);
                      setEndTime(e.target.value);
                    }}
                    className="!py-1.5 text-sm"
                  >
                    {TIME_OPTIONS.map((t) => (
                      <option key={t} value={t}>
                        {formatTimeOfDay(t)}
                      </option>
                    ))}
                  </Select>
                </span>
              </span>
            </label>
          </div>

          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Note (optional) — e.g. Hawaii"
            className="w-full px-3 py-2 rounded-xl border border-black/10 bg-white text-sm focus:outline-none focus:border-[#CB4538] transition-colors"
          />

          {error && (
            <p className="text-sm font-medium text-[#CB4538]">{error}</p>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => {
                setAdding(false);
                setError("");
              }}
              className="flex-1 px-4 py-2 rounded-full border border-black/15 text-black/60 text-sm font-medium hover:bg-black/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2 rounded-full bg-black text-white text-sm font-semibold hover:bg-black/85 transition-colors disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save override"}
            </button>
          </div>
        </form>
      )}

      {upcoming.length === 0 && past.length === 0 && !adding && (
        <p className="text-sm text-black/35">Nothing scheduled.</p>
      )}

      <div className="space-y-1.5">
        {upcoming.map((range) => (
          <OverrideRow
            key={`${range.from}-${range.to}`}
            range={range}
            onRemove={onRemove}
          />
        ))}
      </div>

      {past.length > 0 && (
        <details className="mt-4">
          <summary className="text-xs font-medium text-black/40 cursor-pointer hover:text-black/60 transition-colors">
            {past.length} past {past.length === 1 ? "override" : "overrides"}
          </summary>
          <div className="space-y-1.5 mt-2 opacity-60">
            {past.map((range) => (
              <OverrideRow
                key={`${range.from}-${range.to}`}
                range={range}
                onRemove={onRemove}
              />
            ))}
          </div>
        </details>
      )}
    </div>
  );
}

function OverrideRow({
  range,
  onRemove,
}: {
  range: OverrideRange;
  onRemove: (from: string, to: string) => void;
}) {
  const isOff = !range.start_time;
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-black/[0.07] px-3.5 py-2.5">
      <div className="min-w-0">
        <p className="text-sm font-medium text-black truncate">
          {formatRange(range)}
        </p>
        <p className="text-xs text-black/45">
          {isOff
            ? "Unavailable"
            : `${formatTimeOfDay(range.start_time!)} – ${formatTimeOfDay(
                range.end_time!
              )}`}
          {range.note ? ` · ${range.note}` : ""}
        </p>
      </div>
      <button
        type="button"
        onClick={() => onRemove(range.from, range.to)}
        className="text-xs font-medium text-black/35 hover:text-[#CB4538] transition-colors shrink-0"
      >
        Remove
      </button>
    </div>
  );
}
