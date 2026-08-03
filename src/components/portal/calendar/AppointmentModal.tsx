"use client";

import { useState } from "react";
import type { Trainer } from "@/lib/supabase/types";
import {
  buildAppointmentName,
  parseAppointmentName,
  type AppointmentType,
} from "@/lib/portal/client-display";
import { Select } from "@/components/portal/Select";

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
  const [apptType, setApptType] = useState<AppointmentType>(parsed.type);
  const [nameOnly, setNameOnly] = useState(parsed.name);
  const [repeatWeekly, setRepeatWeekly] = useState(false);
  const [repeatWeeks, setRepeatWeeks] = useState(4);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSaving(true);
    const err = await onSave({
      ...form,
      client_name: buildAppointmentName(apptType, nameOnly),
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

          <div className="space-y-4">
            <div>
              <label className="portal-kicker block mb-1.5">Start</label>
              <input
                type="datetime-local"
                required
                value={form.start_time}
                onChange={(e) =>
                  setForm({ ...form, start_time: e.target.value })
                }
                className="w-full px-3 py-2.5 rounded-xl border border-black/10 bg-white focus:outline-none focus:border-[#CB4538] transition-colors"
              />
            </div>
            <div>
              <label className="portal-kicker block mb-1.5">End</label>
              <input
                type="datetime-local"
                required
                value={form.end_time}
                onChange={(e) =>
                  setForm({ ...form, end_time: e.target.value })
                }
                className="w-full px-3 py-2.5 rounded-xl border border-black/10 bg-white focus:outline-none focus:border-[#CB4538] transition-colors"
              />
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
