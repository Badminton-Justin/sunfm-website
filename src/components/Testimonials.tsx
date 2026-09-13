"use client";

import { useRef, useEffect } from "react";
import Image from "next/image";
import TrackedVideo from "@/components/TrackedVideo";
import TrackedLink from "@/components/TrackedLink";
import AnimatedCounter from "@/components/AnimatedCounter";
import { useReveal } from "@/hooks/useReveal";
import { trackEvent } from "@/lib/analytics";

const R2_BASE = "https://pub-46d372e7b4b84eaf8efe9f21cab9b2ba.r2.dev";

// The poster JPGs in R2 are full-size originals (the largest is 836KB). A
// <video poster> can't take a next/image component, so point it at the
// optimizer route directly — same resizing and WebP/AVIF negotiation, just
// addressed by URL. Cards render at most 320px wide, so 640 covers 2x DPR.
const poster = (url: string) =>
  `/_next/image?url=${encodeURIComponent(url)}&w=640&q=70`;

const videoTestimonials = [
  {
    videoUrl: `${R2_BASE}/Sneha_Edited.mp4`,
    posterUrl: `${R2_BASE}/Sneha_Edited_Poster.jpg`,
    name: "Sneha",
    role: "",
    result: "Structured Health Lifestyle",
    quote:
      "My body feels like a well-oiled machine and I feel stronger than ever before. Jeff makes the entire journey very enjoyable. He has been the best investment in my fitness journey and I highly recommend him.",
  },
  {
    videoUrl: `${R2_BASE}/Marshall_Edited.mp4`,
    posterUrl: `${R2_BASE}/Marshall_Edited_Poster.jpg`,
    name: "Marshall",
    role: "",
    result: "Pain Free & Functional Strength",
    quote:
      "I originally only planned to do sessions for a few months, and now it's been 4 years. Sessions with Jeff are really great and I'd recommend them to anyone.",
  },
  {
    videoUrl: `${R2_BASE}/Cristina_Edited.mp4`,
    posterUrl: `${R2_BASE}/Cristina_Edited_Poster.jpg`,
    name: "Cristina",
    role: "",
    result: "Achieved Dream Weight",
    quote:
      "He made things seem doable rather than overwhelming. Jeff is incredibly easy to work with and he's truly become a friend. With his help, I've achieved my goal weight and I'm still going strong.",
  },
  {
    videoUrl: `${R2_BASE}/Kanth_Edited.mp4`,
    posterUrl: `${R2_BASE}/Kanth_Edited_Poster.jpg`,
    name: "Kanth",
    role: "",
    result: "Discipline and Strength Building",
    quote:
      "Before working with Jeff, I was never disciplined. Now, it has changed significantly for my workouts and diet. Thank you Jeff, thank you for everything.",
  },
  {
    videoUrl: `${R2_BASE}/Josh_Edited.mp4`,
    posterUrl: `${R2_BASE}/Josh_Edited_Poster.jpg`,
    name: "Josh",
    role: "",
    result: "Consistency and Health Longevity",
    quote:
      "Working with Jeff completely changed the way that I train. His programs have helped me stay consistent for over 3 years. I would highly recommend working with Jeff.",
  },
  {
    videoUrl: `${R2_BASE}/Chen_Edited.mp4`,
    posterUrl: `${R2_BASE}/Chen_Edited_Poster.jpg`,
    name: "Chen",
    role: "",
    result: "Cured Neck and Low Back Pain",
    quote:
      "Jeff helps me move out of my comfort zone. He really understands what I would like to achieve.",
  },
  {
    videoUrl: `${R2_BASE}/Curtis_Edited.mp4`,
    posterUrl: `${R2_BASE}/Curtis_Edited_Poster.jpg`,
    name: "Curtis",
    role: "",
    result: "Flexibility and Strength",
    quote:
      "Jeff is very detail oriented. The workouts were much more fun and I saw a lot of results. He was able to balance out my body and keep me consistent.",
  },
  {
    videoUrl: `${R2_BASE}/Karson_Edited.mp4`,
    posterUrl: `${R2_BASE}/Karson_Edited_Poster.jpg`,
    name: "Karson",
    role: "",
    result: "Functional Strength for Life",
    quote:
      "Before Jeff, I went to the gym once a week. After, I consistently go to the gym twice a week. My strength has gotten a lot better and my body has gotten a lot more toned.",
  },
];

