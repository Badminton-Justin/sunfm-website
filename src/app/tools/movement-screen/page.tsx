import type { Metadata } from "next";
import Link from "next/link";
import AmbientBackground from "@/components/movement-screen/AmbientBackground";
import MovementScreen from "@/components/movement-screen/MovementScreen";

const canonical = "https://www.sunfm.fitness/tools/movement-screen";

export const metadata: Metadata = {
  title: "Free Movement Screen: Find Your Tightest Joint in 5 Minutes",
  description:
    "Score your hips, shoulders, T-spine, hamstrings, ankles, and core in 5 minutes. Free, no email. Get a 1-week program built around your tightest areas.",
  alternates: { canonical },
  openGraph: {
    title: "Free Movement Screen: Find Your Tightest Joint in 5 Minutes",
    description:
      "Score your shoulder, thoracic, hip, hamstring, ankle, and core mobility on six axes. Free, no email, with personalized drills for your weakest areas.",
    type: "website",
    url: canonical,
    images: [
      {
        url: "https://www.sunfm.fitness/images/jeffrey-og.jpg",
        width: 1200,
        height: 630,
        alt: "The Movement Screen by Jeffrey Sun",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Movement Screen: Find Your Tightest Joint in 5 Minutes",
    description:
      "Score your mobility on six axes in 5 minutes. Free, no email, personalized drills included.",
  },
};

const softwareApplicationSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "The Movement Screen",
  url: canonical,
  applicationCategory: "HealthApplication",
  description:
    "A 12-question mobility self-assessment scoring shoulders, thoracic spine, hips, hamstrings, ankles, and core. Includes a downloadable 1-week program.",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  author: {
    "@type": "Person",
    name: "Jeffrey Sun",
    jobTitle: "ACE-Certified Personal Trainer",
    url: "https://www.sunfm.fitness",
  },
};

export default function MovementScreenPage() {
  return (
    <main className="relative min-h-screen bg-[#0a0a0a] text-white overflow-hidden flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(softwareApplicationSchema),
        }}
      />
      <AmbientBackground />

      {/* Minimal top bar */}
      <div className="relative z-20 flex-shrink-0 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between">
        <Link
          href="/"
          className="group inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.25em] text-white/50 hover:text-white transition-colors"
          aria-label="Back to SunFM"
        >
          <svg
            className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          sunfm
        </Link>
        <div className="flex items-center gap-3 font-mono text-[10px] tracking-[0.25em] uppercase text-white/40">
          <Link
            href="/#apply"
            className="hidden sm:inline text-white/60 hover:text-white transition-colors"
          >
            Book consultation
          </Link>
          <span className="hidden sm:inline h-px w-6 bg-white/20" />
          <span>v2.0</span>
        </div>
      </div>

      {/* Content fills remaining viewport; short screens (intro, question)
          are vertically centered. Long screens (results) grow naturally
          and are effectively top-aligned because the container grows to
          match them. */}
      <div className="relative z-10 flex-1 flex items-center justify-center py-6 md:py-10">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <MovementScreen />
        </div>
      </div>
    </main>
  );
}
