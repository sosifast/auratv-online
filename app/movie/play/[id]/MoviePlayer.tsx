'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Server, Star, Clock } from 'lucide-react';
import { Movie } from '@/app/lib/api-movie/data';
import BottomMenu from '@/app/component/menu';

interface MoviePlayerProps {
  movie: Movie;
}

export default function MoviePlayer({ movie }: MoviePlayerProps) {
  const [activeServer, setActiveServer] = useState(0);

  // High-availability embed providers using TMDB IDs
  const servers = [
    { name: 'Server 1 (Vidsrc TO)', url: `https://vidsrc.to/embed/movie/${movie.id}` },
    { name: 'Server 2 (Vidsrc PRO)', url: `https://vidsrc.pro/embed/movie/${movie.id}` },
    { name: 'Server 3 (Embed SU)', url: `https://embed.su/embed/movie/${movie.id}` },
    { name: 'Server 4 (Vidsrc ME)', url: `https://vidsrc.me/embed/movie?tmdb=${movie.id}` },
  ];

  return (
    <div className="w-full min-h-screen bg-neutral-950 text-white antialiased font-sans flex flex-col relative pb-28">
      
      {/* TOP NAVBAR */}
      <header className="w-full z-45 px-4 py-4 flex items-center gap-4 bg-neutral-900/60 backdrop-blur-md border-b border-neutral-900 sticky top-0">
        <Link 
          href={`/movie/detail/${movie.id}`} 
          className="p-2 rounded-full bg-neutral-850 hover:bg-neutral-800 border border-neutral-800 text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex flex-col">
          <span className="text-[10px] text-[#E50914] font-bold tracking-wider uppercase">Memutar Film</span>
          <h1 className="text-sm font-extrabold text-white truncate max-w-[200px] sm:max-w-md">
            {movie.title}
          </h1>
        </div>
      </header>

      {/* MAIN CINEMATIC VIEWPORT */}
      <main className="flex-1 w-full px-4 md:px-10 py-6 max-w-5xl mx-auto flex flex-col gap-6">
        
        {/* ASPECT RATIO VIDEO CONTAINER */}
        <div className="w-full aspect-video bg-black shadow-2xl relative border border-neutral-900 rounded-2xl overflow-hidden">
          <iframe
            src={servers[activeServer].url}
            className="w-full h-full border-0 absolute inset-0"
            allowFullScreen
            scrolling="no"
            sandbox="allow-forms allow-pointer-lock allow-same-origin allow-scripts allow-top-navigation"
          />
        </div>

        {/* SERVER SELECTION SWITCHER */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-[10px] text-neutral-400 font-bold uppercase tracking-wider">
            <Server className="w-4 h-4 text-[#E50914]" />
            <span>Pilih Server Alternatif (Ganti jika lambat / terblokir)</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {servers.map((srv, idx) => (
              <button
                key={idx}
                onClick={() => setActiveServer(idx)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  activeServer === idx
                    ? 'bg-[#E50914] border-[#E50914] text-white shadow-md shadow-red-500/10'
                    : 'bg-neutral-900 border-neutral-850 hover:bg-neutral-850 hover:border-neutral-800 text-neutral-300'
                }`}
              >
                {srv.name}
              </button>
            ))}
          </div>
        </div>

        {/* MOVIE METADATA DETAILS */}
        <div className="border-t border-neutral-900 pt-6 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">{movie.title}</h2>
            <div className="flex items-center gap-1 bg-amber-400/10 text-amber-400 text-xs font-bold px-2 py-0.5 rounded-lg border border-amber-400/10">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{movie.vote_average?.toFixed(1) || '0.0'}</span>
            </div>
            {movie.year && (
              <span className="text-neutral-400 text-xs font-semibold">{movie.year}</span>
            )}
            {movie.runtime && (
              <div className="flex items-center gap-1 text-neutral-400 text-xs font-semibold">
                <Clock className="w-3.5 h-3.5 text-neutral-500" />
                <span>{movie.runtime} menit</span>
              </div>
            )}
          </div>

          {movie.tagline && (
            <p className="text-neutral-400 italic text-xs sm:text-sm">"{movie.tagline}"</p>
          )}

          <p className="text-neutral-300 text-xs sm:text-sm leading-relaxed max-w-3xl">
            {movie.overview || "Tidak ada deskripsi sinopsis film."}
          </p>

          {movie.genres && movie.genres.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {movie.genres.map((genre) => (
                <span 
                  key={genre.id} 
                  className="px-3 py-1 bg-neutral-900 border border-neutral-850 text-neutral-400 text-xs font-bold rounded-full"
                >
                  {genre.name}
                </span>
              ))}
            </div>
          )}
        </div>

      </main>

      {/* CORE NAVIGATION */}
      <BottomMenu />
    </div>
  );
}
