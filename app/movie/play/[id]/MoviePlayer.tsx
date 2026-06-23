'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, Server, Star, Clock, Play, Pause, 
  Volume2, VolumeX, Maximize, Minimize, Settings, Loader2,
  RotateCw, RotateCcw, AlertTriangle, ExternalLink
} from 'lucide-react';
import { Movie } from '@/app/lib/api-movie/types';
import BottomMenu from '@/app/component/menu';

interface MoviePlayerProps {
  movie: Movie;
  directLinks: string[];
}

// ── HLS Hook ─────────────────────────────────────────────────────────────────
function useHls(videoRef: React.RefObject<HTMLVideoElement | null>, src: string | null, enabled: boolean) {
  const hlsRef = useRef<any>(null);

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
  }, [src, enabled]);
}

// ── MPEG-TS Hook ─────────────────────────────────────────────────────────────
function useMpegTs(videoRef: React.RefObject<HTMLVideoElement | null>, src: string | null, enabled: boolean) {
  const playerRef = useRef<any>(null);

  useEffect(() => {
    if (!enabled || !src || !videoRef.current) return;
    let cancelled = false;

    (async () => {
      const mpegts = (await import('mpegts.js')).default;
      if (cancelled) return;

      if (!mpegts.isSupported()) {
        if (videoRef.current) videoRef.current.src = src;
        return;
      }
      if (playerRef.current) { playerRef.current.destroy(); playerRef.current = null; }

      const player = mpegts.createPlayer({
        type: 'mpegts',
        url: src,
        isLive: false
      });
      playerRef.current = player;
      player.attachMediaElement(videoRef.current!);
      player.load();
    })();

    return () => {
      cancelled = true;
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [src, enabled]);
}

export default function MoviePlayer({ movie, directLinks }: MoviePlayerProps) {
  const [activeServer, setActiveServer] = useState(0);

  // Setup servers list: if direct streams exist, pre-pend them to the servers list.
  // Always append the alternative embed servers as fallbacks.
  const servers = [];
  if (directLinks && directLinks.length > 0) {
    directLinks.forEach((link, idx) => {
      servers.push({
        name: directLinks.length === 1 ? 'Server Utama (Direct Link)' : `Server Utama ${idx + 1} (Direct Link)`,
        url: link,
        isDirect: true
      });
    });
  }
  
  servers.push(
    { name: 'Server 1 (Vidsrc TO)', url: `https://vidsrc.to/embed/movie/${movie.id}`, isDirect: false },
    { name: 'Server 2 (Vidsrc PRO)', url: `https://vidsrc.pro/embed/movie/${movie.id}`, isDirect: false },
    { name: 'Server 3 (Embed SU)', url: `https://embed.su/embed/movie/${movie.id}`, isDirect: false },
    { name: 'Server 4 (Vidsrc ME)', url: `https://vidsrc.me/embed/movie?tmdb=${movie.id}`, isDirect: false },
  );

  const currentServer = servers[activeServer];

  // Custom Video Player States
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [videoError, setVideoError] = useState(false);

  // Format detection
  const streamUrlLower = currentServer.isDirect ? currentServer.url.toLowerCase().split('?')[0] : '';
  const isHls = currentServer.isDirect && (streamUrlLower.includes('.m3u8') || streamUrlLower.includes('m3u8'));
  const isTs = currentServer.isDirect && (streamUrlLower.includes('.ts') || streamUrlLower.includes('/ts'));
  const isMkv = currentServer.isDirect && streamUrlLower.includes('.mkv');
  
  // Initialize stream decoders
  useHls(videoRef, isHls ? currentServer.url : null, isHls);
  useMpegTs(videoRef, isTs ? currentServer.url : null, isTs);

  // Native source injection for MP4/MKV
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !currentServer.isDirect || isHls || isTs) return;
    video.src = currentServer.url;
    // reset states
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setVideoError(false);
  }, [activeServer, currentServer, isHls, isTs]);

  // Keyboard shortcut events
  useEffect(() => {
    if (!currentServer.isDirect) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      const video = videoRef.current;
      if (!video) return;

      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
        return;
      }

      switch (e.key.toLowerCase()) {
        case ' ':
          e.preventDefault();
          togglePlay();
          break;
        case 'arrowleft':
          e.preventDefault();
          handleSkip(-10);
          break;
        case 'arrowright':
          e.preventDefault();
          handleSkip(10);
          break;
        case 'arrowup':
          e.preventDefault();
          setVolume((v) => {
            const nv = Math.min(1, v + 0.1);
            video.volume = nv;
            if (nv > 0) setIsMuted(false);
            return nv;
          });
          break;
        case 'arrowdown':
          e.preventDefault();
          setVolume((v) => {
            const nv = Math.max(0, v - 0.1);
            video.volume = nv;
            return nv;
          });
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'm':
          e.preventDefault();
          toggleMute();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentServer.isDirect, isPlaying, duration]);

  // Manage control visibility
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
        setShowSpeedMenu(false);
      }
    }, 3000);
  };

  const handleMouseLeave = () => {
    if (isPlaying) {
      setShowControls(false);
      setShowSpeedMenu(false);
    }
  };

  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [isPlaying]);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }, []);

  const handleSkip = (seconds: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(0, Math.min(video.duration || 0, video.currentTime + seconds));
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const time = parseFloat(e.target.value);
    video.currentTime = time;
    setCurrentTime(time);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const val = parseFloat(e.target.value);
    video.volume = val;
    setVolume(val);
    if (val > 0) {
      setIsMuted(false);
      video.muted = false;
    } else {
      setIsMuted(true);
      video.muted = true;
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    const nextMuted = !isMuted;
    video.muted = nextMuted;
    setIsMuted(nextMuted);
    if (!nextMuted && volume === 0) {
      video.volume = 0.5;
      setVolume(0.5);
    }
  };

  const changeSpeed = (rate: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = rate;
    setPlaybackRate(rate);
    setShowSpeedMenu(false);
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch((err) => {
        console.error("Error attempting to enable fullscreen mode:", err);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      });
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '00:00';
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = Math.floor(secs % 60);
    const pad = (n: number) => n.toString().padStart(2, '0');
    if (h > 0) {
      return `${h}:${pad(m)}:${pad(s)}`;
    }
    return `${pad(m)}:${pad(s)}`;
  };

  return (
    <div className="w-full min-h-screen bg-neutral-950 text-white antialiased font-sans flex flex-col relative pb-28">
      
      {/* TOP NAVBAR */}
      <header className="w-full z-45 px-4 py-4 flex items-center gap-4 bg-neutral-900/60 backdrop-blur-md border-b border-neutral-900 sticky top-0">
        <Link 
          href={`/movie/detail/${movie.id}`} 
          className="p-2 rounded-full bg-neutral-850 hover:bg-neutral-800 border border-neutral-800 text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex flex-col">
          <span className="text-[10px] text-[#E50914] font-bold tracking-wider uppercase">Memutar Film</span>
          <h1 className="text-sm font-extrabold text-white truncate max-w-[200px] sm:max-w-md">
            {movie.title}
          </h1>
        </div>
      </header>

      {/* MAIN CINEMATIC VIEWPORT */}
      <main className="flex-1 w-full px-4 md:px-10 py-6 max-w-5xl mx-auto flex flex-col gap-6">
        
        {/* ASPECT RATIO VIDEO CONTAINER */}
        <div className="w-full aspect-video bg-black shadow-2xl relative border border-neutral-900 rounded-2xl overflow-hidden animate-in fade-in duration-300">
          
          {currentServer.isDirect ? (
            /* PREMIUM CUSTOM HTML5 VIDEO PLAYER */
            <div 
              ref={containerRef}
              className="relative w-full h-full bg-black flex items-center justify-center group overflow-hidden"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              <video
                ref={videoRef}
                className="w-full h-full object-contain cursor-pointer"
                playsInline
                preload="metadata"
                onClick={togglePlay}
                onTimeUpdate={() => setCurrentTime(videoRef.current?.currentTime || 0)}
                onDurationChange={() => setDuration(videoRef.current?.duration || 0)}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onWaiting={() => setIsBuffering(true)}
                onPlaying={() => setIsBuffering(false)}
                onLoadedMetadata={() => setDuration(videoRef.current?.duration || 0)}
                onError={() => setVideoError(true)}
              />

              {/* MKV or Video Playback Error Compatibility Overlay */}
              {(isMkv || videoError) && (
                <div className="absolute inset-0 bg-neutral-900/95 flex flex-col items-center justify-center text-center p-6 z-30 animate-in fade-in duration-300">
                  <AlertTriangle className="w-16 h-16 text-amber-500 mb-4 animate-bounce" />
                  <h3 className="text-base sm:text-lg font-bold text-white mb-2">
                    Format Video (.mkv) / Kendala Browser
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-400 max-w-md mb-6 leading-relaxed">
                    Browser Anda tidak mendukung pemutaran langsung kontainer video <strong>.mkv</strong> secara native. 
                    Anda dapat memutar menggunakan <strong>Server Alternatif</strong> di bawah, atau membuka stream langsung di VLC Player / MX Player.
                  </p>
                  <div className="flex flex-wrap justify-center gap-3">
                    <a
                      href={currentServer.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 bg-[#E50914] text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md hover:bg-red-700 transition-all cursor-pointer"
                    >
                      <ExternalLink className="w-4 h-4" /> Buka Stream di VLC / Player Eksternal
                    </a>
                  </div>
                </div>
              )}

              {/* Buffering Loading Indicator */}
              {isBuffering && !videoError && !isMkv && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none z-30">
                  <Loader2 className="w-12 h-12 text-[#E50914] animate-spin" />
                </div>
              )}

              {/* Large Play Button Overlay */}
              {!isPlaying && !isBuffering && !videoError && !isMkv && (
                <button 
                  onClick={togglePlay}
                  className="absolute p-5 rounded-full bg-black/50 hover:bg-[#E50914] transition-all transform hover:scale-110 border border-white/10 z-20"
                >
                  <Play className="w-8 h-8 text-white fill-white ml-0.5" />
                </button>
              )}

              {/* PREMIUM CONTROL BAR OVERLAY */}
              <div 
                className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/75 to-transparent px-4 pt-10 pb-4 flex flex-col gap-3 transition-opacity duration-300 z-40 select-none ${
                  showControls && !videoError && !isMkv ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                }`}
              >
                {/* Timeline Seekbar */}
                <div className="flex items-center gap-3 w-full">
                  <span className="text-[10px] text-neutral-300 font-medium">
                    {formatTime(currentTime)}
                  </span>
                  
                  <div className="relative flex-1 group/timeline py-1.5 flex items-center">
                    <input
                      type="range"
                      min={0}
                      max={duration || 100}
                      value={currentTime}
                      onChange={handleSeek}
                      className="w-full h-1 cursor-pointer bg-neutral-700/50 hover:h-1.5 transition-all rounded-lg appearance-none accent-[#E50914] outline-none"
                      style={{
                        background: `linear-gradient(to right, #E50914 0%, #E50914 ${(currentTime / (duration || 1)) * 100}%, rgba(115,115,115,0.4) ${(currentTime / (duration || 1)) * 100}%, rgba(115,115,115,0.4) 100%)`
                      }}
                    />
                  </div>
                  
                  <span className="text-[10px] text-neutral-300 font-medium">
                    {formatTime(duration)}
                  </span>
                </div>

                {/* Sub-controls: Buttons, Volume, Speed, Fullscreen */}
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-4">
                    {/* Play/Pause */}
                    <button 
                      onClick={togglePlay}
                      className="text-white hover:text-[#E50914] transition-colors p-1"
                    >
                      {isPlaying ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white" />}
                    </button>

                    {/* Quick Seek Rewind 10s */}
                    <button 
                      onClick={() => handleSkip(-10)}
                      className="text-neutral-400 hover:text-white transition-colors"
                      title="Mundur 10 detik"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>

                    {/* Quick Seek Forward 10s */}
                    <button 
                      onClick={() => handleSkip(10)}
                      className="text-neutral-400 hover:text-white transition-colors"
                      title="Maju 10 detik"
                    >
                      <RotateCw className="w-4 h-4" />
                    </button>

                    {/* Volume control */}
                    <div className="flex items-center gap-2 group/volume">
                      <button 
                        onClick={toggleMute}
                        className="text-white hover:text-[#E50914] transition-colors p-1"
                      >
                        {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                      </button>
                      
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.05}
                        value={isMuted ? 0 : volume}
                        onChange={handleVolumeChange}
                        className="w-0 group-hover/volume:w-16 h-1 cursor-pointer transition-all duration-300 bg-neutral-700 rounded-lg appearance-none accent-white outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Playback Speed Controller */}
                    <div className="relative">
                      <button 
                        onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                        className="flex items-center gap-1 text-xs font-bold text-neutral-300 hover:text-white px-2 py-1 bg-neutral-900 border border-neutral-800 rounded-lg transition-all"
                      >
                        <Settings className="w-3.5 h-3.5" />
                        <span>{playbackRate}x</span>
                      </button>
                      
                      {showSpeedMenu && (
                        <div className="absolute bottom-full right-0 mb-2 w-28 bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-xl z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
                          <div className="py-1 text-[10px] text-neutral-400 font-bold uppercase tracking-wider px-3 border-b border-neutral-850">
                            Kecepatan
                          </div>
                          {[0.5, 1, 1.25, 1.5, 2].map((rate) => (
                            <button
                              key={rate}
                              onClick={() => changeSpeed(rate)}
                              className={`w-full text-left px-4 py-2 text-xs font-semibold hover:bg-neutral-850 transition-colors ${
                                playbackRate === rate ? 'text-[#E50914] bg-neutral-850/50' : 'text-neutral-300'
                              }`}
                            >
                              {rate === 1 ? 'Normal' : `${rate}x`}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Fullscreen toggle */}
                    <button 
                      onClick={toggleFullscreen}
                      className="text-white hover:text-[#E50914] transition-colors p-1"
                    >
                      {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* EXTERNAL SERVER IFRAME EMBED FALLBACK (NO SANDBOX ATTR TO PREVENT IFRAME LOAD ISSUES) */
            <iframe
              src={currentServer.url}
              className="w-full h-full border-0 absolute inset-0"
              allowFullScreen
              scrolling="no"
            />
          )}

        </div>

        {/* SERVER SELECTION SWITCHER */}
        {servers.length > 1 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[10px] text-neutral-400 font-bold uppercase tracking-wider">
              <Server className="w-4 h-4 text-[#E50914]" />
              <span>Pilih Server Alternatif (Ganti jika lambat / terblokir)</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {servers.map((srv, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveServer(idx)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    activeServer === idx
                      ? 'bg-[#E50914] border-[#E50914] text-white shadow-md shadow-red-500/10'
                      : 'bg-neutral-900 border-neutral-850 hover:bg-neutral-850 hover:border-neutral-800 text-neutral-300'
                  }`}
                >
                  {srv.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* MOVIE METADATA DETAILS */}
        <div className="border-t border-neutral-900 pt-6 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">{movie.title}</h2>
            <div className="flex items-center gap-1 bg-amber-400/10 text-amber-400 text-xs font-bold px-2 py-0.5 rounded-lg border border-amber-400/10">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{movie.vote_average?.toFixed(1) || '0.0'}</span>
            </div>
            {movie.year && (
              <span className="text-neutral-400 text-xs font-semibold">{movie.year}</span>
            )}
            {movie.runtime && (
              <div className="flex items-center gap-1 text-neutral-400 text-xs font-semibold">
                <Clock className="w-3.5 h-3.5 text-neutral-500" />
                <span>{movie.runtime} menit</span>
              </div>
            )}
          </div>

          {movie.tagline && (
            <p className="text-neutral-400 italic text-xs sm:text-sm">"{movie.tagline}"</p>
          )}

          <p className="text-neutral-300 text-xs sm:text-sm leading-relaxed max-w-3xl">
            {movie.overview || "Tidak ada deskripsi sinopsis film."}
          </p>

          {movie.genres && movie.genres.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {movie.genres.map((genre) => (
                <span 
                  key={genre.id} 
                  className="px-3 py-1 bg-neutral-900 border border-neutral-850 text-neutral-400 text-xs font-bold rounded-full"
                >
                  {genre.name}
                </span>
              ))}
            </div>
          )}
        </div>

      </main>

      {/* CORE NAVIGATION */}
      <BottomMenu />
    </div>
  );
}
