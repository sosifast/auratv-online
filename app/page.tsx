'use client';

import React, { useState, useEffect } from 'react';
import {
  PlayCircle, Home, MonitorPlay, Film, Search, Bell, Play, Plus,
  ChevronRight, Users, Flame, Rocket, Skull, Smile, Heart, Wand2, Eye,
  Clapperboard
} from 'lucide-react';
import BottomMenu from './component/menu';

export default function App() {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Data for the Hero Slider
  const slideData = [
    {
      img: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80",
      title: "Cyber Dawn",
      desc: "When the world is ruled by AI, a group of rebels must find the original source code before human civilization is wiped out forever.",
      genre: "Sci-Fi"
    },
    {
      img: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?auto=format&fit=crop&w=800&q=80",
      title: "Neon Dreams",
      desc: "A detective's journey through a futuristic metropolis to uncover the biggest conspiracy of 2140.",
      genre: "Action"
    },
    {
      img: "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?auto=format&fit=crop&w=800&q=80",
      title: "The Outlanders",
      desc: "Surviving on an alien planet has never been this easy. Join the epic adventure across the galaxy.",
      genre: "Adventure"
    }
  ];

  // Auto Slider Effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slideData.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slideData.length]);

  // Static Data
  const genres = [
    { name: 'Action', color: 'from-orange-400 to-red-500', icon: Flame },
    { name: 'Sci-Fi', color: 'from-cyan-400 to-blue-500', icon: Rocket },
    { name: 'Horror', color: 'from-gray-700 to-gray-900', icon: Skull },
    { name: 'Comedy', color: 'from-yellow-400 to-amber-500', icon: Smile },
    { name: 'Romance', color: 'from-pink-400 to-rose-500', icon: Heart },
    { name: 'Fantasy', color: 'from-violet-400 to-purple-600', icon: Wand2 },
    { name: 'Thriller', color: 'from-emerald-400 to-teal-600', icon: Eye }
  ];

  const recommendations = [
    { title: "The Lost City", img: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=300&q=80", isNew: true },
    { title: "Neon Dreams", img: "https://images.unsplash.com/photo-1616530940355-351fabd9524b?auto=format&fit=crop&w=300&q=80", isNew: false },
    { title: "Dark Forest", img: "https://images.unsplash.com/photo-1574267432553-4b4628081524?auto=format&fit=crop&w=300&q=80", isNew: true },
    { title: "Ocean's Echo", img: "https://images.unsplash.com/photo-1502899576159-f224dc2349fa?auto=format&fit=crop&w=300&q=80", isNew: false },
    { title: "Space Walk", img: "https://images.unsplash.com/photo-1604928141064-207cea6f5822?auto=format&fit=crop&w=300&q=80", isNew: false },
    { title: "Mystery Room", img: "https://images.unsplash.com/photo-1535016120720-40c746a46b14?auto=format&fit=crop&w=300&q=80", isNew: false },
    { title: "Cyber Core", img: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=300&q=80", isNew: true },
    { title: "Silent Hills", img: "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=300&q=80", isNew: false },
    { title: "Desert Rose", img: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?auto=format&fit=crop&w=300&q=80", isNew: false },
    { title: "City Lights", img: "https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&w=300&q=80", isNew: true }
  ];

  const liveChannels = [
    { title: "Global News", views: "12.5K", img: "https://images.unsplash.com/photo-1616469829581-73993eb86b02?auto=format&fit=crop&w=400&q=80" },
    { title: "Sports Arena", views: "8.2K", img: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=400&q=80" },
    { title: "Hit Music", views: "5.1K", img: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=400&q=80" },
    { title: "Daily Update", views: "3.4K", img: "https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=400&q=80" }
  ];

  const categoriesData = [
    { title: "K-Drama Hits", color: "from-pink-400 to-rose-500", icon: Heart },
    { title: "Anime Universe", color: "from-violet-400 to-purple-600", icon: Wand2 },
    { title: "Kids & Family", color: "from-yellow-400 to-amber-500", icon: Smile },
    { title: "Documentary", color: "from-emerald-400 to-teal-600", icon: Eye }
  ];

  // Fungsi khusus agar bisa "klik-dan-geser" (drag to scroll) di Desktop
  const dragHandlers = {
    onMouseDown: (e: any) => {
      const ele = e.currentTarget;
      ele.dataset.isDown = 'true';
      ele.dataset.startX = e.pageX - ele.offsetLeft;
      ele.dataset.scrollLeft = ele.scrollLeft;
    },
    onMouseLeave: (e: any) => {
      e.currentTarget.dataset.isDown = 'false';
    },
    onMouseUp: (e: any) => {
      e.currentTarget.dataset.isDown = 'false';
    },
    onMouseMove: (e: any) => {
      const ele = e.currentTarget;
      if (ele.dataset.isDown !== 'true') return;
      e.preventDefault();
      const x = e.pageX - ele.offsetLeft;
      const startX = parseFloat(ele.dataset.startX);
      const scrollLeft = parseFloat(ele.dataset.scrollLeft);
      const walk = (x - startX) * 2; // Angka 2 untuk mempercepat laju geseran
      ele.scrollLeft = scrollLeft - walk;
    }
  };

  return (
    // Main wrapper: Removed max-w-2xl and mx-auto so it spans the entire screen width
    <div className="w-full h-screen overflow-hidden antialiased bg-gray-50 text-gray-900 font-sans selection:bg-[#E50914]/30 flex flex-col relative">



      {/* TOP HEADER (Fixed on top, transparent to solid blur) */}
      <header className="absolute top-0 left-0 w-full z-40 px-5 md:px-10 py-4 flex justify-between items-center bg-gradient-to-b from-black/60 to-transparent">
        <div className="flex items-center gap-2">
          <PlayCircle className="w-8 h-8 text-[#E50914] bg-white rounded-full p-0.5" />
          <span className="text-xl font-bold tracking-wider text-white drop-shadow-md">VERSE</span>
        </div>

        <div className="flex items-center gap-3">
          <button className="p-2 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30 transition-colors">
            <Search className="w-5 h-5 text-white" />
          </button>
          <button className="p-2 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30 transition-colors">
            <Bell className="w-5 h-5 text-white" />
          </button>
        </div>
      </header>

      {/* MAIN SCROLLABLE CONTENT */}
      {/* Padding bottom ensures content isn't hidden behind the fixed bottom nav */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden hide-scrollbar pb-24 w-full bg-white">

        {/* HERO SLIDER (Responsive height and layout) */}
        <section className="relative w-full h-[60vh] md:h-[70vh] lg:h-[80vh] bg-gray-900 flex items-end overflow-hidden">

          {/* Slider Track */}
          <div
            className="absolute inset-0 w-full h-full flex transition-transform duration-700 ease-in-out"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {slideData.map((slide, index) => (
              <div key={index} className="w-full h-full flex-shrink-0 relative">
                <img src={slide.img} className="w-full h-full object-cover" alt={slide.title} />
                {/* Gradient for text readability - adapted for light theme by fading to white at the very bottom */}
                <div className="absolute inset-0 bg-gradient-to-t from-white via-black/50 to-black/20"></div>
              </div>
            ))}
          </div>

          {/* Hero Content */}
          <div className="relative z-10 px-5 md:px-10 pb-8 md:pb-12 w-full md:w-2/3 lg:w-1/2">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-1 text-[10px] md:text-xs font-bold bg-[#E50914] text-white rounded uppercase tracking-wider">New</span>
              <span className="text-xs md:text-sm font-medium text-gray-200">{slideData[currentSlide].genre} • 2026</span>
            </div>

            <div className="transition-opacity duration-300">
              <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold mb-3 leading-tight text-white drop-shadow-md">
                {slideData[currentSlide].title}
              </h1>
              <p className="text-xs sm:text-base text-gray-200 mb-6 line-clamp-2 md:line-clamp-3 drop-shadow-sm w-[90%] md:w-full">
                {slideData[currentSlide].desc}
              </p>
            </div>

            <div className="flex items-center gap-3 md:gap-5">
              <button className="flex-1 md:flex-none md:px-8 flex justify-center items-center gap-2 bg-[#E50914] text-white px-4 py-3 rounded-xl md:rounded-full font-bold shadow-lg shadow-[#E50914]/30 active:scale-95 hover:bg-red-700 transition-all">
                <Play className="w-5 h-5 md:w-6 md:h-6 fill-white" />
                Play Now
              </button>
              <button className="flex-1 md:flex-none md:px-8 flex justify-center items-center gap-2 bg-white/20 backdrop-blur-md text-white border border-white/20 px-4 py-3 rounded-xl md:rounded-full font-bold active:scale-95 hover:bg-white/30 transition-all shadow-md">
                <Plus className="w-5 h-5 md:w-6 md:h-6" />
                My List
              </button>
            </div>
          </div>

          {/* Slider Indicators */}
          <div className="absolute top-24 md:top-auto md:bottom-10 right-5 md:right-10 flex flex-col md:flex-row gap-1.5 md:gap-2 z-20">
            {slideData.map((_, idx) => (
              <div
                key={idx}
                className={`transition-all duration-300 rounded-full ${idx === currentSlide ? 'bg-white h-4 w-1 md:h-2 md:w-6' : 'bg-white/40 h-1.5 w-1 md:h-2 md:w-2'}`}
              />
            ))}
          </div>
        </section>

        <div className="px-5 md:px-10 pt-8 space-y-12 md:space-y-16 w-full bg-white">

          {/* GENRE SECTION */}
          <section className="w-full">
            <h2 className="text-lg md:text-2xl font-bold tracking-tight text-gray-900 mb-4 md:mb-6">Explore Genres</h2>

            <div
              className="flex overflow-x-auto gap-3 md:gap-5 hide-scrollbar pb-6 md:pb-8 -mx-5 md:-mx-10 px-5 md:px-10 cursor-grab active:cursor-grabbing select-none"
              {...dragHandlers}
            >
              {genres.map((genre, idx) => {
                const Icon = genre.icon;
                return (
                  <div key={idx} className="shrink-0 w-28 md:w-40 h-16 md:h-20 relative rounded-xl overflow-hidden shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-all">
                    <div className={`absolute inset-0 bg-gradient-to-br ${genre.color} opacity-10 pointer-events-none`}></div>
                    <div className="w-full h-full flex items-center p-3 relative pointer-events-none">
                      <div className="flex-1 relative z-10">
                        <span className="font-bold text-sm md:text-base text-gray-800">{genre.name}</span>
                      </div>
                      <Icon className="absolute -right-2 -bottom-2 w-10 h-10 md:w-14 md:h-14 text-gray-400 opacity-20" />
                    </div>
                  </div>
                )
              })}
            </div>
          </section>

          {/* REKOMENDASI SECTION */}
          <section className="w-full">
            <div className="flex justify-between items-end mb-4 md:mb-6">
              <h2 className="text-lg md:text-2xl font-bold tracking-tight text-gray-900">Recommended</h2>
              <a href="#" className="text-[#E50914] text-xs md:text-sm font-semibold flex items-center hover:underline">
                See All <ChevronRight className="w-3 h-3 md:w-4 md:h-4 ml-0.5" />
              </a>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 md:gap-4 pb-4 md:pb-6">
              {recommendations.map((item, idx) => (
                <div key={idx} className="relative cursor-pointer group w-full">
                  <div className="relative w-full aspect-[2/3] rounded-xl overflow-hidden shadow-sm bg-gray-200 group-hover:shadow-lg transition-all">
                    <img src={item.img} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />

                    {/* Badge */}
                    {item.isNew && (
                      <div className="absolute top-2 left-2 bg-[#E50914] text-white text-[9px] md:text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                        NEW
                      </div>
                    )}
                  </div>
                  <h3 className="mt-2 text-xs md:text-sm font-semibold text-gray-800 truncate">{item.title}</h3>
                </div>
              ))}
            </div>
          </section>

          {/* LIVE TV SECTION */}
          <section className="w-full">
            <h2 className="text-lg md:text-2xl font-bold tracking-tight text-gray-900 mb-4 md:mb-6">Live TV</h2>

            <div
              className="flex overflow-x-auto gap-3 md:gap-5 hide-scrollbar pb-6 md:pb-8 -mx-5 md:-mx-10 px-5 md:px-10 cursor-grab active:cursor-grabbing select-none"
              {...dragHandlers}
            >
              {liveChannels.map((channel, idx) => (
                <div key={idx} className="shrink-0 w-56 md:w-80 relative cursor-pointer group">
                  <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-sm bg-gray-200 border border-gray-100 group-hover:shadow-md transition-all pointer-events-none">
                    <img src={channel.img} alt={channel.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent"></div>

                    {/* Live Badge */}
                    <div className="absolute top-2 left-2 flex items-center gap-1 bg-[#E50914] text-white text-[9px] md:text-xs font-bold px-1.5 py-0.5 rounded shadow-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                      LIVE
                    </div>

                    {/* Viewers */}
                    <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm text-white text-[9px] md:text-xs font-medium px-1.5 py-0.5 rounded flex items-center gap-1">
                      <Users className="w-2.5 h-2.5 md:w-3 md:h-3" /> {channel.views}
                    </div>

                    <div className="absolute bottom-2 md:bottom-4 left-2 md:left-4 right-2 md:right-4">
                      <h3 className="text-sm md:text-lg font-bold text-white truncate drop-shadow-md">{channel.title}</h3>
                      <p className="text-[9px] md:text-xs text-gray-300 font-medium truncate mt-0.5">Streaming Now</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* CATEGORIES SECTION */}
          <section className="w-full pb-6 md:pb-10">
            <h2 className="text-lg md:text-2xl font-bold tracking-tight text-gray-900 mb-3 md:mb-5">Categories</h2>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
              {categoriesData.map((cat, idx) => {
                const Icon = cat.icon;
                return (
                  <div key={idx} className="w-full h-16 md:h-20 relative rounded-xl overflow-hidden shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-all">
                    <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-10 pointer-events-none`}></div>
                    <div className="w-full h-full flex items-center p-3 relative pointer-events-none">
                      <div className="flex-1 relative z-10">
                        <span className="font-bold text-sm md:text-base text-gray-800">{cat.title}</span>
                      </div>
                      <Icon className="absolute -right-2 -bottom-2 w-10 h-10 md:w-14 md:h-14 text-gray-400 opacity-20" />
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        </div>
      </main>

      {/* BOTTOM NAVIGATION (Fixed at bottom - full width) */}
      <BottomMenu />

    </div>
  );
}