import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import TrackedCTALink from "@/components/TrackedCTALink";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Our Team | Sun Functional Movement",
  description:
    "Meet the coaches at Sun Functional Movement. ACE certified personal trainers in San Jose helping busy professionals build functional strength and longevity.",
  alternates: {
    canonical: "https://www.sunfm.fitness/team",
  },
  openGraph: {
    title: "Our Team | Sun Functional Movement",
    description:
      "Meet the coaches at Sun Functional Movement in San Jose.",
    type: "website",
    url: "https://www.sunfm.fitness/team",
    images: [{ url: "https://www.sunfm.fitness/images/jeffrey-hero.jpg" }],
  },
};

export default function TeamPage() {
  const teamMembers = [
    {
      name: "Jeffrey Sun",
      title: "Founder & Head Coach",
      credentials: "ACE Certified Personal Trainer | B.S. Human Biology",
      bio: "As a certified personal trainer with a degree in Human Biology, Jeffrey specializes in helping busy professionals build bodies that last. His approach is rooted in physiology and focused on health longevity - not crash diets or unsustainable programs. With his background as an EMT and athletic trainer, he understands the body at a deeper level.",
      specialties: [
        "Mobility & Flexibility",
        "Movement Pattern Correction",
        "Transition from Therapy to Training",
        "Hypertrophy",
        "Athletic Performance",
        "Functional Strength",
      ],
      education: [
        "B.S. Human Biology - UC Santa Cruz",
        "ACE Certified Personal Trainer",
        "Division III Athletic Training Internship",
        "CPR/AED Certified",
      ],
      experience: [
        "12,000+ training sessions delivered",
        "7+ years of professional training",
        "Former Youth Gymnastics and Soccer Coach",
        "Former Emergency Medical Technician",
      ],
      image: "/images/jeffrey-hero.jpg",
      placeholder: false,
    },
    {
      name: "Crystal Sun",
      title: "Coach",
      credentials: "B.S. Neurobiology, Physiology & Behavior — UC Davis",
      bio: "My journey into fitness began through competitive gymnastics, and my degree in Neurobiology, Physiology, and Behavior from UC Davis gives me a strong foundation in how the body and mind work together. I apply that science practically — building programs that support physical progress and overall well-being, not just short-term results.\n\nHaving trained in a Division I athletic performance program, I understand what it takes to build for performance, resilience, and long-term health. Whether you're just starting out, returning after time away, or pushing your performance further, my goal is to create an environment where you feel supported and challenged.",
      specialties: [
        "Functional Strength",
        "Mobility & Flexibility",
        "Athletic Performance",
        "Mind-Body Connection",
        "Beginner-Friendly Training",
        "Stress Management & Well-Being",
      ],
      education: [
        "B.S. Neurobiology, Physiology & Behavior — UC Davis",
        "Division I Athletic Performance Program",
        "Competitive Gymnastics Background",
      ],
      experience: [
        "Clients of all ages and fitness levels",
        "Strength & conditioning under Division I coaches",
        "Background in competitive gymnastics",
      ],
      image: "/images/Crystal_Hero.jpg",
      placeholder: false,
    },
  ];

  return (
    <>
    <main className="min-h-screen bg-[#EEEADA]">
      {/* Header */}
      <header className="bg-[#EEEADA] py-6 border-b border-black/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center">
              <Image
                src="/images/logo.png"
                alt="SunFM"
                width={200}
                height={75}
                className="h-16 w-auto"
                priority
              />
            </Link>
            <Link
              href="/"
              className="text-black font-medium hover:text-[#CB4538] transition-colors flex items-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back to Home
            </Link>
          </div>
        </div>
      </header>

      {/* Page Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Page Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-black mb-4">
            Our Team
          </h1>
          <div className="w-16 h-1 bg-[#FFD140] mx-auto"></div>
          <p className="text-gray-600 mt-6 max-w-2xl mx-auto text-lg">
            Meet the dedicated coaches behind SunFM who are committed to helping
            you move better, feel stronger, and live longer.
          </p>
        </div>

        {/* Team Members */}
        <div className="space-y-16 md:space-y-24">
          {teamMembers.map((member, index) => (
            <div
              key={member.name}
              className={`grid md:grid-cols-2 gap-12 items-start ${
                index % 2 === 1 ? "md:flex-row-reverse" : ""
              }`}
            >
              {/* Image */}
              <div className={`${index % 2 === 1 ? "md:order-2" : ""}`}>
                <div>
                  <div className="relative bg-gradient-to-br from-[#CB4538] to-[#8B2E25] rounded-2xl overflow-hidden aspect-[4/5] flex items-center justify-center">
                    {member.placeholder ? (
                      <div className="text-center text-white p-8">
                        <Image
                          src={member.image}
                          alt={member.name}
                          width={200}
                          height={200}
                          className="mx-auto mb-4"
                        />
                        <p className="text-sm opacity-75">
                          Replace with {member.name}&apos;s professional photo
                        </p>
                      </div>
                    ) : (
                      <Image
                        src={member.image}
                        alt={member.name}
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div className={`${index % 2 === 1 ? "md:order-1" : ""}`}>
                <h2 className="text-3xl md:text-4xl font-bold text-black mb-2">
                  {member.name}
                </h2>
                <p className="text-[#CB4538] font-semibold text-lg mb-2">
                  {member.title}
                </p>
                <p className="text-gray-600 font-medium mb-6">
                  {member.credentials}
                </p>

                <div className="text-gray-700 mb-8 text-lg leading-relaxed space-y-4">
                  {member.bio.split("\n\n").map((paragraph, i) => (
                    <p key={i}>{paragraph}</p>
                  ))}
                </div>

                {member.specialties.length > 0 && (
                  <div className="mb-8">
                    <h3 className="font-bold text-black mb-3">Specialties:</h3>
                    <div className="flex flex-wrap gap-2">
                      {member.specialties.map((specialty) => (
                        <span
                          key={specialty}
                          className="bg-[#FFD140] text-black px-3 py-1 rounded-full text-sm font-medium"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {member.education.length > 0 && (
                  <div className="mb-8">
                    <h3 className="font-bold text-black mb-3">Education:</h3>
                    <ul className="space-y-2">
                      {member.education.map((item) => (
                        <li
                          key={item}
                          className="flex items-center gap-2 text-gray-700"
                        >
                          <svg
                            className="w-5 h-5 text-[#CB4538] flex-shrink-0"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {member.experience.length > 0 && (
                  <div>
                    <h3 className="font-bold text-black mb-3">Experience:</h3>
                    <ul className="space-y-2">
                      {member.experience.map((item) => (
                        <li
                          key={item}
                          className="flex items-center gap-2 text-gray-700"
                        >
                          <svg
                            className="w-5 h-5 text-[#CB4538] flex-shrink-0"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-16 md:mt-24 text-center bg-[#3D3D3D] rounded-2xl p-8 md:p-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Start Your Journey?
          </h2>
          <p className="text-gray-400 mb-8 max-w-xl mx-auto">
            Book a free consultation with our team and take the first step
            toward moving better, feeling stronger, and living longer.
          </p>
          <TrackedCTALink
            href="/#apply"
            section="team_page_footer_cta"
            buttonText="Book Your Free Consultation"
            className="btn-primary text-lg"
          >
            Book Your Free Consultation
          </TrackedCTALink>
        </div>
      </div>

    </main>
    <Footer />
    </>
  );
}
