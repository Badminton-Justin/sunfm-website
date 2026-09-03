"use client";

import { useState, useEffect, useRef } from "react";
import { trackEvent, setEnhancedConversionUserData } from "@/lib/analytics";
import { captureAttribution } from "@/lib/attribution";
import { useReveal } from "@/hooks/useReveal";
import { SMS_CONSENT_TEXT } from "@/lib/sms-consent";

interface FormData {
  name: string;
  email: string;
  phone: string;
  age: string;
  goal: string;
  goalDetails: string;
  experience: string;
  currentRoutine: string;
  motivation: string;
  injuries: string;
  referral: string;
  referralDetails: string;
}

export default function ApplicationForm() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    age: "",
    goal: "",
    goalDetails: "",
    experience: "",
    currentRoutine: "",
    motivation: "",
    injuries: "",
    referral: "",
    referralDetails: "",
  });
  const [smsConsent, setSmsConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const successRef = useRef<HTMLDivElement>(null);
  const hasStarted = useRef(false);
  const attributionRef = useRef<Record<string, string>>({});
  const revealRef = useReveal<HTMLDivElement>(0.1);

  useEffect(() => {
    attributionRef.current = captureAttribution();
  }, []);

  const handleFieldFocus = (fieldName: string) => {
    if (!hasStarted.current) {
      hasStarted.current = true;
      trackEvent("form_start", { first_field: fieldName });
    }
  };

  const handleFieldBlur = (fieldName: string, value: string) => {
    if (value.trim()) {
      trackEvent("form_field_complete", { field_name: fieldName });
    } else {
      trackEvent("form_field_abandon", { field_name: fieldName });
    }
  };

  const handleDropdownChange = (fieldName: string, value: string) => {
    if (value) {
      trackEvent("form_dropdown_select", { field_name: fieldName, value });
    }
  };

  useEffect(() => {
    if (submitStatus === "success" && successRef.current) {
      successRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [submitStatus]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");

    const fieldsCompleted = Object.values(formData).filter((v) => v.trim()).length;
    trackEvent("form_submit_attempt", { fields_completed: fieldsCompleted });

    try {
      const response = await fetch("/api/submit-form", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          smsConsent,
          attribution: attributionRef.current,
          landingPage: "/",
        }),
      });

      if (response.ok) {
        setEnhancedConversionUserData(formData.email, formData.phone);
        trackEvent("form_submit_success", {
          ...attributionRef.current,
          landing_page: "/",
        });
        setSubmitStatus("success");
        setSmsConsent(false);
        setFormData({
          name: "",
          email: "",
          phone: "",
          age: "",
          goal: "",
          goalDetails: "",
          experience: "",
          currentRoutine: "",
          motivation: "",
          injuries: "",
          referral: "",
          referralDetails: "",
        });
      } else {
        trackEvent("form_submit_error", { error_type: `http_${response.status}` });
        setSubmitStatus("error");
      }
    } catch {
      trackEvent("form_submit_error", { error_type: "network_error" });
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const goalOptions = [
    "Eliminate pain and improve mobility",
    "Build muscle and get stronger",
    "Get comfortable in a gym setting",
    "Transition from physical therapy to training",
    "Recover from injury",
    "General health and longevity",
    "Other",
  ];

  const experienceOptions = [
    "Complete beginner - never worked out",
    "Some experience - worked out on my own",
    "Intermediate - regular gym goer",
    "Advanced - played sports or trained consistently",
  ];

  const referralOptions = [
    "Google Search",
    "Yelp",
    "Instagram",
    "Friend/Family Referral",
    "Other",
  ];

  const inputClasses = "w-full px-4 py-3.5 bg-white/[0.07] border border-white/15 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#FFD140]/50 focus:border-[#FFD140]/50 transition-all text-base";
  const selectClasses = "w-full px-4 py-3.5 bg-white/[0.07] border border-white/15 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#FFD140]/50 focus:border-[#FFD140]/50 transition-all text-base appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20fill%3D%22%23999%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20d%3D%22M7%2010l5%205%205-5z%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_0.75rem_center]";

  return (
    <section id="apply" className="bg-[#0f0f0f] relative overflow-hidden">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2" ref={revealRef}>
        {/* Left - display text */}
        <div className="pt-12 pb-6 md:py-20 lg:py-28 flex flex-col justify-center px-6 md:px-12 lg:px-16 reveal">
          <p className="text-xs tracking-[0.2em] uppercase text-[#FFD140] mb-6">Get started</p>
          <h2 className="text-display text-white mb-6">
            Book Your{" "}
            <em className="text-[#FFD140]">Free</em>{" "}
            Consultation
          </h2>
          <p className="text-white/50 text-lg leading-relaxed mb-6">
            Fill out the form and I&apos;ll reach out to schedule your free
            1-hour consultation. No commitment required.
          </p>
          <p className="text-[#FFD140] text-sm font-medium">
            Plus: Get a free mobility assessment + 1-week plan
          </p>
        </div>

        {/* Right - form */}
        <div className="pt-6 pb-12 md:py-20 lg:py-28 px-6 md:px-12 lg:px-16 bg-white/[0.03] reveal reveal-delay-2">
          {/* Success message */}
          {submitStatus === "success" && (
            <div ref={successRef} className="border border-green-500/30 rounded-xl p-8 text-center">
              <svg
                className="w-12 h-12 text-green-500 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="text-xl font-bold text-white mb-2">
                Application Received!
              </h3>
              <p className="text-gray-400">
                Thanks for reaching out! Check your email for your free mobility assessment + 1-week plan.
                I&apos;ll be in touch within 24 hours to schedule your free consultation.
              </p>
            </div>
          )}

          {/* Error message */}
          {submitStatus === "error" && (
            <div className="border border-red-500/30 rounded-xl p-6 mb-8 text-center">
              <p className="text-red-400">
                Something went wrong. Please try again or contact me directly at{" "}
                <a
                  href="mailto:jeff@sunfm.fitness"
                  className="underline"
                  onClick={() => trackEvent("external_link_click", { platform: "email", section: "application_form_error" })}
                >
                  jeff@sunfm.fitness
                </a>
              </p>
            </div>
          )}

          {/* Form */}
          {submitStatus !== "success" && (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-white/70 text-xs uppercase tracking-wider mb-2">
                  Full Name *
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
                  placeholder="John Smith"
                />
              </div>

              {/* Email and Phone */}
              <div className="grid md:grid-cols-2 gap-x-8 gap-y-5">
                <div>
                  <label htmlFor="email" className="block text-white/70 text-xs uppercase tracking-wider mb-2">
                    Email *
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
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-white/70 text-xs uppercase tracking-wider mb-2">
                    Phone Number *
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
                    placeholder="(555) 123-4567"
                  />

                  {/* A2P 10DLC: optional and unchecked — texting consent can't
                      be a condition of submitting the form. */}
                  <div className="flex gap-3 mt-3 p-3 bg-white/[0.04] border border-white/10 rounded-lg">
                    <input
                      type="checkbox"
                      id="smsConsent"
                      name="smsConsent"
                      checked={smsConsent}
                      onChange={(e) => {
                        setSmsConsent(e.target.checked);
                        trackEvent("sms_consent_toggle", {
                          consented: e.target.checked ? "yes" : "no",
                        });
                      }}
                      aria-describedby="smsConsentText"
                      className="mt-0.5 h-4 w-4 shrink-0 accent-[#FFD140] cursor-pointer"
                    />
                    {/* The <label> covers the consent sentence only — wrapping the
                        links in it would toggle the box on the way out of a click. */}
                    <div id="smsConsentText" className="text-xs text-white/50 leading-relaxed">
                      <label htmlFor="smsConsent" className="cursor-pointer">
                        {SMS_CONSENT_TEXT}
                      </label>{" "}
                      <a href="/terms" className="underline hover:text-white/70">
                        Terms of Service
                      </a>{" "}
                      |{" "}
                      <a href="/privacy" className="underline hover:text-white/70">
                        Privacy Policy
                      </a>
                      .
                    </div>
                  </div>
                </div>
              </div>

              {/* Age */}
              <div className="max-w-[200px]">
                <label htmlFor="age" className="block text-white/70 text-xs uppercase tracking-wider mb-2">
                  Age
                </label>
                <input
                  type="number"
                  id="age"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  onFocus={() => handleFieldFocus("age")}
                  onBlur={(e) => handleFieldBlur("age", e.target.value)}
                  className={inputClasses}
                  placeholder="30"
                  min="16"
                  max="100"
                />
              </div>

              {/* Primary Goal */}
              <div>
                <label htmlFor="goal" className="block text-white/70 text-xs uppercase tracking-wider mb-2">
                  What&apos;s your primary goal? *
                </label>
                <select
                  id="goal"
                  name="goal"
                  required
                  value={formData.goal}
                  onChange={(e) => {
                    handleChange(e);
                    handleDropdownChange("goal", e.target.value);
                  }}
                  onFocus={() => handleFieldFocus("goal")}
                  className={selectClasses}
                >
                  <option value="" className="bg-[#0f0f0f]">Select your primary goal</option>
                  {goalOptions.map((option) => (
                    <option key={option} value={option} className="bg-[#0f0f0f]">{option}</option>
                  ))}
                </select>
                {formData.goal === "Other" && (
                  <input
                    type="text"
                    id="goalDetails"
                    name="goalDetails"
                    value={formData.goalDetails}
                    onChange={handleChange}
                    className={inputClasses}
                    placeholder="Please describe your primary goal"
                  />
                )}
              </div>

              {/* Experience level */}
              <div>
                <label htmlFor="experience" className="block text-white/70 text-xs uppercase tracking-wider mb-2">
                  How experienced are you with exercise? *
                </label>
                <select
                  id="experience"
                  name="experience"
                  required
                  value={formData.experience}
                  onChange={(e) => {
                    handleChange(e);
                    handleDropdownChange("experience", e.target.value);
                  }}
                  onFocus={() => handleFieldFocus("experience")}
                  className={selectClasses}
                >
                  <option value="" className="bg-[#0f0f0f]">Select your experience level</option>
                  {experienceOptions.map((option) => (
                    <option key={option} value={option} className="bg-[#0f0f0f]">{option}</option>
                  ))}
                </select>
              </div>

              {/* Current Routine */}
              <div>
                <label htmlFor="currentRoutine" className="block text-white/70 text-xs uppercase tracking-wider mb-2">
                  Do you have a current exercise routine?
                </label>
                <textarea
                  id="currentRoutine"
                  name="currentRoutine"
                  value={formData.currentRoutine}
                  onChange={handleChange}
                  onFocus={() => handleFieldFocus("currentRoutine")}
                  onBlur={(e) => handleFieldBlur("currentRoutine", e.target.value)}
                  rows={2}
                  className={`${inputClasses} resize-none`}
                  placeholder="e.g., Go to the gym 2x/week, run occasionally, no current routine, etc."
                />
              </div>

              {/* Motivation */}
              <div>
                <label htmlFor="motivation" className="block text-white/70 text-xs uppercase tracking-wider mb-2">
                  What made you want to start personal training?
                </label>
                <textarea
                  id="motivation"
                  name="motivation"
                  value={formData.motivation}
                  onChange={handleChange}
                  onFocus={() => handleFieldFocus("motivation")}
                  onBlur={(e) => handleFieldBlur("motivation", e.target.value)}
                  rows={2}
                  className={`${inputClasses} resize-none`}
                  placeholder="e.g., Want to get stronger, tired of back pain, preparing for a goal, etc."
                />
              </div>

              {/* Injuries/Pain */}
              <div>
                <label htmlFor="injuries" className="block text-white/70 text-xs uppercase tracking-wider mb-2">
                  Any current injuries or areas of pain?
                </label>
                <textarea
                  id="injuries"
                  name="injuries"
                  value={formData.injuries}
                  onChange={handleChange}
                  onFocus={() => handleFieldFocus("injuries")}
                  onBlur={(e) => handleFieldBlur("injuries", e.target.value)}
                  rows={2}
                  className={`${inputClasses} resize-none`}
                  placeholder="e.g., Lower back pain, old shoulder injury, etc."
                />
              </div>

              {/* How did you hear about us */}
              <div>
                <label htmlFor="referral" className="block text-white/70 text-xs uppercase tracking-wider mb-2">
                  How did you hear about SunFM? *
                </label>
                <select
                  id="referral"
                  name="referral"
                  required
                  value={formData.referral}
                  onChange={(e) => {
                    handleChange(e);
                    handleDropdownChange("referral", e.target.value);
                  }}
                  onFocus={() => handleFieldFocus("referral")}
                  className={selectClasses}
                >
                  <option value="" className="bg-[#0f0f0f]">Select an option</option>
                  {referralOptions.map((option) => (
                    <option key={option} value={option} className="bg-[#0f0f0f]">{option}</option>
                  ))}
                </select>
                {(formData.referral === "Friend/Family Referral" || formData.referral === "Other") && (
                  <input
                    type="text"
                    id="referralDetails"
                    name="referralDetails"
                    value={formData.referralDetails}
                    onChange={handleChange}
                    className={inputClasses}
                    placeholder={formData.referral === "Friend/Family Referral" ? "Who referred you?" : "Please specify"}
                  />
                )}
              </div>

              {/* Submit button */}
              <div className="pt-6">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full btn-secondary text-base py-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Submitting...
                    </>
                  ) : (
                    "Book My Free Consultation"
                  )}
                </button>
              </div>

              <p className="text-white/40 text-xs leading-relaxed pt-4">
                By submitting, you agree to be contacted about training services
                by phone or email. Texts are optional and only sent if you check
                the box.
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
