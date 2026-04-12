"use client";

import Image from "next/image";
import { trackEvent } from "@/lib/analytics";

export default function Hero() {
  const scrollToApply = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const element = document.querySelector("#apply");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const credentials = [
    { number: "12,000+", label: "Sessions Delivered" },
    { number: "107+", label: "Clients Trained" },
    { number: "7+", label: "Years Training" },
    { number: "South Bay", label: "& Online" },
  ];

  return (
    <section className="pt-28 pb-16 md:pt-32 md:pb-24 bg-[#EEEADA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Left content */}
          <div>
            {/* Credentials badges */}
            <div className="hidden md:flex flex-wrap gap-4 mb-8">
              {credentials.map((cred, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-sm"
                >
                  <svg
                    className="w-5 h-5 text-[#FFD140]"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="font-bold text-black">{cred.number}</span>
                  <span className="text-gray-600 text-sm">{cred.label}</span>
                </div>
              ))}
            </div>

            {/* Headline */}
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-black leading-tight mb-6">
              <span className="highlight">Move Better.</span>
              <br />
              Feel Stronger. Live Longer.
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-xl text-gray-700 mb-8 max-w-xl">
              Hi, I&apos;m Jeffrey Sun, a personal trainer in San Jose serving
              the South Bay Area. I help busy professionals eliminate pain,
              build functional strength, and train for health longevity - not
              just quick fixes.
            </p>

            {/* CTA Button */}
            <a
              href="#apply"
              onClick={(e) => {
                scrollToApply(e);
                trackEvent("cta_click", { button_text: "Book Your Free Consultation", section: "hero" });
              }}
              className="btn-primary inline-flex items-center gap-2 text-lg"
            >
              Book Your Free Consultation
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </a>

            {/* 5-star ratings */}
            <div className="mt-6 flex items-center gap-2 text-sm text-gray-700">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className="w-4 h-4 text-[#FFD140]"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span>
                5 stars on{" "}
                <a
                  href="https://maps.app.goo.gl/XyrnsHXu9K1xYqXw5"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold underline hover:text-[#CB4538] transition-colors"
                  onClick={() => trackEvent("external_link_click", { platform: "google_maps", section: "hero" })}
                >
                  Google
                </a>
                {" & "}
                <a
                  href="https://www.yelp.com/biz/jeff-sun-fitness-sunnyvale"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold underline hover:text-[#CB4538] transition-colors"
                  onClick={() => trackEvent("external_link_click", { platform: "yelp", section: "hero" })}
                >
                  Yelp
                </a>
              </span>
            </div>
          </div>

          {/* Right content - Image */}
          <div className="flex justify-center">
            <div className="relative w-64 sm:w-72 md:w-80 lg:w-96 aspect-[3/4] overflow-hidden rounded-2xl shadow-xl">
              <Image
                src="/images/jeffrey-headshot-final.jpg"
                alt="Jeffrey Sun - Personal Trainer"
                fill
                className="object-cover scale-125"
                style={{ objectPosition: '65% 15%' }}
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
