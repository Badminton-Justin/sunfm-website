"use client";

import { useState } from "react";
import RevealWrapper from "@/components/RevealWrapper";
import { trackEvent } from "@/lib/analytics";
import type { FAQ } from "@/lib/service-areas";

function FAQItem({
  faq,
  delayClass,
  onToggle,
}: {
  faq: FAQ;
  delayClass: string;
  onToggle: (question: string, opening: boolean) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={`group bg-white rounded-2xl border border-black/5 overflow-hidden ${open ? "shadow-sm" : ""} transition-shadow reveal ${delayClass}`}
    >
      <button
        type="button"
        onClick={() => {
          const next = !open;
          setOpen(next);
          onToggle(faq.question, next);
        }}
        aria-expanded={open}
        className="w-full cursor-pointer text-left p-6 flex items-start justify-between gap-6"
      >
        <h3 className="text-base md:text-lg font-semibold text-[#1a1a1a] leading-snug">
          {faq.question}
        </h3>
        <span
          className={`flex-shrink-0 w-6 h-6 mt-0.5 flex items-center justify-center rounded-full bg-[#FFD140] text-black transition-transform duration-300 ${
            open ? "rotate-45" : ""
          }`}
          aria-hidden="true"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
          </svg>
        </span>
      </button>

      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-out ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div
            className={`px-6 pb-6 -mt-1 text-gray-600 leading-relaxed transition-opacity duration-200 ${
              open ? "opacity-100 delay-100" : "opacity-0"
            }`}
          >
            {faq.answer}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ServiceAreaFAQ({
  faqs,
  city,
}: {
  faqs: FAQ[];
  city: string;
}) {
  const handleToggle = (question: string, opening: boolean) => {
    if (opening) {
      trackEvent("faq_toggle", {
        question: question.slice(0, 50),
        section: "service_area_faq",
      });
    }
  };

  return (
    <section className="py-20 md:py-28 bg-[#EEEADA]">
      <RevealWrapper className="max-w-3xl mx-auto px-4 sm:px-6">
        <p className="text-xs tracking-[0.25em] uppercase text-gray-500 font-medium mb-4 reveal">
          FAQ
        </p>
        <h2 className="text-display scroll-skew text-[#1a1a1a] mb-3 reveal reveal-delay-1">
          Questions from {city} clients
        </h2>
        <div className="w-12 h-1 bg-[#FFD140] mb-12 reveal reveal-delay-2" />

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <FAQItem
              key={i}
              faq={faq}
              delayClass={`reveal-delay-${Math.min(i + 1, 5)}`}
              onToggle={handleToggle}
            />
          ))}
        </div>
      </RevealWrapper>
    </section>
  );
}
