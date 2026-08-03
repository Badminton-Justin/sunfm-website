import { createClient } from "@/lib/supabase/server";
import { requireTrainer } from "@/lib/supabase/trainer";
import { GoogleCalendarConnect } from "@/components/portal/GoogleCalendarConnect";

interface SettingsPageProps {
  searchParams: Promise<{
    google_connected?: string;
    google_error?: string;
    google_warning?: string;
  }>;
}

export default async function SettingsPage({ searchParams }: SettingsPageProps) {
  const trainer = await requireTrainer();
  const supabase = await createClient();
  const params = await searchParams;

  const { data: connection } = await supabase
    .from("google_calendar_connections")
    .select("*")
    .eq("trainer_id", trainer.id)
    .maybeSingle();

  return (
    <div>
      <p className="portal-kicker mb-2">Your Account</p>
      <h1 className="font-display text-4xl text-black mb-8">Settings</h1>
      <GoogleCalendarConnect
        isConnected={!!connection}
        justConnected={params.google_connected === "1"}
        connectError={params.google_error}
        connectWarning={params.google_warning}
      />
    </div>
  );
}
