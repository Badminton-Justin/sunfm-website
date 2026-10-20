import posthog from "posthog-js";

declare global {
  interface Window {
    // Undefined until the GA script loads, after hydration.
    gtag?: (...args: [string, string, Record<string, string | number>?]) => void;
  }
}

// gtag is defined by the GA script, which Next loads after hydration -- later
// than the mount effects that fire start_page_view, banner_impression and the
// first section check. Those used to be dropped on nearly every visit, so hold
// them here and send them once gtag exists.
const pendingGtag: [string, Record<string, string | number> | undefined][] = [];
let gtagWaiter: ReturnType<typeof setInterval> | null = null;

function sendToGtag(eventName: string, params?: Record<string, string | number>) {
  if (window.gtag) {
    window.gtag("event", eventName, params);
    return;
  }
  pendingGtag.push([eventName, params]);
  if (gtagWaiter) return;
  let tries = 0;
  gtagWaiter = setInterval(() => {
    tries++;
    if (window.gtag) {
      for (const [name, p] of pendingGtag.splice(0)) window.gtag("event", name, p);
    }
    // Give up after ~15s (GA blocked, e.g. by an ad blocker).
    if (window.gtag || tries >= 150) {
      clearInterval(gtagWaiter!);
      gtagWaiter = null;
      pendingGtag.length = 0;
    }
  }, 100);
}

// GA4 reserves `source`, `medium`, `campaign`, `term`, `content`, `campaign_id`
// and `source_platform` as event parameters that feed session traffic-source
// attribution. Passing any of them here silently overwrites the session's real
// acquisition source -- a `source: "start_page"` on the /start form events sent
// every paid conversion into the Unassigned channel with no gclid, so Google Ads
// imported zero conversions for ~90 days. Prefix descriptive params instead
// (`page_source`, `promo_name`).
export function trackEvent(eventName: string, params?: Record<string, string | number>) {
  if (typeof window === "undefined") return;

  // Fire to GA4
  sendToGtag(eventName, params);

  // Fire to PostHog (if initialized)
  if (posthog.__loaded) {
    posthog.capture(eventName, params);
  }
}

// Enhanced Conversions: gives Google Ads a backup match signal (hashed
// email/phone) for when gclid cookie-based matching fails — browser privacy
// restrictions, ad blockers, cross-device sessions, etc. Google's tag hashes
// this client-side before it leaves the browser; we only need to normalize
// formatting (lowercase/trim email, E.164 phone) so the hash actually matches
// what Google has on file. Must be called before the conversion-driving
// trackEvent call, since it attaches to whatever event fires next.
export function setEnhancedConversionUserData(email: string, phone: string) {
  if (typeof window === "undefined" || !window.gtag) return;

  const userData: Record<string, string> = {};

  const normalizedEmail = email.trim().toLowerCase();
  if (normalizedEmail) userData.email = normalizedEmail;

  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) {
    userData.phone_number = `+1${digits}`;
  } else if (digits.length === 11 && digits.startsWith("1")) {
    userData.phone_number = `+${digits}`;
  }

  if (Object.keys(userData).length > 0) {
    window.gtag("set", "user_data", userData);
  }
}
