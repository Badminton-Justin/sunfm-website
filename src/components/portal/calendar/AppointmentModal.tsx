"use client";

import { useState } from "react";
import type {
  Appointment,
  AvailabilityOverride,
  Trainer,
  TrainerAvailability,
} from "@/lib/supabase/types";
import { coverageFor } from "@/lib/portal/availability";
import {
  trainerFreeBusy,
  type TrainerFreeBusy,
} from "@/lib/portal/trainer-freebusy";
import {
  buildAppointmentName,
  parseAppointmentName,
  type AppointmentType,
} from "@/lib/portal/client-display";
import { parseDatetimeLocal, toDatetimeLocal } from "@/lib/portal/date-utils";
import {
  MAX_FIXED_WEEKS,
  OPEN_ENDED_HORIZON_DAYS,
  type RepeatSpec,
} from "@/lib/portal/recurrence";
import {
  endTimeOptions,
  minuteOfDay,
  startTimeOptions,
} from "@/lib/portal/time-options";
import { Select } from "@/components/portal/Select";
import { DatePicker } from "@/components/portal/DatePicker";
import { SeriesScopeDialog, type SeriesScope } from "./SeriesScopeDialog";

export interface AppointmentFormValues {
  id: string | null;
  trainer_id: string;
  client_name: string;
  start_time: string; // datetime-local value
  end_time: string;
  notes: string;
  // New appointments only. weeks counts occurrences including the first;
  // indefinite ignores it and books to the rolling horizon instead.
  repeat?: RepeatSpec;
}

interface AppointmentModalProps {
  initial: AppointmentFormValues;
  trainers: Trainer[];
  canPickTrainer: boolean;
  canManage: boolean; // owner, or this trainer's own appointment — gates cancel
  isCanceled?: boolean;
  isSeries?: boolean; // booked as part of a "Repeat weekly" batch
  // Warns when the chosen time falls outside the trainer's hours. Never
  // blocks — the 6am on your day off is exactly the booking you'd want.
  availability: TrainerAvailability[];
  overrides: AvailabilityOverride[];
  // Booking yourself, the weekly-hours warning is telling you something you
  // already know: you set those hours and you're choosing to work outside
  // them. It stays for everyone else's calendar, where it's news.
  currentTrainerId: string;
  // Every appointment on the calendar, so the picker can say who is already
  // booked at the chosen time rather than only who is within their hours.
  appointments: Appointment[];
  onSave: (
    values: AppointmentFormValues,
    scope: SeriesScope
  ) => Promise<string | null>; // returns error message, or null on success
  onCancelAppointment?: (scope: SeriesScope) => Promise<string | null>;
  onRestore?: (scope: SeriesScope) => Promise<string | null>;
  onDelete?: (scope: SeriesScope) => Promise<string | null>;
  onClose: () => void;
}

type Action = "save" | "cancel" | "restore" | "delete";

const TYPE_OPTIONS: { value: AppointmentType; label: string }[] = [
  { value: "session", label: "Session" },
  { value: "consultation", label: "Consultation" },
];

const DEFAULT_DURATION = 60;

const SCOPE_COPY: Record<
  Action,
  { verb: string; detail: string; destructive?: boolean }
> = {
  save: {
    verb: "Save",
    detail:
      "Later sessions shift by the same amount and pick up the same details.",
  },
  cancel: {
    verb: "Cancel",
    detail:
      "Canceling takes it off Google Calendar. The booking stays here, struck through, and can be restored.",
    destructive: true,
  },
  restore: {
    verb: "Restore",
    detail: "Books it again and puts the Google Calendar event back.",
  },
  delete: {
    verb: "Delete",
    detail:
      "Deleting also removes it from Google Calendar, and can't be undone.",
    destructive: true,
  },
};

