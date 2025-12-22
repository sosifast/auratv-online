"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    Play, Pause, Volume2, VolumeX, Maximize, Minimize, SkipBack, SkipForward,
    ArrowLeft, Settings, List, ThumbsUp, ThumbsDown, Share2, Plus, ChevronRight
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import {
    AdsterraBanner,
    AdsterraNativeBanner,
    AdsterraSocialBar,
    AdsterraPopunder,
    AdsterraSmartlink,
    AdContainer
} from '@/components/ads/AdsterraAds';

interface Streaming {
    id: string;
    id_category: string;
    name: string;
    slug: string;
    description: string | null;
    title_seo: string | null;
    desc_seo: string | null;
    url_banner: string | null;
    view_count: number;
    category?: { name: string; slug: string };
}


interface Playlist {
    id: string;
    url_streaming: string;
    type_streaming: 'mp4' | 'm3u8' | 'ts';
    name_server?: string;
    status: string;
}

const supabase = createClient();

async function getStreamingBySlug(slug: string): Promise<Streaming | null> {
    const { data, error } = await supabase
        .from('streaming')
        .select('*, category:id_category(name, slug)')
        .eq('slug', slug)
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

// Get same channel (same category)
async function getSameChannel(categoryId: string, excludeId: string): Promise<Streaming[]> {
    const { data, error } = await supabase
        .from('streaming')
        .select('*, category:id_category(name, slug)')
        .eq('status', 'Active')
        .eq('id_category', categoryId)
        .neq('id', excludeId)
        .limit(6);
    if (error) {
        console.error('Error fetching same channel:', error);
        return [];
    }
    return (data || []).sort(() => Math.random() - 0.5); // Randomize
}

// Get recommendations (random active streaming)
async function getRecommendations(excludeId: string): Promise<Streaming[]> {
    const { data, error } = await supabase
        .from('streaming')
        .select('*, category:id_category(name, slug)')
        .eq('status', 'Active')
        .neq('id', excludeId)
        .limit(12);
    if (error) return [];
    return (data || []).sort(() => Math.random() - 0.5).slice(0, 6); // Random 6 items
}

// Get trending (most viewed)
async function getTrending(excludeId: string): Promise<Streaming[]> {
    const { data, error } = await supabase
        .from('streaming')
        .select('*, category:id_category(name, slug)')
        .eq('status', 'Active')
        .neq('id', excludeId)
        .order('view_count', { ascending: false })
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
    const streamingSlug = params.slug as string;

    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const controlsTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

    const [streaming, setStreaming] = useState<Streaming | null>(null);
    const [playlist, setPlaylist] = useState<Playlist[]>([]);
    const [sameChannel, setSameChannel] = useState<Streaming[]>([]);
    const [recommendations, setRecommendations] = useState<Streaming[]>([]);
    const [trending, setTrending] = useState<Streaming[]>([]);
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
    const [selectedPlaylistIndex, setSelectedPlaylistIndex] = useState(0);

    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);
                const streamingData = await getStreamingBySlug(streamingSlug);
                if (streamingData) {
                    setStreaming(streamingData);
                    incrementViewCount(streamingData.id);

                    // Update document title and meta for SEO
                    const pageTitle = streamingData.title_seo || `Nonton ${streamingData.name} - Streaming Online`;
                    const pageDesc = streamingData.desc_seo || streamingData.description || `Tonton ${streamingData.name} streaming online gratis di AuraTV. Nikmati kualitas HD dengan subtitle Indonesia.`;

                    document.title = `${pageTitle} | AuraTV`;

                    // Update or create meta description
                    let metaDesc = document.querySelector('meta[name="description"]');
                    if (!metaDesc) {
                        metaDesc = document.createElement('meta');
                        metaDesc.setAttribute('name', 'description');
                        document.head.appendChild(metaDesc);
                    }
                    metaDesc.setAttribute('content', pageDesc);

                    // Update or create og:title
                    let ogTitle = document.querySelector('meta[property="og:title"]');
                    if (!ogTitle) {
                        ogTitle = document.createElement('meta');
                        ogTitle.setAttribute('property', 'og:title');
                        document.head.appendChild(ogTitle);
                    }
                    ogTitle.setAttribute('content', pageTitle);

                    // Update or create og:description
                    let ogDesc = document.querySelector('meta[property="og:description"]');
                    if (!ogDesc) {
                        ogDesc = document.createElement('meta');
                        ogDesc.setAttribute('property', 'og:description');
                        document.head.appendChild(ogDesc);
                    }
                    ogDesc.setAttribute('content', pageDesc);

                    // Update or create og:image
                    if (streamingData.url_banner) {
                        let ogImage = document.querySelector('meta[property="og:image"]');
                        if (!ogImage) {
                            ogImage = document.createElement('meta');
                            ogImage.setAttribute('property', 'og:image');
                            document.head.appendChild(ogImage);
                        }
                        ogImage.setAttribute('content', streamingData.url_banner);
                    }

                    const [playlistData, sameChannelData, recommendationsData, trendingData] = await Promise.all([
                        getPlaylist(streamingData.id),
                        getSameChannel(streamingData.id_category, streamingData.id),
                        getRecommendations(streamingData.id),
                        getTrending(streamingData.id)
                    ]);

                    console.log('Fetched data:', {
                        playlist: playlistData.length,
                        sameChannel: sameChannelData.length,
                        recommendations: recommendationsData.length,
                        trending: trendingData.length
                    });

                    setPlaylist(playlistData);
                    setSameChannel(sameChannelData);
                    setRecommendations(recommendationsData);
                    setTrending(trendingData);
                }
            } catch (err) {
                console.error('Error:', err);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [streamingSlug]);

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

    const videoUrl = playlist[selectedPlaylistIndex]?.url_streaming || '';

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
                        onError={(e) => {
                            console.error('Video error:', e);
                            // Silently handle video errors
                        }}
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
                            <button onClick={() => router.push('/')} className="flex items-center gap-2 text-white hover:text-gray-300">
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

            {/* Popunder & Smartlink */}
            <AdsterraPopunder placement="play" />
            <AdsterraSmartlink placement="play" />

            {/* Banner Ad before Info */}
            <div className="max-w-6xl mx-auto px-4">
                <AdContainer>
                    <AdsterraBanner placement="play" />
                </AdContainer>
            </div>

            {/* Info Section */}
            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Main Info */}
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

                    {/* Playlist Sidebar */}
                    {playlist.length > 0 && (
                        <div className="lg:w-80">
                            <div className="bg-zinc-900 rounded-lg border border-zinc-800 overflow-hidden">
                                <div className="p-4 border-b border-zinc-800">
                                    <h3 className="text-white font-semibold flex items-center gap-2">
                                        <List className="w-5 h-5" />
                                        Pilih Kualitas
                                    </h3>
                                    <p className="text-gray-400 text-xs mt-1">{playlist.length} opsi tersedia</p>
                                </div>
                                <div className="max-h-96 overflow-y-auto">
                                    {playlist.map((item, index) => (
                                        <button
                                            key={item.id}
                                            onClick={() => {
                                                setSelectedPlaylistIndex(index);
                                                if (videoRef.current) {
                                                    videoRef.current.src = item.url_streaming;
                                                    videoRef.current.load();
                                                    if (isPlaying) videoRef.current.play();
                                                }
                                            }}
                                            className={`w-full p-4 text-left border-b border-zinc-800 hover:bg-zinc-800 transition ${selectedPlaylistIndex === index ? 'bg-zinc-800' : ''
                                                }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <p className="text-white font-medium">
                                                    {item.name_server || `Server ${index + 1}`}
                                                </p>
                                                {selectedPlaylistIndex === index && (
                                                    <div className="w-2 h-2 bg-red-600 rounded-full ml-2"></div>
                                                )}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Native Banner Ad #1 */}
                <AdContainer className="mt-8">
                    <AdsterraNativeBanner placement="play" />
                </AdContainer>

                {/* Channel yang Sama */}
                <div className="mt-12">
                    <h2 className="text-xl font-bold text-white mb-4">Channel yang Sama</h2>
                    {sameChannel.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {sameChannel.map(s => (
                                <div key={s.id} onClick={() => router.push(`/play/${s.slug}`)} className="cursor-pointer group">
                                    <div className="aspect-video rounded-lg overflow-hidden bg-zinc-800">
                                        <img src={s.url_banner || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400'} alt={s.name} className="w-full h-full object-cover group-hover:scale-105 transition" />
                                    </div>
                                    <p className="text-white text-sm mt-2 line-clamp-1">{s.name}</p>
                                    <p className="text-gray-400 text-xs">{s.category?.name}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 bg-zinc-900 rounded-lg border border-zinc-800">
                            <p className="text-gray-400">Tidak ada streaming lain di channel ini</p>
                            <p className="text-gray-500 text-sm mt-1">Tambahkan streaming di admin panel</p>
                        </div>
                    )}
                </div>

                {/* Native Banner Ad #2 */}
                <AdContainer className="mt-8">
                    <AdsterraNativeBanner placement="play" />
                </AdContainer>

                {/* Rekomendasi */}
                <div className="mt-12">
                    <h2 className="text-xl font-bold text-white mb-4">Rekomendasi</h2>
                    {recommendations.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {recommendations.map(r => (
                                <div key={r.id} onClick={() => router.push(`/play/${r.slug}`)} className="cursor-pointer group">
                                    <div className="aspect-video rounded-lg overflow-hidden bg-zinc-800">
                                        <img src={r.url_banner || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400'} alt={r.name} className="w-full h-full object-cover group-hover:scale-105 transition" />
                                    </div>
                                    <p className="text-white text-sm mt-2 line-clamp-1">{r.name}</p>
                                    <p className="text-gray-400 text-xs">{r.category?.name}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 bg-zinc-900 rounded-lg border border-zinc-800">
                            <p className="text-gray-400">Belum ada rekomendasi</p>
                            <p className="text-gray-500 text-sm mt-1">Tambahkan lebih banyak streaming untuk rekomendasi</p>
                        </div>
                    )}
                </div>

                {/* Native Banner Ad #3 */}
                <AdContainer className="mt-8">
                    <AdsterraNativeBanner placement="play" />
                </AdContainer>

                {/* Trending */}
                <div className="mt-12">
                    <div className="flex items-center gap-2 mb-4">
                        <h2 className="text-xl font-bold text-white">Trending</h2>
                        <span className="text-red-500">🔥</span>
                    </div>
                    {trending.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {trending.map((t, index) => (
                                <div key={t.id} onClick={() => router.push(`/play/${t.slug}`)} className="cursor-pointer group relative">
                                    <div className="aspect-video rounded-lg overflow-hidden bg-zinc-800 relative">
                                        <img src={t.url_banner || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400'} alt={t.name} className="w-full h-full object-cover group-hover:scale-105 transition" />
                                        {/* Badge ranking */}
                                        <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
                                            #{index + 1}
                                        </div>
                                    </div>
                                    <p className="text-white text-sm mt-2 line-clamp-1">{t.name}</p>
                                    <p className="text-gray-400 text-xs">{t.view_count.toLocaleString()} views</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 bg-zinc-900 rounded-lg border border-zinc-800">
                            <p className="text-gray-400">Belum ada trending</p>
                            <p className="text-gray-500 text-sm mt-1">Streaming akan tampil berdasarkan jumlah views</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Social Bar (sticky bottom) */}
            <AdsterraSocialBar placement="play" />
        </div>
    );
}