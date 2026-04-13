"use client";

import Link from "next/link";
import { trackEvent } from "@/lib/analytics";
import { useReveal } from "@/hooks/useReveal";

export default function PainPoints() {
  const scrollToApply = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const element = document.querySelector("#apply");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const revealRef = useReveal<HTMLDivElement>();

  const painPoints = [
    "Constant neck and upper back tightness from desk jobs",
    "Low back pain from a sedentary lifestyle",
    "Lack of structure and routine in exercise and health",
    "Never learning proper form or getting formal instruction",
    "Wanting to feel strong and capable in your body again",
  ];

  return (
    <section className="section-padding bg-[#F5F2ED]">
      <div className="max-w-5xl mx-auto" ref={revealRef}>
        {/* Section header */}
        <div className="mb-16 reveal" style={{ transitionDelay: '0ms' }}>
          <p className="text-[#CB4538] font-semibold text-xs tracking-[0.2em] uppercase mb-4">Sound familiar?</p>
          <h2 className="text-display scroll-skew text-[#1a1a1a]">
            Are You Tired Of&hellip;
          </h2>
        </div>

        {/* Pain points - large type list */}
        <div className="mb-16">
          {painPoints.map((point, index) => (
            <div
              key={index}
              className={`pain-row group border-b border-black/10 py-6 md:py-8 flex items-baseline gap-4 md:gap-6 cursor-default reveal reveal-delay-${Math.min(index + 1, 5)}`}
            >
              <span className="pain-number text-[#CB4538] font-display text-lg md:text-xl shrink-0 opacity-40 transition-all duration-300">
                {String(index + 1).padStart(2, '0')}
              </span>
              <p className="text-xl md:text-2xl lg:text-3xl text-[#1a1a1a] font-display tracking-tight leading-tight">
                {point}
              </p>
            </div>
          ))}
        </div>

        {/* Transition text */}
        <div className="max-w-2xl reveal reveal-delay-3">
          <p className="text-xl md:text-2xl text-gray-600 mb-6 leading-relaxed font-display">
            What might sound too good to be true is{" "}
            <strong className="text-[#1a1a1a]">totally achievable with the right system.</strong>
          </p>
          <p className="text-lg text-gray-500 mb-10 leading-relaxed">
            That&apos;s why I created a training approach focused on{" "}
            <span className="highlight font-semibold">health longevity</span> &mdash;
            not quick fixes that don&apos;t last.
          </p>
          <a
            href="#apply"
            onClick={(e) => {
              scrollToApply(e);
              trackEvent("cta_click", { button_text: "Start Your Transformation", section: "pain_points" });
            }}
            className="btn-primary"
          >
            Start Your Transformation
          </a>

          {/* Internal links to relevant blog content */}
          <div className="mt-10 pt-8 border-t border-black/10">
            <p className="text-sm text-gray-400 uppercase tracking-wider mb-3">Related reading</p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-6">
              <Link href="/training/functional-movement-exercises-for-desk-workers" className="text-sm text-gray-600 hover:text-[#CB4538] transition-colors underline underline-offset-4">
                Exercises for desk workers
              </Link>
              <Link href="/training/strength-training-for-longevity-beginners-guide-over-30" className="text-sm text-gray-600 hover:text-[#CB4538] transition-colors underline underline-offset-4">
                Strength training after 30
              </Link>
              <Link href="/wellness/personal-training-for-stress-relief-bay-area" className="text-sm text-gray-600 hover:text-[#CB4538] transition-colors underline underline-offset-4">
                Training for stress relief
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