// The form thinks in "when it starts" + "how long it runs"; the two
// datetime-local strings the caller wants are derived from that on save.
function initialSchedule(initial: AppointmentFormValues) {
  const start = parseDatetimeLocal(initial.start_time) ?? new Date();
  const end = parseDatetimeLocal(initial.end_time);
  const minutes = end
    ? Math.round((end.getTime() - start.getTime()) / 60000)
    : DEFAULT_DURATION;
  return { start, duration: minutes > 0 ? minutes : DEFAULT_DURATION };
}

export function AppointmentModal({
  initial,
  trainers,
  canPickTrainer,
  canManage,
  isCanceled,
  isSeries,
  availability,
  overrides,
  currentTrainerId,
  appointments,
  onSave,
  onCancelAppointment,
  onRestore,
  onDelete,
  onClose,
}: AppointmentModalProps) {
  const parsed = parseAppointmentName(initial.client_name);
  const isNew = !initial.id;

  const [form, setForm] = useState(initial);
  const [schedule, setSchedule] = useState(() => initialSchedule(initial));
  const [apptType, setApptType] = useState<AppointmentType>(parsed.type);
  const [nameOnly, setNameOnly] = useState(parsed.name);
  const [repeatWeekly, setRepeatWeekly] = useState(false);
  const [repeatWeeks, setRepeatWeeks] = useState(4);
  const [repeatForever, setRepeatForever] = useState(false);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [confirming, setConfirming] = useState<"cancel" | "delete" | null>(null);
  const [scopeAsk, setScopeAsk] = useState<Action | null>(null);
  const [isWorking, setIsWorking] = useState(false);

  // An already-canceled appointment has nothing left to cancel; it gets
  // restore instead, which re-books it and rebuilds the Google event.
  const showCancel = !isCanceled && !!onCancelAppointment;
  const showRestore = !!isCanceled && !!onRestore;

  const startMinutes = minuteOfDay(schedule.start);
  const endAt = new Date(schedule.start.getTime() + schedule.duration * 60000);

  const coverage = coverageFor(
    schedule.start,
    endAt,
    form.trainer_id,
    availability,
    overrides
  );
  const trainerName =
    trainers.find((t) => t.id === form.trainer_id)?.name ?? "this trainer";

  // An explicit override still shows on your own calendar: you named that date
  // off, and a booking landing in the middle of it is worth a second look.
  // Who could take this slot, recomputed as the date and time change. Owners
  // get it as a picker: the point is to answer "who's free at 10?" without
  // opening the dropdown and checking each name one at a time.
  const freeBusy = trainerFreeBusy(
    schedule.start,
    endAt,
    trainers,
    appointments,
    availability,
    overrides,
    initial.id
  );

  const bookingSelf = form.trainer_id === currentTrainerId;
  const showCoverageWarning =
    !coverage.covered &&
    (!bookingSelf || coverage.availability.isUnavailable);

  const setStartDate = (date: Date) => {
    setSchedule((s) => {
      const start = new Date(s.start);
      start.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
      return { ...s, start };
    });
  };

  const setStartMinutes = (minutes: number) => {
    setSchedule((s) => {
      const start = new Date(s.start);
      start.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0);
      return { ...s, start };
    });
  };

  // Every write goes through here. One of a repeat batch asks whether it lands
  // on this session alone or carries through the later ones first; a one-off
  // goes straight through as "one", which the server treats the same way.
  const start = (action: Action) => {
    if (isSeries) {
      setScopeAsk(action);
      return;
    }
    if (action === "save" || action === "restore") {
      void run(action, "one");
      return;
    }
    setConfirming(action); // cancel and delete confirm before firing
  };

  const run = async (action: Action, scope: SeriesScope) => {
    setError("");
    const busy = action === "save" ? setIsSaving : setIsWorking;
    busy(true);
    let err: string | null = null;
    if (action === "save") {
      err = await onSave(
        {
          ...form,
          client_name: buildAppointmentName(apptType, nameOnly),
          start_time: toDatetimeLocal(schedule.start),
          end_time: toDatetimeLocal(endAt),
          repeat:
            isNew && repeatWeekly
              ? repeatForever
                ? { indefinite: true }
                : { weeks: repeatWeeks }
              : undefined,
        },
        scope
      );
    } else if (action === "delete") {
      err = (await onDelete?.(scope)) ?? null;
    } else if (action === "cancel") {
      err = (await onCancelAppointment?.(scope)) ?? null;
    } else {
      err = (await onRestore?.(scope)) ?? null;
    }
    busy(false);
    setScopeAsk(null);
    if (err) {
      setError(err);
      setConfirming(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    start("save");
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center px-4 z-50">
      <div className="bg-[#FDFCF8] rounded-[28px] shadow-2xl w-full max-w-md border border-black/[0.06] max-h-[90vh] flex flex-col overflow-hidden">
        <div className="shrink-0 px-7 pt-7">
        {isCanceled && (
          <div className="mb-4 rounded-xl bg-black/[0.04] border border-black/[0.07] px-3.5 py-2.5">
            <p className="text-sm font-semibold text-black/70">
              This appointment is canceled
            </p>
            <p className="text-xs text-black/45 mt-0.5">
              It was removed from Google Calendar. Restoring puts the event
              back.
            </p>
          </div>
        )}
        <h2 className="font-display text-2xl text-black mb-5">
          {form.id ? "Edit appointment" : "New appointment"}
        </h2>
        </div>
        {/* Header and actions stay put; only the fields between them scroll,
            so Cancel and Delete can't slide off the bottom of a tall form. */}
        <form onSubmit={handleSubmit} className="flex flex-col min-h-0 flex-1">
          <div className="flex-1 overflow-y-auto px-7 pb-1 space-y-5">
          {canPickTrainer && (
            <div>
              <label className="portal-kicker block mb-1.5">Trainer</label>
              <Select
                value={form.trainer_id}
                onChange={(e) =>
                  setForm({ ...form, trainer_id: e.target.value })
                }
              >
                {trainers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </Select>
            </div>
          )}

          <div>
            <label className="portal-kicker block mb-1.5">Type</label>
            <div className="flex items-center rounded-full border border-black/10 p-0.5 w-fit">
              {TYPE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setApptType(opt.value)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                    apptType === opt.value
                      ? "bg-black text-white"
                      : "text-black/50 hover:text-black"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="portal-kicker block mb-1.5">Client name</label>
            <input
              type="text"
              required
              value={nameOnly}
              onChange={(e) => setNameOnly(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-black/10 bg-white focus:outline-none focus:border-[#CB4538] transition-colors"
              placeholder="e.g. Jane Doe (placeholder for now)"
            />
          </div>

          <div>
            <label className="portal-kicker block mb-1.5">When</label>
            <DatePicker
              value={schedule.start}
              onChange={setStartDate}
              ariaLabel="Appointment date"
            />
            <div className="grid grid-cols-2 gap-3 mt-2.5">
              <div>
                <label
                  htmlFor="appt-start-time"
                  className="block text-[11px] font-medium text-black/40 mb-1"
                >
                  Starts
                </label>
                <Select
                  id="appt-start-time"
                  value={startMinutes}
                  onChange={(e) => setStartMinutes(Number(e.target.value))}
                >
                  {startTimeOptions(startMinutes).map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <label
                  htmlFor="appt-end-time"
                  className="block text-[11px] font-medium text-black/40 mb-1"
                >
                  Ends
                </label>
                <Select
                  id="appt-end-time"
                  value={schedule.duration}
                  onChange={(e) =>
                    setSchedule((s) => ({ ...s, duration: Number(e.target.value) }))
                  }
                >
                  {endTimeOptions(startMinutes, schedule.duration).map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
          </div>

          {canPickTrainer && (
            <div>
              <label className="portal-kicker block mb-1.5">Who's free</label>
              <div className="flex flex-wrap gap-1.5">
                {freeBusy.map((row) => (
                  <FreeBusyChip
                    key={row.trainer.id}
                    row={row}
                    selected={row.trainer.id === form.trainer_id}
                    onSelect={() =>
                      setForm({ ...form, trainer_id: row.trainer.id })
                    }
                  />
                ))}
              </div>
            </div>
          )}

          {showCoverageWarning && (
            <div className="rounded-xl bg-[#B8860B]/10 px-3.5 py-2.5">
              <p className="text-sm font-medium text-[#8A6508]">
                {coverage.availability.isUnavailable
                  ? `${trainerName} is marked unavailable that day${
                      coverage.availability.note
                        ? ` — ${coverage.availability.note}`
                        : ""
                    }.`
                  : coverage.availability.windows.length === 0
                  ? `${trainerName} has no hours set for that day.`
                  : `That's outside ${trainerName}'s hours for that day.`}
              </p>
              <p className="text-xs text-[#8A6508]/70 mt-0.5">
                You can still book it.
              </p>
            </div>
          )}

          {isNew && (
            <div className="rounded-xl border border-black/10 px-3.5 py-3">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={repeatWeekly}
                  onChange={(e) => setRepeatWeekly(e.target.checked)}
                  className="w-4 h-4 accent-[#CB4538]"
                />
                <span className="text-sm font-medium text-black">
                  Repeat weekly
                </span>
              </label>
              {repeatWeekly && (
                <div className="mt-3 pl-[26px] space-y-2.5">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="radio"
                      name="repeat-mode"
                      checked={!repeatForever}
                      onChange={() => setRepeatForever(false)}
                      className="w-3.5 h-3.5 accent-[#CB4538]"
                    />
                    <span className="text-sm text-black/60">for</span>
                    <input
                      type="number"
                      min={2}
                      max={MAX_FIXED_WEEKS}
                      value={repeatWeeks}
                      onFocus={() => setRepeatForever(false)}
                      onChange={(e) =>
                        setRepeatWeeks(
                          Math.min(
                            MAX_FIXED_WEEKS,
                            Math.max(2, Number(e.target.value) || 2)
                          )
                        )
                      }
                      className="w-16 px-2 py-1.5 rounded-lg border border-black/10 bg-white text-sm text-center focus:outline-none focus:border-[#CB4538] transition-colors"
                    />
                    <span className="text-sm text-black/60">weeks</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="radio"
                      name="repeat-mode"
                      checked={repeatForever}
                      onChange={() => setRepeatForever(true)}
                      className="w-3.5 h-3.5 accent-[#CB4538]"
                    />
                    <span className="text-sm text-black/60">
                      indefinitely
                    </span>
                  </label>

                  {repeatForever && (
                    <p className="text-xs text-black/40 leading-relaxed">
                      Books {OPEN_ENDED_HORIZON_DAYS / 7} weeks ahead and keeps
                      extending nightly. Ends when you cancel or delete this and
                      all later ones.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          <div>
            <label className="portal-kicker block mb-1.5">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={2}
              className="w-full px-3 py-2.5 rounded-xl border border-black/10 bg-white focus:outline-none focus:border-[#CB4538] transition-colors resize-none"
            />
          </div>

          </div>

          <div className="shrink-0 px-7 pt-4 pb-7 border-t border-black/[0.06] space-y-3">
          {error && (
            <p className="text-[#CB4538] text-sm font-medium">{error}</p>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-full border border-black/15 text-black/60 font-medium hover:bg-black/5 transition-colors"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 btn-primary !py-2.5 disabled:opacity-50"
            >
              {isSaving ? "Saving…" : "Save"}
            </button>
          </div>

          {form.id && canManage && (showCancel || showRestore || onDelete) && (
            <div className="pt-3 border-t border-black/[0.06]">
              {confirming ? (
                <div>
                  <p className="text-sm text-black/60 text-center mb-3">
                    {confirming === "delete"
                      ? `Delete ${nameOnly || "this appointment"} for good? It also disappears from Google Calendar, and this can't be undone.`
                      : `Cancel the appointment with ${nameOnly}? It stays on the calendar, struck through.`}
                  </p>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setConfirming(null)}
                      disabled={isWorking}
                      className="flex-1 px-4 py-2 rounded-full border border-black/15 text-black/60 text-sm font-medium hover:bg-black/5 transition-colors disabled:opacity-50"
                    >
                      Keep it
                    </button>
                    <button
                      type="button"
                      onClick={() => run(confirming, "one")}
                      disabled={isWorking}
                      className="flex-1 px-4 py-2 rounded-full bg-[#CB4538] text-white text-sm font-semibold hover:bg-[#B03B30] transition-colors disabled:opacity-50"
                    >
                      {isWorking
                        ? "Working…"
                        : confirming === "delete"
                        ? "Delete"
                        : "Cancel it"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-4 text-sm font-medium">
                  {showCancel && (
                    <button
                      type="button"
                      onClick={() => start("cancel")}
                      className="text-[#CB4538]/70 hover:text-[#CB4538] transition-colors"
                    >
                      Cancel appointment
                    </button>
                  )}
                  {showRestore && (
                    <button
                      type="button"
                      onClick={() => start("restore")}
                      disabled={isWorking}
                      className="font-semibold text-black hover:opacity-70 transition-opacity disabled:opacity-50"
                    >
                      {isWorking ? "Restoring…" : "Restore appointment"}
                    </button>
                  )}
                  {(showCancel || showRestore) && onDelete && (
                    <span className="text-black/15" aria-hidden="true">
                      |
                    </span>
                  )}
                  {onDelete && (
                    <button
                      type="button"
                      onClick={() => start("delete")}
                      className="text-black/40 hover:text-[#CB4538] transition-colors"
                    >
                      Delete permanently
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
          </div>
        </form>
      </div>

      {scopeAsk && (
        <SeriesScopeDialog
          title="This appointment repeats"
          detail={SCOPE_COPY[scopeAsk].detail}
          oneLabel={`${SCOPE_COPY[scopeAsk].verb} this appointment`}
          followingLabel={`${SCOPE_COPY[scopeAsk].verb} this and all later ones`}
          destructive={SCOPE_COPY[scopeAsk].destructive}
          busy={isSaving || isWorking}
          onChoose={(scope) => run(scopeAsk, scope)}
          onCancel={() => setScopeAsk(null)}
        />
      )}
    </div>
  );
}

// One trainer's answer for the chosen slot. Selectable whatever it says —
// "booked" is information, not a veto, same as the warning below it.
function FreeBusyChip({
  row,
  selected,
  onSelect,
}: {
  row: TrainerFreeBusy;
  selected: boolean;
  onSelect: () => void;
}) {
  const detail =
    row.state === "booked"
      ? parseAppointmentName(row.conflict!.client_name).name
      : row.state === "off"
      ? row.note ?? "day off"
      : row.state === "outside"
      ? "outside hours"
      : null;

  const tone =
    row.state === "free"
      ? "border-[#3F6E52]/30 bg-[#3F6E52]/10 text-[#2F5540]"
      : row.state === "booked"
      ? "border-[#CB4538]/25 bg-[#CB4538]/[0.07] text-[#8A2F26]"
      : "border-black/10 bg-black/[0.03] text-black/50";

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors ${tone} ${
        selected
          ? "ring-2 ring-black ring-offset-1 ring-offset-[#FDFCF8]"
          : "hover:brightness-95"
      }`}
    >
      <span
        aria-hidden="true"
        className={`w-1.5 h-1.5 rounded-full ${
          row.state === "free"
            ? "bg-[#3F6E52]"
            : row.state === "booked"
            ? "bg-[#CB4538]"
            : "bg-black/25"
        }`}
      />
      <span className="font-medium">{row.trainer.name}</span>
      {detail && <span className="opacity-70 truncate max-w-[10rem]">{detail}</span>}
    </button>
  );
}
