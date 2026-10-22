import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// /start runs PostHog experiments assigned on the server, so the page arrives
// with its variant already in place instead of swapping after load. That needs
// the same distinct_id the browser's PostHog uses: reuse the one in PostHog's
// own cookie, or, on a first visit, create it there so posthog-js adopts it.
// The id reaches the page through a request header.
function withPosthogId(request: NextRequest) {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) return NextResponse.next();

  const cookieName = `ph_${key}_posthog`;
  let distinctId: string | undefined;
  const existing = request.cookies.get(cookieName)?.value;
  if (existing) {
    try {
      // Decoding JSON that's already plain leaves it unchanged.
      distinctId = JSON.parse(decodeURIComponent(existing)).distinct_id;
    } catch {
      // unreadable cookie: treat as a first visit
    }
  }

  const isNew = !distinctId;
  if (!distinctId) distinctId = crypto.randomUUID();

  const headers = new Headers(request.headers);
  headers.set("x-ph-distinct-id", distinctId);
  const response = NextResponse.next({ request: { headers } });

  if (isNew) {
    // Same shape, encoding and domain posthog-js writes (cross-subdomain).
    const value = encodeURIComponent(
      JSON.stringify({ distinct_id: distinctId, $device_id: distinctId, $user_state: "anonymous" })
    );
    const host = request.nextUrl.hostname;
    const domain = host.endsWith("sunfm.fitness") ? "; Domain=.sunfm.fitness" : "";
    response.headers.append(
      "Set-Cookie",
      `${cookieName}=${value}; Path=/; Max-Age=31536000; SameSite=Lax; Secure${domain}`
    );
  }
  return response;
}

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/start")) {
    return withPosthogId(request);
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Required: this refreshes the session token, do not remove.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isLoginRoute = pathname === "/portal/login";
  // Reachable signed out by definition — these are the routes for someone who
  // cannot get in. reset-password is deliberately not treated as a login
  // route: arriving there with a recovery session must not bounce to the
  // schedule before the new password has actually been set.
  const isPublicPortalRoute =
    isLoginRoute ||
    pathname === "/portal/forgot-password" ||
    pathname === "/portal/reset-password";

  if (!user && !isPublicPortalRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/portal/login";
    return NextResponse.redirect(url);
  }

  if (user && isLoginRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/portal/schedule";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/portal/:path*", "/start"],
};
