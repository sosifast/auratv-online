'use client';

import React from 'react';
import Link from 'next/link';
import { Home, MonitorPlay, Film, Clapperboard } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function BottomMenu() {
    const pathname = usePathname();

    const isHome = pathname === '/';
    const isShorts = pathname.startsWith('/short');
    const isMovie = pathname.startsWith('/movie');

    const navClassName = isShorts
        ? 'bg-black/80 backdrop-blur-lg border-t border-white/10'
        : 'bg-white/95 backdrop-blur-md border-t border-gray-100 bottom-nav-shadow';

    return (
        <nav className={`fixed bottom-0 left-0 w-full z-50 pb-[env(safe-area-inset-bottom)] transition-colors duration-300 ${navClassName}`}>
            <ul className="flex justify-around md:justify-center md:gap-16 items-center px-1 py-1.5">
                <li>
                    <Link href="/" className={`flex flex-col items-center gap-1 p-2 w-14 md:w-20 hover:scale-105 transition-transform ${isHome ? 'text-[#E50914]' : (isShorts ? 'text-gray-400 hover:text-white' : 'text-gray-400 hover:text-gray-900')}`}>
                        <Home className={`w-6 h-6 md:w-7 md:h-7 ${isHome ? 'fill-current' : ''}`} />
                        <span className="text-[9px] md:text-xs font-bold">Home</span>
                    </Link>
                </li>
                <li>
                    <Link href="/short" className={`flex flex-col items-center gap-1 p-2 w-14 md:w-20 hover:scale-105 transition-all ${isShorts ? 'text-[#E50914]' : 'text-gray-400 hover:text-gray-900'}`}>
                        <Clapperboard className={`w-6 h-6 md:w-7 md:h-7 ${isShorts ? 'text-[#E50914] fill-[#E50914]' : ''}`} />
                        <span className={`text-[9px] md:text-xs font-bold`}>Shorts</span>
                    </Link>
                </li>
                <li>
                    <Link href="#" className={`flex flex-col items-center gap-1 p-2 w-14 md:w-20 hover:scale-105 transition-all ${isShorts ? 'text-gray-400 hover:text-white' : 'text-gray-400 hover:text-gray-900'}`}>
                        <MonitorPlay className="w-6 h-6 md:w-7 md:h-7" />
                        <span className="text-[9px] md:text-xs font-medium">TV</span>
                    </Link>
                </li>
                <li>
                    <Link href="/movie" className={`flex flex-col items-center gap-1 p-2 w-14 md:w-20 hover:scale-105 transition-all ${isMovie ? 'text-[#E50914]' : (isShorts ? 'text-gray-400 hover:text-white' : 'text-gray-400 hover:text-gray-900')}`}>
                        <Film className={`w-6 h-6 md:w-7 md:h-7 ${isMovie ? 'fill-current' : ''}`} />
                        <span className={`text-[9px] md:text-xs ${isMovie ? 'font-bold' : 'font-medium'}`}>Movie</span>
                    </Link>
                </li>
                <li>
                    <Link href="#" className={`flex flex-col items-center gap-1 p-2 w-14 md:w-20 hover:scale-105 transition-all ${isShorts ? 'text-gray-400 hover:text-white' : 'text-gray-400 hover:text-gray-900'}`}>
                        <div className="w-6 h-6 md:w-7 md:h-7 rounded-full overflow-hidden border-2 border-transparent">
                            <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80" alt="Account" className="w-full h-full object-cover" />
                        </div>
                        <span className="text-[9px] md:text-xs font-medium">Account</span>
                    </Link>
                </li>
            </ul>
        </nav>
    );
}
