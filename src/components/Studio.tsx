import Image from "next/image";
import RevealWrapper from "@/components/RevealWrapper";
import TrackedLink from "@/components/TrackedLink";
import { studioPhotos, STUDIO_MAPS_URL } from "@/lib/studio";

// Sits just before the application form, so someone deciding whether to book
// can see the room they'd be walking into.
export default function Studio() {
  const { trainingFloor, frontDesk, pullUpRig, barbellRack } = studioPhotos;

  return (
    <section id="studio" className="section-padding bg-[#F5F2ED]">
      <RevealWrapper className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-6 mb-12 md:mb-16 reveal">
          <div>
            <p className="text-xs tracking-[0.2em] uppercase text-gray-400 mb-4">The Studio</p>
            <h2 className="text-display scroll-skew text-[#1a1a1a]">
              Where You&apos;ll Train
            </h2>
          </div>
          <div className="flex flex-col justify-end gap-4">
            <p className="text-gray-500 text-lg leading-relaxed max-w-md">
              A full strength studio on Parkmoor Ave in San Jose, with squat
              racks, cable machines, free weights and a turf lane.
            </p>
            <TrackedLink
              href={STUDIO_MAPS_URL}
              platform="google_maps"
              section="home_studio"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-[#CB4538] font-semibold hover:underline w-fit"
            >
              1401 Parkmoor Ave, Suite 100 · Get directions
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </TrackedLink>
          </div>
        </div>

        {/* Bento: wide floor shot leads, desk across the top right, two details below it */}
        <div className="grid grid-cols-2 md:grid-cols-4 md:grid-rows-2 gap-3 md:gap-4 md:h-[560px]">
          <div className="relative col-span-2 md:row-span-2 aspect-[4/3] md:aspect-auto rounded-2xl overflow-hidden reveal reveal-delay-1">
            <Image
              src={trainingFloor.src}
              alt={trainingFloor.alt}
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
          <div className="relative col-span-2 aspect-[16/9] md:aspect-auto rounded-2xl overflow-hidden reveal reveal-delay-2">
            <Image
              src={frontDesk.src}
              alt={frontDesk.alt}
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
          <div className="relative aspect-square md:aspect-auto rounded-2xl overflow-hidden reveal reveal-delay-3">
            <Image
              src={pullUpRig.src}
              alt={pullUpRig.alt}
              fill
              sizes="(min-width: 768px) 25vw, 50vw"
              className="object-cover"
              style={{ objectPosition: "50% 30%" }}
            />
          </div>
          <div className="relative aspect-square md:aspect-auto rounded-2xl overflow-hidden reveal reveal-delay-4">
            <Image
              src={barbellRack.src}
              alt={barbellRack.alt}
              fill
              sizes="(min-width: 768px) 25vw, 50vw"
              className="object-cover"
            />
          </div>
        </div>
      </RevealWrapper>
    </section>
  );
}
