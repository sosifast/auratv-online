import { NextRequest } from "next/server";
import { getMovies } from "@/app/lib/api-movie/data";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const genre = searchParams.get("genre");
    const search = searchParams.get("search");

    let movies = await getMovies();

    // 1. Filter by Genre ID (if specified)
    if (genre) {
      const genreId = parseInt(genre, 10);
      if (!isNaN(genreId)) {
        movies = movies.filter(m => m.genre_ids && m.genre_ids.includes(genreId));
      }
    }

    // 2. Filter by Search Query (if specified)
    if (search) {
      const query = search.toLowerCase().trim();
      movies = movies.filter(m => 
        (m.title && m.title.toLowerCase().includes(query)) ||
        (m.original_title && m.original_title.toLowerCase().includes(query)) ||
        (m.overview && m.overview.toLowerCase().includes(query))
      );
    }

    // 3. Paginate
    const totalCount = movies.length;
    const totalPages = Math.ceil(totalCount / limit);
    const startIndex = (page - 1) * limit;
    const paginatedMovies = movies.slice(startIndex, startIndex + limit);

    return Response.json({
      movies: paginatedMovies,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage: page < totalPages,
      }
    });
  } catch (error: any) {
    console.error("API Error in GET /api/movie:", error);
    return Response.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
