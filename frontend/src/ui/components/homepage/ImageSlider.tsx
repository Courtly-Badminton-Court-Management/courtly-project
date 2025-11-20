"use client";

import { useState, useEffect } from "react";

const images = [
  "/banner/main-poster.png",
  "/banner/event-poster.png",
  "/banner/closure-poster.png",
  "/banner/rules-poster.png",
  "/banner/sponsor-poster.png",
];

export default function ImageSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((p) => (p + 1) % images.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const goPrev = () => setCurrentIndex((p) => (p - 1 + images.length) % images.length);
  const goNext = () => setCurrentIndex((p) => (p + 1) % images.length);

  // 16:5 aspect ratio (1600x500) using padding-top trick (500/1600 = 31.25%)
  return (
    <div className="relative w-full overflow-hidden rounded-2xl shadow-sm border border-platinum">
      <div
        className="flex transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {images.map((src, idx) => (
          <div key={idx} className="w-full flex-shrink-0">
            <div className="relative w-full pt-[31.25%] bg-neutral-50">
              <img
                src={src}
                alt={`banner-${idx + 1}`}
                className="absolute inset-0 h-full w-full object-cover"
                // onError={() => console.warn(`⚠️ Failed to load banner: ${src}`)}
              />
            </div>
          </div>
        ))}
      </div>

      {/* arrows */}
      <button
        onClick={goPrev}
        aria-label="Previous"
        className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full hover:bg-black/60"
      >
        ‹
      </button>
      <button
        onClick={goNext}
        aria-label="Next"
        className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full hover:bg-black/60"
      >
        ›
      </button>

      {/* dots */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
        {images.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`w-2.5 h-2.5 rounded-full ${
              idx === currentIndex ? "bg-white" : "bg-white/40"
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
