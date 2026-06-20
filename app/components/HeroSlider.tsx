'use client';

import React, { useState, useEffect } from 'react';
import { Play, Plus } from 'lucide-react';

export default function HeroSlider({ sliders }: { sliders: any[] }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (!sliders || sliders.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliders.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [sliders]);

  if (!sliders || sliders.length === 0) return null;

  return (
    <section className="relative w-full h-[60vh] md:h-[70vh] lg:h-[80vh] bg-[#1F2833] flex items-end overflow-hidden">
      {/* Slider Track */}
      <div 
        className="absolute inset-0 w-full h-full flex transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {sliders.map((slide, index) => (
          <div key={index} className="w-full h-full flex-shrink-0 relative">
            <img src={slide.image_url} className="w-full h-full object-cover" alt={slide.title} />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0C10] via-[#0B0C10]/80 to-transparent"></div>
            <div className="absolute inset-0 hidden md:block bg-gradient-to-r from-[#0B0C10] via-[#0B0C10]/60 to-transparent"></div>
          </div>
        ))}
      </div>

      {/* Hero Content */}
      <div className="relative z-10 px-4 md:px-12 pb-8 md:pb-16 w-full md:w-2/3 lg:w-1/2">
        <div className="flex items-center gap-2 mb-3">
          <span className="px-2 py-1 text-xs font-bold bg-[#E50914] text-white rounded uppercase tracking-wider">New Release</span>
        </div>
        
        <div className="transition-opacity duration-300">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold mb-3 leading-tight drop-shadow-lg">
            {sliders[currentSlide].title}
          </h1>
          <p className="text-sm md:text-base text-gray-300 mb-6 line-clamp-2 md:line-clamp-3 max-w-md drop-shadow-md">
            {sliders[currentSlide].description || "Saksikan keseruannya sekarang."}
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <a href={sliders[currentSlide].link_url || "#"} className="flex items-center gap-2 bg-white text-[#0B0C10] px-6 py-3 rounded-full font-bold hover:bg-gray-200 transition-transform hover:scale-105 active:scale-95 shadow-lg shadow-white/10">
            <Play className="w-5 h-5 fill-[#0B0C10]" />
            Play Now
          </a>
          <button className="flex items-center gap-2 bg-white/20 backdrop-blur-md text-white px-6 py-3 rounded-full font-bold hover:bg-white/30 transition-transform hover:scale-105 active:scale-95">
            <Plus className="w-5 h-5" />
            My List
          </button>
        </div>
      </div>

      {/* Slider Indicators */}
      <div className="absolute bottom-4 right-4 md:bottom-8 md:right-12 flex gap-2 z-20">
        {sliders.map((_, idx) => (
          <div 
            key={idx} 
            className={`h-2 rounded-full transition-all duration-300 ${idx === currentSlide ? 'bg-white w-4' : 'bg-white/30 w-2'}`}
          />
        ))}
      </div>
    </section>
  );
}
