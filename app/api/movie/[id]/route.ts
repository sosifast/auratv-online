import { NextRequest } from "next/server";
import { getMovieById, getMovieBySlug } from "@/app/lib/api-movie/data";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // In Next.js 15/16, params is a Promise and must be awaited before accessing properties
    const { id } = await params;
    const numericId = parseInt(id, 10);
    
    let movie = null;
    
    // 1. Try finding by ID if it's a valid number
    if (!isNaN(numericId)) {
      movie = await getMovieById(numericId);
    }
    
    // 2. Fallback to slug if not found by ID or if ID is a slug string
    if (!movie) {
      movie = await getMovieBySlug(id);
    }

    if (!movie) {
      return Response.json(
        { error: "Movie not found" },
        { status: 404 }
      );
    }

    return Response.json(movie);
  } catch (error: any) {
    console.error("API error in GET /api/movie/[id]:", error);
    return Response.json(
      { error: error.message || "Failed to fetch movie details" },
      { status: 500 }
    );
  }
}
