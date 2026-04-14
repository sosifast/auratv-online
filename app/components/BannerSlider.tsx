'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, PlayCircle, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface SliderItem {
  id: number;
  image_url: string;
  url_target: string;
}

export default function BannerSlider({ sliders }: { sliders: SliderItem[] }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % sliders.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [sliders.length]);

  if (!sliders || sliders.length === 0) return null;

  return (
    <section className="relative w-full rounded-[2rem] overflow-hidden group mb-10 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)]">
      <div className="relative aspect-[16/6] md:aspect-[21/7] w-full overflow-hidden">
        {sliders.map((slider, index) => (
          <div
            key={slider.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === current ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            <Link href={slider.url_target}>
              <img 
                src={slider.image_url} 
                alt={`Slide ${slider.id}`} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/40 via-transparent to-transparent"></div>
            </Link>
          </div>
        ))}
        
        {/* Navigation Arrows */}
        <button 
          onClick={() => setCurrent((prev) => (prev - 1 + sliders.length) % sliders.length)}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 bg-white/10 backdrop-blur-md rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <ChevronLeft size={24} />
        </button>
        <button 
          onClick={() => setCurrent((prev) => (prev + 1) % sliders.length)}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 bg-white/10 backdrop-blur-md rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <ChevronRight size={24} />
        </button>

        {/* Indicators */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {sliders.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                i === current ? 'bg-white w-8' : 'bg-white/30'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
