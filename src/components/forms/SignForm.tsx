"use client";

import { useState } from "react";
import { CLIENT_FORMS, type ClientFormId } from "@/lib/client-forms";
import SignaturePad from "./SignaturePad";

const inputClasses =
  "w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#CB4538]/40 focus:border-[#CB4538]/60 transition-all";
const labelClasses = "block text-sm font-medium text-gray-700 mb-1.5";

type Field = {
  name: string;
  label: string;
  type?: string;
  autoComplete?: string;
  inputMode?: "email" | "tel";
};

const CONTACT_FIELDS: Field[] = [
  { name: "name", label: "Full name", autoComplete: "name" },
  { name: "email", label: "Email", type: "email", autoComplete: "email", inputMode: "email" },
  { name: "phone", label: "Phone", type: "tel", autoComplete: "tel", inputMode: "tel" },
];

const EMERGENCY_FIELDS: Field[] = [
  { name: "emergencyName", label: "Emergency contact name", autoComplete: "off" },
  { name: "emergencyPhone", label: "Emergency contact phone", type: "tel", autoComplete: "off", inputMode: "tel" },
];

export default function SignForm({ formId }: { formId: ClientFormId }) {
  const form = CLIENT_FORMS[formId];
  const [values, setValues] = useState<Record<string, string>>({});
  const [agreed, setAgreed] = useState(false);
  const [signature, setSignature] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState("");

  function field({ name, label, type = "text", autoComplete, inputMode }: Field) {
    return (
      <div key={name}>
        <label htmlFor={name} className={labelClasses}>
          {label}
        </label>
        <input
          id={name}
          name={name}
          type={type}
          required
          autoComplete={autoComplete}
          inputMode={inputMode}
          value={values[name] || ""}
          onChange={(e) => setValues((v) => ({ ...v, [name]: e.target.value }))}
          className={inputClasses}
        />
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    if (!signature) {
      setError("Please sign in the box above.");
      return;
    }
    if (!agreed) {
      setError("Please check the box to agree.");
      return;
    }
    setStatus("sending");
    try {
      const response = await fetch("/api/sign-form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formId,
          ...values,
          company: (e.currentTarget.elements.namedItem("company") as HTMLInputElement)?.value,
          agreed,
          signature,
        }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || "Something went wrong. Please try again.");
      }
      setStatus("done");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Something went wrong. Please try again.");
      setStatus("idle");
    }
  }

  if (status === "done") {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
        <h2 className="text-2xl font-bold text-[#1a1a1a] mb-3">You&rsquo;re all set</h2>
        <p className="text-gray-600">
          Thanks, {values.name?.split(" ")[0]}. We&rsquo;ve emailed a signed copy to {values.email}.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-[#1a1a1a]">Your details</h2>
        {CONTACT_FIELDS.map(field)}
        {form.collectsContactDetails && EMERGENCY_FIELDS.map(field)}
        {/* Honeypot: off-screen and skipped by keyboard and screen readers. */}
        <input
          type="text"
          name="company"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="absolute -left-[9999px] h-0 w-0 opacity-0"
        />
      </section>

      <section>
        <h2 className="text-xl font-bold text-[#1a1a1a] mb-4">{form.title}</h2>
        <div className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6 space-y-4 text-[15px] text-gray-700 leading-relaxed">
          {form.sections.map((section, i) => (
            <div key={i} className="space-y-4">
              {section.heading && <h3 className="font-semibold text-[#1a1a1a]">{section.heading}</h3>}
              {section.paragraphs.map((paragraph, j) =>
                typeof paragraph === "string" ? (
                  <p key={j}>{paragraph}</p>
                ) : (
                  <div key={j}>
                    <p className="font-semibold text-[#1a1a1a]">{paragraph.rule}</p>
                    <p className="mt-1">{paragraph.detail}</p>
                  </div>
                )
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-5">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-1 h-5 w-5 shrink-0 accent-[#CB4538]"
          />
          <span className="text-gray-800 font-medium">{form.agreement}</span>
        </label>

        <div>
          <p className={labelClasses}>Signature</p>
          <SignaturePad onChange={setSignature} />
        </div>

        {error && (
          <p role="alert" className="text-sm text-[#CB4538]">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={status === "sending"}
          className="w-full bg-[#CB4538] hover:bg-[#a83829] disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-lg transition-colors text-base"
        >
          {status === "sending" ? "Signing…" : "Sign and submit"}
        </button>
        <p className="text-xs text-gray-500">
          By clicking &ldquo;Sign and submit&rdquo; you agree that your drawn signature is your legal
          signature on this document. We record the date, time, and device you sign from.
        </p>
      </section>
    </form>
  );
}
