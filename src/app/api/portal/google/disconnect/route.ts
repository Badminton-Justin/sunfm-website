import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { getValidAccessToken } from "@/lib/google/tokens";
import { revokeToken } from "@/lib/google/oauth";
import { stopChannel } from "@/lib/google/calendar";
import { getConnection } from "@/lib/google/sync";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const service = createServiceClient();
  const connection = await getConnection(service, user.id);
  if (connection) {
    try {
      const accessToken = await getValidAccessToken(service, connection);
      if (connection.watch_channel_id && connection.watch_resource_id) {
        await stopChannel(
          accessToken,
          connection.watch_channel_id,
          connection.watch_resource_id
        );
      }
      await revokeToken(connection.refresh_token);
    } catch (err) {
      // Best-effort cleanup on Google's side — still remove our copy below.
      console.error("Google disconnect cleanup failed", err);
    }
  }

  // Drop any queued deletes along with the connection. They're unreachable
  // without credentials, and leaving them behind would suppress those event
  // ids from ever being imported again if the trainer reconnects later.
  await service
    .from("google_pending_deletions")
    .delete()
    .eq("trainer_id", user.id);

  await service
    .from("google_calendar_connections")
    .delete()
    .eq("trainer_id", user.id);

  return NextResponse.json({ success: true });
}
