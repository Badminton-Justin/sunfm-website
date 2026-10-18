import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Footer from "@/components/Footer";
import MemberDetails from "@/components/team/MemberDetails";
import TeamCTA from "@/components/team/TeamCTA";
import TeamHeader from "@/components/team/TeamHeader";
import { coaches, type TeamMember } from "@/lib/coaches";

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

// Coaches carry their own Person schema on /team/<slug>.
const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Jeffrey Sun",
  jobTitle: "Founder & Head Coach",
  url: "https://www.sunfm.fitness/team",
  image: "https://www.sunfm.fitness/images/jeffrey-hero.jpg",
  worksFor: {
    "@type": "Organization",
    name: "Sun Functional Movement",
    url: "https://www.sunfm.fitness",
  },
  alumniOf: {
    "@type": "CollegeOrUniversity",
    name: "UC Santa Cruz",
  },
  hasCredential: [
    {
      "@type": "EducationalOccupationalCredential",
      credentialCategory: "degree",
      name: "B.S. Human Biology",
    },
    {
      "@type": "EducationalOccupationalCredential",
      credentialCategory: "certification",
      name: "ACE Certified Personal Trainer",
    },
  ],
  knowsAbout: [
    "Mobility",
    "Functional Strength",
    "Movement Pattern Correction",
    "Hypertrophy",
    "Athletic Performance",
  ],
  sameAs: [
    "https://www.instagram.com/jeffsunfitness/",
    "https://www.linkedin.com/company/sun-functional-movement",
  ],
};

const teamBreadcrumbs = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://www.sunfm.fitness" },
    { "@type": "ListItem", position: 2, name: "Team", item: "https://www.sunfm.fitness/team" },
  ],
};

const jeffrey: TeamMember = {
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
};

export default function TeamPage() {
  return (
    <>
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
    />
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(teamBreadcrumbs) }}
    />
    <main className="min-h-screen bg-[#EEEADA]">
      <TeamHeader />

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

        {/* Founder */}
        <div className="grid md:grid-cols-2 gap-12 items-start">
          <div className="relative bg-gradient-to-br from-[#CB4538] to-[#8B2E25] rounded-2xl overflow-hidden aspect-[4/5]">
            <Image
              src={jeffrey.image}
              alt={jeffrey.name}
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
              priority
            />
          </div>
          <MemberDetails member={jeffrey} />
        </div>

        {/* Coaches: a card each, full profile on its own page */}
        {coaches.length > 0 && (
          <section className="mt-16 md:mt-24">
            <h2 className="text-3xl md:text-4xl font-bold text-black mb-8 md:mb-10 text-center">
              Our Coaches
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {coaches.map((coach) => (
                <Link
                  key={coach.slug}
                  href={`/team/${coach.slug}`}
                  className="group block"
                >
                  <div className="relative bg-gradient-to-br from-[#CB4538] to-[#8B2E25] rounded-2xl overflow-hidden aspect-[4/5] mb-4">
                    <Image
                      src={coach.image}
                      alt={coach.name}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  </div>
                  <h3 className="text-2xl font-bold text-black group-hover:text-[#CB4538] transition-colors">
                    {coach.name}
                  </h3>
                  <p className="text-[#CB4538] font-semibold mt-1">{coach.title}</p>
                  <p className="text-gray-600 mt-1">{coach.highlight}</p>
                  <span className="inline-flex items-center gap-1 mt-3 text-sm font-semibold text-black group-hover:text-[#CB4538] transition-colors">
                    View full profile
                    <span aria-hidden="true">&rarr;</span>
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        <TeamCTA section="team_page_footer_cta" />
      </div>

    </main>
    <Footer />
    </>
  );
}
