import { NextRequest } from "next/server";
import { getEpisodesForStream, getShortStreamBySlug } from "@/app/lib/api-short";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const stream = await getShortStreamBySlug(slug);

  if (!stream) {
    return Response.json({ error: "Stream not found" }, { status: 404 });
  }

  const episodes = await getEpisodesForStream(stream.id);

  return Response.json({ stream, episodes });
}
