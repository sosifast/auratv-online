import { NextRequest } from "next/server";
import { getMovieGenres } from "@/app/lib/api-movie/data";

export async function GET(_req: NextRequest) {
  try {
    const genres = await getMovieGenres();
    return Response.json(genres);
  } catch (error: any) {
    console.error("API Error in GET /api/movie/genres:", error);
    return Response.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
