'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PlayCircle, Home, MonitorPlay, Film } from 'lucide-react';

export default function Navbar({ setup }: { setup: any }) {
  const pathname = usePathname();

  return (
    <>
      {/* SIDEBAR (Tablet/Desktop Only - Hidden on Mobile) */}
      <aside className="hidden md:flex flex-col w-24 lg:w-64 bg-[#050608] border-r border-white/5 h-full z-50 transition-all duration-300">
        <div className="flex items-center justify-center lg:justify-start lg:px-8 h-20 w-full mt-4">
          <PlayCircle className="w-10 h-10 text-[#E50914]" />
          <span className="hidden lg:block ml-3 text-2xl font-bold tracking-wider">VERSE</span>
        </div>

        <nav className="flex-1 flex flex-col gap-6 mt-10 px-4 lg:px-6">
          <Link href="/" className={`${pathname === '/' ? 'text-[#E50914] bg-white/5' : 'text-gray-400 hover:bg-white/5 hover:text-white'} flex flex-col lg:flex-row items-center lg:justify-start justify-center gap-2 lg:gap-4 p-3 rounded-xl transition-colors group`}>
            <Home className="w-6 h-6 transition-transform group-hover:scale-110" />
            <span className="text-xs lg:text-base font-medium">Home</span>
          </Link>
          <Link href="/tv" className={`${pathname === '/tv' ? 'text-[#E50914] bg-white/5' : 'text-gray-400 hover:bg-white/5 hover:text-white'} flex flex-col lg:flex-row items-center lg:justify-start justify-center gap-2 lg:gap-4 p-3 rounded-xl transition-colors group`}>
            <MonitorPlay className="w-6 h-6 transition-transform group-hover:scale-110" />
            <span className="text-xs lg:text-base font-medium">TV</span>
          </Link>
          <Link href="/movies" className={`${pathname === '/movies' ? 'text-[#E50914] bg-white/5' : 'text-gray-400 hover:bg-white/5 hover:text-white'} flex flex-col lg:flex-row items-center lg:justify-start justify-center gap-2 lg:gap-4 p-3 rounded-xl transition-colors group`}>
            <Film className="w-6 h-6 transition-transform group-hover:scale-110" />
            <span className="text-xs lg:text-base font-medium">Movies</span>
          </Link>
        </nav>

        <div className="mb-8 px-4 lg:px-6">
          <Link href="/account" className="text-gray-400 flex flex-col lg:flex-row items-center lg:justify-start justify-center gap-2 lg:gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors group hover:text-white">
            <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-transparent group-hover:border-[#E50914] transition-colors">
              <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80" alt="Account" className="w-full h-full object-cover" />
            </div>
            <span className="hidden lg:block text-base font-medium">Account</span>
          </Link>
        </div>
      </aside>

      {/* BOTTOM NAVIGATION (Mobile Only - Hidden on Tablet/Desktop) */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-[#0B0C10]/95 backdrop-blur-lg border-t border-white/10 z-50 pb-[env(safe-area-inset-bottom)]">
        <ul className="flex justify-around items-center p-2">
          <li>
            <Link href="/" className={`${pathname === '/' ? 'text-[#E50914]' : 'text-gray-400 hover:text-white'} flex flex-col items-center gap-1 p-2 w-16 transition-colors`}>
              <Home className="w-6 h-6" />
              <span className="text-[10px] font-medium">Home</span>
            </Link>
          </li>
          <li>
            <Link href="/tv" className={`${pathname === '/tv' ? 'text-[#E50914]' : 'text-gray-400 hover:text-white'} flex flex-col items-center gap-1 p-2 w-16 transition-colors`}>
              <MonitorPlay className="w-6 h-6" />
              <span className="text-[10px] font-medium">TV</span>
            </Link>
          </li>
          <li>
            <Link href="/movies" className={`${pathname === '/movies' ? 'text-[#E50914]' : 'text-gray-400 hover:text-white'} flex flex-col items-center gap-1 p-2 w-16 transition-colors`}>
              <Film className="w-6 h-6" />
              <span className="text-[10px] font-medium">Movie</span>
            </Link>
          </li>
          <li>
            <Link href="/account" className="text-gray-400 flex flex-col items-center gap-1 p-2 w-16 hover:text-white transition-colors">
              <div className="w-6 h-6 rounded-full overflow-hidden border-2 border-transparent">
                <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80" alt="Account" className="w-full h-full object-cover" />
              </div>
              <span className="text-[10px] font-medium">Account</span>
            </Link>
          </li>
        </ul>
      </nav>
    </>
  );
}
