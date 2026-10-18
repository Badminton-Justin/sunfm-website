import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Footer from "@/components/Footer";
import TeamCTA from "@/components/team/TeamCTA";
import TeamHeader from "@/components/team/TeamHeader";
import { coaches } from "@/lib/coaches";

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
    images: [{ url: "https://www.sunfm.fitness/images/jeffrey-sun-studio.jpg" }],
  },
};

const teamBreadcrumbs = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://www.sunfm.fitness" },
    { "@type": "ListItem", position: 2, name: "Team", item: "https://www.sunfm.fitness/team" },
  ],
};

export default function TeamPage() {
  return (
    <>
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

        {/* A card per coach; each full profile lives on /team/<slug> */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {coaches.map((coach, index) => (
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
                  priority={index < 3}
                />
              </div>
              <h2 className="text-2xl font-bold text-black group-hover:text-[#CB4538] transition-colors">
                {coach.name}
              </h2>
              <p className="text-[#CB4538] font-semibold mt-1">{coach.title}</p>
              <p className="text-gray-600 mt-1">{coach.highlight}</p>
              <span className="inline-flex items-center gap-1 mt-3 text-sm font-semibold text-black group-hover:text-[#CB4538] transition-colors">
                View full profile
                <span aria-hidden="true">&rarr;</span>
              </span>
            </Link>
          ))}
        </div>

        <TeamCTA section="team_page_footer_cta" />
      </div>

    </main>
    <Footer />
    </>
  );
}
