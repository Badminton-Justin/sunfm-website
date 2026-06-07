"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { trackEvent } from "@/lib/analytics";

const R2_BASE = "https://pub-46d372e7b4b84eaf8efe9f21cab9b2ba.r2.dev";

const FAQ_ITEMS = [
  {
    q: "What happens during the free consultation?",
    a: "A free 1-hour session, in-person or online. I'll run a real movement assessment, walk you through a short workout focused on breathwork, core, and mobility, and we'll talk through what you're trying to fix.",
  },
  {
    q: "What makes your training different?",
    a: "My background is in Human Biology and I worked as an EMT before becoming a trainer. I specialize in movement pattern correction — finding what's actually causing your pain or limitation, not just managing symptoms. The work focuses on mobility, strength that holds up over time, and undoing what desk work does to a body.",
  },
  {
    q: "How do you track progress?",
    a: "A training app tracks your workouts and progression. I check in on the big compound lifts monthly. For mobility work, I track pain levels and range of motion week over week. We set clear benchmarks during the consultation so you know what to look for.",
  },
  {
    q: "I have an injury or pain. Can I still train?",
    a: "Yes. Many of my clients come in while managing chronic pain or recovering from injury. I specialize in transitioning safely from therapy to training, often in coordination with your PT or doctor.",
  },
  {
    q: "How much does training cost?",
    a: "Packages vary by frequency. Most of my clients train 2-3 times a week. I'll cover specific pricing during the consultation once I know what fits your schedule and goals.",
  },
];

const VIDEO_TESTIMONIALS = [
  {
    name: "Marshall",
    result: "4-year client · Pain-free strength",
    poster: "Marshall_Edited_Poster.jpg",
    video: "Marshall_Edited.mp4",
  },
  {
    name: "Sneha",
    result: "Structured health lifestyle",
    poster: "Sneha_Edited_Poster.jpg",
    video: "Sneha_Edited.mp4",
  },
  {
    name: "Cristina",
    result: "Achieved goal weight",
    poster: "Cristina_Edited_Poster.jpg",
    video: "Cristina_Edited.mp4",
  },
  {
    name: "Kanth",
    result: "Discipline and strength",
    poster: "Kanth_Edited_Poster.jpg",
    video: "Kanth_Edited.mp4",
  },
];

const TEXT_TESTIMONIALS = [
  {
    quote: "I originally only planned to do sessions for a few months, and now it's been 4 years. Sessions with Jeff are really great and I'd recommend them to anyone.",
    name: "Marshall",
    result: "Pain-free strength",
  },
  {
    quote: "My body feels like a well-oiled machine and I feel stronger than ever before. He has been the best investment in my fitness journey and I highly recommend him.",
    name: "Sneha",
    result: "Structured health lifestyle",
  },
  {
    quote: "He made things seem doable rather than overwhelming. Jeff is incredibly easy to work with and he's truly become a friend. With his help, I've achieved my goal weight and I'm still going strong.",
    name: "Cristina",
    result: "Achieved goal weight",
  },
  {
    quote: "Before working with Jeff, I was never disciplined. Now, it has changed significantly for my workouts and diet. Thank you Jeff, thank you for everything.",
    name: "Kanth",
    result: "Discipline and strength",
  },
];

