'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Heart, MessageCircle, Bookmark, Share2,
  Play, X, ArrowLeft, Loader2, AlertCircle
} from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────────────
interface ShortStream {
  id: string;
  title: string;
  slug: string;
  image: string;
  description: string;
  views: number;
  episodes: number;
  tags: string[];
  is_paid: number;
  rating_score: number;
}

interface ShortEpisode {
  id_stream: string;
  sources: string[];
}

type VideoType = 'hls' | 'mp4' | 'mkv' | 'ts' | 'unknown';

function detectVideoType(url: string): VideoType {
  if (!url) return 'unknown';
  const lower = url.toLowerCase().split('?')[0];
  if (lower.includes('.m3u8')) return 'hls';
  if (lower.includes('.m4p') || lower.includes('.mp4')) return 'mp4';
  if (lower.includes('.mkv')) return 'mkv';
  if (lower.includes('.ts')) return 'ts';
  return 'unknown';
}

function formatNum(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return String(n);
}

// ── HLS Hook ─────────────────────────────────────────────────────────────────
function useHls(videoRef: React.RefObject<HTMLVideoElement | null>, src: string | null, enabled: boolean) {
  const hlsRef = useRef<import('hls.js').default | null>(null);

  useEffect(() => {
    if (!enabled || !src || !videoRef.current) return;
    let cancelled = false;

    (async () => {
      const Hls = (await import('hls.js')).default;
      if (cancelled) return;

      if (!Hls.isSupported()) {
        if (videoRef.current) videoRef.current.src = src;
        return;
      }
      if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null; }

      const hls = new Hls({ enableWorker: true, lowLatencyMode: true });
      hlsRef.current = hls;
      hls.loadSource(src);
      hls.attachMedia(videoRef.current!);
      hls.on(Hls.Events.ERROR, (_, d) => { if (d.fatal) console.error('HLS error', d); });
    })();

    return () => {
      cancelled = true;
      if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null; }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src, enabled]);
}

