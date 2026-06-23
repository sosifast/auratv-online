import { cache } from 'react';
import { Movie, MovieGenre, CastActor, CrewMember } from './types';

const API_BASE = "https://streamku-kappa.vercel.app";

// Persistent caching in Node's global object to survive Next.js Fast Refresh reloads in dev mode.
interface GlobalMovieCache {
  cachedMovies?: Movie[];
  cachedMoviesTime?: number;
  cachedGenres?: MovieGenre[];
  cachedGenresTime?: number;
}

const cacheGlobal = (global as any) as GlobalMovieCache;

const CACHE_TTL = 3600 * 1000; // 1 hour cache duration

/**
 * Fetch movie genres list.
 */
export const getMovieGenres = cache(async (): Promise<MovieGenre[]> => {
  const now = Date.now();
  if (cacheGlobal.cachedGenres && (now - (cacheGlobal.cachedGenresTime || 0) < CACHE_TTL)) {
    return cacheGlobal.cachedGenres;
  }

  try {
    const res = await fetch(`${API_BASE}/movie/genres.json`, { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error(`Failed to fetch movie genres. Status: ${res.status}`);
    const data = await res.json();
    cacheGlobal.cachedGenres = data;
    cacheGlobal.cachedGenresTime = now;
    return data;
  } catch (error) {
    console.error("Error in getMovieGenres:", error);
    return cacheGlobal.cachedGenres || [];
  }
});

/**
 * Fetch all movies from the 10k database.
 * Implements a hybrid memory + filesystem-based caching system to bypass Next.js 2MB cache limits.
 * In Next.js dev mode, global variables are frequently reset. Storing a local filesystem cache
 * avoids downloading the ~20MB database over the network on every request.
 */
export const getMovies = cache(async (): Promise<Movie[]> => {
  const now = Date.now();
  
  // 1. In-memory check first (survives dev server Fast Refresh!)
  if (cacheGlobal.cachedMovies && (now - (cacheGlobal.cachedMoviesTime || 0) < CACHE_TTL)) {
    return cacheGlobal.cachedMovies;
  }

  const fs = await import('fs');
  const path = await import('path');
  const cachePath = path.join(process.cwd(), 'public', 'movie', 'database_cache.json');

  // 2. Check local filesystem cache
  try {
    if (fs.existsSync(cachePath)) {
      const stats = fs.statSync(cachePath);
      const fileAge = now - stats.mtimeMs;
      if (fileAge < CACHE_TTL) {
        const fileData = await fs.promises.readFile(cachePath, 'utf8');
        const parsed = JSON.parse(fileData);
        const uniqueMovies: Movie[] = [];
        const seenIds = new Set<number>();
        if (Array.isArray(parsed)) {
          for (const movie of parsed) {
            if (movie && movie.id) {
              const idNum = Number(movie.id);
              if (!seenIds.has(idNum)) {
                seenIds.add(idNum);
                uniqueMovies.push({ ...movie, id: idNum });
              }
            }
          }
        }
        cacheGlobal.cachedMovies = uniqueMovies;
        cacheGlobal.cachedMoviesTime = now;
        return uniqueMovies;
      }
    }
  } catch (err) {
    console.error("Error reading local database cache:", err);
  }

  // 3. Fallback/Fetch from remote API
  try {
    const res = await fetch(`${API_BASE}/movie/database.json`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Failed to fetch movies database. Status: ${res.status}`);
    const data = await res.json();
    
    const uniqueMovies: Movie[] = [];
    const seenIds = new Set<number>();
    if (Array.isArray(data)) {
      for (const movie of data) {
        if (movie && movie.id) {
          const idNum = Number(movie.id);
          if (!seenIds.has(idNum)) {
            seenIds.add(idNum);
            uniqueMovies.push({ ...movie, id: idNum });
          }
        }
      }
    }

    // Save to local filesystem cache for subsequent requests
    try {
      const dir = path.dirname(cachePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      await fs.promises.writeFile(cachePath, JSON.stringify(data), 'utf8');
    } catch (writeErr) {
      console.error("Error saving movies database cache to disk:", writeErr);
    }
    
    cacheGlobal.cachedMovies = uniqueMovies;
    cacheGlobal.cachedMoviesTime = now;
    return uniqueMovies;
  } catch (error) {
    console.error("Error in getMovies:", error);
    
    // Read stale cache as a last resort
    try {
      if (fs.existsSync(cachePath)) {
        const fileData = await fs.promises.readFile(cachePath, 'utf8');
        const parsed = JSON.parse(fileData);
        const uniqueMovies: Movie[] = [];
        const seenIds = new Set<number>();
        if (Array.isArray(parsed)) {
          for (const movie of parsed) {
            if (movie && movie.id) {
              const idNum = Number(movie.id);
              if (!seenIds.has(idNum)) {
                seenIds.add(idNum);
                uniqueMovies.push({ ...movie, id: idNum });
              }
            }
          }
        }
        return uniqueMovies;
      }
    } catch (e) {
      // ignore
    }
    
    return cacheGlobal.cachedMovies || [];
  }
});

export interface MovieStreamLink {
  movie_name: string;
  [key: string]: any;
}

/**
 * Fetch movie stream links directly from the remote API.
 * Strips comments from JSON to ensure parse safety.
 */
export const getMovieStreamLinks = async (): Promise<MovieStreamLink[]> => {
  try {
    const res = await fetch(`${API_BASE}/movie/link_stream.json`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Failed to fetch link_stream.json. Status: ${res.status}`);
    const text = await res.text();
    
    // Strip single-line and multi-line comments from JSON string
    const cleanedText = text.replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, '$1');
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("Error fetching getMovieStreamLinks:", error);
    return [];
  }
};

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
