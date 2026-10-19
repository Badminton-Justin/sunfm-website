import RevealWrapper from "@/components/RevealWrapper";
import StudioStrip from "@/components/StudioStrip";
import type { ServiceArea } from "@/lib/service-areas";
import { studioPhotos } from "@/lib/studio";

export default function ServiceAreaMap({ area }: { area: ServiceArea }) {
  const originQuery = encodeURIComponent(`${area.city}, CA`);
  const destination = encodeURIComponent(
    "1401 Parkmoor Ave, San Jose, CA 95126"
  );
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&origin=${originQuery}&destination=${destination}`;

  // Coordinate-based embed to guarantee the pin lands on the studio without requiring an API key.
  const studioCoords = "37.3115,-121.9192";
  const staticEmbedSrc = `https://www.google.com/maps?q=${studioCoords}&z=14&t=m&output=embed`;

  return (
    <section className="py-20 md:py-28 bg-white">
      <RevealWrapper className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-5 gap-10 lg:gap-16 items-start">
          {/* Left: info card */}
          <div className="lg:col-span-2">
            <p className="text-xs tracking-[0.25em] uppercase text-gray-500 font-medium mb-4 reveal">
              Location
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-[#1a1a1a] mb-6 leading-tight reveal reveal-delay-1">
              The studio is close to {area.city}.
            </h2>

            <div className="space-y-5 mb-8 reveal reveal-delay-2">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                  Address
                </p>
                <p className="text-[#1a1a1a] font-medium">
                  1401 Parkmoor Avenue, Suite 100
                  <br />
                  San Jose, CA 95126
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                  Drive from {area.city}
                </p>
                <p className="text-gray-700 leading-relaxed">
                  {area.commuteText}
                </p>
              </div>
            </div>

            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-[#CB4538] font-semibold hover:underline reveal reveal-delay-3"
            >
              Get directions from {area.city}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
          </div>

          {/* Right: map embed */}
          <div className="lg:col-span-3 reveal-scale">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100 border border-black/5 shadow-sm">
              <iframe
                src={staticEmbedSrc}
                title={`Map of studio near ${area.city}`}
                width="100%"
                height="100%"
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0 h-full w-full border-0"
              />
            </div>
          </div>
        </div>

        <StudioStrip
          photos={[studioPhotos.trainingFloor, studioPhotos.turfLane, studioPhotos.frontDesk]}
          caption="Inside the studio at 1401 Parkmoor Ave, San Jose"
          className="mt-10 lg:mt-14 reveal"
        />
      </RevealWrapper>
    </section>
  );
}