// ── VideoPlayer ───────────────────────────────────────────────────────────────
function VideoPlayer({
  stream, episode, epIndex, totalEps,
  onOpenEpisodes, isActive, onEnded,
}: {
  stream: ShortStream;
  episode: ShortEpisode | undefined;
  epIndex: number;
  totalEps: number;
  onOpenEpisodes: () => void;
  isActive: boolean;
  onEnded: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [buffering, setBuffering] = useState(false);

  const src = episode?.sources[0] ?? '';
  const vType = detectVideoType(src);
  const isHls = vType === 'hls';

  useHls(videoRef, isHls ? src : null, isHls && isActive);

  // Set native src
  useEffect(() => {
    if (!videoRef.current || isHls || !src) return;
    videoRef.current.src = src;
  }, [src, isHls]);

  const attemptPlay = useCallback(() => {
    const vid = videoRef.current;
    if (!vid || !isActive) return;
    vid.play().then(() => setIsPlaying(true)).catch((e) => {
      console.warn("Autoplay failed", e);
      setIsPlaying(false);
    });
  }, [isActive]);

  // Auto play/pause when active changes
  useEffect(() => {
    if (isActive) {
      attemptPlay();
    } else {
      const vid = videoRef.current;
      if (vid) {
        vid.pause();
        vid.currentTime = 0;
        setIsPlaying(false);
      }
    }
  }, [isActive, attemptPlay]);

  const togglePlay = useCallback(() => {
    const vid = videoRef.current;
    if (!vid) return;
    if (vid.paused) {
      vid.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      vid.pause();
      setIsPlaying(false);
    }
  }, []);

  return (
    <div className="relative w-full h-full snap-start shrink-0 bg-black flex items-center justify-center overflow-hidden">

      {/* Poster / Video — object-contain agar tidak terpotong */}
      {src ? (
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-contain"
          playsInline
          preload="metadata"
          poster={stream.image}
          onClick={togglePlay}
          onWaiting={() => setBuffering(true)}
          onCanPlay={() => {
            setBuffering(false);
            if (isActive) attemptPlay();
          }}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={onEnded}
        />
      ) : (
        <img
          src={stream.image}
          alt={stream.title}
          className="absolute inset-0 w-full h-full object-contain"
          onClick={togglePlay}
        />
      )}

      {/* Buffering */}
      {buffering && (
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <Loader2 className="w-10 h-10 text-white/70 animate-spin" />
        </div>
      )}

      {/* Pause icon */}
      {!isPlaying && !buffering && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="bg-black/40 p-4 rounded-full backdrop-blur-sm">
            <Play size={44} className="text-white fill-white opacity-85" />
          </div>
        </div>
      )}

      {/* Top fade */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-transparent h-36 pointer-events-none" />
      {/* Bottom fade */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent h-72 pointer-events-none" />

      {/* ── RIGHT ACTIONS ── */}
      <div className="absolute right-3 bottom-28 z-20 flex flex-col items-center gap-5">
        {/* Like */}
        <button
          onClick={() => setIsLiked(p => !p)}
          className="flex flex-col items-center gap-1 active:scale-90 transition-transform"
        >
          <div className={`p-2.5 rounded-full transition-colors ${isLiked ? 'bg-[#E50914]/20' : 'bg-black/20 backdrop-blur-md'}`}>
            <Heart className={`w-7 h-7 ${isLiked ? 'text-[#E50914] fill-[#E50914]' : 'text-white fill-white'}`} />
          </div>
          <span className="text-white text-[11px] font-semibold drop-shadow-md">{formatNum(stream.rating_score)}</span>
        </button>

        {/* Comment */}
        <button className="flex flex-col items-center gap-1 active:scale-90 transition-transform">
          <div className="p-2.5 rounded-full bg-black/20 backdrop-blur-md">
            <MessageCircle className="w-7 h-7 text-white" />
          </div>
          <span className="text-white text-[11px] font-semibold drop-shadow-md">{formatNum(stream.views)}</span>
        </button>

        {/* Save */}
        <button
          onClick={() => setIsSaved(p => !p)}
          className="flex flex-col items-center gap-1 active:scale-90 transition-transform"
        >
          <div className={`p-2.5 rounded-full transition-colors ${isSaved ? 'bg-amber-500/20' : 'bg-black/20 backdrop-blur-md'}`}>
            <Bookmark className={`w-7 h-7 ${isSaved ? 'text-amber-400 fill-amber-400' : 'text-white'}`} />
          </div>
          <span className="text-white text-[11px] font-semibold drop-shadow-md">Save</span>
        </button>

        {/* Share */}
        <button className="flex flex-col items-center gap-1 active:scale-90 transition-transform">
          <div className="p-2.5 rounded-full bg-black/20 backdrop-blur-md">
            <Share2 className="w-7 h-7 text-white" />
          </div>
          <span className="text-white text-[11px] font-semibold drop-shadow-md">Share</span>
        </button>
      </div>

      {/* ── BOTTOM LEFT INFO ── */}
      <div className="absolute left-4 bottom-8 z-20 flex flex-col items-start max-w-[78%]">

        {/* Episode label */}
        <div
          onClick={(e) => { e.stopPropagation(); onOpenEpisodes(); }}
          className="flex items-center text-amber-300 text-[13px] font-medium mb-1.5 cursor-pointer drop-shadow-md"
        >
          <Play size={11} className="mr-1.5 fill-current shrink-0" />
          Episode {epIndex + 1}
          <span className="text-white/60 ml-1.5 font-normal text-[11px]">| {totalEps} Ep &rsaquo;</span>
        </div>

        {/* Title */}
        <h2 className="text-white font-bold text-[17px] drop-shadow-md leading-snug line-clamp-2 mb-1">
          {stream.title}
        </h2>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mt-0.5">
          {stream.tags.slice(0, 2).map(tag => (
            <span key={tag} className="text-[10px] text-white/70 font-medium">#{tag}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function PlayPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.play as string;

  const [stream, setStream] = useState<ShortStream | null>(null);
  const [episodes, setEpisodes] = useState<ShortEpisode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeEpIdx, setActiveEpIdx] = useState(0);
  const [showEpisodes, setShowEpisodes] = useState(false);

  // Track which card is visible via IntersectionObserver
  const [visibleIdx, setVisibleIdx] = useState(0);
  const feedRef = useRef<HTMLDivElement>(null);

  // Fetch
  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetch(`/api/short/episode/${slug}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        setStream(data.stream);
        setEpisodes(data.episodes ?? []);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [slug]);

  // IntersectionObserver to detect active card
  useEffect(() => {
    const feed = feedRef.current;
    if (!feed || episodes.length === 0) return;

    const cards = feed.querySelectorAll('[data-ep-card]');
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const idx = parseInt((entry.target as HTMLElement).dataset.epCard ?? '0');
            setVisibleIdx(idx);
            setActiveEpIdx(idx);
          }
        }
      },
      { root: feed, threshold: 0.6 }
    );
    cards.forEach(c => observer.observe(c));
    return () => observer.disconnect();
  }, [episodes]);

  // ── Loading ──
  if (loading) return (
    <div className="flex flex-col items-center justify-center w-full h-screen bg-black text-white gap-4">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');body{font-family:'Inter',sans-serif;background:#000;margin:0;}`}</style>
      <div className="relative">
        <div className="w-14 h-14 rounded-full border-4 border-white/10 border-t-white animate-spin" />
      </div>
      <p className="text-white/50 text-sm">Memuat…</p>
    </div>
  );

  if (error || !stream) return (
    <div className="flex flex-col items-center justify-center w-full h-screen bg-black text-white gap-4 px-8 text-center">
      <style>{`body{font-family:'Inter',sans-serif;background:#000;margin:0;}`}</style>
      <AlertCircle className="w-12 h-12 text-red-500" />
      <p className="text-white font-semibold">Konten tidak ditemukan</p>
      <p className="text-white/50 text-sm">{error}</p>
      <button onClick={() => router.back()} className="mt-2 flex items-center gap-2 bg-white text-black px-5 py-2 rounded-full text-sm font-semibold">
        <ArrowLeft className="w-4 h-4" /> Kembali
      </button>
    </div>
  );

  // If no episodes yet, show single poster
  const cards = episodes.length > 0 ? episodes : [undefined];

  return (
    <div className="w-full h-[100dvh] bg-black font-[Inter] select-none overflow-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        html,body{font-family:'Inter',sans-serif;margin:0;padding:0;background:#000;overflow:hidden;overscroll-behavior:none;}
        .no-scrollbar::-webkit-scrollbar{display:none;}
        .no-scrollbar{-ms-overflow-style:none;scrollbar-width:none;}
        @keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
        .slide-up{animation:slideUp 0.28s cubic-bezier(0.32,0.72,0,1);}
      `}</style>

      <div className="relative w-full h-full bg-black overflow-hidden flex flex-col">

        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 z-30 p-2 rounded-full bg-black/30 backdrop-blur-md border border-white/10"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>

        {/* ── FEED ── */}
        <div
          ref={feedRef}
          className="w-full h-full overflow-y-scroll snap-y snap-mandatory no-scrollbar"
        >
          {cards.map((ep, idx) => (
            <div
              key={idx}
              data-ep-card={idx}
              className="w-full shrink-0 snap-start"
              style={{ height: '100dvh' }}
            >
              <VideoPlayer
                stream={stream}
                episode={ep}
                epIndex={idx}
                totalEps={episodes.length || stream.episodes}
                onOpenEpisodes={() => setShowEpisodes(true)}
                isActive={visibleIdx === idx}
                onEnded={() => {
                  const nextIdx = idx + 1;
                  if (nextIdx < cards.length) {
                    const card = feedRef.current?.querySelector(`[data-ep-card="${nextIdx}"]`);
                    card?.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              />
            </div>
          ))}
        </div>

        {/* ── EPISODE BOTTOM SHEET ── */}
        {showEpisodes && (
          <div className="absolute inset-0 z-50 flex items-end justify-center">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/60"
              onClick={() => setShowEpisodes(false)}
            />

            {/* Sheet */}
            <div className="relative w-full h-[65vh] bg-neutral-900 rounded-t-2xl flex flex-col slide-up shadow-[0_-10px_40px_rgba(0,0,0,0.6)]">
              {/* Drag handle */}
              <div className="w-full flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 bg-white/20 rounded-full" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-5 pb-3 pt-2 border-b border-white/8">
                <h3 className="text-white font-bold text-base">Pilih Episode</h3>
                <button
                  onClick={() => setShowEpisodes(false)}
                  className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <X size={16} className="text-white" />
                </button>
              </div>

              {/* Episode chips */}
              <div className="flex-1 overflow-y-auto p-4 no-scrollbar pb-10">
                {episodes.length > 0 ? (
                  <div className="flex flex-wrap gap-2.5">
                    {episodes.map((ep, idx) => {
                      const isActive = idx === activeEpIdx;
                      return (
                        <button
                          key={idx}
                          onClick={() => {
                            // Scroll feed to that card
                            const feed = feedRef.current;
                            const card = feed?.querySelector(`[data-ep-card="${idx}"]`);
                            card?.scrollIntoView({ behavior: 'smooth' });
                            setActiveEpIdx(idx);
                            setShowEpisodes(false);
                          }}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border flex items-center gap-1.5 ${
                            isActive
                              ? 'bg-white/20 border-white/40 text-white'
                              : 'bg-white/5 border-transparent text-white/60 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          {isActive && <Play size={12} className="fill-current shrink-0" />}
                          Ep {idx + 1}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  // Generate episode placeholders from stream.episodes count
                  <div className="flex flex-wrap gap-2.5">
                    {Array.from({ length: stream.episodes }, (_, i) => (
                      <button
                        key={i}
                        onClick={() => setShowEpisodes(false)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border flex items-center gap-1.5 ${
                          i === 0
                            ? 'bg-white/20 border-white/40 text-white'
                            : 'bg-white/5 border-transparent text-white/60 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        {i === 0 && <Play size={12} className="fill-current shrink-0" />}
                        Ep {i + 1}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
