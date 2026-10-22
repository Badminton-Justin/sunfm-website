import type { Metadata } from "next";
import { headers } from "next/headers";
import StartLanding from "./StartLanding";

// PostHog experiment on the headline. Evaluated here so the page arrives with
// its variant in place (no swap after load); middleware supplies the visitor's
// PostHog distinct_id. Any failure or slowness falls back to the current
// headline, and an inactive flag returns no variant.
const HEADLINE_FLAG = "start-headline";

async function getHeadlineVariant(distinctId: string | null): Promise<string | undefined> {
  const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!apiKey || !distinctId) return undefined;
  const configured = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "";
  const host = configured.startsWith("http") ? configured.replace(/\/$/, "") : "https://us.i.posthog.com";
  try {
    const res = await fetch(`${host}/flags/?v=2`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: apiKey,
        distinct_id: distinctId,
        flag_keys_to_evaluate: [HEADLINE_FLAG],
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(800),
    });
    if (!res.ok) return undefined;
    const data = (await res.json()) as {
      flags?: Record<string, { enabled?: boolean; variant?: string | null }>;
    };
    const flag = data.flags?.[HEADLINE_FLAG];
    return flag?.enabled && flag.variant ? flag.variant : undefined;
  } catch {
    return undefined;
  }
}

export const metadata: Metadata = {
  title: "Free Personal Training Consultation in San Jose | Sun FM",
  description:
    "ACE-certified personal trainer in San Jose for busy professionals over 30. 13,000+ sessions, 127+ clients. Book your free consultation today.",
  // Paid-traffic landing page — exclude from organic index so it doesn't
  // cannibalize the homepage for the same intent queries.
  robots: { index: false, follow: false },
  alternates: { canonical: "/start" },
};

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "PersonalTrainer",
  name: "Sun Functional Movement",
  alternateName: "SunFM",
  url: "https://www.sunfm.fitness/start",
  telephone: "+1-620-407-2893",
  address: {
    "@type": "PostalAddress",
    streetAddress: "1401 Parkmoor Ave, Suite 100",
    addressLocality: "San Jose",
    addressRegion: "CA",
    postalCode: "95126",
    addressCountry: "US",
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "5.0",
    reviewCount: "107",
    bestRating: "5",
  },
};

export default async function StartPage({
  searchParams,
}: {
  searchParams: Promise<{ t?: string }>;
}) {
  const { t } = await searchParams;
  // Facebook/Instagram in-app browser. Its autofill scrolls ad visitors
  // straight to the form, so they get the stand-in form until they touch it
  // (see FormPreview). Decided here so the first HTML already has no fields.
  const requestHeaders = await headers();
  const userAgent = requestHeaders.get("user-agent") ?? "";
  const metaInAppBrowser = /Instagram|FBAN|FBAV|FB_IAB|FBIOS/i.test(userAgent);
  // Ad groups that pick their own copy with ?t= stay out of the test.
  const headlineVariant = t ? undefined : await getHeadlineVariant(requestHeaders.get("x-ph-distinct-id"));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      <StartLanding themeKey={t} deferFields={metaInAppBrowser} headlineVariant={headlineVariant} />
    </>
  );
}
