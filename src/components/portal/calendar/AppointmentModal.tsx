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
  onSave: (values: AppointmentFormValues) => Promise<string | null>; // returns error message, or null on success
  onCancelAppointment?: () => Promise<void>;
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
  onSave,
  onCancelAppointment,
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
  const [isCanceling, setIsCanceling] = useState(false);

  const startMinutes = minuteOfDay(schedule.start);
  const endAt = new Date(schedule.start.getTime() + schedule.duration * 60000);

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
    setError("");
    setIsSaving(true);
    const err = await onSave({
      ...form,
      client_name: buildAppointmentName(apptType, nameOnly),
      start_time: toDatetimeLocal(schedule.start),
      end_time: toDatetimeLocal(endAt),
      repeatWeeks: isNew && repeatWeekly ? repeatWeeks : undefined,
    });
    setIsSaving(false);
    if (err) setError(err);
  };

  const handleCancelAppointment = async () => {
    if (!onCancelAppointment) return;
    if (!confirm(`Cancel the appointment with ${nameOnly}?`)) return;
    setIsCanceling(true);
    await onCancelAppointment();
    setIsCanceling(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center px-4 z-50">
      <div className="bg-[#FDFCF8] rounded-[28px] shadow-2xl p-7 w-full max-w-md border border-black/[0.06] max-h-[90vh] overflow-y-auto">
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

          {form.id && canManage && !isCanceled && onCancelAppointment && (
            <div className="flex pt-3 border-t border-black/[0.06]">
              <button
                type="button"
                onClick={handleCancelAppointment}
                disabled={isCanceling}
                className="flex-1 text-sm font-medium text-[#CB4538]/70 hover:text-[#CB4538] transition-colors disabled:opacity-50"
              >
                {isCanceling ? "Canceling…" : "Cancel appointment"}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
