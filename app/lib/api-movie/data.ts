import { cache } from 'react';

const API_BASE = "https://streamku-kappa.vercel.app";

export interface MovieGenre {
  id: number;
  name: string;
}

export interface CastActor {
  id: number;
  name: string;
  character: string;
  profile_path: string;
  order: number;
}

export interface CrewMember {
  id: number;
  name: string;
  job: string;
  department: string;
  profile_path: string;
}

export interface Movie {
  id: number;
  title: string;
  original_title: string;
  slug: string;
  seo_title: string;
  desc_title: string;
  overview: string;
  tagline?: string;
  release_date: string;
  year: string;
  runtime?: number;
  status?: string;
  budget?: number;
  revenue?: number;
  imdb_id?: string;
  homepage?: string;
  poster_url: string;
  backdrop_url: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  genre_ids: number[];
  genres?: MovieGenre[];
  adult: boolean;
  actors?: CastActor[];
  directors?: CrewMember[];
  writers?: CrewMember[];
  producers?: CrewMember[];
  trailer?: string | null;
  keywords?: MovieGenre[];
}

// In-memory cache to bypass Next.js's 2MB data cache limits for the 10k movie database.
let cachedMovies: Movie[] | null = null;
let cachedMoviesTime = 0;

let cachedGenres: MovieGenre[] | null = null;
let cachedGenresTime = 0;

const CACHE_TTL = 3600 * 1000; // 1 hour cache duration

/**
 * Fetch movie genres list.
 */
export const getMovieGenres = cache(async (): Promise<MovieGenre[]> => {
  const now = Date.now();
  if (cachedGenres && (now - cachedGenresTime < CACHE_TTL)) {
    return cachedGenres;
  }

  try {
    const res = await fetch(`${API_BASE}/movie/genres.json`, { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error(`Failed to fetch movie genres. Status: ${res.status}`);
    const data = await res.json();
    cachedGenres = data;
    cachedGenresTime = now;
    return data;
  } catch (error) {
    console.error("Error in getMovieGenres:", error);
    return cachedGenres || [];
  }
});

/**
 * Fetch all movies from the 10k database.
 * Uses manual memory-based caching to bypass Next.js file-caching limits (>2MB).
 */
export const getMovies = cache(async (): Promise<Movie[]> => {
  const now = Date.now();
  if (cachedMovies && (now - cachedMoviesTime < CACHE_TTL)) {
    return cachedMovies;
  }

  try {
    const res = await fetch(`${API_BASE}/movie/database.json`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Failed to fetch movies database. Status: ${res.status}`);
    const data = await res.json();
    cachedMovies = data;
    cachedMoviesTime = now;
    return data;
  } catch (error) {
    console.error("Error in getMovies:", error);
    return cachedMovies || [];
  }
});

/**
 * Get a movie by its numeric ID.
 */
export const getMovieById = async (id: number): Promise<Movie | null> => {
  try {
    const movies = await getMovies();
    return movies.find((movie) => movie.id === id) || null;
  } catch (error) {
    console.error("Error in getMovieById:", error);
    return null;
  }
};

/**
 * Get a movie by its slug string.
 */
export const getMovieBySlug = async (slug: string): Promise<Movie | null> => {
  try {
    const movies = await getMovies();
    return movies.find((movie) => movie.slug === slug) || null;
  } catch (error) {
    console.error("Error in getMovieBySlug:", error);
    return null;
  }
};
