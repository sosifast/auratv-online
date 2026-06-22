import { NextRequest } from "next/server";
import { getShortStreams } from "@/app/lib/api-short";

export async function GET(_req: NextRequest) {
  const streams = await getShortStreams();
  return Response.json(streams);
}
