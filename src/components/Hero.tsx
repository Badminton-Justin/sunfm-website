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

  return (
    <section className="min-h-screen flex items-center lg:items-end relative bg-[#F5F2ED] overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-y-0 right-0 w-full lg:w-[45%] z-0">
        <Image
          src="/images/jeffrey-headshot-final.jpg"
          alt="Jeffrey Sun - Personal Trainer"
          fill
          className="object-cover hero-image-settle"
          style={{ objectPosition: '65% 15%' }}
          priority
        />
        {/* Mobile + iPad: dark overlay for white text. lg+: beige fade from left */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/65 to-black/45 lg:bg-none lg:bg-gradient-to-r lg:from-[#F5F2ED] lg:via-transparent lg:to-transparent" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pb-16 lg:pb-24 pt-20 lg:pt-40">
        <div className="max-w-2xl">
          {/* Credential line */}
          <p className="hero-enter hero-enter-1 text-xs md:text-sm text-white/70 lg:text-gray-500 tracking-[0.15em] uppercase mb-6 md:mb-8 font-medium">
            12,000+ Sessions &bull; 107+ Clients &bull; South Bay Area
          </p>

          {/* Headline - massive display type */}
          {/* No hero-enter here on purpose. .hero-enter uses animation-fill-mode
              both, so the element sits at opacity 0 until its delay elapses, and
              the headline and subheadline are the largest above-fold text. That
              made the subheadline the LCP element at 4.1s, all of it render
              delay rather than load time. The eyebrow above and the CTA row
              below still stagger, so the entrance still reads. */}
          <h1 className="text-display-lg text-white lg:text-[#1a1a1a] mb-6 md:mb-8">
            <span className="inline-block highlight">Move Better.</span>
            <br />
            <span className="inline-block">Feel Stronger.</span>
            <br />
            <span className="inline-block">Live Longer.</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-white/80 lg:text-gray-500 mb-8 md:mb-10 max-w-lg leading-relaxed">
            Hi, I&apos;m Jeffrey Sun, a personal trainer in San Jose serving
            the South Bay Area. I help busy professionals eliminate pain,
            build functional strength, and train for health longevity - not
            just quick fixes.
          </p>

          {/* CTA + social proof row */}
          <div className="hero-enter hero-enter-5 flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <a
              href="#apply"
              onClick={(e) => {
                scrollToApply(e);
                trackEvent("cta_click", { button_text: "Book Your Free Consultation", section: "hero" });
              }}
              className="btn-primary"
            >
              Book Your Free Consultation
            </a>

            <div className="flex items-center gap-2 text-sm text-white/60 lg:text-gray-400">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className="w-3.5 h-3.5 text-[#FFD140]"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span>
                on{" "}
                <a
                  href="https://maps.app.goo.gl/XyrnsHXu9K1xYqXw5"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2 hover:text-[#CB4538] transition-colors"
                  onClick={() => trackEvent("external_link_click", { platform: "google_maps", section: "hero" })}
                >
                  Google
                </a>
                {" & "}
                <a
                  href="https://www.yelp.com/biz/sun-functional-movement-san-jose"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2 hover:text-[#CB4538] transition-colors"
                  onClick={() => trackEvent("external_link_click", { platform: "yelp", section: "hero" })}
                >
                  Yelp
                </a>
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
