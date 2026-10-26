import type { Metadata } from "next";
import SignForm from "@/components/forms/SignForm";
import { CLIENT_FORMS } from "@/lib/client-forms";

const form = CLIENT_FORMS.waiver;

export const metadata: Metadata = {
  title: "Liability Waiver | Sun Functional Movement",
  // Only for clients we send the link to.
  robots: { index: false, follow: false },
};

export default function WaiverPage() {
  return (
    <main className="bg-[#F5F2ED] min-h-screen py-12 sm:py-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <p className="text-sm font-semibold tracking-wide text-[#CB4538] uppercase mb-2">
          Sun Functional Movement
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold text-[#1a1a1a] mb-3">{form.title}</h1>
        <p className="text-gray-600 mb-10">{form.intro}</p>
        <SignForm formId="waiver" />
      </div>
    </main>
  );
}
