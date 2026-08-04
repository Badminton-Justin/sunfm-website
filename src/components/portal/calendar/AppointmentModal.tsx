"use client";

import { useState } from "react";
import type { Trainer } from "@/lib/supabase/types";
import {
  buildAppointmentName,
  parseAppointmentName,
  type AppointmentType,
} from "@/lib/portal/client-display";
import { parseDatetimeLocal, toDatetimeLocal } from "@/lib/portal/date-utils";
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
  repeatWeeks?: number; // total occurrences (including the first) — new appointments only
}

interface AppointmentModalProps {
  initial: AppointmentFormValues;
  trainers: Trainer[];
  canPickTrainer: boolean;
  canManage: boolean; // owner, or this trainer's own appointment — gates cancel
  isCanceled?: boolean;
  isSeries?: boolean; // booked as part of a "Repeat weekly" batch
  onSave: (
    values: AppointmentFormValues,
    scope: SeriesScope
  ) => Promise<string | null>; // returns error message, or null on success
  onCancelAppointment?: () => Promise<void>;
  onRestore?: () => Promise<string | null>;
  onDelete?: (scope: SeriesScope) => Promise<string | null>;
  onClose: () => void;
}

const TYPE_OPTIONS: { value: AppointmentType; label: string }[] = [
  { value: "session", label: "Session" },
  { value: "consultation", label: "Consultation" },
];

const DEFAULT_DURATION = 60;

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
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [confirming, setConfirming] = useState<"cancel" | "delete" | null>(null);
  const [scopeAsk, setScopeAsk] = useState<"save" | "delete" | null>(null);
  const [isWorking, setIsWorking] = useState(false);

  // An already-canceled appointment has nothing left to cancel; it gets
  // restore instead, which re-books it and rebuilds the Google event.
  const showCancel = !isCanceled && !!onCancelAppointment;
  const showRestore = !!isCanceled && !!onRestore;

  const runRestore = async () => {
    setError("");
    setIsWorking(true);
    const err = await onRestore?.();
    setIsWorking(false);
    if (err) setError(err);
  };

  const startMinutes = minuteOfDay(schedule.start);
  const endAt = new Date(schedule.start.getTime() + schedule.duration * 60000);
  // The push path deliberately doesn't create Google events for sessions that
  // have already finished, so restoring one only changes the portal.
  const hasHappened = endAt.getTime() < Date.now();

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // One of a repeat batch: ask whether the edit lands on this session alone
    // or carries through the rest before writing anything.
    if (isSeries) {
      setScopeAsk("save");
      return;
    }
    await runSave("one");
  };

  const runSave = async (scope: SeriesScope) => {
    setError("");
    setIsSaving(true);
    const err = await onSave(
      {
        ...form,
        client_name: buildAppointmentName(apptType, nameOnly),
        start_time: toDatetimeLocal(schedule.start),
        end_time: toDatetimeLocal(endAt),
        repeatWeeks: isNew && repeatWeekly ? repeatWeeks : undefined,
      },
      scope
    );
    setIsSaving(false);
    setScopeAsk(null);
    if (err) setError(err);
  };

  // Cancel keeps the row (struck through on the calendar); delete drops it for
  // good, here and on Google Calendar. Both close the modal on success.
  const runConfirmed = async (scope: SeriesScope = "one") => {
    setError("");
    setIsWorking(true);
    let err: string | null = null;
    if (confirming === "delete" || scopeAsk === "delete") {
      err = (await onDelete?.(scope)) ?? null;
    } else {
      await onCancelAppointment?.();
    }
    setIsWorking(false);
    if (err) {
      setError(err);
      setConfirming(null);
      setScopeAsk(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center px-4 z-50">
      <div className="bg-[#FDFCF8] rounded-[28px] shadow-2xl p-7 w-full max-w-md border border-black/[0.06] max-h-[90vh] overflow-y-auto">
        {isCanceled && (
          <div className="mb-4 rounded-xl bg-black/[0.04] border border-black/[0.07] px-3.5 py-2.5">
            <p className="text-sm font-semibold text-black/70">
              This appointment is canceled
            </p>
            <p className="text-xs text-black/45 mt-0.5">
              {hasHappened
                ? "It was removed from Google Calendar. Restoring books it again here — past sessions aren't re-added to Google."
                : "It was removed from Google Calendar. Restoring puts the event back."}
            </p>
          </div>
        )}
        <h2 className="font-display text-2xl text-black mb-5">
          {form.id ? "Edit appointment" : "New appointment"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-5">
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
                <div className="flex items-center gap-2 mt-3 pl-[26px]">
                  <span className="text-sm text-black/60">for</span>
                  <input
                    type="number"
                    min={2}
                    max={52}
                    value={repeatWeeks}
                    onChange={(e) =>
                      setRepeatWeeks(
                        Math.min(52, Math.max(2, Number(e.target.value) || 2))
                      )
                    }
                    className="w-16 px-2 py-1.5 rounded-lg border border-black/10 bg-white text-sm text-center focus:outline-none focus:border-[#CB4538] transition-colors"
                  />
                  <span className="text-sm text-black/60">weeks</span>
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

          {error && (
            <p className="text-[#CB4538] text-sm font-medium">{error}</p>
          )}

          <div className="flex gap-3 pt-1">
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
                      onClick={() => runConfirmed("one")}
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
                      onClick={() => setConfirming("cancel")}
                      className="text-[#CB4538]/70 hover:text-[#CB4538] transition-colors"
                    >
                      Cancel appointment
                    </button>
                  )}
                  {showRestore && (
                    <button
                      type="button"
                      onClick={runRestore}
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
                      onClick={() =>
                        isSeries ? setScopeAsk("delete") : setConfirming("delete")
                      }
                      className="text-black/40 hover:text-[#CB4538] transition-colors"
                    >
                      Delete permanently
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </form>
      </div>

      {scopeAsk && (
        <SeriesScopeDialog
          title="This appointment repeats"
          detail={
            scopeAsk === "delete"
              ? "Deleting also removes it from Google Calendar, and can't be undone."
              : "Later sessions shift by the same amount and pick up the same details."
          }
          oneLabel={
            scopeAsk === "delete" ? "Delete this appointment" : "Save this appointment"
          }
          followingLabel={
            scopeAsk === "delete"
              ? "Delete this and all later ones"
              : "Save this and all later ones"
          }
          destructive={scopeAsk === "delete"}
          busy={isSaving || isWorking}
          onChoose={(scope) =>
            scopeAsk === "delete" ? runConfirmed(scope) : runSave(scope)
          }
          onCancel={() => setScopeAsk(null)}
        />
      )}
    </div>
  );
}
