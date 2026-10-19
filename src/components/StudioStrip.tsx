import Image from "next/image";
import type { StudioPhoto } from "@/lib/studio";

// A compact row of studio photos for pages where the photos support something
// else (the /start form, a city page's location block) rather than lead.
export default function StudioStrip({
  photos,
  caption,
  className = "",
}: {
  photos: StudioPhoto[];
  caption?: string;
  className?: string;
}) {
  return (
    <figure className={className}>
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {photos.map((photo) => (
          <div key={photo.src} className="relative aspect-[4/3] rounded-xl overflow-hidden bg-[#1a1a1a]">
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              sizes="(min-width: 1024px) 200px, 33vw"
              className="object-cover"
            />
          </div>
        ))}
      </div>
      {caption && (
        <figcaption className="mt-2 text-sm text-gray-500">{caption}</figcaption>
      )}
    </figure>
  );
}
