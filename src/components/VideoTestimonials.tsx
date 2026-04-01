const R2_BASE = "https://pub-46d372e7b4b84eaf8efe9f21cab9b2ba.r2.dev";

const videoTestimonials = [
  {
    videoUrl: `${R2_BASE}/Cristina_Edited.mp4`,
    posterUrl: `${R2_BASE}/Cristina_Edited_Poster.jpg`,
    name: "Cristina",
    title: "",
    description: "",
    quote:
      "He made things seem doable rather than overwhelming. Jeff is incredibly easy to work with and he's truly become a friend. With his help, I've achieved my goal weight and I'm still going strong.",
  },
  // Add more entries here as you upload videos to R2
];

export default function VideoTestimonials() {
  if (videoTestimonials.length === 0) return null;

  return (
    <section className="section-padding bg-[#EEEADA]">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-black">
            Hear It From Them
          </h2>
          <div className="w-16 h-1 bg-[#FFD140] mx-auto mt-4"></div>
        </div>

        <div className="flex flex-col gap-16">
          {videoTestimonials.map((t, index) => (
            <div
              key={index}
              className="flex flex-col md:flex-row items-center gap-8 md:gap-12"
            >
              {/* Video */}
              <div className="w-full max-w-[280px] shrink-0">
                <video
                  src={t.videoUrl}
                  poster={t.posterUrl}
                  controls
                  playsInline
                  preload="none"
                  className="w-full aspect-[9/16] rounded-2xl shadow-lg object-cover bg-black"
                />
              </div>

              {/* Content */}
              <div className="flex-1">
                <h3 className="text-2xl md:text-3xl font-bold text-black mb-1">
                  {t.name}
                </h3>
                <p className="text-[#CB4538] font-semibold mb-2">{t.title}</p>
                {t.description && (
                  <p className="text-gray-600 mb-6">{t.description}</p>
                )}

                {/* Quote card */}
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <svg
                    className="w-8 h-8 text-[#FFD140] mb-3"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>
                  <p className="text-gray-700 text-lg italic">&ldquo;{t.quote}&rdquo;</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
