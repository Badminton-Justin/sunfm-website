"use client";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { useEffect } from "react";

if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    // Only create a person profile when we explicitly identify (otherwise anonymous)
    person_profiles: "identified_only",
    // We track pageviews manually in PostHogPageView to support App Router route changes
    capture_pageview: false,
    capture_pageleave: true,
    // Mask all form input values in session recordings to protect PII
    // (name, email, phone on Apply form; quiz answers on Movement Screen)
    session_recording: {
      maskAllInputs: true,
      maskTextSelector: ".ph-mask",
    },
    // Capture Core Web Vitals (LCP, CLS, INP, TTFB)
    capture_performance: true,
    // Don't capture rage clicks on the form submit button (it's expected when validation fails)
    rageclick: true,
  });
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Ensure init runs in the client even if module-level guard missed it (HMR safety)
    if (
      typeof window !== "undefined" &&
      process.env.NEXT_PUBLIC_POSTHOG_KEY &&
      !posthog.__loaded
    ) {
      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
        person_profiles: "identified_only",
        capture_pageview: false,
        capture_pageleave: true,
        session_recording: {
          maskAllInputs: true,
          maskTextSelector: ".ph-mask",
        },
        capture_performance: true,
        rageclick: true,
      });
    }
  }, []);

  return <PHProvider client={posthog}>{children}</PHProvider>;
}
