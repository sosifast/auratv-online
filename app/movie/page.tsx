import type { Metadata } from 'next';
import MovieExplorer from './MovieExplorer';
import { getMovies, getMovieGenres } from '@/app/lib/api-movie/data';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Nonton Film Online Gratis | Movie Stream - Streamku',
  description: 'Temukan ribuan film online gratis dengan kualitas terbaik di Streamku. Tonton genre Aksi, Petualangan, Horor, Komedi, Romantis, dan lainnya.',
};

export default async function MoviePage() {
  // Pre-fetch data on the server for instant page delivery & crawler SEO visibility
  const genres = await getMovieGenres();
  const allMovies = await getMovies();
  
  // Slices the first page (20 entries) directly for initial hydration
  const initialMovies = allMovies.slice(0, 20);
  const totalCount = allMovies.length;
  const initialHasNextPage = totalCount > 20;

  return (
    <MovieExplorer 
      initialMovies={initialMovies} 
      initialGenres={genres}
      initialHasNextPage={initialHasNextPage}
    />
  );
}
