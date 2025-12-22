"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    Play, Pause, Volume2, VolumeX, Maximize, Minimize, SkipBack, SkipForward,
    ArrowLeft, Settings, List, ThumbsUp, ThumbsDown, Share2, Plus, ChevronRight
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface Streaming {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    url_banner: string | null;
    view_count: number;
    category?: { name: string; slug: string };
}

interface Playlist {
    id: string;
    url_streaming: string;
    type_streaming: 'mp4' | 'm3u8' | 'ts';
    status: string;
}

const supabase = createClient();

async function getStreaming(id: string): Promise<Streaming | null> {
    const { data, error } = await supabase
        .from('streaming')
        .select('*, category:id_category(name, slug)')
        .eq('id', id)
        .single();
    if (error) return null;
    return data;
}

async function getPlaylist(streamingId: string): Promise<Playlist[]> {
    const { data, error } = await supabase
        .from('streaming_playlist')
        .select('*')
        .eq('id_streaming', streamingId)
        .eq('status', 'Active');
    if (error) return [];
    return data || [];
}

async function getRelatedStreamings(categorySlug: string, excludeId: string): Promise<Streaming[]> {
    const { data, error } = await supabase
        .from('streaming')
        .select('*, category:id_category(name, slug)')
        .eq('status', 'Active')
        .neq('id', excludeId)
        .limit(6);
    if (error) return [];
    return data || [];
}

async function incrementViewCount(id: string) {
    const { data: current } = await supabase
        .from('streaming')
        .select('view_count')
        .eq('id', id)
        .single();

    if (current) {
        await supabase
            .from('streaming')
            .update({ view_count: (current.view_count || 0) + 1 })
            .eq('id', id);
    }
}

