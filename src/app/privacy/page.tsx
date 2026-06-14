import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | Sun Functional Movement",
  description:
    "How Sun Functional Movement collects, uses, and protects your personal information.",
  alternates: { canonical: "/privacy" },
  robots: { index: false, follow: true },
};

export default function PrivacyPage() {
  return (
    <main className="bg-[#F5F2ED] min-h-screen py-16">
      <article className="max-w-3xl mx-auto px-4 sm:px-6">
        <Link
          href="/"
          className="text-sm text-gray-500 hover:text-[#CB4538] transition-colors inline-flex items-center gap-1 mb-8"
        >
          <span aria-hidden="true">←</span> Back to sunfm.fitness
        </Link>

        <h1 className="text-4xl sm:text-5xl font-bold text-[#1a1a1a] mb-3">
          Privacy Policy
        </h1>
        <p className="text-sm text-gray-500 mb-12">
          Last updated: June 7, 2026
        </p>

        <div className="space-y-10 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-[#1a1a1a] mb-4">
              What this covers
            </h2>
            <p>
              This is the privacy policy for Sun Functional Movement (&ldquo;Sun
              FM,&rdquo; &ldquo;we,&rdquo; &ldquo;us&rdquo;), a personal
              training studio located at 1401 Parkmoor Ave, San Jose, CA 95126.
              It explains what information we collect when you use our website
              at sunfm.fitness or contact us, and what we do with it.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#1a1a1a] mb-4">
              Information we collect
            </h2>

            <h3 className="font-semibold text-[#1a1a1a] mt-6 mb-2">
              Information you give us directly
            </h3>
            <p className="mb-3">
              When you fill out a consultation form, take the Movement Screen
              quiz, or contact us, you provide:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Name</li>
              <li>Email address</li>
              <li>Phone number</li>
              <li>
                Information you choose to share about your training goals,
                current routine, injuries, or motivation
              </li>
            </ul>

            <h3 className="font-semibold text-[#1a1a1a] mt-6 mb-2">
              Information collected automatically
            </h3>
            <p className="mb-3">
              When you visit the site, we and our analytics providers
              automatically collect:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Pages visited and how you navigate the site</li>
              <li>Approximate location (city/region level)</li>
              <li>Device, browser, and operating system info</li>
              <li>
                How you got to the site (referring URL, search keyword, ad click
                identifier)
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#1a1a1a] mb-4">
              How we use it
            </h2>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>
                To respond to your consultation request and schedule sessions
              </li>
              <li>
                To send occasional emails about training, wellness, and Sun FM
                updates (only if you opt in)
              </li>
              <li>
                To improve the website and understand what content helps
                prospective clients
              </li>
              <li>
                To measure the effectiveness of our advertising and marketing
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#1a1a1a] mb-4">
              Who we share it with
            </h2>
            <p className="mb-3">
              We don&apos;t sell your personal information. We share data with
              the following service providers, only as needed to operate the
              business:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>
                <strong>Kit (ConvertKit)</strong> — email service provider,
                stores your email and name if you opt into communications
              </li>
              <li>
                <strong>Google Sheets / Google Workspace</strong> — internal CRM
                for consultation requests
              </li>
              <li>
                <strong>Google Analytics 4 and Google Ads</strong> — measures
                site traffic and ad performance using hashed identifiers
              </li>
              <li>
                <strong>PostHog</strong> — product analytics for understanding
                how visitors use the site; form input values are masked in
                session recordings
              </li>
              <li>
                <strong>Cloudflare R2</strong> — hosts video testimonials
              </li>
              <li>
                <strong>Vercel</strong> — hosts the website
              </li>
            </ul>
            <p className="mt-4">
              Each provider operates under its own privacy policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#1a1a1a] mb-4">
              Tracking and cookies
            </h2>
            <p>
              The site uses cookies and similar technologies for analytics,
              advertising attribution, and improving your experience. This
              includes Google Ads conversion tracking (which uses click
              identifiers such as gclid) and PostHog session analytics. You can
              disable cookies in your browser settings, but some site features
              may not work properly.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#1a1a1a] mb-4">
              Data retention
            </h2>
            <p>
              We retain consultation requests and client communications for as
              long as needed to provide our services, comply with legal
              obligations, or resolve disputes. Analytics data is retained
              according to provider defaults — Google Analytics retains data for
              14 months by default, and PostHog retention is configured per
              account.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#1a1a1a] mb-4">
              Your rights (California residents)
            </h2>
            <p className="mb-3">
              Under the California Consumer Privacy Act (CCPA), you have the
              right to:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Know what personal information we have about you</li>
              <li>Request deletion of your personal information</li>
              <li>
                Opt out of the sale or sharing of personal information (we
                don&apos;t sell, but you can opt out of analytics tracking)
              </li>
              <li>Not be discriminated against for exercising these rights</li>
            </ul>
            <p className="mt-4">
              To exercise these rights, email{" "}
              <a
                href="mailto:jeff@sunfm.fitness"
                className="text-[#CB4538] underline hover:no-underline"
              >
                jeff@sunfm.fitness
              </a>
              . We&apos;ll respond within 45 days.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#1a1a1a] mb-4">
              Children&apos;s privacy
            </h2>
            <p>
              Our services aren&apos;t directed to children under 13. We
              don&apos;t knowingly collect personal information from children
              under 13.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#1a1a1a] mb-4">
              Changes to this policy
            </h2>
            <p>
              We may update this policy occasionally. The &ldquo;Last
              updated&rdquo; date at the top reflects the most recent change.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#1a1a1a] mb-4">Contact</h2>
            <p>
              Questions about this privacy policy? Email{" "}
              <a
                href="mailto:jeff@sunfm.fitness"
                className="text-[#CB4538] underline hover:no-underline"
              >
                jeff@sunfm.fitness
              </a>{" "}
              or call{" "}
              <a
                href="tel:+14087614963"
                className="text-[#CB4538] underline hover:no-underline"
              >
                (408) 761-4963
              </a>
              .
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}
