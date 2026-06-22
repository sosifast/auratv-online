import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { 
  ArrowLeft, Play, Star, Clock, 
  Calendar, DollarSign, Award, Heart, MessageSquare
} from 'lucide-react';
import { getMovieById, getMovieBySlug } from '@/app/lib/api-movie/data';
import BottomMenu from '@/app/component/menu';

export const dynamic = 'force-dynamic';

interface DetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: DetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const numericId = parseInt(id, 10);
  
  let movie = null;
  if (!isNaN(numericId)) {
    movie = await getMovieById(numericId);
  }
  if (!movie) {
    movie = await getMovieBySlug(id);
  }

  if (!movie) {
    return {
      title: 'Film Tidak Ditemukan - Streamku',
    };
  }

  return {
    title: `${movie.title} (${movie.year}) - Nonton Film Online Gratis | Streamku`,
    description: movie.overview || movie.desc_title || `Nonton film ${movie.title} secara online gratis di Streamku.`,
  };
}

function formatCurrency(amount?: number): string {
  if (!amount || amount === 0) return '-';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(amount);
}

function formatRuntime(minutes?: number): string {
  if (!minutes || minutes === 0) return '-';
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (hours === 0) return `${remainingMinutes}m`;
  return `${hours}j ${remainingMinutes}m`;
}

