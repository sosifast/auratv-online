'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    PlayCircle, MonitorPlay, Film, Search, Bell, Play, Plus,
    ChevronRight, Users, Flame, Rocket, Skull, Smile, Heart, Wand2, Eye,
    MessageCircle, Share2, Bookmark, Clapperboard, Loader2
} from 'lucide-react';
import BottomMenu from '@/app/component/menu';

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

function formatViews(n: number): string {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
    if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
    return String(n);
}

export default function ShortsPage() {
    const router = useRouter();
    const [shortsFromApi, setShortsFromApi] = useState<ShortStream[]>([]);
    const [loadingShorts, setLoadingShorts] = useState(false);

    // --- FETCH DATA UNTUK SHORTS DARI API ---
    const [shortsError, setShortsError] = useState<string | null>(null);

    const fetchShorts = () => {
        setLoadingShorts(true);
        setShortsError(null);

        // Fetch langsung dari API eksternal — bypass ngrok interstitial di proxy
        fetch('https://streamku-kappa.vercel.app/short/stream.json')
            .then((r) => {
                if (!r.ok) throw new Error(`HTTP ${r.status}`);
                return r.json();
            })
            .then((data) => {
                // Handle array langsung ATAU format { value: [...], Count: N }
                if (Array.isArray(data)) {
                    setShortsFromApi(data);
                } else if (data && Array.isArray(data.value)) {
                    setShortsFromApi(data.value);
                } else {
                    throw new Error('Format data tidak dikenal');
                }
            })
            .catch((err: Error) => {
                setShortsError(err.message ?? 'Gagal memuat data');
            })
            .finally(() => setLoadingShorts(false));
    };

    useEffect(() => {
        fetchShorts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // KOMPONEN: Tampilan Reelshort / Shorts Mobile Player
    const renderShorts = () => (
        <div className="flex-1 w-full h-full bg-black relative snap-y snap-mandatory overflow-y-scroll hide-scrollbar">
            {/* HEADER OVERLAY FOR SHORTS */}
            <header className="absolute top-0 left-0 w-full z-40 px-4 py-5 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
                <h2 className="text-white font-bold text-xl drop-shadow-lg tracking-wide pointer-events-auto">Shorts</h2>
                <Search 
                    className="w-6 h-6 text-white drop-shadow-md pointer-events-auto cursor-pointer" 
                    onClick={() => router.push('/short/search')}
                />
            </header>

            {/* LOADING STATE */}
            {loadingShorts && (
                <div className="w-full h-[100dvh] flex flex-col items-center justify-center gap-4">
                    <Loader2 className="w-10 h-10 text-[#E50914] animate-spin" />
                    <p className="text-gray-400 text-sm">Memuat shorts…</p>
                </div>
            )}

            {/* SHORTS VIDEO FEED */}
            {!loadingShorts && shortsFromApi.map((short, index) => (
                <div key={short.id} className="w-full h-[100dvh] snap-start relative flex justify-center items-center bg-black">

                    {/* Poster image */}
                    <div className="absolute inset-0 w-full h-full">
                        <img
                            src={short.image}
                            alt={short.title}
                            className="w-full h-full object-cover opacity-90"
                            loading={index === 0 ? 'eager' : 'lazy'}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent h-2/3 top-auto bottom-0"></div>

                        {/* Play Button overlay */}
                        <div
                            className="absolute inset-0 flex justify-center items-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                            onClick={() => router.push(`/short/${short.slug}`)}
                        >
                            <div className="bg-black/40 backdrop-blur-sm rounded-full p-4">
                                <PlayCircle className="w-16 h-16 text-white" />
                            </div>
                        </div>
                    </div>

                    {/* RIGHT ACTION BUTTONS */}
                    <div className="absolute right-4 bottom-32 flex flex-col items-center gap-6 z-20">
                        <button className="flex flex-col items-center gap-1 group active:scale-90 transition-transform">
                            <div className="bg-black/20 backdrop-blur-md p-3 rounded-full border border-white/10 group-hover:bg-[#E50914] transition-colors">
                                <Heart className="w-6 h-6 text-white fill-white" />
                            </div>
                            <span className="text-white text-xs font-bold drop-shadow-md">{formatViews(short.rating_score)}</span>
                        </button>

                        <button className="flex flex-col items-center gap-1 group active:scale-90 transition-transform">
                            <div className="bg-black/20 backdrop-blur-md p-3 rounded-full border border-white/10">
                                <MessageCircle className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-white text-xs font-bold drop-shadow-md">{short.episodes}</span>
                        </button>

                        <button className="flex flex-col items-center gap-1 group active:scale-90 transition-transform">
                            <div className="bg-black/20 backdrop-blur-md p-3 rounded-full border border-white/10">
                                <Bookmark className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-white text-xs font-bold drop-shadow-md">Save</span>
                        </button>

                        <button className="flex flex-col items-center gap-1 group active:scale-90 transition-transform">
                            <div className="bg-black/20 backdrop-blur-md p-3 rounded-full border border-white/10">
                                <Share2 className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-white text-xs font-bold drop-shadow-md">Share</span>
                        </button>
                    </div>

                    {/* BOTTOM LEFT INFORMATION */}
                    <div className="absolute left-4 bottom-24 right-20 z-20">
                        {short.is_paid === 1 && (
                            <div className="bg-amber-500 text-black text-[10px] font-bold px-2 py-0.5 rounded w-max mb-2">
                                PREMIUM
                            </div>
                        )}
                        {short.tags.length > 0 && (
                            <div className="bg-[#E50914] text-white text-[10px] font-bold px-2 py-0.5 rounded w-max mb-2">
                                {short.tags[0].toUpperCase()}
                            </div>
                        )}
                        <h3 className="text-white font-extrabold text-xl md:text-2xl drop-shadow-lg mb-1 line-clamp-2">{short.title}</h3>
                        <p className="text-gray-300 text-sm font-semibold drop-shadow-md mb-2">{short.episodes} Episode · {formatViews(short.views)} views</p>
                        <p className="text-gray-200 text-xs line-clamp-2 md:line-clamp-3 mb-4 drop-shadow-md leading-relaxed pr-4">
                            {short.description}
                        </p>

                        <button
                            onClick={() => router.push(`/short/${short.slug}`)}
                            className="bg-white/20 backdrop-blur-md border border-white/30 text-white px-5 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 hover:bg-white hover:text-black transition-colors shadow-lg active:scale-95"
                        >
                            <Play className="w-4 h-4 fill-current" /> Watch Full Series
                        </button>
                    </div>


                </div>
            ))}

            {/* EMPTY STATE */}
            {!loadingShorts && shortsFromApi.length === 0 && (
                <div className="w-full h-[100dvh] flex flex-col items-center justify-center gap-4 text-center px-8">
                    <Clapperboard className="w-12 h-12 text-gray-600" />
                    <p className="text-gray-400 text-sm">Tidak ada shorts tersedia saat ini</p>
                </div>
            )}
        </div>
    );

    return (
        <div className="w-full h-[100dvh] overflow-hidden antialiased font-sans selection:bg-[#E50914]/30 flex flex-col relative transition-colors duration-300 bg-black">

            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');
        body { font-family: 'Outfit', sans-serif; -webkit-tap-highlight-color: transparent; background-color: #000; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .bottom-nav-shadow { box-shadow: 0 -4px 20px -5px rgba(0, 0, 0, 0.05); }
      `}</style>

            {/* RENDER KONTEN SHORTS */}
            {renderShorts()}

            {/* BOTTOM NAVIGATION - FULL WIDTH */}
            <BottomMenu />
        </div>
    );
}