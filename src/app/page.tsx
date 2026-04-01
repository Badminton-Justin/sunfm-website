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

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Testimonials />
        <PainPoints />
        <HowItWorks />
        <ApplicationForm />
        <WhoIsThisFor />
        <About />
        <FAQ />
      </main>
      <Footer />
      <StickyCTA />
    </>
  );
}