const STAR = (
  <svg className="w-4 h-4 text-[#FFD140]" fill="currentColor" viewBox="0 0 20 20">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

export default function StartLanding() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    goal: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const hasStarted = useRef(false);
  const successRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (submitStatus === "success" && successRef.current) {
      successRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [submitStatus]);

  // Hide the mobile sticky CTA when the form itself is visible on screen.
  useEffect(() => {
    const form = document.getElementById("start-form");
    if (!form) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsFormVisible(entry.isIntersecting),
      { threshold: 0.25 }
    );
    observer.observe(form);
    return () => observer.disconnect();
  }, []);

  const handleFieldFocus = (fieldName: string) => {
    if (!hasStarted.current) {
      hasStarted.current = true;
      trackEvent("form_start", { first_field: fieldName, source: "start_page" });
    }
  };

  const handleFieldBlur = (fieldName: string, value: string) => {
    if (value.trim()) {
      trackEvent("form_field_complete", { field_name: fieldName, source: "start_page" });
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");

    trackEvent("form_submit_attempt", { source: "start_page" });

    try {
      const response = await fetch("/api/submit-form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          age: "",
          goal: formData.goal,
          goalDetails: "",
          experience: "",
          currentRoutine: "",
          motivation: "",
          injuries: "",
          referral: "google-ads",
          referralDetails: "Submitted from /start landing page",
          contactMethod: "email",
        }),
      });

      if (response.ok) {
        trackEvent("form_submit_success", { source: "start_page" });
        setSubmitStatus("success");
        setFormData({ name: "", email: "", phone: "", goal: "" });
      } else {
        trackEvent("form_submit_error", { source: "start_page", error_type: `http_${response.status}` });
        setSubmitStatus("error");
      }
    } catch {
      trackEvent("form_submit_error", { source: "start_page", error_type: "network_error" });
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClasses =
    "w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#CB4538]/40 focus:border-[#CB4538]/60 transition-all";

  return (
    <div className="min-h-screen bg-[#F5F2ED]">
      {/* Minimal header — logo + studio address + call/text */}
      <header className="bg-white border-b border-black/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <Image
              src="/images/full-logo-transparent.png"
              alt="Sun FM"
              width={140}
              height={32}
              className="h-8 w-auto"
              priority
            />
          </Link>
          <div className="text-right">
            <p className="text-xs text-gray-500 leading-tight mb-0.5">
              1401 Parkmoor Ave, San Jose
            </p>
            <div className="flex items-center gap-2 justify-end text-sm leading-tight">
              <a
                href="tel:+14087614963"
                onClick={() => trackEvent("cta_click", { button_text: "Call", section: "start_header" })}
                className="font-medium text-[#1a1a1a] hover:text-[#CB4538] transition-colors"
              >
                (408) 761-4963
              </a>
              <span className="text-gray-300" aria-hidden="true">·</span>
              <a
                href="sms:+14087614963?body=Hi%20Jeff%2C%20I%27d%20like%20to%20learn%20more%20about%20training%20at%20Sun%20FM."
                onClick={() => trackEvent("cta_click", { button_text: "Text", section: "start_header" })}
                className="text-gray-500 hover:text-[#CB4538] transition-colors"
              >
                Text
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Hero + Form side-by-side */}
      <section className="relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 lg:py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Left: copy */}
            <div>
              <p className="text-xs sm:text-sm text-gray-500 tracking-[0.15em] uppercase mb-5 font-medium">
                Personal training in San Jose &amp; South Bay
              </p>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl text-[#1a1a1a] font-bold leading-[1.05] mb-6">
                Train without breaking down.
              </h1>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed max-w-lg">
                For busy professionals over 30 who want to feel strong, move
                well, and stay that way for the long run. Mobility, strength
                for longevity, and undoing what desk work does to your body.
              </p>

              {/* Trust pills */}
              <div className="flex flex-wrap items-center gap-3 mb-8 text-sm">
                <div className="flex items-center gap-2 bg-white border border-black/5 rounded-full px-4 py-2">
                  <div className="flex gap-0.5">{[...Array(5)].map((_, i) => <span key={i}>{STAR}</span>)}</div>
                  <span className="text-gray-700 font-medium">107 reviews</span>
                </div>
                <div className="bg-white border border-black/5 rounded-full px-4 py-2 text-gray-700 font-medium">
                  12,000+ sessions
                </div>
                <div className="bg-white border border-black/5 rounded-full px-4 py-2 text-gray-700 font-medium">
                  ACE-certified
                </div>
                <div className="bg-white border border-black/5 rounded-full px-4 py-2 text-gray-700 font-medium">
                  Mobility-first
                </div>
              </div>

              {/* Founder line */}
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Image
                  src="/images/jeffrey-headshot-final.jpg"
                  alt="Jeffrey Sun"
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-full object-cover"
                  style={{ objectPosition: "65% 15%" }}
                />
                <span>
                  Founded by <strong className="text-[#1a1a1a]">Jeffrey Sun</strong>, ACE-certified personal trainer
                </span>
              </div>
            </div>

            {/* Right: form */}
            <div id="start-form" className="bg-white rounded-2xl shadow-xl border border-black/5 p-6 sm:p-8 lg:sticky lg:top-8 scroll-mt-24">
              {submitStatus === "success" ? (
                <div ref={successRef} className="py-8 text-center">
                  <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-[#1a1a1a] mb-2">You&apos;re in.</h2>
                  <p className="text-gray-600">
                    Jeff will reach out within 24 hours to schedule your free consultation.
                  </p>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-[#1a1a1a] mb-1">Request your free consultation</h2>
                  <p className="text-sm text-gray-500 mb-6">1 hour, no obligation. I&apos;ll personally respond, usually within a few hours.</p>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">
                        Your name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        onFocus={() => handleFieldFocus("name")}
                        onBlur={(e) => handleFieldBlur("name", e.target.value)}
                        className={inputClasses}
                        placeholder="Jane Doe"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        onFocus={() => handleFieldFocus("email")}
                        onBlur={(e) => handleFieldBlur("email", e.target.value)}
                        className={inputClasses}
                        placeholder="jane@example.com"
                      />
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1.5">
                        Phone
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={handleChange}
                        onFocus={() => handleFieldFocus("phone")}
                        onBlur={(e) => handleFieldBlur("phone", e.target.value)}
                        className={inputClasses}
                        placeholder="(408) 555-0123"
                      />
                    </div>

                    <div>
                      <label htmlFor="goal" className="block text-sm font-medium text-gray-700 mb-1.5">
                        What&apos;s your main goal?
                      </label>
                      <select
                        id="goal"
                        name="goal"
                        required
                        value={formData.goal}
                        onChange={handleChange}
                        onFocus={() => handleFieldFocus("goal")}
                        className={inputClasses}
                      >
                        <option value="">Pick one</option>
                        <option value="Build strength and muscle">Build strength and muscle</option>
                        <option value="Lose weight and feel better">Lose weight and feel better</option>
                        <option value="Fix pain and improve mobility">Fix pain and improve mobility</option>
                        <option value="Get in shape for the long run">Get in shape for the long run</option>
                        <option value="Return to training after a break">Return to training after a break</option>
                        <option value="Not sure yet — want to talk it through">Not sure yet — want to talk it through</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-[#CB4538] hover:bg-[#a83829] disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-lg transition-colors text-base"
                    >
                      {isSubmitting ? "Sending..." : "Request my free consultation"}
                    </button>

                    {submitStatus === "error" && (
                      <p className="text-sm text-red-600 text-center">
                        Something went wrong. Try again, or text us at (408) 761-4963.
                      </p>
                    )}

                    <p className="text-xs text-gray-500 text-center pt-1">
                      No spam. No high-pressure sales. Just a conversation.
                    </p>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Text testimonials — horizontal carousel */}
      <section className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8">
            <p className="text-xs text-gray-500 tracking-[0.15em] uppercase font-medium">What my clients say</p>
          </div>
          <div className="-mx-4 sm:-mx-6">
            <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth px-4 sm:px-6 pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {TEXT_TESTIMONIALS.map((t) => (
                <div
                  key={t.name}
                  className="flex-none w-[85%] sm:w-[420px] snap-start bg-[#F5F2ED] rounded-2xl p-6 sm:p-8"
                >
                  <div className="flex gap-0.5 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <span key={i}>{STAR}</span>
                    ))}
                  </div>
                  <p className="text-gray-800 leading-relaxed mb-5">&ldquo;{t.quote}&rdquo;</p>
                  <p className="text-sm font-semibold text-[#1a1a1a]">{t.name}</p>
                  <p className="text-xs text-gray-500">{t.result}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <p className="text-xs text-gray-500 tracking-[0.15em] uppercase font-medium mb-3">How it works</p>
            <h2 className="text-3xl sm:text-4xl text-[#1a1a1a] font-bold">Three steps to your first session</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                num: "1",
                title: "Tell me what you&apos;re working with",
                desc: "30-second form. I&apos;ll personally respond, usually within a few hours, to set up a time that fits your schedule.",
              },
              {
                num: "2",
                title: "Movement screen + short workout",
                desc: "Free 1-hour session, in-person or online. I&apos;ll run a real movement assessment to find what&apos;s tight or compensating, walk you through a short workout so you feel how I coach, and map out what your body actually needs.",
              },
              {
                num: "3",
                title: "You leave with a plan",
                desc: "Either way, you walk out with a real read on where your body is and what to work on next. If we&apos;re a fit, I&apos;ll lay out training from there.",
              },
            ].map((step) => (
              <div key={step.num} className="text-center">
                <div className="w-12 h-12 bg-[#CB4538] text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {step.num}
                </div>
                <h3 className="font-bold text-[#1a1a1a] mb-2" dangerouslySetInnerHTML={{ __html: step.title }} />
                <p className="text-sm text-gray-600 leading-relaxed" dangerouslySetInnerHTML={{ __html: step.desc }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Video testimonials — horizontal carousel */}
      <section className="bg-[#F5F2ED] py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8">
            <p className="text-xs text-gray-500 tracking-[0.15em] uppercase font-medium">Hear from my clients</p>
          </div>
          <div className="-mx-4 sm:-mx-6">
            <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth px-4 sm:px-6 pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {VIDEO_TESTIMONIALS.map((t) => (
                <div key={t.name} className="flex-none w-[70%] sm:w-[280px] snap-start">
                  <div className="aspect-[9/16] rounded-2xl overflow-hidden bg-black shadow-xl mb-3">
                    <video
                      controls
                      playsInline
                      preload="metadata"
                      poster={`${R2_BASE}/${t.poster}`}
                      className="w-full h-full object-cover"
                    >
                      <source src={`${R2_BASE}/${t.video}`} type="video/mp4" />
                    </video>
                  </div>
                  <p className="text-sm font-semibold text-[#1a1a1a]">{t.name}</p>
                  <p className="text-xs text-gray-500">{t.result}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <p className="text-xs text-gray-500 tracking-[0.15em] uppercase font-medium mb-3">Common questions</p>
            <h2 className="text-3xl sm:text-4xl text-[#1a1a1a] font-bold">The basics</h2>
          </div>
          <div className="space-y-3">
            {FAQ_ITEMS.map((item, i) => (
              <div key={i} className="bg-white rounded-xl border border-black/5 overflow-hidden">
                <button
                  type="button"
                  onClick={() => {
                    const next = openFaq === i ? null : i;
                    setOpenFaq(next);
                    if (next !== null) {
                      trackEvent("faq_open", { question: item.q, source: "start_page" });
                    }
                  }}
                  className="w-full px-5 py-4 text-left flex items-center justify-between transition-colors"
                >
                  <span className="font-semibold text-[#1a1a1a]">{item.q}</span>
                  <svg
                    className={`w-5 h-5 text-gray-400 transition-transform ${openFaq === i ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5 text-gray-600 leading-relaxed">{item.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="bg-[#1a1a1a] py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl text-white font-bold mb-4">
            Ready to train without breaking down?
          </h2>
          <p className="text-lg text-white/70 mb-8 max-w-xl mx-auto">
            The first conversation is always free. We&apos;ll figure out what your body needs and what training would look like around your week.
          </p>
          <button
            type="button"
            onClick={() => {
              trackEvent("cta_click", { button_text: "Scroll to form", section: "start_closing" });
              const form = document.getElementById("start-form");
              if (form) {
                form.scrollIntoView({ behavior: "smooth", block: "center" });
              } else {
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
            }}
            className="bg-[#CB4538] hover:bg-[#a83829] text-white font-semibold px-8 py-4 rounded-lg transition-colors text-base"
          >
            Request my free consultation
          </button>
        </div>
      </section>

      {/* Minimal footer */}
      <footer className="bg-[#0f0f0f] text-white/60 py-8 text-sm pb-24 lg:pb-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row gap-4 sm:gap-6 items-center justify-between">
          <p>&copy; {new Date().getFullYear()} Sun Functional Movement. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="tel:+14087614963" className="hover:text-white transition-colors">
              (408) 761-4963
            </a>
            <Link href="/" className="hover:text-white transition-colors">
              Full site
            </Link>
          </div>
        </div>
      </footer>

      {/* Mobile sticky CTA — hidden on desktop, when form is visible, or after submit */}
      {submitStatus !== "success" && !isFormVisible && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-black/10 px-4 py-3 shadow-[0_-4px_12px_rgba(0,0,0,0.08)]">
          <button
            type="button"
            onClick={() => {
              trackEvent("cta_click", { button_text: "Sticky Book CTA", section: "start_sticky_mobile" });
              const form = document.getElementById("start-form");
              if (form) {
                form.scrollIntoView({ behavior: "smooth", block: "center" });
                const nameInput = form.querySelector('input[name="name"]') as HTMLInputElement | null;
                setTimeout(() => nameInput?.focus(), 600);
              }
            }}
            className="w-full bg-[#CB4538] hover:bg-[#a83829] text-white font-semibold py-3 rounded-lg transition-colors text-base"
          >
            Request Free Consultation
          </button>
        </div>
      )}
    </div>
  );
}
