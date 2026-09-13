"use client";

import { useState } from "react";
import { trackEvent } from "@/lib/analytics";
import { useReveal } from "@/hooks/useReveal";

export default function FAQ() {
  const faqs = [
    {
      question: "Where are training sessions held?",
      answer:
        "I offer both in-person and online training. In-person sessions are held at the studio in San Jose, with clients coming from Sunnyvale, Cupertino, Santa Clara, Mountain View, Campbell, and throughout the South Bay Area. Online sessions are conducted via video call and are just as effective for most clients.",
    },
    {
      question: "What happens during the free consultation?",
      answer:
        "The consultation is a free 1-hour session where we discuss your goals, assess your current fitness level, and identify any pain points or limitations. It includes a talking consult at the beginning, a short workout focusing on breathwork, abs, and mobility, and a breakdown of how my training program would work for you. There's no obligation to sign up.",
    },
    {
      question: "How much does training cost?",
      answer:
        "Pricing depends on your specific needs and training frequency. I offer various packages ranging from individual sessions to comprehensive monthly programs. During the free consultation, I'll recommend the best option for your goals and budget. Most clients invest in packages that work out to 2-3 sessions per week.",
    },
    {
      question: "Do you offer online training?",
      answer:
        "Yes! I offer online training for clients who travel frequently or prefer the flexibility of training from home. Online sessions include live video coaching, custom programming through my training app, and ongoing support. Many clients do a mix of in-person and online sessions.",
    },
    {
      question: "What makes your approach different?",
      answer:
        "I focus on health longevity, not quick fixes. My background in Human Biology and experience as an EMT gives me a deeper understanding of how the body works. I specialize in movement pattern correction, helping clients eliminate pain at the source rather than just treating symptoms. Most importantly, I teach you WHY, not just what to do.",
    },
    {
      question: "How do you track progress?",
      answer:
        "I use a combination of methods: my training app tracks your workouts and progress, periodic DEXA scans give us accurate body composition data, and I check in on big compound lifts monthly. For mobility work, I use pain levels and range of motion as indicators. We'll set clear benchmarks during your consultation.",
    },
    {
      question: "I have an injury. Can I still train?",
      answer:
        "Many of my clients come to me while recovering from injuries or dealing with chronic pain. My specialty is transitioning people from therapy to training safely. I work with your healthcare providers when needed and modify exercises to accommodate your limitations while still making progress.",
    },
    {
      question: "What if my schedule is packed?",
      answer:
        "I understand busy professionals have demanding schedules. That's why I offer flexible scheduling including early morning and evening slots. We can also do a mix of in-person and online sessions to fit your availability. Even 1 session per week can lead to significant progress when done consistently.",
    },
    {
      question: "Do I need any equipment?",
      answer:
        "For in-person training, I have all the equipment we need. For online sessions, basic equipment like dumbbells, resistance bands, and a mat are helpful but not required to start. I can design effective programs with minimal equipment. During your consultation, I'll recommend what to get based on your goals and space.",
    },
  ];

  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const revealRef = useReveal<HTMLDivElement>();

  return (
    <section className="section-padding bg-[#F5F2ED]">
      <div className="max-w-7xl mx-auto" ref={revealRef}>
        <div className="grid md:grid-cols-[1fr_1.5fr] gap-12 md:gap-20">
          {/* Left - sticky header */}
          <div className="md:sticky md:top-32 md:self-start reveal">
            <p className="text-xs tracking-[0.2em] uppercase text-gray-400 mb-4">FAQ</p>
            <h2 className="text-display scroll-skew text-[#1a1a1a] mb-6">
              Common Questions
            </h2>
            <p className="text-gray-500 mb-6 leading-relaxed">
              Everything you need to know before getting started.
            </p>
            <div>
              <p className="text-gray-400 text-sm mb-1">Still have questions?</p>
              <a
                href="mailto:jeff@sunfm.fitness"
                className="text-[#CB4538] font-medium hover:underline underline-offset-4 transition-colors"
                onClick={() => trackEvent("external_link_click", { platform: "email", section: "faq" })}
              >
                jeff@sunfm.fitness
              </a>
            </div>
          </div>

          {/* Right - accordion */}
          <div className="border-t border-black/10 reveal reveal-delay-2">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="border-b border-black/10"
              >
                <button
                  onClick={() => {
                    const isOpening = openIndex !== index;
                    setOpenIndex(openIndex === index ? null : index);
                    if (isOpening) {
                      trackEvent("faq_toggle", { question: faq.question.slice(0, 50) });
                    }
                  }}
                  className="w-full py-6 flex items-start justify-between text-left gap-4 group"
                >
                  <span className={`text-lg font-medium transition-colors ${openIndex === index ? 'text-[#1a1a1a]' : 'text-gray-500 group-hover:text-[#1a1a1a]'}`}>
                    {faq.question}
                  </span>
                  <span className={`text-2xl leading-none shrink-0 mt-0.5 transition-colors ${openIndex === index ? 'text-[#CB4538]' : 'text-gray-300'}`}>
                    {openIndex === index ? "\u2212" : "+"}
                  </span>
                </button>
                {openIndex === index && (
                  <div className="pb-6 pr-0 md:pr-12">
                    <p className="text-gray-500 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
