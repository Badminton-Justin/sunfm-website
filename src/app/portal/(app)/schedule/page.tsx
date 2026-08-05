import { createClient } from "@/lib/supabase/server";
import { requireTrainer } from "@/lib/supabase/trainer";
import { CalendarClient } from "@/components/portal/calendar/CalendarClient";

export default async function SchedulePage() {
  const trainer = await requireTrainer();
  const supabase = await createClient();

  const [
    { data: trainers },
    { data: appointments },
    { data: availability },
    { data: overrides },
  ] = await Promise.all([
    supabase.from("trainers").select("*").order("name"),
    supabase
      .from("appointments")
      .select("*")
      .order("start_time", { ascending: true }),
    supabase.from("trainer_availability").select("*"),
    supabase.from("availability_overrides").select("*"),
  ]);

  return (
    <div>
      <p className="portal-kicker mb-2">Front Desk</p>
      <h1 className="font-display text-4xl text-black mb-8">Schedule</h1>
      <CalendarClient
        currentTrainer={trainer}
        trainers={trainers ?? []}
        initialAppointments={appointments ?? []}
        availability={availability ?? []}
        overrides={overrides ?? []}
        initialView={trainer.default_calendar_view}
      />
    </div>
  );
}
