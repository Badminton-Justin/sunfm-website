"use client";

import type { Appointment, Trainer } from "@/lib/supabase/types";
import { isSameDay, monthGridDays } from "@/lib/portal/date-utils";
import { compactClientName } from "@/lib/portal/client-display";
import { getChipStyle } from "./colors";

interface MonthViewProps {
  anchorDate: Date;
  trainers: Trainer[];
  appointments: Appointment[];
  trainerColorMap: Map<string, string>;
  onDayClick: (date: Date) => void;
}

const MAX_CHIPS_PER_DAY = 3;

export function MonthView({
  anchorDate,
  trainers,
  appointments,
  trainerColorMap,
  onDayClick,
}: MonthViewProps) {
  const days = monthGridDays(anchorDate);
  const today = new Date();
  const currentMonth = anchorDate.getMonth();
  const visibleTrainerIds = new Set(trainers.map((t) => t.id));

  return (
    <div className="rounded-2xl border border-black/[0.06] bg-[#FDFCF8] overflow-hidden">
      <div className="grid grid-cols-7 border-b border-black/[0.06]">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div
            key={d}
            className="py-2 text-center text-[11px] font-semibold uppercase tracking-wide text-black/40"
          >
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map((day) => {
          const inMonth = day.getMonth() === currentMonth;
          const isToday = isSameDay(day, today);
          const dayAppointments = appointments
            .filter(
              (a) =>
                a.status !== "canceled" &&
                visibleTrainerIds.has(a.trainer_id) &&
                isSameDay(new Date(a.start_time), day)
            )
            .sort(
              (a, b) =>
                new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
            );
          const shown = dayAppointments.slice(0, MAX_CHIPS_PER_DAY);
          const overflow = dayAppointments.length - shown.length;

          return (
            <button
              key={day.toISOString()}
              onClick={() => onDayClick(day)}
              className={`min-h-[104px] border-b border-r border-black/[0.06] p-1.5 text-left hover:bg-black/[0.02] transition-colors flex flex-col gap-1 ${
                inMonth ? "" : "bg-black/[0.015]"
              }`}
            >
              <span
                className={`text-xs font-semibold w-5 h-5 flex items-center justify-center rounded-full ${
                  isToday
                    ? "bg-[#CB4538] text-white"
                    : inMonth
                    ? "text-black/70"
                    : "text-black/30"
                }`}
              >
                {day.getDate()}
              </span>
              <div className="space-y-0.5">
                {shown.map((appt) => {
                  const chipStyle = getChipStyle(
                    appt.client_name,
                    trainerColorMap.get(appt.trainer_id) ?? "#1a1a1a"
                  );
                  return (
                    <div
                      key={appt.id}
                      className={`text-[10px] leading-tight px-1 py-0.5 rounded truncate ${chipStyle.textClass}`}
                      style={{ background: chipStyle.background }}
                    >
                      {new Date(appt.start_time).toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                      })}{" "}
                      {compactClientName(appt.client_name)}
                    </div>
                  );
                })}
                {overflow > 0 && (
                  <p className="text-[10px] text-black/40 pl-1">
                    +{overflow} more
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