const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m}:${s.toString().padStart(2, '0')}`;
};

export default function PlayPage() {
    const params = useParams();
    const router = useRouter();
    const streamingId = params.id as string;

    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const controlsTimeoutRef = useRef<NodeJS.Timeout>();

    const [streaming, setStreaming] = useState<Streaming | null>(null);
    const [playlist, setPlaylist] = useState<Playlist[]>([]);
    const [related, setRelated] = useState<Streaming[]>([]);
    const [loading, setLoading] = useState(true);

    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [showSettings, setShowSettings] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);

    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);
                const streamingData = await getStreaming(streamingId);
                if (streamingData) {
                    setStreaming(streamingData);
                    incrementViewCount(streamingId);

                    const [playlistData, relatedData] = await Promise.all([
                        getPlaylist(streamingId),
                        getRelatedStreamings(streamingData.category?.slug || '', streamingId)
                    ]);
                    setPlaylist(playlistData);
                    setRelated(relatedData);
                }
            } catch (err) {
                console.error('Error:', err);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [streamingId]);

    const handleMouseMove = useCallback(() => {
        setShowControls(true);
        if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
        controlsTimeoutRef.current = setTimeout(() => {
            if (isPlaying) setShowControls(false);
        }, 3000);
    }, [isPlaying]);

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const toggleFullscreen = () => {
        if (!containerRef.current) return;
        if (!isFullscreen) {
            containerRef.current.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
        setIsFullscreen(!isFullscreen);
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const time = parseFloat(e.target.value);
        if (videoRef.current) {
            videoRef.current.currentTime = time;
            setCurrentTime(time);
        }
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const vol = parseFloat(e.target.value);
        if (videoRef.current) {
            videoRef.current.volume = vol;
            setVolume(vol);
            setIsMuted(vol === 0);
        }
    };

    const toggleMute = () => {
        if (videoRef.current) {
            videoRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    const skip = (seconds: number) => {
        if (videoRef.current) {
            videoRef.current.currentTime += seconds;
        }
    };

    const changeSpeed = (speed: number) => {
        if (videoRef.current) {
            videoRef.current.playbackRate = speed;
            setPlaybackSpeed(speed);
        }
        setShowSettings(false);
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            switch (e.key) {
                case ' ': e.preventDefault(); togglePlay(); break;
                case 'ArrowLeft': skip(-10); break;
                case 'ArrowRight': skip(10); break;
                case 'ArrowUp': e.preventDefault(); handleVolumeChange({ target: { value: Math.min(1, volume + 0.1).toString() } } as any); break;
                case 'ArrowDown': e.preventDefault(); handleVolumeChange({ target: { value: Math.max(0, volume - 0.1).toString() } } as any); break;
                case 'm': toggleMute(); break;
                case 'f': toggleFullscreen(); break;
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isPlaying, volume]);

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!streaming) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
                <p className="text-white text-xl">Streaming tidak ditemukan</p>
                <button onClick={() => router.push('/')} className="px-6 py-2 bg-red-600 text-white rounded-lg">
                    Kembali ke Beranda
                </button>
            </div>
        );
    }

    const videoUrl = playlist[0]?.url_streaming || '';

    return (
        <div className="min-h-screen bg-black">
            {/* Video Player */}
            <div
                ref={containerRef}
                className="relative w-full aspect-video bg-black"
                onMouseMove={handleMouseMove}
                onMouseLeave={() => isPlaying && setShowControls(false)}
            >
                {videoUrl ? (
                    <video
                        ref={videoRef}
                        src={videoUrl}
                        className="w-full h-full"
                        poster={streaming.url_banner || undefined}
                        onTimeUpdate={() => videoRef.current && setCurrentTime(videoRef.current.currentTime)}
                        onLoadedMetadata={() => videoRef.current && setDuration(videoRef.current.duration)}
                        onEnded={() => setIsPlaying(false)}
                        onClick={togglePlay}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <img src={streaming.url_banner || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1920'} alt={streaming.name} className="w-full h-full object-cover opacity-50" />
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <p className="text-gray-400 text-lg mb-4">Video belum tersedia</p>
                            <p className="text-gray-500 text-sm">Tambahkan playlist di admin panel</p>
                        </div>
                    </div>
                )}

                {/* Controls Overlay */}
                <div className={`absolute inset-0 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                    {/* Top Bar */}
                    <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent">
                        <div className="flex items-center justify-between">
                            <button onClick={() => router.back()} className="flex items-center gap-2 text-white hover:text-gray-300">
                                <ArrowLeft className="w-6 h-6" />
                                <span className="hidden sm:inline">Kembali</span>
                            </button>
                            <h1 className="text-white font-bold text-lg truncate max-w-md">{streaming.name}</h1>
                            <div className="w-20"></div>
                        </div>
                    </div>

                    {/* Center Play Button */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <button onClick={togglePlay} className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition">
                            {isPlaying ? <Pause className="w-10 h-10 text-white" /> : <Play className="w-10 h-10 text-white fill-white" />}
                        </button>
                    </div>

                    {/* Bottom Controls */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                        {/* Progress Bar */}
                        <div className="flex items-center gap-3 mb-4">
                            <span className="text-white text-sm">{formatTime(currentTime)}</span>
                            <input
                                type="range"
                                min={0}
                                max={duration || 100}
                                value={currentTime}
                                onChange={handleSeek}
                                className="flex-1 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-red-600 [&::-webkit-slider-thumb]:rounded-full"
                            />
                            <span className="text-white text-sm">{formatTime(duration)}</span>
                        </div>

                        {/* Control Buttons */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <button onClick={togglePlay} className="text-white hover:text-gray-300">
                                    {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                                </button>
                                <button onClick={() => skip(-10)} className="text-white hover:text-gray-300">
                                    <SkipBack className="w-6 h-6" />
                                </button>
                                <button onClick={() => skip(10)} className="text-white hover:text-gray-300">
                                    <SkipForward className="w-6 h-6" />
                                </button>

                                {/* Volume */}
                                <div className="flex items-center gap-2">
                                    <button onClick={toggleMute} className="text-white hover:text-gray-300">
                                        {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                                    </button>
                                    <input
                                        type="range"
                                        min={0}
                                        max={1}
                                        step={0.1}
                                        value={isMuted ? 0 : volume}
                                        onChange={handleVolumeChange}
                                        className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                {/* Speed */}
                                <div className="relative">
                                    <button onClick={() => setShowSettings(!showSettings)} className="text-white hover:text-gray-300">
                                        <Settings className="w-6 h-6" />
                                    </button>
                                    {showSettings && (
                                        <div className="absolute bottom-full right-0 mb-2 bg-zinc-900 border border-zinc-700 rounded-lg overflow-hidden shadow-xl">
                                            <p className="px-4 py-2 text-gray-400 text-sm border-b border-zinc-700">Kecepatan</p>
                                            {[0.5, 0.75, 1, 1.25, 1.5, 2].map(speed => (
                                                <button
                                                    key={speed}
                                                    onClick={() => changeSpeed(speed)}
                                                    className={`w-full px-4 py-2 text-left text-sm hover:bg-zinc-800 ${playbackSpeed === speed ? 'text-red-500' : 'text-white'}`}
                                                >
                                                    {speed}x
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <button onClick={toggleFullscreen} className="text-white hover:text-gray-300">
                                    {isFullscreen ? <Minimize className="w-6 h-6" /> : <Maximize className="w-6 h-6" />}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Info Section */}
            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row gap-8">
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold text-white mb-2">{streaming.name}</h1>
                        <div className="flex items-center gap-4 text-gray-400 text-sm mb-4">
                            <span>{streaming.category?.name || 'Movie'}</span>
                            <span>•</span>
                            <span>{streaming.view_count.toLocaleString()} views</span>
                        </div>
                        <p className="text-gray-300 mb-6">{streaming.description || 'Tidak ada deskripsi'}</p>

                        {/* Actions */}
                        <div className="flex flex-wrap gap-4">
                            <button className="flex items-center gap-2 px-4 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700">
                                <Plus className="w-5 h-5" /> Daftar Saya
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700">
                                <ThumbsUp className="w-5 h-5" /> Suka
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700">
                                <Share2 className="w-5 h-5" /> Bagikan
                            </button>
                        </div>
                    </div>
                </div>

                {/* Related */}
                {related.length > 0 && (
                    <div className="mt-12">
                        <h2 className="text-xl font-bold text-white mb-4">Rekomendasi Lainnya</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {related.map(r => (
                                <div key={r.id} onClick={() => router.push(`/play/${r.id}`)} className="cursor-pointer group">
                                    <div className="aspect-video rounded-lg overflow-hidden bg-zinc-800">
                                        <img src={r.url_banner || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400'} alt={r.name} className="w-full h-full object-cover group-hover:scale-105 transition" />
                                    </div>
                                    <p className="text-white text-sm mt-2 line-clamp-1">{r.name}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}