import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Server Components can't set cookies, so setAll's write may throw there —
// that's fine as long as middleware.ts is refreshing the session on every request.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // ignore when called from a Server Component
          }
        },
      },
    }
  );
}
