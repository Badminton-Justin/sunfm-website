"use client";

import { useMemo, useState } from "react";
import type { Trainer, TrainerAvailability } from "@/lib/supabase/types";
import { Select } from "@/components/portal/Select";

interface AvailabilityClientProps {
  currentTrainer: Trainer;
  trainers: Trainer[];
  initialAvailability: TrainerAvailability[];
}

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const DAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function formatTime(t: string) {
  const [h, m] = t.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${String(m).padStart(2, "0")} ${period}`;
}

export function AvailabilityClient({
  currentTrainer,
  trainers,
  initialAvailability,
}: AvailabilityClientProps) {
  const isOwner = currentTrainer.role === "owner";
  const [selectedTrainerId, setSelectedTrainerId] = useState(
    currentTrainer.id
  );
  const [availability, setAvailability] = useState(initialAvailability);
  const [dayOfWeek, setDayOfWeek] = useState(1);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const byDay = useMemo(() => {
    const map = new Map<number, TrainerAvailability[]>();
    for (const a of availability) {
      if (a.trainer_id !== selectedTrainerId) continue;
      if (!map.has(a.day_of_week)) map.set(a.day_of_week, []);
      map.get(a.day_of_week)!.push(a);
    }
    return map;
  }, [availability, selectedTrainerId]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSaving(true);

    try {
      const res = await fetch("/api/portal/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trainer_id: selectedTrainerId,
          day_of_week: dayOfWeek,
          start_time: startTime,
          end_time: endTime,
        }),
      });
      const json = await res.json();

      if (!res.ok) {
        setError(json.error ?? "Something went wrong.");
        return;
      }

      setAvailability((prev) => [...prev, json.availability]);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/portal/availability/${id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setAvailability((prev) => prev.filter((a) => a.id !== id));
    }
  };

  return (
    <div>
      {isOwner && (
        <div className="mb-8">
          <label className="portal-kicker block mb-1.5">Trainer</label>
          <div className="max-w-xs">
            <Select
              value={selectedTrainerId}
              onChange={(e) => setSelectedTrainerId(e.target.value)}
            >
              {trainers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </Select>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3 mb-10">
        {DAYS.map((day, idx) => (
          <div
            key={day}
            className="bg-[#FDFCF8] rounded-2xl border border-black/[0.06] shadow-[0_1px_2px_rgba(26,26,26,0.04)] p-3.5"
          >
            <h3 className="text-xs font-semibold uppercase tracking-wide text-black/60 mb-2.5">
              <span className="md:hidden">{day}</span>
              <span className="hidden md:inline">{DAYS_SHORT[idx]}</span>
            </h3>
            <div className="space-y-1.5">
              {(byDay.get(idx) ?? []).map((window) => (
                <div
                  key={window.id}
                  className="group flex items-center justify-between text-xs bg-[#FFD140]/15 text-black/70 rounded-lg px-2 py-1.5"
                >
                  <span className="leading-tight">
                    {formatTime(window.start_time)}
                    <br className="hidden sm:block" />
                    <span className="hidden sm:inline"> – </span>
                    {formatTime(window.end_time)}
                  </span>
                  <button
                    onClick={() => handleDelete(window.id)}
                    className="text-black/30 hover:text-[#CB4538] ml-1 shrink-0 transition-colors"
                    aria-label="Remove window"
                  >
                    ×
                  </button>
                </div>
              ))}
              {(byDay.get(idx) ?? []).length === 0 && (
                <p className="text-xs text-black/25">—</p>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-[#FDFCF8] rounded-2xl border border-black/[0.06] shadow-[0_1px_2px_rgba(26,26,26,0.04)] p-5 max-w-lg">
        <div className="portal-ledger-heading mb-4">Add a Weekly Window</div>
        <form onSubmit={handleAdd} className="flex flex-wrap items-end gap-3">
          <div className="w-40">
            <label className="portal-kicker block mb-1.5">Day</label>
            <Select
              value={dayOfWeek}
              onChange={(e) => setDayOfWeek(Number(e.target.value))}
            >
              {DAYS.map((day, idx) => (
                <option key={day} value={idx}>
                  {day}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <label className="portal-kicker block mb-1.5">Start</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-black/10 bg-white focus:outline-none focus:border-[#CB4538] transition-colors"
            />
          </div>
          <div>
            <label className="portal-kicker block mb-1.5">End</label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-black/10 bg-white focus:outline-none focus:border-[#CB4538] transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={isSaving}
            className="btn-primary text-sm !py-2.5 disabled:opacity-50"
          >
            {isSaving ? "Adding…" : "Add"}
          </button>
        </form>
        {error && (
          <p className="text-[#CB4538] text-sm font-medium mt-3">{error}</p>
        )}
      </div>
    </div>
  );
}
