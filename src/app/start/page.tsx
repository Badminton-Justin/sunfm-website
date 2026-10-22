import type { Metadata } from "next";
import { headers } from "next/headers";
import StartLanding from "./StartLanding";

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
  const userAgent = (await headers()).get("user-agent") ?? "";
  const metaInAppBrowser = /Instagram|FBAN|FBAV|FB_IAB|FBIOS/i.test(userAgent);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      <StartLanding themeKey={t} deferFields={metaInAppBrowser} />
    </>
  );
}
