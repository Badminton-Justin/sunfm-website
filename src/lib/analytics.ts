import posthog from "posthog-js";

declare global {
  interface Window {
    gtag: (...args: [string, string, Record<string, string | number>?]) => void;
  }
}

export function trackEvent(eventName: string, params?: Record<string, string | number>) {
  if (typeof window === "undefined") return;

  // Fire to GA4
  if (window.gtag) {
    window.gtag("event", eventName, params);
  }

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
