import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowLeft, Award } from 'lucide-react';
import { getMovieById, getMovieBySlug, getMovieStreamLinks } from '@/app/lib/api-movie/data';
import MoviePlayer from './MoviePlayer';

export const dynamic = 'force-dynamic';

interface PlayPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PlayPageProps): Promise<Metadata> {
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
      title: 'Pemutar Film - Streamku',
    };
  }

  return {
    title: `Memutar ${movie.title} (${movie.year}) - Nonton Film Online Gratis | Streamku`,
    description: `Tonton streaming film ${movie.title} secara online gratis di Streamku dengan kualitas HD terbaik.`,
  };
}

export default async function MoviePlayPage({ params }: PlayPageProps) {
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
          Maaf, film yang ingin Anda putar tidak tersedia atau tautan telah kedaluwarsa.
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

  const streamLinks = await getMovieStreamLinks();
  const matchingStream = streamLinks.find(
    (link) => link.movie_name === movie.id.toString()
  );

  const directLinks: string[] = [];
  if (matchingStream) {
    const streamObj = matchingStream as any;
    if (streamObj.link) directLinks.push(streamObj.link);
    for (let i = 1; i <= 20; i++) {
      const key = `link_${i}`;
      if (streamObj[key]) {
        directLinks.push(streamObj[key]);
      }
    }
  }

  return <MoviePlayer movie={movie} directLinks={directLinks} />;
}
