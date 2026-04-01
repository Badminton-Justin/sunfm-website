"use client";

import Image from "next/image";

const R2_BASE = "https://pub-46d372e7b4b84eaf8efe9f21cab9b2ba.r2.dev";

const videoTestimonials = [
  {
    videoUrl: `${R2_BASE}/Sneha_Edited.mp4`,
    name: "Sneha",
    role: "",
    result: "Improved Structured and General Pain",
    quote:
      "My body feels like a well-oiled machine and I feel stronger than ever before. Jeff makes the entire journey very enjoyable. He has been the best investment in my fitness journey and I highly recommend him.",
  },
  {
    videoUrl: `${R2_BASE}/Marshall_Edited.mp4`,
    name: "Marshall",
    role: "",
    result: "Pain Free & Functional Strength",
    quote:
      "I originally only planned to do sessions for a few months, and now it's been 4 years. Sessions with Jeff are really great and I'd recommend them to anyone.",
  },
  {
    videoUrl: `${R2_BASE}/Cristina_Edited.mp4`,
    name: "Cristina",
    role: "",
    result: "Achieved Dream Weight",
    quote:
      "He made things seem doable rather than overwhelming. Jeff is incredibly easy to work with and he's truly become a friend. With his help, I've achieved my goal weight and I'm still going strong.",
  },
  {
    videoUrl: `${R2_BASE}/Kanth_Edited.mp4`,
    name: "Kanth",
    role: "",
    result: "Discipline and Strength Building",
    quote:
      "Before working with Jeff, I was never disciplined. Now, it has changed significantly for my workouts and diet. Thank you Jeff, thank you for everything.",
  },
  {
    videoUrl: `${R2_BASE}/Josh_Edited.mp4`,
    name: "Josh",
    role: "",
    result: "Consistency and Health Longevity",
    quote:
      "Working with Jeff completely changed the way that I train. His programs have helped me stay consistent for over 3 years. I would highly recommend working with Jeff.",
  },
  {
    videoUrl: `${R2_BASE}/Chen_Edited.mp4`,
    name: "Chen",
    role: "",
    result: "Cured Neck and Low Back Pain",
    quote:
      "Jeff helps me move out of my comfort zone. He really understands what I would like to achieve.",
  },
  {
    videoUrl: `${R2_BASE}/Curtis_Edited.mp4`,
    name: "Curtis",
    role: "",
    result: "Improved Flexibility and Muscle Imbalance",
    quote:
      "Jeff is very detail oriented. The workouts were much more fun and I saw a lot of results. He was able to balance out my body and keep me consistent.",
  },
  {
    videoUrl: `${R2_BASE}/Karson_Edited.mp4`,
    name: "Karson",
    role: "",
    result: "Improved Functional Strength in his life",
    quote:
      "Before Jeff, I went to the gym once a week. After, I consistently go to the gym twice a week. My strength has gotten a lot better and my body has gotten a lot more toned.",
  },
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="section-padding bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-black">
            What Clients Say
          </h2>
          <div className="w-16 h-1 bg-[#FFD140] mx-auto mt-4"></div>
          <p className="text-gray-600 mt-6 max-w-2xl mx-auto text-lg">
            Real results from real people who are committed to their health.
          </p>
        </div>

        {/* Video testimonials */}
        {videoTestimonials.length > 0 && (
          <div className="flex flex-col gap-10 mb-16">
            {videoTestimonials.map((t, index) => (
              <div key={index} className="flex flex-col sm:flex-row items-center gap-6 max-w-3xl mx-auto w-full">
                <div className="w-full sm:w-[200px] shrink-0">
                  <video
                    src={t.videoUrl}
                    controls
                    playsInline
                    preload="metadata"
                    className="w-full aspect-[9/16] rounded-2xl shadow-lg object-cover bg-black"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="bg-[#EEEADA] rounded-2xl p-5 sm:p-8 h-full flex flex-col">
                    {/* Quote icon + badge */}
                    <div className="flex items-center justify-between mb-4">
                      <svg className="w-10 h-10 text-[#FFD140]" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                      </svg>
                      {t.result && (
                        <div className="bg-[#FFD140] text-black px-3 py-1 rounded-full text-sm font-semibold">
                          {t.result}
                        </div>
                      )}
                    </div>
                    {/* Quote */}
                    <p className="text-gray-700 text-lg italic mb-6">&ldquo;{t.quote}&rdquo;</p>
                    {/* Author */}
                    <div className="mt-auto">
                      <p className="font-bold text-black">{t.name}</p>
                      {t.role && <p className="text-gray-600 text-sm">{t.role}</p>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Community photo */}
        <div className="relative rounded-2xl overflow-hidden mb-12 h-64 md:h-80">
          <Image
            src="/images/group.jpg"
            alt="SunFM community - clients trained by Jeffrey Sun"
            fill
            className="object-cover [object-position:50%_33%]"
          />
          <div className="absolute inset-0 bg-black/45 flex items-center justify-center">
            <p className="text-white text-2xl md:text-3xl font-bold text-center px-4">
              107+ Clients Trained. Join Our Community.
            </p>
          </div>
        </div>

        {/* Social proof */}
        <div className="text-center">
          <p className="text-gray-600 mb-4">See more reviews on</p>
          <div className="flex items-center justify-center gap-6">
            <a
              href="https://www.yelp.com/biz/jeff-sun-fitness-sunnyvale"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-black hover:text-[#CB4538] transition-colors"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.707 2.293a1 1 0 00-1.414 0l-9 9a1 1 0 001.414 1.414L12 4.414l8.293 8.293a1 1 0 001.414-1.414l-9-9z" />
              </svg>
              <span className="font-semibold">Yelp</span>
            </a>
            <a
              href="https://maps.app.goo.gl/XyrnsHXu9K1xYqXw5"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-black hover:text-[#CB4538] transition-colors"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
              </svg>
              <span className="font-semibold">Google</span>
            </a>
            <a
              href="https://www.instagram.com/jeffsunfitness/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-black hover:text-[#CB4538] transition-colors"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
              <span className="font-semibold">Instagram</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