export default function Testimonials() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const revealRef = useReveal<HTMLDivElement>(0.1);
  const hasNudged = useRef(false);

  // Auto-scroll hint: nudge right then back after 3s
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || hasNudged.current) return;
    const timer = setTimeout(() => {
      if (el.scrollLeft === 0) {
        hasNudged.current = true;
        el.scrollTo({ left: 60, behavior: "smooth" });
        setTimeout(() => el.scrollTo({ left: 0, behavior: "smooth" }), 600);
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const el = scrollRef.current;
    const scrollAmount = 340;

    trackEvent("testimonial_nav", { direction });

    if (direction === "right") {
      const maxScroll = el.scrollWidth - el.clientWidth;
      if (el.scrollLeft >= maxScroll - 10) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        el.scrollBy({ left: scrollAmount, behavior: "smooth" });
      }
    } else {
      if (el.scrollLeft <= 10) {
        el.scrollTo({ left: el.scrollWidth - el.clientWidth, behavior: "smooth" });
      } else {
        el.scrollBy({ left: -scrollAmount, behavior: "smooth" });
      }
    }
  };

  return (
    <section id="testimonials" className="section-padding bg-[#1a1a1a] text-white overflow-hidden">
      <div className="max-w-7xl mx-auto" ref={revealRef}>
        {/* Section header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12 px-4 sm:px-0 reveal">
          <div>
            <p className="text-xs tracking-[0.2em] uppercase text-gray-500 mb-4">Testimonials</p>
            <h2 className="text-display scroll-skew text-white">
              What Clients Say
            </h2>
          </div>
          <div className="flex items-center gap-6">
            <p className="text-gray-400 max-w-sm text-sm leading-relaxed hidden md:block">
              Real results from real people who are committed to their health.
            </p>
            {/* Navigation arrows */}
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => scroll("left")}
                className="w-11 h-11 rounded-full border border-white/20 flex items-center justify-center hover:bg-white hover:text-black transition-all"
                aria-label="Previous testimonial"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={() => scroll("right")}
                className="w-11 h-11 rounded-full border border-white/20 flex items-center justify-center hover:bg-white hover:text-black transition-all"
                aria-label="Next testimonial"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Horizontal scroll testimonials */}
        <div
          ref={scrollRef}
          className="scroll-container gap-5 pb-4 px-4 sm:px-0"
        >
          {videoTestimonials.map((t, index) => (
            <div
              key={index}
              className="scroll-item w-[260px] sm:w-[300px] md:w-[320px] flex flex-col"
            >
              {/* Video */}
              <div className="mb-4">
                <TrackedVideo
                  videoName={t.name}
                  src={t.videoUrl}
                  poster={poster(t.posterUrl)}
                  controls
                  playsInline
                  preload="none"
                  className="w-full aspect-[9/16] rounded-xl object-cover bg-black/50"
                />
              </div>
              {/* Info */}
              <div className="flex-1">
                <p className="text-[#FFD140] text-xs font-semibold tracking-[0.1em] uppercase mb-2">
                  {t.result}
                </p>
                <p className="text-white/90 text-sm leading-relaxed mb-3">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <p className="text-white font-semibold text-sm">{t.name}</p>
                {t.role && <p className="text-gray-500 text-xs">{t.role}</p>}
              </div>
            </div>
          ))}
        </div>

        {/* Community + Social proof */}
        <div className="mt-16 grid md:grid-cols-2 gap-8 items-center reveal reveal-delay-2">
          <div className="relative rounded-xl overflow-hidden aspect-[16/9]">
            <Image
              src="/images/group.jpg"
              alt="SunFM community - clients trained by Jeffrey Sun"
              fill
              className="object-cover [object-position:50%_33%]"
            />
          </div>
          <div className="px-4 sm:px-0">
            <div className="inline-block bg-[#FFD140] rounded-xl px-6 py-3 mb-6">
              <p className="text-4xl md:text-5xl font-display text-[#1a1a1a]"><AnimatedCounter target={107} duration={1000} /></p>
              <p className="text-sm text-black/60">clients trained</p>
            </div>
            <p className="text-gray-400 text-lg mb-6">
              And counting. Join our community.
            </p>
            <div className="flex items-center gap-6 text-sm">
              <span className="text-gray-500">See reviews on</span>
              <TrackedLink
                href="https://www.yelp.com/biz/sun-functional-movement-san-jose"
                platform="yelp"
                section="testimonials"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-[#FFD140] transition-colors font-medium underline underline-offset-4"
              >
                Yelp
              </TrackedLink>
              <TrackedLink
                href="https://maps.app.goo.gl/XyrnsHXu9K1xYqXw5"
                platform="google_maps"
                section="testimonials"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-[#FFD140] transition-colors font-medium underline underline-offset-4"
              >
                Google
              </TrackedLink>
              <TrackedLink
                href="https://www.instagram.com/jeffsunfitness/"
                platform="instagram"
                section="testimonials"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-[#FFD140] transition-colors font-medium underline underline-offset-4"
              >
                Instagram
              </TrackedLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
