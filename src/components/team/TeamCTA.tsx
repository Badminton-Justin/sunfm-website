import TrackedCTALink from "@/components/TrackedCTALink";

export default function TeamCTA({ section }: { section: string }) {
  return (
    <div className="mt-16 md:mt-24 text-center bg-[#1a1a1a] rounded-2xl p-8 md:p-12">
      <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
        Ready to Start Your Journey?
      </h2>
      <p className="text-lg text-white/70 mb-8 max-w-xl mx-auto">
        Book a free consultation with our team and take the first step
        toward moving better, feeling stronger, and living longer.
      </p>
      <TrackedCTALink
        href="/#apply"
        section={section}
        buttonText="Book Your Free Consultation"
        className="inline-block bg-[#CB4538] hover:bg-[#a83829] text-white font-semibold px-8 py-4 rounded-lg transition-colors text-base"
      >
        Book Your Free Consultation
      </TrackedCTALink>
    </div>
  );
}
