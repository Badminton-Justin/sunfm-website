import type { SupabaseClient } from "@supabase/supabase-js";
import type { GoogleCalendarConnection } from "@/lib/supabase/types";
import { refreshAccessToken } from "./oauth";

const REFRESH_MARGIN_MS = 5 * 60 * 1000; // refresh 5 min before actual expiry

// Returns a valid access token for the connection, transparently refreshing
// (and persisting the refresh) if the current one is expired or near-expiry.
export async function getValidAccessToken(
  supabase: SupabaseClient,
  connection: GoogleCalendarConnection
): Promise<string> {
  const expiresAt = new Date(connection.access_token_expires_at).getTime();
  if (expiresAt - Date.now() > REFRESH_MARGIN_MS) {
    return connection.access_token;
  }

  const refreshed = await refreshAccessToken(connection.refresh_token);
  const newExpiresAt = new Date(
    Date.now() + refreshed.expires_in * 1000
  ).toISOString();

  await supabase
    .from("google_calendar_connections")
    .update({
      access_token: refreshed.access_token,
      access_token_expires_at: newExpiresAt,
    })
    .eq("trainer_id", connection.trainer_id);

  return refreshed.access_token;
}
