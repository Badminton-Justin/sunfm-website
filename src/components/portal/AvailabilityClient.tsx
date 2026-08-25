"use client";

import { useMemo, useState } from "react";
import type {
  AvailabilityOverride,
  Trainer,
  TrainerAvailability,
} from "@/lib/supabase/types";
import { minutesToTime, timeToMinutes } from "@/lib/portal/availability";
import { Select } from "@/components/portal/Select";
import { WeeklyHoursGrid } from "@/components/portal/availability/WeeklyHoursGrid";
import { DateOverrides } from "@/components/portal/availability/DateOverrides";

interface AvailabilityClientProps {
  currentTrainer: Trainer;
  trainers: Trainer[];
  initialAvailability: TrainerAvailability[];
  initialOverrides: AvailabilityOverride[];
}

export function AvailabilityClient({
  currentTrainer,
  trainers,
  initialAvailability,
  initialOverrides,
}: AvailabilityClientProps) {
  const isOwner = currentTrainer.role === "owner";
  const [selectedTrainerId, setSelectedTrainerId] = useState(currentTrainer.id);
  const [availability, setAvailability] = useState(initialAvailability);
  const [overrides, setOverrides] = useState(initialOverrides);
  const [error, setError] = useState("");

  const windows = useMemo(
    () => availability.filter((a) => a.trainer_id === selectedTrainerId),
    [availability, selectedTrainerId]
  );
  const trainerOverrides = useMemo(
    () => overrides.filter((o) => o.trainer_id === selectedTrainerId),
    [overrides, selectedTrainerId]
  );

  const handleAddWindow = async (
    dayOfWeek: number,
    startTime: string,
    endTime: string
  ) => {
    setError("");
    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);

    // Painting hours that touch a window already on that day widens it,
    // rather than stacking a second block on top of the first.
    const overlapping = availability.filter(
      (a) =>
        a.trainer_id === selectedTrainerId &&
        a.day_of_week === dayOfWeek &&
        timeToMinutes(a.start_time) <= endMinutes &&
        timeToMinutes(a.end_time) >= startMinutes
    );
    const mergedStart = Math.min(
      startMinutes,
      ...overlapping.map((a) => timeToMinutes(a.start_time))
    );
    const mergedEnd = Math.max(
      endMinutes,
      ...overlapping.map((a) => timeToMinutes(a.end_time))
    );

    // Already covered — a drag inside existing hours changes nothing.
    if (
      overlapping.length === 1 &&
      timeToMinutes(overlapping[0].start_time) === mergedStart &&
      timeToMinutes(overlapping[0].end_time) === mergedEnd
    ) {
      return;
    }

    // Optimism would need a real id to key off, and the round trip is one
    // insert — cheap enough to just wait for the row.
    const res = await fetch("/api/portal/availability", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        trainer_id: selectedTrainerId,
        day_of_week: dayOfWeek,
        start_time: minutesToTime(mergedStart),
        end_time: minutesToTime(mergedEnd),
      }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(json.error ?? "Could not add those hours.");
      return;
    }

    // Insert first, so a failed delete leaves a duplicate rather than a gap.
    const absorbed = new Set<string>();
    for (const w of overlapping) {
      const del = await fetch(`/api/portal/availability/${w.id}`, {
        method: "DELETE",
      });
      if (del.ok) absorbed.add(w.id);
      else setError("Some overlapping hours could not be merged.");
    }

    setAvailability((prev) => [
      ...prev.filter((a) => !absorbed.has(a.id)),
      json.availability,
    ]);
  };

  const handleRemoveWindow = async (id: string) => {
    setError("");
    const res = await fetch(`/api/portal/availability/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      setError(json.error ?? "Could not remove those hours.");
      return;
    }
    setAvailability((prev) => prev.filter((a) => a.id !== id));
  };

  const handleAddOverride = async (range: {
    from: string;
    to: string;
    start_time: string | null;
    end_time: string | null;
    note: string;
  }): Promise<string | null> => {
    const res = await fetch("/api/portal/availability-overrides", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trainer_id: selectedTrainerId, ...range }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) return json.error ?? "Could not save that override.";

    // The route clears the dates first, so drop anything local in that span
    // rather than ending up with both the old and new rows.
    const created: AvailabilityOverride[] = json.overrides ?? [];
    setOverrides((prev) => [
      ...prev.filter(
        (o) =>
          o.trainer_id !== selectedTrainerId ||
          o.date < range.from ||
          o.date > range.to
      ),
      ...created,
    ]);
    return null;
  };

  const handleRemoveOverride = async (from: string, to: string) => {
    setError("");
    const res = await fetch(
      `/api/portal/availability-overrides?trainer_id=${selectedTrainerId}&from=${from}&to=${to}`,
      { method: "DELETE" }
    );
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      setError(json.error ?? "Could not remove that override.");
      return;
    }
    setOverrides((prev) =>
      prev.filter(
        (o) =>
          o.trainer_id !== selectedTrainerId || o.date < from || o.date > to
      )
    );
  };

  return (
    <div className="space-y-8">
      {isOwner && (
        <div className="max-w-xs">
          <label className="portal-kicker block mb-1.5">Trainer</label>
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
      )}

      {error && (
        <p className="text-sm font-medium text-[#CB4538]">{error}</p>
      )}

      <div>
        <div className="flex items-baseline justify-between gap-4 mb-3">
          <p className="text-sm font-semibold text-black">Weekly hours</p>
          <p className="text-xs text-black/40">
            Drag a column to add hours · × to remove
          </p>
        </div>
        <WeeklyHoursGrid
          windows={windows}
          onAdd={handleAddWindow}
          onRemove={handleRemoveWindow}
        />
      </div>

      <div className="max-w-2xl">
        <DateOverrides
          overrides={trainerOverrides}
          onAdd={handleAddOverride}
          onRemove={handleRemoveOverride}
        />
      </div>
    </div>
  );
}
