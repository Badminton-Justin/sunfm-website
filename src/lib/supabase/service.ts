import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Server-only client using the service-role (secret) key — bypasses RLS
// entirely. Only for background contexts with no logged-in user session
// (Google webhook handler, cron renewal job, token refresh triggered from
// those). Never import this from a client component or expose the key
// to the browser.
export function createServiceClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}
