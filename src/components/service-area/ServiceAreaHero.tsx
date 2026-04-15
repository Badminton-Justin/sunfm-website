import Image from "next/image";
import TrackedCTALink from "@/components/TrackedCTALink";
import type { ServiceArea } from "@/lib/service-areas";

export default function ServiceAreaHero({ area }: { area: ServiceArea }) {
  const cityWord = area.city;
  const headlineWithoutCity = area.heroHeadline.replace(cityWord, "").trim();

  return (
    <section className="relative bg-[#1a1a1a] text-white overflow-hidden pt-16 pb-20 md:pt-24 md:pb-28">
      {/* Subtle grid pattern overlay */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />

      {/* Right-side portrait on lg+ */}
      <div
        aria-hidden="true"
        className="absolute inset-y-0 right-0 w-[55%] z-0 hidden lg:block"
      >
        <Image
          src="/images/jeffrey-headshot-final.jpg"
          alt=""
          fill
          className="object-cover hero-image-settle"
          style={{ objectPosition: "60% 20%" }}
          priority
        />
        {/* Long, soft fade so the image merges into the section's dark bg
            on the left with no visible seam. */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to right, #1a1a1a 0%, rgba(26,26,26,0.95) 20%, rgba(26,26,26,0.55) 45%, rgba(26,26,26,0.15) 75%, rgba(26,26,26,0) 100%)",
          }}
        />
      </div>

      {/* Accent glow */}
      <div
        aria-hidden="true"
        className="absolute -top-48 -right-48 h-[500px] w-[500px] rounded-full bg-[#FFD140]/10 blur-3xl"
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:max-w-[60%]">
          <p className="hero-enter hero-enter-1 text-xs md:text-sm tracking-[0.25em] uppercase text-[#FFD140] font-medium mb-6">
            {area.heroTag}
          </p>

          <h1 className="text-display-lg mb-8">
            <span className="hero-enter hero-enter-2 inline-block">
              {headlineWithoutCity}
            </span>{" "}
            <span className="hero-enter hero-enter-3 inline-block highlight">
              {cityWord}
            </span>
          </h1>

          <p className="hero-enter hero-enter-3 text-lg md:text-xl text-white/70 leading-relaxed mb-10">
            {area.heroSubheadline}
          </p>

          {/* Quick facts row */}
          <div className="hero-enter hero-enter-4 grid grid-cols-2 gap-4 md:gap-6 mb-10">
            {area.quickFacts.map((fact) => (
              <div
                key={fact.label}
                className="border-l-2 border-[#FFD140] pl-4"
              >
                <p className="text-xs text-white/50 uppercase tracking-wider mb-1">
                  {fact.label}
                </p>
                <p className="text-sm md:text-base text-white font-semibold">
                  {fact.value}
                </p>
              </div>
            ))}
          </div>

          <div className="hero-enter hero-enter-5 flex flex-col sm:flex-row gap-3 sm:gap-4">
            <TrackedCTALink
              href="/#apply"
              section={`service_area_${area.slug}_hero`}
              buttonText="Book Your Free Consultation"
              className="btn-secondary text-center w-full sm:w-auto"
            >
              Book Your Free Consultation
            </TrackedCTALink>
            <TrackedCTALink
              href="#how-training-works"
              section={`service_area_${area.slug}_hero_secondary`}
              buttonText="See how it works"
              className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full border border-white/20 text-white hover:bg-white/5 transition-colors w-full sm:w-auto"
            >
              See how it works
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </TrackedCTALink>
          </div>
        </div>
      </div>
    </section>
  );
}
