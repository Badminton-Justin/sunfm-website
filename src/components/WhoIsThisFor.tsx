"use client";

import { useReveal } from "@/hooks/useReveal";

export default function WhoIsThisFor() {
  const revealRef = useReveal<HTMLDivElement>();
  const idealClients = [
    {
      title: "Working professionals",
      description: "Who want to invest in their long-term health and have the discipline to show up consistently.",
    },
    {
      title: "People recovering from injury",
      description: "Looking to transition from physical therapy back to full training safely and effectively.",
    },
    {
      title: "Those experiencing chronic pain",
      description: "Neck pain, back pain, shoulder issues - who want to address the root cause, not just mask symptoms.",
    },
    {
      title: "Athletes and active individuals",
      description: "Who want to improve performance, prevent injuries, and move more efficiently.",
    },
    {
      title: "Health-conscious individuals",
      description: "Who understand that investing in their body now pays dividends for decades to come.",
    },
  ];

  const notForList = [
    "Quick-fix seekers focused only on a number on the scale",
    "Those looking for crash diets or unsustainable programs",
    "People who can't commit to consistent training",
  ];

  return (
    <section className="section-padding bg-[#F5F2ED]">
      <div className="max-w-7xl mx-auto" ref={revealRef}>
        {/* Two-column asymmetric layout */}
        <div className="grid md:grid-cols-[1.2fr_1fr] gap-16 md:gap-24">
          {/* This IS for you */}
          <div className="reveal">
            <p className="text-xs tracking-[0.2em] uppercase text-[#CB4538] mb-4 font-medium">Good fit</p>
            <h2 className="text-display scroll-skew text-[#1a1a1a] mb-12">
              This Is For You If&hellip;
            </h2>

            <div className="space-y-0">
              {idealClients.map((client, index) => (
                <div
                  key={index}
                  className="py-6 border-b border-black/8 group"
                >
                  <h3 className="font-display text-xl md:text-2xl text-[#1a1a1a] mb-2 tracking-tight">{client.title}</h3>
                  <p className="text-gray-500 leading-relaxed">{client.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* This is NOT for you */}
          <div className="md:pt-24 reveal reveal-delay-2">
            <p className="text-xs tracking-[0.2em] uppercase text-gray-400 mb-4 font-medium">Not a fit</p>
            <h2 className="font-display text-2xl md:text-3xl text-[#1a1a1a] mb-8 tracking-tight">
              This Is NOT For You If&hellip;
            </h2>

            <ul className="space-y-4 mb-12">
              {notForList.map((item, index) => (
                <li key={index} className="text-gray-500 leading-relaxed pl-4 border-l-2 border-gray-200">
                  {item}
                </li>
              ))}
            </ul>

            {/* Philosophy box */}
            <div className="bg-[#1a1a1a] rounded-2xl p-8 md:p-10 text-white">
              <p className="text-xs tracking-[0.2em] uppercase text-[#FFD140] mb-4">My Philosophy</p>
              <p className="text-white/80 mb-4 leading-relaxed">
                I believe in training for <span className="text-[#FFD140] font-semibold italic font-display">health longevity</span>.
                That means building a body that serves you well not just today, but for the next 30, 40, 50+ years.
              </p>
              <p className="text-white/80 leading-relaxed">
                If you&apos;re looking for someone to help you lose 20 pounds in a month, I&apos;m not your guy.
                But if you want to build sustainable strength, eliminate pain, and feel capable in your body
                for decades to come &mdash; let&apos;s talk.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
