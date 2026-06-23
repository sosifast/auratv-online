'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Film, Search, Star, PlayCircle, Loader2, X, Clapperboard } from 'lucide-react';
import BottomMenu from '@/app/component/menu';
import { Movie, MovieGenre } from '@/app/lib/api-movie/types';

interface MovieExplorerProps {
  initialMovies: Movie[];
  initialGenres: MovieGenre[];
  initialHasNextPage: boolean;
}

export default function MovieExplorer({
  initialMovies,
  initialGenres,
  initialHasNextPage,
}: MovieExplorerProps) {
  const [movies, setMovies] = useState<Movie[]>(() => {
    const unique: Movie[] = [];
    const seen = new Set<number>();
    for (const m of initialMovies) {
      if (m && m.id) {
        const idNum = Number(m.id);
        if (!seen.has(idNum)) {
          seen.add(idNum);
          unique.push({ ...m, id: idNum });
        }
      }
    }
    return unique;
  });
  const [genres] = useState<MovieGenre[]>(initialGenres);
  const [activeGenre, setActiveGenre] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(initialHasNextPage);
  
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const isInitialMount = useRef(true);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loaderRef = useRef<HTMLDivElement | null>(null);

  // Debounce search query changes
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 400);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  // Fetch Page 1 whenever activeGenre or debouncedSearch changes (excluding initial load)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const fetchFilteredMovies = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        queryParams.set('page', '1');
        queryParams.set('limit', '20');
        if (activeGenre !== null) {
          queryParams.set('genre', activeGenre.toString());
        }
        if (debouncedSearch.trim() !== '') {
          queryParams.set('search', debouncedSearch.trim());
        }

        const res = await fetch(`/api/movie?${queryParams.toString()}`);
        if (!res.ok) throw new Error("Gagal mengambil data");
        const data = await res.json();
        
        const uniqueMovies: Movie[] = [];
        const seenIds = new Set<number>();
        if (data.movies) {
          for (const m of data.movies) {
            if (m && m.id) {
              const idNum = Number(m.id);
              if (!seenIds.has(idNum)) {
                seenIds.add(idNum);
                uniqueMovies.push({ ...m, id: idNum });
              }
            }
          }
        }
        setMovies(uniqueMovies);
        setPage(1);
        setHasNextPage(data.pagination?.hasNextPage ?? false);
      } catch (error) {
        console.error("Gagal menyaring film:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFilteredMovies();
  }, [activeGenre, debouncedSearch]);

  // Infinite scroll observer trigger
  useEffect(() => {
    if (loading || !hasNextPage) return;

    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !loadingMore) {
        loadMoreMovies();
      }
    });

    if (loaderRef.current) {
      observerRef.current.observe(loaderRef.current);
    }

    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, loadingMore, hasNextPage, page, activeGenre, debouncedSearch]);

  // Load next page of movies
  const loadMoreMovies = async () => {
    setLoadingMore(true);
    const nextPage = page + 1;
    try {
      const queryParams = new URLSearchParams();
      queryParams.set('page', nextPage.toString());
      queryParams.set('limit', '20');
      if (activeGenre !== null) {
        queryParams.set('genre', activeGenre.toString());
      }
      if (debouncedSearch.trim() !== '') {
        queryParams.set('search', debouncedSearch.trim());
      }

      const res = await fetch(`/api/movie?${queryParams.toString()}`);
      if (!res.ok) throw new Error("Gagal mengambil data halaman berikutnya");
      const data = await res.json();
      
      if (data.movies && data.movies.length > 0) {
        setMovies((prev) => {
          const combined = [...prev, ...data.movies];
          const unique: Movie[] = [];
          const seen = new Set<number>();
          for (const m of combined) {
            if (m && m.id) {
              const idNum = Number(m.id);
              if (!seen.has(idNum)) {
                seen.add(idNum);
                unique.push({ ...m, id: idNum });
              }
            }
          }
          return unique;
        });
        setPage(nextPage);
        setHasNextPage(data.pagination?.hasNextPage ?? false);
      } else {
        setHasNextPage(false);
      }
    } catch (error) {
      console.error("Gagal memuat film berikutnya:", error);
    } finally {
      setLoadingMore(false);
    }
  };

  // Skeleton Card Template
  const SkeletonCard = () => (
    <div className="animate-pulse flex flex-col rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm">
      <div className="aspect-[2/3] w-full bg-gray-200" />
      <div className="p-3.5 flex flex-col gap-2 flex-1">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-full" />
        <div className="h-3 bg-gray-200 rounded w-5/6" />
      </div>
    </div>
  );

  return (
    <div className="w-full h-screen overflow-hidden antialiased bg-gray-50 text-gray-900 font-sans selection:bg-[#E50914]/30 flex flex-col relative">
      
      {/* TOP HEADER */}
      <header className="absolute top-0 left-0 w-full z-40 px-5 md:px-10 py-4 flex justify-between items-center bg-white border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Film className="w-7 h-7 text-[#E50914]" />
          <span className="text-xl font-bold tracking-wider text-gray-900">MOVIES</span>
        </div>

        {/* Dynamic Search Box */}
        <div className="relative w-44 sm:w-64 md:w-80">
          <input
            type="text"
            placeholder="Cari judul film..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-1.5 text-xs sm:text-sm bg-gray-100 hover:bg-gray-200/70 focus:bg-white text-gray-900 placeholder-gray-400 rounded-full border border-transparent focus:border-gray-200 focus:outline-none transition-all"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 hover:text-gray-900 text-gray-400 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden hide-scrollbar pt-20 pb-24 w-full bg-white flex flex-col">
        
        {/* HORIZONTAL GENRE FILTER */}
        <div className="px-5 md:px-10 py-4 shrink-0 bg-white sticky top-0 z-30 border-b border-gray-50 flex items-center gap-2 overflow-x-auto hide-scrollbar">
          <button
            onClick={() => setActiveGenre(null)}
            className={`px-4 py-1.5 text-xs font-bold rounded-full transition-all shrink-0 cursor-pointer ${
              activeGenre === null
                ? 'bg-gradient-to-r from-[#E50914] to-red-600 text-white shadow-sm shadow-red-500/20'
                : 'bg-gray-100 hover:bg-gray-200/70 text-gray-600 hover:text-gray-900'
            }`}
          >
            Semua
          </button>
          {genres.map((genre) => (
            <button
              key={genre.id}
              onClick={() => setActiveGenre(genre.id)}
              className={`px-4 py-1.5 text-xs font-bold rounded-full transition-all shrink-0 cursor-pointer ${
                activeGenre === genre.id
                  ? 'bg-gradient-to-r from-[#E50914] to-red-600 text-white shadow-sm shadow-red-500/20'
                  : 'bg-gray-100 hover:bg-gray-200/70 text-gray-600 hover:text-gray-900'
              }`}
            >
              {genre.name}
            </button>
          ))}
        </div>

        {/* MOVIE GRID CONTAINER */}
        <div className="px-5 md:px-10 py-6 flex-1">
          {/* Skeleton state */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
              {Array.from({ length: 12 }).map((_, idx) => (
                <SkeletonCard key={idx} />
              ))}
            </div>
          ) : movies.length > 0 ? (
            <>
              {/* Responsive Grid. Grid size is up to 4 columns on large devices, forming 4x5 layout per 20 entries */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
                {movies.map((movie) => (
                  <Link 
                    href={`/movie/detail/${movie.id}`}
                    key={movie.id} 
                    className="group relative cursor-pointer flex flex-col rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm hover:shadow-lg hover:border-gray-200 transition-all duration-300"
                  >
                    {/* Poster Image Wrapper */}
                    <div className="relative aspect-[2/3] w-full bg-gray-100 overflow-hidden">
                      <img 
                        src={movie.poster_url || "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?auto=format&fit=crop&w=300&q=80"} 
                        alt={movie.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      
                      {/* Hover Overlay with play symbol */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <div className="transform scale-90 group-hover:scale-100 transition-all duration-300 bg-black/40 backdrop-blur-md rounded-full p-3.5 border border-white/20">
                          <PlayCircle className="w-10 h-10 text-white fill-white/10" />
                        </div>
                      </div>

                      {/* Poster Badges */}
                      <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
                        {/* Average Rating */}
                        {movie.vote_average > 0 && (
                          <div className="flex items-center gap-1 bg-black/60 backdrop-blur-sm text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-lg shadow-sm">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            <span>{movie.vote_average.toFixed(1)}</span>
                          </div>
                        )}
                        
                        {/* Year Badge */}
                        {movie.year && (
                          <div className="bg-black/60 backdrop-blur-sm text-white text-[10px] font-semibold px-2 py-0.5 rounded-lg shadow-sm w-fit">
                            {movie.year}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Content Details */}
                    <div className="p-3 flex flex-col flex-1">
                      <h3 className="text-xs sm:text-sm font-bold text-gray-800 line-clamp-1 group-hover:text-[#E50914] transition-colors duration-200">
                        {movie.title}
                      </h3>
                      <p className="text-[10px] sm:text-xs text-gray-500 line-clamp-2 mt-1 leading-relaxed">
                        {movie.overview || "Tidak ada deskripsi singkat."}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Loader intersection target for Infinite Scroll */}
              {hasNextPage && (
                <div ref={loaderRef} className="w-full py-8 mt-4 flex justify-center items-center">
                  {loadingMore ? (
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                      <Loader2 className="w-5 h-5 text-[#E50914] animate-spin" />
                      <span>Memuat film lainnya...</span>
                    </div>
                  ) : (
                    <div className="h-4 w-4" /> // Placeholder target
                  )}
                </div>
              )}

              {/* End of list banner */}
              {!hasNextPage && movies.length > 12 && (
                <div className="w-full py-10 text-center text-gray-400 text-xs sm:text-sm border-t border-gray-50 mt-10">
                  Sudah menampilkan semua film
                </div>
              )}
            </>
          ) : (
            // Empty state
            <div className="w-full py-20 flex flex-col items-center justify-center gap-3 text-center">
              <Clapperboard className="w-12 h-12 text-gray-300" />
              <h3 className="text-sm font-bold text-gray-800">Film Tidak Ditemukan</h3>
              <p className="text-xs text-gray-400 max-w-xs">
                Tidak ada film yang cocok dengan pencarian atau filter yang dipilih. Coba cari kata kunci lain.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* BOTTOM NAVIGATION BAR */}
      <BottomMenu />
    </div>
  );
}
