"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CALENDAR_VIEWS,
  type Appointment,
  type AvailabilityOverride,
  type CalendarView,
  type Trainer,
  type TrainerAvailability,
} from "@/lib/supabase/types";
import {
  addDays,
  addMonths,
  formatPeriodLabel,
  parseDatetimeLocal,
  toDatetimeLocal,
} from "@/lib/portal/date-utils";
import {
  GYM_TIME_ZONE,
  gymNow,
  isoFromWallClock,
  wallClockFromIso,
} from "@/lib/portal/timezone";
import { compactClientName } from "@/lib/portal/client-display";
import { buildTrainerColorMap } from "./colors";
import { DayView } from "./DayView";
import { WeekView } from "./WeekView";
import { MonthView } from "./MonthView";
import { TrainerSidebar } from "./TrainerSidebar";
import { AppointmentModal, type AppointmentFormValues } from "./AppointmentModal";
import { SeriesScopeDialog, type SeriesScope } from "./SeriesScopeDialog";

interface CalendarClientProps {
  currentTrainer: Trainer;
  trainers: Trainer[];
  initialAppointments: Appointment[];
  availability: TrainerAvailability[];
  overrides: AvailabilityOverride[];
  initialView: CalendarView;
}

export function CalendarClient({
  currentTrainer,
  trainers,
  initialAppointments,
  availability,
  overrides,
  initialView,
}: CalendarClientProps) {
  const router = useRouter();
  const [appointments, setAppointments] = useState(initialAppointments);
  const [view, setView] = useState<CalendarView>(initialView);
  const [anchorDate, setAnchorDate] = useState(() => new Date());
  const [visibleTrainerIds, setVisibleTrainerIds] = useState(
    () => new Set(trainers.map((t) => t.id))
  );
  const [modalValues, setModalValues] = useState<AppointmentFormValues | null>(
    null
  );
  const [isSyncing, setIsSyncing] = useState(false);
  const [moveError, setMoveError] = useState("");
  const [pendingMove, setPendingMove] = useState<{
    original: Appointment;
    optimistic: Appointment;
  } | null>(null);

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

  const openCreateAt = (
    trainerId: string,
    start: Date,
    end = new Date(start.getTime() + 60 * 60 * 1000)
  ) => {
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
    const start = gymNow();
    start.setMinutes(0, 0, 0);
    start.setHours(start.getHours() + 1);
    openCreateAt(currentTrainer.id, start);
  };

  const openEdit = (appt: Appointment) => {
    setModalValues({
      id: appt.id,
      trainer_id: appt.trainer_id,
      client_name: appt.client_name,
      start_time: toDatetimeLocal(wallClockFromIso(appt.start_time)),
      end_time: toDatetimeLocal(wallClockFromIso(appt.end_time)),
      notes: appt.notes ?? "",
    });
  };

  const editingAppt = modalValues?.id
    ? appointments.find((a) => a.id === modalValues.id) ?? null
    : null;

  const handleSave = async (
    values: AppointmentFormValues,
    scope: SeriesScope
  ): Promise<string | null> => {
    // A repeat is expanded server-side. Doing it here meant one request per
    // week, each waiting on its own Google insert — bearable at 4 weeks,
    // unusable for an open-ended booking's ~26.
    const start = parseDatetimeLocal(values.start_time) ?? new Date();
    const end = parseDatetimeLocal(values.end_time) ?? new Date();

    const payload = {
      trainer_id: values.trainer_id,
      client_name: values.client_name,
      start_time: isoFromWallClock(start),
      end_time: isoFromWallClock(end),
      notes: values.notes || null,
      ...(values.id ? { scope } : { repeat: values.repeat }),
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

    if (!res.ok) return json.error ?? "Something went wrong.";

    if (values.id) {
      // A "following" edit also rewrites the later occurrences server-side.
      mergeAppointments(json.appointments ?? [json.appointment]);
    } else {
      const created: Appointment[] = json.appointments ?? [json.appointment];
      setAppointments((prev) => [...prev, ...created]);
    }

    setModalValues(null);
    router.refresh();
    return null;
  };

  const mergeAppointments = (updated: Appointment[]) => {
    setAppointments((prev) =>
      prev.map((a) => updated.find((u) => u.id === a.id) ?? a)
    );
  };

  const canEditAppointment = (appt: Appointment) =>
    isOwner || appt.trainer_id === currentTrainer.id;

  // Drag-to-reschedule. The drop shows immediately — including while the
  // series prompt is up, so the chip doesn't snap back and jump again — and is
  // rolled back if the PATCH is refused or the prompt is dismissed.
  const handleMoveAppointment = (appt: Appointment, newStart: Date) => {
    const durationMs =
      new Date(appt.end_time).getTime() - new Date(appt.start_time).getTime();
    const optimistic = {
      ...appt,
      start_time: isoFromWallClock(newStart),
      end_time: isoFromWallClock(new Date(newStart.getTime() + durationMs)),
    };

    setMoveError("");
    setAppointments((prev) =>
      prev.map((a) => (a.id === appt.id ? optimistic : a))
    );

    if (appt.series_id) {
      setPendingMove({ original: appt, optimistic });
      return;
    }
    void commitMove(appt, optimistic, "one");
  };

  const commitMove = async (
    original: Appointment,
    optimistic: Appointment,
    scope: SeriesScope
  ) => {
    const rollback = () =>
      setAppointments((prev) =>
        prev.map((a) => (a.id === original.id ? original : a))
      );

    const res = await fetch(`/api/portal/appointments/${original.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        start_time: optimistic.start_time,
        end_time: optimistic.end_time,
        scope,
      }),
    });

    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      rollback();
      setMoveError(json.error ?? "Could not move that appointment.");
      return;
    }

    const json = await res.json();
    mergeAppointments(json.appointments ?? [json.appointment]);
    router.refresh();
  };

  // Cancel and restore are the same write: status, plus the scope that decides
  // whether the later occurrences of a repeat come along.
  const setStatus = async (
    status: "booked" | "canceled",
    scope: SeriesScope,
    failureMessage: string
  ): Promise<string | null> => {
    if (!modalValues?.id) return null;
    const res = await fetch(`/api/portal/appointments/${modalValues.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, scope }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) return json.error ?? failureMessage;
    mergeAppointments(json.appointments ?? [json.appointment]);
    setModalValues(null);
    router.refresh();
    return null;
  };

  // Un-cancel. The push path already handles a re-booked appointment: the
  // stored google_event_id points at the event the cancel deleted, Google
  // reports it gone, and a replacement is created in its place.
  const handleRestore = (scope: SeriesScope) =>
    setStatus("booked", scope, "Could not restore the appointment.");

  // Hard delete — the rows go, and the API drops the matching Google Calendar
  // events (queuing the deletions so a later sync can't re-import them).
  const handleDelete = async (scope: SeriesScope): Promise<string | null> => {
    if (!modalValues?.id) return null;
    const res = await fetch(
      `/api/portal/appointments/${modalValues.id}?scope=${scope}`,
      { method: "DELETE" }
    );
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      return json.error ?? "Could not delete the appointment.";
    }
    const removed = new Set<string>(json.deletedIds ?? [modalValues.id]);
    setAppointments((prev) => prev.filter((a) => !removed.has(a.id)));
    setModalValues(null);
    router.refresh();
    return null;
  };

  const handleCancelAppointment = (scope: SeriesScope) =>
    setStatus("canceled", scope, "Could not cancel the appointment.");

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
            {CALENDAR_VIEWS.map((v) => (
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
          {moveError && (
            <div className="mb-3 flex items-center justify-between gap-3 rounded-xl border border-[#CB4538]/25 bg-[#CB4538]/5 px-3.5 py-2.5">
              <p className="text-sm font-medium text-[#CB4538]">{moveError}</p>
              <button
                onClick={() => setMoveError("")}
                className="text-xs font-semibold text-[#CB4538]/60 hover:text-[#CB4538] transition-colors"
              >
                Dismiss
              </button>
            </div>
          )}
          {view === "day" && (
            <DayView
              date={anchorDate}
              trainers={visibleTrainers}
              currentTrainer={currentTrainer}
              appointments={appointments}
              availability={availability}
              overrides={overrides}
              trainerColorMap={trainerColorMap}
              onSlotSelect={openCreateAt}
              onEventClick={openEdit}
              onMoveAppointment={handleMoveAppointment}
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
              onMoveAppointment={handleMoveAppointment}
              onSlotSelect={openCreateAt}
              canEdit={canEditAppointment}
              currentTrainerId={currentTrainer.id}
              availability={availability}
              overrides={overrides}
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
          isSeries={!!editingAppt?.series_id}
          availability={availability}
          overrides={overrides}
          onSave={handleSave}
          onCancelAppointment={
            modalValues.id ? handleCancelAppointment : undefined
          }
          onRestore={modalValues.id ? handleRestore : undefined}
          onDelete={modalValues.id ? handleDelete : undefined}
          onClose={() => setModalValues(null)}
        />
      )}

      {pendingMove && (
        <SeriesScopeDialog
          title="This appointment repeats"
          detail={`Moving ${compactClientName(
            pendingMove.original.client_name
          )} to ${new Date(pendingMove.optimistic.start_time).toLocaleString(
            "en-US",
            {
              weekday: "short",
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
              timeZone: GYM_TIME_ZONE,
            }
          )}. Later sessions shift by the same amount.`}
          oneLabel="Move this appointment"
          followingLabel="Move this and all later ones"
          onChoose={(scope) => {
            const move = pendingMove;
            setPendingMove(null);
            void commitMove(move.original, move.optimistic, scope);
          }}
          onCancel={() => {
            setAppointments((prev) =>
              prev.map((a) =>
                a.id === pendingMove.original.id ? pendingMove.original : a
              )
            );
            setPendingMove(null);
          }}
        />
      )}
    </div>
  );
}
