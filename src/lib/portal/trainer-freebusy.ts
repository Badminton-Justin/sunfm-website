import type {
  Appointment,
  AvailabilityOverride,
  Trainer,
  TrainerAvailability,
} from "@/lib/supabase/types";
import { coverageFor } from "@/lib/portal/availability";
import { wallClockFromIso } from "@/lib/portal/timezone";

// Why a trainer can't take the slot, in the order the answer matters: an
// existing booking is a hard conflict, a day off is a decision they made, and
// being outside their hours is the softest of the three.
export type FreeBusyState = "free" | "booked" | "off" | "outside";

export interface TrainerFreeBusy {
  trainer: Trainer;
  state: FreeBusyState;
  // The appointment in the way, when there is one — the chip names the client
  // so the owner can judge whether it's the kind of session worth moving.
  conflict: Appointment | null;
  // The override note ("Hawaii"), when a day off carries one.
  note: string | null;
}

// Half-open: a session ending at 10:00 and one starting at 10:00 are
// back-to-back, not a double booking.
function overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) {
  return aStart < bEnd && bStart < aEnd;
}

/**
 * Who can take a slot, for every trainer at once.
 *
 * `start` and `end` are gym wall-clock Dates, the same ones the calendar grid
 * positions against. Appointment rows are instants, so they come back through
 * wallClockFromIso before they're compared.
 */
export function trainerFreeBusy(
  start: Date,
  end: Date,
  trainers: Trainer[],
  appointments: Appointment[],
  availability: TrainerAvailability[],
  overrides: AvailabilityOverride[],
  // The appointment being edited never conflicts with itself.
  excludeAppointmentId?: string | null
): TrainerFreeBusy[] {
  return trainers.map((trainer) => {
    const conflict =
      appointments.find(
        (a) =>
          a.trainer_id === trainer.id &&
          a.status !== "canceled" &&
          a.id !== excludeAppointmentId &&
          overlaps(
            start,
            end,
            wallClockFromIso(a.start_time),
            wallClockFromIso(a.end_time)
          )
      ) ?? null;

    const { covered, availability: effective } = coverageFor(
      start,
      end,
      trainer.id,
      availability,
      overrides
    );

    const state: FreeBusyState = conflict
      ? "booked"
      : effective.isUnavailable
      ? "off"
      : covered
      ? "free"
      : "outside";

    return { trainer, state, conflict, note: effective.note };
  });
}
