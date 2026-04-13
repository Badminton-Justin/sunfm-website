"use client";

import Image from "next/image";
import Link from "next/link";
import MeetTeamLink from "@/components/MeetTeamLink";
import AnimatedCounter from "@/components/AnimatedCounter";
import { useReveal } from "@/hooks/useReveal";

export default function About() {
  const revealRef = useReveal<HTMLDivElement>();
  const badgeRef = useReveal<HTMLDivElement>(0.3);

  const specialties = [
    "Mobility & Flexibility",
    "Movement Pattern Correction",
    "Transition from Therapy to Training",
    "Hypertrophy",
    "Athletic Performance",
    "Functional Strength",
    "Weight Loss",
  ];

  const education = [
    "B.S. Human Biology - UC Santa Cruz",
    "ACE Certified Personal Trainer",
    "Division III Athletic Training Internship",
    "CPR/AED Certified",
  ];

  const experience = [
    "12,000+ training sessions delivered",
    "Former Youth Gymnastics and Soccer Coach",
    "Former Emergency Medical Technician",
  ];

  return (
    <section id="about" className="section-padding bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto" ref={revealRef}>
        {/* Header */}
        <div className="mb-20 reveal">
          <p className="text-xs tracking-[0.2em] uppercase text-gray-400 mb-4">About</p>
          <h2 className="text-display scroll-skew text-[#1a1a1a]">
            Meet Your Coach
          </h2>
        </div>

        <div className="grid md:grid-cols-[1fr_1.1fr] gap-12 md:gap-20 items-start">
          {/* Left - Image with overlaid stat */}
          <div className="relative reveal reveal-delay-1">
            <div className="rounded-2xl overflow-hidden aspect-[4/5] relative">
              <Image
                src="/images/jeffrey-hero.jpg"
                alt="Jeffrey Sun - Personal Trainer"
                fill
                className="object-cover"
              />
            </div>
            {/* Stat callout */}
            <div
              ref={badgeRef}
              className="mt-4 md:mt-0 md:absolute md:-bottom-6 md:-right-8 bg-[#FFD140] rounded-xl px-6 py-4 shadow-lg reveal-scale inline-block"
              style={{ transitionDelay: '400ms' }}
            >
              <p className="text-3xl md:text-4xl font-display text-[#1a1a1a]"><AnimatedCounter target={12000} duration={1400} /></p>
              <p className="text-sm text-black/60">sessions delivered</p>
            </div>
          </div>

          {/* Right - Bio */}
          <div className="reveal reveal-delay-2">
            <h3 className="font-display text-3xl md:text-4xl text-[#1a1a1a] mb-2 tracking-tight">
              Jeffrey Sun
            </h3>
            <p className="text-[#CB4538] text-sm font-medium mb-8 tracking-wide">
              ACE Certified Personal Trainer | B.S. Human Biology
            </p>

            <p className="text-gray-600 mb-6 text-lg leading-relaxed">
              As a certified personal trainer with a degree in Human Biology, I
              specialize in helping busy professionals in their 20s and 30s
              build bodies that last. My approach is rooted in physiology and
              focused on <strong className="text-[#1a1a1a]">health longevity</strong> - not crash diets or
              unsustainable programs.
            </p>

            <p className="text-gray-500 mb-12 leading-relaxed">
              With my background as an EMT and athletic trainer, I understand
              the body at a deeper level. I&apos;ve seen what happens when
              people neglect their health, and I&apos;m here to make sure that
              doesn&apos;t happen to you. Based in the South Bay Area, I train
              clients from San Jose, Sunnyvale, Cupertino, Santa Clara, and
              Mountain View - both in-person and online.
            </p>

            {/* Specialties */}
            <div className="mb-10">
              <h4 className="text-xs tracking-[0.2em] uppercase text-gray-400 mb-4 font-medium">Specialties</h4>
              <div className="flex flex-wrap gap-2">
                {specialties.map((specialty, index) => (
                  <span
                    key={index}
                    className="border border-black/15 text-[#1a1a1a] px-4 py-1.5 rounded-full text-sm"
                  >
                    {specialty}
                  </span>
                ))}
              </div>
            </div>

            {/* Education & Experience in columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div>
                <h4 className="text-xs tracking-[0.2em] uppercase text-gray-400 mb-4 font-medium">Education</h4>
                <ul className="space-y-3">
                  {education.map((item, index) => (
                    <li key={index} className="text-gray-600 leading-relaxed">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-xs tracking-[0.2em] uppercase text-gray-400 mb-4 font-medium">Experience</h4>
                <ul className="space-y-3">
                  {experience.map((item, index) => (
                    <li key={index} className="text-gray-600 leading-relaxed">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-10 flex flex-col sm:flex-row gap-4 sm:gap-6">
              <MeetTeamLink />
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 text-[#1a1a1a] font-semibold hover:text-[#CB4538] transition-colors underline underline-offset-4"
              >
                Read the blog
              </Link>
              <Link
                href="/nutrition/meal-prep-for-busy-professionals"
                className="inline-flex items-center gap-2 text-gray-500 font-medium hover:text-[#CB4538] transition-colors underline underline-offset-4 text-sm"
              >
                Nutrition tips
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
