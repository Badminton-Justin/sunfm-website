export type TrainerRole = "owner" | "trainer";

export type CalendarView = "day" | "week" | "month";

export const CALENDAR_VIEWS: CalendarView[] = ["day", "week", "month"];

export interface Trainer {
  id: string;
  name: string;
  email: string;
  role: TrainerRole;
  // Which view the schedule page opens on — see migration 0010.
  default_calendar_view: CalendarView;
  created_at: string;
}

export type AppointmentStatus = "booked" | "canceled";

export interface Appointment {
  id: string;
  trainer_id: string;
  client_name: string;
  start_time: string;
  end_time: string;
  notes: string | null;
  status: AppointmentStatus;
  // Shared by the occurrences booked together via "Repeat weekly"; null for a
  // one-off. Not a recurrence rule — see migration 0009.
  series_id: string | null;
  created_at: string;
  updated_at: string;
  google_event_id: string | null;
  google_synced_at: string | null;
  google_push_pending: boolean;
}

export interface TrainerAvailability {
  id: string;
  trainer_id: string;
  day_of_week: number; // 0 = Sunday .. 6 = Saturday
  start_time: string; // "HH:MM:SS"
  end_time: string;
  created_at: string;
}

export interface GoogleCalendarConnection {
  trainer_id: string;
  google_calendar_id: string;
  access_token: string;
  access_token_expires_at: string;
  refresh_token: string;
  sync_token: string | null;
  watch_channel_id: string | null;
  watch_resource_id: string | null;
  watch_channel_expires_at: string | null;
  watch_verification_token: string | null;
  sync_window_end: string | null;
  sync_lock_at: string;
  consecutive_failed_pulls: number;
  connected_at: string;
  updated_at: string;
}
