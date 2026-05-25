import Link from "next/link";
import Image from "next/image";
import RevealWrapper from "@/components/RevealWrapper";
import TrackedCTALink from "@/components/TrackedCTALink";
import Footer from "@/components/Footer";
import ServiceAreaHero from "./ServiceAreaHero";
import ServiceAreaFAQ from "./ServiceAreaFAQ";
import ServiceAreaMap from "./ServiceAreaMap";
import ServiceAreaSchema from "./ServiceAreaSchema";
import { getAllServiceAreas, type ServiceArea } from "@/lib/service-areas";

export default function ServiceAreaPage({ area }: { area: ServiceArea }) {
  const nearbyAreas = getAllServiceAreas().filter((a) => a.slug !== area.slug);

  return (
    <>
      <ServiceAreaSchema area={area} />

      <main className="bg-[#EEEADA]">
        {/* Hero */}
        <ServiceAreaHero area={area} />

        {/* Intro + trainer card */}
        <section className="py-20 md:py-28 bg-[#EEEADA]">
          <RevealWrapper className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-[1fr_320px] lg:gap-16">
              {/* Intro prose */}
              <div className="min-w-0">
                <p className="text-xs tracking-[0.25em] uppercase text-gray-500 font-medium mb-4 reveal">
                  Why {area.city}
                </p>
                <div className="prose prose-lg max-w-none prose-p:text-gray-700 prose-p:leading-relaxed prose-p:text-lg">
                  {area.intro.map((p, i) => (
                    <p
                      key={i}
                      className={`reveal reveal-delay-${Math.min(i + 1, 5)}`}
                    >
                      {p}
                    </p>
                  ))}
                </div>
              </div>

              {/* Trainer card */}
              <aside className="lg:sticky lg:top-8 self-start reveal-scale">
                <div className="bg-white rounded-3xl shadow-sm overflow-hidden border border-black/5">
                  <div className="relative aspect-square">
                    <Image
                      src="/images/jeffrey-headshot-final.jpg"
                      alt="Jeffrey Sun, ACE-certified personal trainer"
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 33vw"
                    />
                  </div>
                  <div className="p-6">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
                      Your Trainer
                    </p>
                    <p className="text-xl font-bold text-[#1a1a1a] mb-1">
                      Jeffrey Sun
                    </p>
                    <p className="text-sm text-gray-500 mb-5">
                      ACE-Certified, 12,000+ sessions
                    </p>
                    <TrackedCTALink
                      href="/#apply"
                      section={`service_area_${area.slug}_trainer_card`}
                      buttonText="Book Free Consultation"
                      className="btn-primary w-full text-center text-sm"
                    >
                      Book Free Consultation
                    </TrackedCTALink>
                  </div>
                </div>
              </aside>
            </div>
          </RevealWrapper>
        </section>

        {/* Content sections */}
        <section
          id="how-training-works"
          className="py-20 md:py-28 bg-white scroll-mt-20"
        >
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            {area.sections.map((section, i) => (
              <RevealWrapper
                key={i}
                className={i > 0 ? "mt-14 md:mt-20" : ""}
              >
                {section.heading && (
                  <>
                    <h2 className="text-3xl md:text-4xl font-bold text-[#1a1a1a] leading-tight mb-3 reveal">
                      {section.heading}
                    </h2>
                    <div className="w-12 h-1 bg-[#FFD140] mb-8 reveal reveal-delay-1" />
                  </>
                )}
                <div className="prose prose-lg max-w-none prose-p:text-gray-700 prose-p:leading-[1.8] prose-p:text-lg">
                  {section.body.map((p, j) => (
                    <p
                      key={j}
                      className={`reveal reveal-delay-${Math.min(j + 2, 5)}`}
                    >
                      {p}
                    </p>
                  ))}
                </div>
              </RevealWrapper>
            ))}
          </div>
        </section>

        {/* Services grid */}
        <section className="py-20 md:py-28 bg-[#EEEADA]">
          <RevealWrapper className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mb-14">
              <p className="text-xs tracking-[0.25em] uppercase text-gray-500 font-medium mb-4 reveal">
                What I do
              </p>
              <h2 className="text-display scroll-skew text-[#1a1a1a] mb-3 reveal reveal-delay-1">
                Services
              </h2>
              <div className="w-12 h-1 bg-[#FFD140] reveal reveal-delay-2" />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {area.services.map((service, i) => (
                <div
                  key={service.title}
                  className={`bg-white rounded-2xl p-8 border border-black/5 hover:shadow-md transition-shadow reveal reveal-delay-${Math.min(i + 1, 5)}`}
                >
                  <div className="w-10 h-10 rounded-xl bg-[#FFD140] flex items-center justify-center mb-5">
                    <svg
                      className="w-5 h-5 text-black"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-[#1a1a1a] mb-3">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {service.description}
                  </p>
                </div>
              ))}
            </div>
          </RevealWrapper>
        </section>

        {/* Map */}
        <ServiceAreaMap area={area} />

        {/* FAQ */}
        <ServiceAreaFAQ faqs={area.faqs} city={area.city} />

        {/* Related reading */}
        {area.relatedPostSlugs.length > 0 && (
          <section className="py-20 md:py-24 bg-white">
            <RevealWrapper className="max-w-5xl mx-auto px-4 sm:px-6">
              <p className="text-xs tracking-[0.25em] uppercase text-gray-500 font-medium mb-4 reveal">
                Further reading
              </p>
              <h2 className="text-2xl md:text-3xl font-bold text-[#1a1a1a] mb-10 reveal reveal-delay-1">
                Articles I often share with {area.city} clients
              </h2>
              <div className="grid sm:grid-cols-2 gap-5">
                {area.relatedPostSlugs.map((post, i) => (
                  <Link
                    key={post.slug}
                    href={`/${post.category}/${post.slug}`}
                    className={`group flex items-center justify-between gap-6 p-6 rounded-2xl border border-black/10 hover:border-[#CB4538] hover:bg-[#CB4538]/5 transition-colors reveal reveal-delay-${Math.min(i + 2, 5)}`}
                  >
                    <span className="text-base md:text-lg font-semibold text-[#1a1a1a] leading-snug">
                      {post.label}
                    </span>
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-[#1a1a1a] text-white flex items-center justify-center transition-transform group-hover:translate-x-1">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </span>
                  </Link>
                ))}
              </div>
            </RevealWrapper>
          </section>
        )}

        {/* Nearby cities */}
        <section className="py-20 md:py-24 bg-[#EEEADA]">
          <RevealWrapper className="max-w-5xl mx-auto px-4 sm:px-6">
            <p className="text-xs tracking-[0.25em] uppercase text-gray-500 font-medium mb-4 reveal">
              Nearby areas
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-[#1a1a1a] mb-10 reveal reveal-delay-1">
              Personal training in other South Bay cities
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {nearbyAreas.map((a, i) => (
                <Link
                  key={a.slug}
                  href={a.urlPath}
                  className={`group flex items-center justify-between gap-3 px-5 py-4 rounded-2xl bg-white border border-black/10 hover:border-[#CB4538] hover:bg-[#CB4538]/5 transition-colors reveal reveal-delay-${Math.min(i + 1, 5)}`}
                >
                  <span className="text-sm md:text-base font-semibold text-[#1a1a1a] leading-tight">
                    {a.city}
                    <span className="block text-xs font-normal text-gray-500">
                      Personal trainer
                    </span>
                  </span>
                  <span className="flex-shrink-0 text-gray-400 group-hover:text-[#CB4538] transition-colors">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </span>
                </Link>
              ))}
            </div>
          </RevealWrapper>
        </section>

        {/* Final CTA */}
        <section className="py-24 md:py-32 bg-[#1a1a1a] text-white overflow-hidden relative">
          <div
            aria-hidden="true"
            className="absolute -bottom-48 -left-48 h-[500px] w-[500px] rounded-full bg-[#CB4538]/10 blur-3xl"
          />
          <RevealWrapper className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
            <p className="text-xs tracking-[0.25em] uppercase text-[#FFD140] font-medium mb-6 reveal">
              Free Consultation
            </p>
            <h2 className="text-display text-white mb-6 reveal reveal-delay-1">
              Ready to start training in{" "}
              <span className="highlight">{area.city}</span>?
            </h2>
            <p className="text-lg text-white/70 max-w-xl mx-auto mb-10 leading-relaxed reveal reveal-delay-2">
              First conversation is free. Real conversation about where you
              are and whether this is the right fit. If it is, we start the
              following week.
            </p>
            <div className="reveal reveal-delay-3">
              <TrackedCTALink
                href="/#apply"
                section={`service_area_${area.slug}_footer`}
                buttonText="Book Your Free Consultation"
                className="btn-secondary inline-block"
              >
                Book Your Free Consultation
              </TrackedCTALink>
            </div>
          </RevealWrapper>
        </section>
      </main>
      <Footer />
    </>
  );
}
