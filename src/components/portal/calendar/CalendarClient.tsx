"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Appointment, Trainer, TrainerAvailability } from "@/lib/supabase/types";
import {
  addDays,
  addMonths,
  formatPeriodLabel,
  parseDatetimeLocal,
  toDatetimeLocal,
} from "@/lib/portal/date-utils";
import { buildTrainerColorMap } from "./colors";
import { DayView } from "./DayView";
import { WeekView } from "./WeekView";
import { MonthView } from "./MonthView";
import { TrainerSidebar } from "./TrainerSidebar";
import { AppointmentModal, type AppointmentFormValues } from "./AppointmentModal";

type ViewMode = "day" | "week" | "month";

interface CalendarClientProps {
  currentTrainer: Trainer;
  trainers: Trainer[];
  initialAppointments: Appointment[];
  availability: TrainerAvailability[];
}

export function CalendarClient({
  currentTrainer,
  trainers,
  initialAppointments,
  availability,
}: CalendarClientProps) {
  const router = useRouter();
  const [appointments, setAppointments] = useState(initialAppointments);
  const [view, setView] = useState<ViewMode>("day");
  const [anchorDate, setAnchorDate] = useState(() => new Date());
  const [visibleTrainerIds, setVisibleTrainerIds] = useState(
    () => new Set(trainers.map((t) => t.id))
  );
  const [modalValues, setModalValues] = useState<AppointmentFormValues | null>(
    null
  );
  const [isSyncing, setIsSyncing] = useState(false);

  // initialAppointments only changes when router.refresh() re-runs the
  // server component with fresh data (e.g. after "Sync now") — pick that up.
  useEffect(() => {
    setAppointments(initialAppointments);
    setIsSyncing(false);
  }, [initialAppointments]);

  const handleSyncNow = async () => {
    setIsSyncing(true);
    try {
      await fetch("/api/portal/google/sync-now", { method: "POST" });
    } finally {
      router.refresh();
    }
  };

  const isOwner = currentTrainer.role === "owner";
  const trainerColorMap = useMemo(() => buildTrainerColorMap(trainers), [trainers]);
  const visibleTrainers = useMemo(
    () => trainers.filter((t) => visibleTrainerIds.has(t.id)),
    [trainers, visibleTrainerIds]
  );

  const toggleTrainer = (id: string) => {
    setVisibleTrainerIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const goToday = () => setAnchorDate(new Date());
  const goPrev = () =>
    setAnchorDate((d) =>
      view === "day" ? addDays(d, -1) : view === "week" ? addDays(d, -7) : addMonths(d, -1)
    );
  const goNext = () =>
    setAnchorDate((d) =>
      view === "day" ? addDays(d, 1) : view === "week" ? addDays(d, 7) : addMonths(d, 1)
    );

  const openCreateAt = (trainerId: string, start: Date) => {
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    setModalValues({
      id: null,
      trainer_id: trainerId,
      client_name: "",
      start_time: toDatetimeLocal(start),
      end_time: toDatetimeLocal(end),
      notes: "",
    });
  };

  const openCreateDefault = () => {
    const start = new Date();
    start.setMinutes(0, 0, 0);
    start.setHours(start.getHours() + 1);
    openCreateAt(currentTrainer.id, start);
  };

  const openEdit = (appt: Appointment) => {
    setModalValues({
      id: appt.id,
      trainer_id: appt.trainer_id,
      client_name: appt.client_name,
      start_time: toDatetimeLocal(new Date(appt.start_time)),
      end_time: toDatetimeLocal(new Date(appt.end_time)),
      notes: appt.notes ?? "",
    });
  };

  const editingAppt = modalValues?.id
    ? appointments.find((a) => a.id === modalValues.id) ?? null
    : null;

  const handleSave = async (
    values: AppointmentFormValues
  ): Promise<string | null> => {
    // repeatWeeks only applies to brand-new appointments — each occurrence
    // is created independently (its own row, its own Google event), just
    // shifted a week apart from the last.
    const occurrences =
      !values.id && values.repeatWeeks ? Math.max(1, values.repeatWeeks) : 1;
    const baseStart = parseDatetimeLocal(values.start_time) ?? new Date();
    const baseEnd = parseDatetimeLocal(values.end_time) ?? new Date();
    const created: Appointment[] = [];

    for (let i = 0; i < occurrences; i++) {
      const start = new Date(baseStart);
      start.setDate(start.getDate() + i * 7);
      const end = new Date(baseEnd);
      end.setDate(end.getDate() + i * 7);

      const payload = {
        trainer_id: values.trainer_id,
        client_name: values.client_name,
        start_time: start.toISOString(),
        end_time: end.toISOString(),
        notes: values.notes || null,
      };

      const res = await fetch(
        values.id
          ? `/api/portal/appointments/${values.id}`
          : "/api/portal/appointments",
        {
          method: values.id ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const json = await res.json();

      if (!res.ok) {
        const message = json.error ?? "Something went wrong.";
        return occurrences > 1 ? `Week ${i + 1} of ${occurrences}: ${message}` : message;
      }
      created.push(json.appointment);
    }

    setAppointments((prev) =>
      values.id
        ? prev.map((a) => (a.id === values.id ? created[0] : a))
        : [...prev, ...created]
    );
    setModalValues(null);
    router.refresh();
    return null;
  };

  const handleCancelAppointment = async () => {
    if (!modalValues?.id) return;
    const res = await fetch(`/api/portal/appointments/${modalValues.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "canceled" }),
    });
    const json = await res.json();
    if (res.ok) {
      setAppointments((prev) =>
        prev.map((a) => (a.id === modalValues.id ? json.appointment : a))
      );
      setModalValues(null);
      router.refresh();
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center rounded-full border border-black/10 overflow-hidden">
            <button
              onClick={goPrev}
              aria-label="Previous"
              className="w-8 h-8 flex items-center justify-center text-black/50 hover:bg-black/5 transition-colors"
            >
              ‹
            </button>
            <button
              onClick={goToday}
              className="px-3 h-8 text-xs font-semibold text-black/60 hover:bg-black/5 transition-colors border-x border-black/10"
            >
              Today
            </button>
            <button
              onClick={goNext}
              aria-label="Next"
              className="w-8 h-8 flex items-center justify-center text-black/50 hover:bg-black/5 transition-colors"
            >
              ›
            </button>
          </div>
          <h2 className="font-display text-xl text-black">
            {formatPeriodLabel(view, anchorDate)}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-full border border-black/10 p-0.5">
            {(["day", "week", "month"] as ViewMode[]).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold capitalize transition-colors ${
                  view === v
                    ? "bg-black text-white"
                    : "text-black/50 hover:text-black"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
          <button
            onClick={handleSyncNow}
            disabled={isSyncing}
            aria-label="Sync now"
            title="Sync now"
            className="w-9 h-9 rounded-full border border-black/10 flex items-center justify-center text-black/50 hover:text-black hover:bg-black/5 transition-colors disabled:opacity-50"
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={isSyncing ? "animate-spin" : ""}
            >
              <path d="M3 12a9 9 0 0 1 15.36-6.36L21 8" />
              <path d="M21 3v5h-5" />
              <path d="M21 12a9 9 0 0 1-15.36 6.36L3 16" />
              <path d="M3 21v-5h5" />
            </svg>
          </button>
          <button onClick={openCreateDefault} className="btn-primary text-sm !py-2.5">
            + New appointment
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <TrainerSidebar
          trainers={trainers}
          currentTrainerId={currentTrainer.id}
          visibleIds={visibleTrainerIds}
          onToggle={toggleTrainer}
          onShowAll={() => setVisibleTrainerIds(new Set(trainers.map((t) => t.id)))}
          onShowNone={() => setVisibleTrainerIds(new Set())}
          trainerColorMap={trainerColorMap}
          availability={availability}
        />

        <div className="flex-1 min-w-0">
          {view === "day" && (
            <DayView
              date={anchorDate}
              trainers={visibleTrainers}
              currentTrainer={currentTrainer}
              appointments={appointments}
              availability={availability}
              trainerColorMap={trainerColorMap}
              onSlotClick={openCreateAt}
              onEventClick={openEdit}
            />
          )}
          {view === "week" && (
            <WeekView
              anchorDate={anchorDate}
              trainers={visibleTrainers}
              appointments={appointments}
              trainerColorMap={trainerColorMap}
              onDayHeaderClick={(date) => {
                setAnchorDate(date);
                setView("day");
              }}
              onEventClick={openEdit}
            />
          )}
          {view === "month" && (
            <MonthView
              anchorDate={anchorDate}
              trainers={visibleTrainers}
              appointments={appointments}
              trainerColorMap={trainerColorMap}
              onDayClick={(date) => {
                setAnchorDate(date);
                setView("day");
              }}
            />
          )}
        </div>
      </div>

      {modalValues && (
        <AppointmentModal
          initial={modalValues}
          trainers={trainers}
          canPickTrainer={isOwner}
          canManage={
            !modalValues.id ||
            isOwner ||
            editingAppt?.trainer_id === currentTrainer.id
          }
          isCanceled={editingAppt?.status === "canceled"}
          onSave={handleSave}
          onCancelAppointment={
            modalValues.id ? handleCancelAppointment : undefined
          }
          onClose={() => setModalValues(null)}
        />
      )}
    </div>
  );
}
