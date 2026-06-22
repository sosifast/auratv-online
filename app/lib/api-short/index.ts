const API_BASE = "https://streamku-kappa.vercel.app";

export interface ShortStream {
  id: string;
  title: string;
  slug: string;
  link: string;
  image: string;
  description: string;
  views: number;
  episodes: number;
  tags: string[];
  is_paid: number;
  rating_score: number;
}

// API mengembalikan { value: [...], Count: N } bukan array langsung
interface ApiResponse<T> {
  value: T[];
  Count: number;
}

// Episode punya field s1-s100, kita ambil semua yang tidak kosong
export interface ShortEpisode {
  id_stream: string;
  sources: string[]; // filtered non-empty sources
}

/**
 * Helper — parse response API yang mengembalikan { value: [], Count: N }
 */
async function fetchApiArray<T>(url: string): Promise<T[]> {
  const res = await fetch(url, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`HTTP ${res.status} from ${url}`);
  const data: ApiResponse<T> | T[] = await res.json();
  // Guard: kalau sudah array, return langsung
  if (Array.isArray(data)) return data;
  // Format baru: { value: [], Count: N }
  if (data && Array.isArray((data as ApiResponse<T>).value)) {
    return (data as ApiResponse<T>).value;
  }
  return [];
}

/**
 * Mengambil semua data streaming short dari API
 */
export async function getShortStreams(): Promise<ShortStream[]> {
  try {
    return await fetchApiArray<ShortStream>(`${API_BASE}/short/stream.json`);
  } catch (error) {
    console.error("Error fetching short streams:", error);
    return [];
  }
}

/**
 * Mengambil data episode/stream links dan normalisasi sources
 */
export async function getShortEpisodes(): Promise<ShortEpisode[]> {
  try {
    // Raw episode record dari API (s1-s100 dll.)
    const raw = await fetchApiArray<Record<string, string>>(`${API_BASE}/short/episode.json`);
    
    const allEpisodes: ShortEpisode[] = [];
    
    for (const ep of raw) {
      const id_stream = ep["id_stream"] ?? "";
      // Setiap s1, s2, s3... adalah episode yang berbeda
      for (let i = 1; i <= 100; i++) {
        const val = ep[`s${i}`];
        if (val && val.trim() !== "") {
          allEpisodes.push({
            id_stream,
            sources: [val.trim()],
          });
        }
      }
    }
    
    return allEpisodes;
  } catch (error) {
    console.error("Error fetching short episodes:", error);
    return [];
  }
}

/**
 * Mengambil detail stream berdasarkan slug/id
 */
export async function getShortStreamBySlug(slug: string): Promise<ShortStream | null> {
  const streams = await getShortStreams();
  return streams.find((s) => s.slug === slug || s.id === slug) ?? null;
}

/**
 * Mengambil semua episode untuk stream tertentu berdasarkan id_stream
 */
export async function getEpisodesForStream(idStream: string): Promise<ShortEpisode[]> {
  const episodes = await getShortEpisodes();
  return episodes.filter((e) => e.id_stream === idStream);
}

/**
 * Detect tipe video dari URL
 */
export type VideoType = "hls" | "mp4" | "mkv" | "ts" | "unknown";

export function detectVideoType(url: string): VideoType {
  if (!url) return "unknown";
  const lower = url.toLowerCase().split("?")[0];
  if (lower.includes(".m3u8")) return "hls";
  if (lower.includes(".m4p") || lower.includes(".mp4")) return "mp4";
  if (lower.includes(".mkv")) return "mkv";
  if (lower.includes(".ts")) return "ts";
  return "unknown";
}
