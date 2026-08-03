import { createClient } from "@/lib/supabase/server";
import { requireTrainer } from "@/lib/supabase/trainer";
import { AvailabilityClient } from "@/components/portal/AvailabilityClient";

export default async function AvailabilityPage() {
  const trainer = await requireTrainer();
  const supabase = await createClient();

  const [{ data: trainers }, { data: availability }] = await Promise.all([
    supabase.from("trainers").select("*").order("name"),
    supabase
      .from("trainer_availability")
      .select("*")
      .order("day_of_week")
      .order("start_time"),
  ]);

  return (
    <div>
      <p className="portal-kicker mb-2">Weekly Rhythm</p>
      <h1 className="font-display text-4xl text-black mb-8">Availability</h1>
      <AvailabilityClient
        currentTrainer={trainer}
        trainers={trainers ?? []}
        initialAvailability={availability ?? []}
      />
    </div>
  );
}
