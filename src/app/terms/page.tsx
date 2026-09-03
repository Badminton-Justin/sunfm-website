import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service | Sun Functional Movement",
  description:
    "The terms that govern your use of the Sun Functional Movement website and personal training services.",
  alternates: { canonical: "/terms" },
  robots: { index: false, follow: true },
};

export default function TermsPage() {
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
          Terms of Service
        </h1>
        <p className="text-sm text-gray-500 mb-12">
          Last updated: September 3, 2026
        </p>

        <div className="space-y-10 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-[#1a1a1a] mb-4">
              Agreement to these terms
            </h2>
            <p>
              These terms govern your use of the website at sunfm.fitness and
              any services you request through it from Sun Functional Movement
              (&ldquo;Sun FM,&rdquo; &ldquo;we,&rdquo; &ldquo;us&rdquo;), a
              personal training studio located at 1401 Parkmoor Ave, San Jose,
              CA 95126. By using the site or booking with us, you agree to
              them. If you don&apos;t agree, please don&apos;t use the site.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#1a1a1a] mb-4">
              Who can use the site
            </h2>
            <p>
              You need to be at least 18 to book services or submit a form on
              this site. Clients under 18 can train with us with the written
              consent of a parent or legal guardian, who takes on these terms on
              their behalf.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#1a1a1a] mb-4">
              What we provide
            </h2>
            <p className="mb-3">
              Sun FM offers in-person personal training, movement assessments,
              and related coaching. The website also publishes articles and
              tools, including the Movement Screen quiz, as general education.
            </p>
            <p>
              Booking a consultation through this site is a request, not a
              confirmed appointment. A session is booked once we confirm it with
              you directly.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#1a1a1a] mb-4">
              Not medical advice
            </h2>
            <p className="mb-3">
              Everything on this site — articles, the Movement Screen quiz,
              training suggestions, and any correspondence with us — is general
              fitness information. It is not medical advice, diagnosis, or
              treatment, and it is not a substitute for care from a licensed
              physician, physical therapist, or other qualified provider.
            </p>
            <p>
              Talk to your doctor before starting any exercise program,
              especially if you have an injury, a chronic condition, are
              pregnant, or have been inactive for a while. If you experience
              chest pain, dizziness, or any symptom that concerns you during
              exercise, stop and seek medical attention.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#1a1a1a] mb-4">
              Assumption of risk
            </h2>
            <p>
              Physical training carries inherent risk of injury. By training
              with us, you accept that risk and confirm that you are
              participating voluntarily and are in adequate health to do so. You
              agree to tell your trainer about injuries, medical conditions,
              medications, and limitations that could affect your training, and
              to keep that information current. In-person clients sign a
              separate waiver and health history form before their first
              session; where that document and these terms overlap, the signed
              document controls.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#1a1a1a] mb-4">
              Sessions, scheduling, and payment
            </h2>
            <p className="mb-3">
              Rates, package terms, session expiration, cancellation notice, and
              payment schedule are set out in the service agreement we provide
              before your first paid session. Those terms apply to your
              training; this page does not replace them.
            </p>
            <p>
              Missed sessions and late cancellations may be charged according to
              that agreement. Prices on the website may change, and any change
              takes effect for new packages rather than ones you&apos;ve already
              purchased.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#1a1a1a] mb-4">
              Studio conduct
            </h2>
            <p>
              We ask that you arrive on time, follow your trainer&apos;s
              instructions on technique and load, use equipment as directed, and
              treat other clients and staff respectfully. We reserve the right
              to end a session or discontinue services if conduct is unsafe,
              abusive, or disruptive to others.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#1a1a1a] mb-4">
              Client portal accounts
            </h2>
            <p>
              If we give you an account for the client portal, you&apos;re
              responsible for keeping your password confidential and for
              activity under your account. Tell us right away if you think
              someone else has access to it.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#1a1a1a] mb-4">
              Website content and intellectual property
            </h2>
            <p>
              The articles, photography, video, training materials, and design
              on this site belong to Sun FM or our licensors. You&apos;re
              welcome to read, share, and link to our content. You may not
              republish it wholesale, sell it, or use it to train commercial
              models without our written permission. If you send us testimonials,
              reviews, or other content, you give us permission to use it in our
              marketing unless you tell us otherwise.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#1a1a1a] mb-4">
              Email and text communications
            </h2>
            <p>
              If you opt in, we&apos;ll send occasional emails about training and
              studio updates, and we may text you about scheduling. You can
              unsubscribe from emails at any time using the link in any message,
              and you can ask us to stop texting by replying STOP or telling
              your trainer. Message and data rates may apply. How we handle your
              information is described in our{" "}
              <Link
                href="/privacy"
                className="text-[#CB4538] underline hover:no-underline"
              >
                Privacy Policy
              </Link>
              .
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#1a1a1a] mb-4">
              Third-party links
            </h2>
            <p>
              We link to other sites — research, videos, and tools we find
              useful. We don&apos;t control them and aren&apos;t responsible for
              their content or their privacy practices.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#1a1a1a] mb-4">
              Disclaimers and limitation of liability
            </h2>
            <p className="mb-3">
              The website is provided as is. We don&apos;t promise it will be
              uninterrupted or error-free, and we make no guarantee of specific
              fitness, weight, or performance results — outcomes depend on
              factors outside our control, including your health, consistency,
              sleep, and nutrition.
            </p>
            <p>
              To the fullest extent allowed by California law, Sun FM is not
              liable for indirect, incidental, or consequential damages arising
              from your use of the website. Nothing here limits liability that
              cannot be limited by law, including for gross negligence or
              willful misconduct.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#1a1a1a] mb-4">
              Governing law
            </h2>
            <p>
              These terms are governed by the laws of the State of California.
              Any dispute will be handled in the state or federal courts located
              in Santa Clara County, California.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#1a1a1a] mb-4">
              Changes to these terms
            </h2>
            <p>
              We may update these terms occasionally. The &ldquo;Last
              updated&rdquo; date at the top reflects the most recent change.
              Continuing to use the site after a change means you accept the
              updated terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#1a1a1a] mb-4">Contact</h2>
            <p>
              Questions about these terms? Email{" "}
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
