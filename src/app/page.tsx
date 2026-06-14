import Header from "@/components/Header";
import Hero from "@/components/Hero";
import PainPoints from "@/components/PainPoints";
import About from "@/components/About";
import HowItWorks from "@/components/HowItWorks";
import WhoIsThisFor from "@/components/WhoIsThisFor";
import Testimonials from "@/components/Testimonials";
import ApplicationForm from "@/components/ApplicationForm";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";
import StickyCTA from "@/components/StickyCTA";
import TrackedSection from "@/components/TrackedSection";

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "PersonalTrainer",
  name: "Sun Functional Movement",
  alternateName: "SunFM",
  url: "https://www.sunfm.fitness",
  logo: "https://www.sunfm.fitness/images/full-logo-transparent.png",
  image: "https://www.sunfm.fitness/images/jeffrey-headshot-final.jpg",
  description:
    "Personal trainer in San Jose helping busy professionals eliminate pain, build functional strength, and train for health longevity.",
  founder: {
    "@type": "Person",
    name: "Jeffrey Sun",
    jobTitle: "ACE Certified Personal Trainer",
    alumniOf: {
      "@type": "CollegeOrUniversity",
      name: "UC Santa Cruz",
    },
  },
  address: {
    "@type": "PostalAddress",
    streetAddress: "1401 Parkmoor Ave, Suite 100",
    addressLocality: "San Jose",
    addressRegion: "CA",
    postalCode: "95126",
    addressCountry: "US",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 37.3175,
    longitude: -121.9108,
  },
  email: "jeff@sunfm.fitness",
  telephone: "+1-408-761-4963",
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      opens: "06:00",
      closes: "22:00",
    },
  ],
  areaServed: [
    { "@type": "City", name: "San Jose" },
    { "@type": "City", name: "Sunnyvale" },
    { "@type": "City", name: "Cupertino" },
    { "@type": "City", name: "Santa Clara" },
    { "@type": "City", name: "Mountain View" },
    { "@type": "City", name: "Campbell" },
  ],
  priceRange: "$$",
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "5.0",
    reviewCount: "107",
    bestRating: "5",
  },
  sameAs: [
    "https://www.instagram.com/jeffsunfitness/",
    "https://www.yelp.com/biz/sun-functional-movement-san-jose",
    "https://maps.app.goo.gl/XyrnsHXu9K1xYqXw5",
  ],
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Where are training sessions held?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "In-person sessions are held in Sunnyvale, with clients coming from San Jose, Cupertino, Santa Clara, Mountain View, Campbell, and throughout the South Bay Area. Online sessions are conducted via video call.",
      },
    },
    {
      "@type": "Question",
      name: "What happens during the free consultation?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The consultation is a free 1-hour session where we discuss your goals, assess your current fitness level, and identify any pain points or limitations. It includes a short workout focusing on breathwork, abs, and mobility. There's no obligation to sign up.",
      },
    },
    {
      "@type": "Question",
      name: "How much does training cost?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Pricing depends on your specific needs and training frequency. Various packages are available ranging from individual sessions to comprehensive monthly programs. Most clients invest in packages that work out to 2-3 sessions per week.",
      },
    },
    {
      "@type": "Question",
      name: "Do you offer online training?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes! Online training includes live video coaching, custom programming through a training app, and ongoing support. Many clients do a mix of in-person and online sessions.",
      },
    },
    {
      "@type": "Question",
      name: "What makes your approach different?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The focus is on health longevity, not quick fixes. With a background in Human Biology and experience as an EMT, Jeffrey specializes in movement pattern correction, helping clients eliminate pain at the source rather than just treating symptoms.",
      },
    },
    {
      "@type": "Question",
      name: "I have an injury. Can I still train?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Many clients come while recovering from injuries or dealing with chronic pain. The specialty is transitioning people from therapy to training safely, working with healthcare providers when needed.",
      },
    },
  ],
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <Header />
      <main>
        <TrackedSection sectionName="hero">
          <Hero />
        </TrackedSection>
        <TrackedSection sectionName="testimonials">
          <Testimonials />
        </TrackedSection>
        <TrackedSection sectionName="pain_points">
          <PainPoints />
        </TrackedSection>
        <TrackedSection sectionName="how_it_works">
          <HowItWorks />
        </TrackedSection>
        <TrackedSection sectionName="application_form">
          <ApplicationForm />
        </TrackedSection>
        <TrackedSection sectionName="who_is_this_for">
          <WhoIsThisFor />
        </TrackedSection>
        <TrackedSection sectionName="about">
          <About />
        </TrackedSection>
        <TrackedSection sectionName="faq">
          <FAQ />
        </TrackedSection>
      </main>
      <Footer />
      <StickyCTA />
    </>
  );
}
