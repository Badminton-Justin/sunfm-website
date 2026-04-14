"use client";

import { useState } from "react";

interface Props {
  id: string;
  title: string;
}

export default function YouTubeEmbed({ id, title }: Props) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="not-prose my-8 overflow-hidden rounded-xl bg-black">
      <div className="relative aspect-video">
        {loaded ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
            title={title}
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="absolute inset-0 h-full w-full border-0"
          />
        ) : (
          <button
            type="button"
            onClick={() => setLoaded(true)}
            className="group absolute inset-0 flex items-center justify-center"
            aria-label={`Play video: ${title}`}
          >
            <img
              src={`https://img.youtube.com/vi/${id}/hqdefault.jpg`}
              alt=""
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-black/20 transition-colors group-hover:bg-black/40" />
            <div className="relative flex h-14 w-20 items-center justify-center rounded-xl bg-[#CB4538] shadow-lg transition-transform group-hover:scale-110">
              <svg
                viewBox="0 0 24 24"
                fill="white"
                className="ml-0.5 h-6 w-6"
                aria-hidden="true"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </button>
        )}
      </div>
    </div>
  );
}
