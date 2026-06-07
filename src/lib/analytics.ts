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