export default async function MovieDetailPage({ params }: DetailPageProps) {
  const { id } = await params;
  const numericId = parseInt(id, 10);
  
  let movie = null;
  if (!isNaN(numericId)) {
    movie = await getMovieById(numericId);
  }
  if (!movie) {
    movie = await getMovieBySlug(id);
  }

  // Not Found fallback view
  if (!movie) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-screen bg-gray-50 text-gray-900 gap-4 text-center px-6">
        <Award className="w-16 h-16 text-[#E50914] animate-pulse" />
        <h1 className="text-xl font-bold text-gray-800">Film Tidak Ditemukan</h1>
        <p className="text-sm text-gray-500 max-w-sm">
          Maaf, film yang Anda cari tidak tersedia atau tautan telah kedaluwarsa.
        </p>
        <Link 
          href="/movie" 
          className="flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-md hover:bg-gray-800 transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Movies
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-white text-gray-900 antialiased font-sans flex flex-col relative pb-28">
      
      {/* HERO BANNER SECTION WITH BACKDROP */}
      <section className="relative w-full h-[45vh] md:h-[55vh] bg-gray-950 flex items-end overflow-hidden">
        {/* Backdrop Image */}
        <div className="absolute inset-0 w-full h-full">
          <img 
            src={movie.backdrop_url || movie.poster_url || "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=1200&q=80"} 
            alt={movie.title}
            className="w-full h-full object-cover opacity-40"
          />
          {/* Subtle overlay transition to blend into bottom content */}
          <div className="absolute inset-0 bg-gradient-to-t from-white via-black/50 to-black/20" />
        </div>

        {/* Floating Back Button */}
        <Link 
          href="/movie" 
          className="absolute top-4 left-4 z-40 p-2.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 hover:bg-black/60 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </Link>

        {/* Overlapping Info container */}
        <div className="relative z-10 w-full px-5 md:px-10 pb-6 flex flex-row items-end gap-4 md:gap-8 max-w-7xl mx-auto">
          {/* Movie Poster (Overlaps the bottom section) */}
          <div className="shrink-0 w-24 sm:w-32 md:w-44 aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl border-2 border-white/80 -mb-14 sm:-mb-16 md:-mb-20 z-20 relative bg-gray-900">
            <img 
              src={movie.poster_url || "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?auto=format&fit=crop&w=300&q=80"} 
              alt={movie.title} 
              className="w-full h-full object-cover"
            />
          </div>

          {/* Title & Metadata */}
          <div className="flex-1 text-white pb-2">
            {/* Tagline or Year badge */}
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2 py-0.5 text-[10px] font-bold bg-[#E50914] text-white rounded">
                {movie.status || "Released"}
              </span>
              <span className="text-xs font-semibold text-gray-300">
                {movie.year}
              </span>
            </div>
            
            <h1 className="text-lg sm:text-3xl md:text-4xl font-extrabold leading-tight tracking-tight drop-shadow-md">
              {movie.title}
            </h1>
            
            {movie.tagline && (
              <p className="text-xs sm:text-sm text-gray-300 font-medium italic mt-1 drop-shadow-sm">
                "{movie.tagline}"
              </p>
            )}

            {/* Rating and Runtime */}
            <div className="flex items-center gap-4 mt-3 text-xs sm:text-sm text-gray-200 drop-shadow-sm font-semibold">
              <div className="flex items-center gap-1 text-amber-400">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>{movie.vote_average?.toFixed(1) || '0.0'}</span>
                <span className="text-gray-400 font-normal">({movie.vote_count})</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-gray-400" />
                <span>{formatRuntime(movie.runtime)}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CORE DETAILS BODY SECTION */}
      <section className="w-full px-5 md:px-10 pt-24 max-w-7xl mx-auto flex flex-col lg:flex-row gap-10">
        
        {/* Left Side: Overview, Cast, Trailer */}
        <div className="flex-1 space-y-8">
          
          {/* Play CTA Call To Action */}
          <div className="w-full">
            <Link 
              href={`/movie/play/${movie.id}`} 
              className="flex items-center justify-center gap-2.5 bg-[#E50914] text-white hover:bg-red-700 font-bold px-8 py-3.5 rounded-full shadow-lg shadow-red-500/20 active:scale-95 hover:scale-[1.01] transition-all text-sm sm:text-base w-full md:w-fit cursor-pointer"
            >
              <Play className="w-5 h-5 fill-white text-white" />
              Tonton Sekarang
            </Link>
          </div>

          {/* Overview */}
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-gray-800 tracking-tight">Sinopsis</h2>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed max-w-3xl">
              {movie.overview || "Tidak ada sinopsis singkat yang tersedia untuk film ini."}
            </p>
          </div>

          {/* Cast Members (Actors) */}
          {movie.actors && movie.actors.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-gray-800 tracking-tight">Pemeran Utama</h2>
              <div className="flex overflow-x-auto gap-4 pb-4 -mx-5 px-5 md:mx-0 md:px-0 hide-scrollbar">
                {movie.actors.slice(0, 15).map((actor) => (
                  <div key={actor.id} className="shrink-0 w-24 flex flex-col items-center text-center">
                    <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-150 border border-gray-100 shadow-sm relative shrink-0">
                      <img 
                        src={actor.profile_path || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80"} 
                        alt={actor.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="text-[11px] font-bold text-gray-800 mt-2 line-clamp-1 w-full">{actor.name}</span>
                    <span className="text-[9px] text-gray-500 mt-0.5 line-clamp-1 w-full">{actor.character}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Crew Information */}
          <div className="border-t border-gray-100 pt-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
              {movie.directors && movie.directors.length > 0 && (
                <div>
                  <h4 className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Sutradara</h4>
                  <p className="text-sm font-bold text-gray-800 mt-1">{movie.directors[0].name}</p>
                </div>
              )}
              {movie.writers && movie.writers.length > 0 && (
                <div>
                  <h4 className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Penulis</h4>
                  <p className="text-sm font-bold text-gray-800 mt-1">
                    {movie.writers.slice(0, 2).map((w) => w.name).join(', ')}
                  </p>
                </div>
              )}
              {movie.producers && movie.producers.length > 0 && (
                <div>
                  <h4 className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Produser</h4>
                  <p className="text-sm font-bold text-gray-800 mt-1">
                    {movie.producers.slice(0, 2).map((p) => p.name).join(', ')}
                  </p>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right Side: Key Metadata and Info details */}
        <div className="w-full lg:w-80 shrink-0 space-y-6 lg:border-l lg:border-gray-100 lg:pl-10">
          
          <div className="space-y-4">
            <h3 className="text-base font-bold text-gray-800 border-b border-gray-100 pb-2">Informasi</h3>
            
            <div className="space-y-3.5 text-sm">
              <div className="flex justify-between items-center py-0.5">
                <span className="text-gray-500 font-medium">Status</span>
                <span className="font-bold text-gray-800">{movie.status || 'Released'}</span>
              </div>
              <div className="flex justify-between items-center py-0.5">
                <span className="text-gray-500 font-medium">Rilis</span>
                <span className="font-bold text-gray-800">{movie.release_date || '-'}</span>
              </div>
              <div className="flex justify-between items-center py-0.5">
                <span className="text-gray-500 font-medium">Anggaran</span>
                <span className="font-bold text-gray-800">{formatCurrency(movie.budget)}</span>
              </div>
              <div className="flex justify-between items-center py-0.5">
                <span className="text-gray-500 font-medium">Pendapatan</span>
                <span className="font-bold text-gray-800">{formatCurrency(movie.revenue)}</span>
              </div>
              <div className="flex justify-between items-center py-0.5">
                <span className="text-gray-500 font-medium">Popularitas</span>
                <span className="font-bold text-gray-800">{movie.popularity?.toFixed(1) || '0.0'}</span>
              </div>
            </div>
          </div>

          {/* Genres */}
          {movie.genres && movie.genres.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-base font-bold text-gray-800">Genre</h3>
              <div className="flex flex-wrap gap-2">
                {movie.genres.map((genre) => (
                  <span 
                    key={genre.id} 
                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-full transition-colors"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Keywords */}
          {movie.keywords && movie.keywords.length > 0 && (
            <div className="space-y-3 border-t border-gray-100 pt-5">
              <h3 className="text-base font-bold text-gray-800">Kata Kunci</h3>
              <div className="flex flex-wrap gap-1.5">
                {movie.keywords.map((kw) => (
                  <span 
                    key={kw.id} 
                    className="px-2 py-0.5 border border-gray-200 text-gray-500 text-[10px] rounded font-medium"
                  >
                    #{kw.name}
                  </span>
                ))}
              </div>
            </div>
          )}

        </div>

      </section>

      {/* FLOAT BOTTOM MENU */}
      <BottomMenu />
    </div>
  );
}
