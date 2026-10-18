import { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import Footer from "@/components/Footer";
import MemberDetails from "@/components/team/MemberDetails";
import TeamCTA from "@/components/team/TeamCTA";
import TeamHeader from "@/components/team/TeamHeader";
import { coaches, getCoach } from "@/lib/coaches";

const baseUrl = "https://www.sunfm.fitness";

type Props = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = false;

export async function generateStaticParams() {
  return coaches.map((coach) => ({ slug: coach.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const coach = getCoach(slug);
  if (!coach) return {};

  const title = `${coach.name}, ${coach.title} | Sun Functional Movement`;
  const url = `${baseUrl}/team/${coach.slug}`;
  return {
    title,
    description: coach.description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description: coach.description,
      type: "profile",
      url,
      images: [{ url: `${baseUrl}${coach.image}` }],
    },
  };
}

export default async function CoachPage({ params }: Props) {
  const { slug } = await params;
  const coach = getCoach(slug);
  if (!coach) notFound();

  const url = `${baseUrl}/team/${coach.slug}`;

  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: coach.name,
    jobTitle: coach.title,
    description: coach.description,
    url,
    image: `${baseUrl}${coach.image}`,
    worksFor: {
      "@type": "Organization",
      name: "Sun Functional Movement",
      url: baseUrl,
    },
    ...(coach.alumniOf
      ? { alumniOf: { "@type": "CollegeOrUniversity", name: coach.alumniOf } }
      : {}),
    hasCredential: [
      coach.degree && {
        "@type": "EducationalOccupationalCredential",
        credentialCategory: "degree",
        name: coach.degree,
      },
      coach.certification && {
        "@type": "EducationalOccupationalCredential",
        credentialCategory: "certificate",
        name: coach.certification,
      },
    ].filter(Boolean),
    knowsAbout: coach.specialties,
  };

  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: baseUrl },
      { "@type": "ListItem", position: 2, name: "Team", item: `${baseUrl}/team` },
      { "@type": "ListItem", position: 3, name: coach.name, item: url },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />
      <main className="min-h-screen bg-[#EEEADA]">
        <TeamHeader backHref="/team" backLabel="Back to Team" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div className="relative bg-gradient-to-br from-[#CB4538] to-[#8B2E25] rounded-2xl overflow-hidden aspect-[4/5]">
              <Image
                src={coach.image}
                alt={coach.name}
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover"
                priority
              />
            </div>
            <MemberDetails member={coach} headingLevel="h1" />
          </div>

          <TeamCTA section={`coach_page_${coach.slug}`} />
        </div>
      </main>
      <Footer />
    </>
  );
}
