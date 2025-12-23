"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search as SearchIcon, ArrowLeft, Play, LayoutGrid } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
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
    name: string;
    slug: string;
    description: string | null;
    url_banner: string | null;
    view_count: number;
    category?: { name: string; slug: string };
}

function SearchResults() {
    const searchParams = useSearchParams();
    const query = searchParams.get('q') || '';
    const [results, setResults] = useState<Streaming[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchInput, setSearchInput] = useState(query);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        async function performSearch() {
            if (!query.trim()) {
                setResults([]);
                setLoading(false);
                return;
            }

            setLoading(true);
            const { data, error } = await supabase
                .from('streaming')
                .select('*, category:id_category(name, slug)')
                .eq('status', 'Active')
                .ilike('name', `%${query}%`)
                .order('view_count', { ascending: false });

            if (error) {
                console.error('Search error:', error);
            } else {
                setResults(data || []);
            }
            setLoading(false);
        }

        performSearch();
        setSearchInput(query);
    }, [query, supabase]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchInput.trim()) {
            router.push(`/search?q=${encodeURIComponent(searchInput.trim())}`);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-950 text-white pb-20">
            {/* Header */}
            <div className="sticky top-0 z-50 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
                    <Link href="/" className="p-2 hover:bg-zinc-800 rounded-full transition">
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <form onSubmit={handleSearch} className="flex-1 relative">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <input
                            type="text"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            placeholder="Cari channel, film, atau acara TV..."
                            className="w-full bg-zinc-900 border border-zinc-700 rounded-full py-2 pl-10 pr-4 focus:outline-none focus:border-red-600 transition"
                            autoFocus
                        />
                    </form>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 mt-8">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="text-gray-400">Mencari hasil untuk "{query}"...</p>
                    </div>
                ) : (
                    <>
                        <div className="flex items-center justify-between mb-8">
                            <h1 className="text-2xl font-bold">
                                {query ? `Hasil pencarian untuk "${query}"` : 'Jelajahi Konten'}
                            </h1>
                            <span className="text-gray-400 text-sm">{results.length} hasil ditemukan</span>
                        </div>

                        {results.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                                {results.map((s) => (
                                    <Link
                                        key={s.id}
                                        href={`/play/${s.slug}`}
                                        className="group flex flex-col gap-3"
                                    >
                                        <div className="relative aspect-video rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 group-hover:border-red-600/50 transition-all duration-300 transform group-hover:scale-[1.03] group-hover:shadow-2xl group-hover:shadow-red-900/20">
                                            <img
                                                src={s.url_banner || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400'}
                                                alt={s.name}
                                                className="w-full h-full object-cover transition duration-500 group-hover:brightness-110"
                                            />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center shadow-xl transform scale-75 group-hover:scale-100 transition-transform duration-300">
                                                    <Play className="w-6 h-6 fill-white" />
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-sm line-clamp-1 group-hover:text-red-500 transition-colors">{s.name}</h3>
                                            <p className="text-gray-500 text-xs mt-1 flex items-center gap-1">
                                                <LayoutGrid className="w-3 h-3" />
                                                {s.category?.name || 'Movie'}
                                            </p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 bg-zinc-900/50 rounded-3xl border border-dashed border-zinc-800">
                                <div className="w-20 h-20 bg-zinc-800 rounded-full flex items-center justify-center mb-6">
                                    <SearchIcon className="w-10 h-10 text-gray-500" />
                                </div>
                                <h2 className="text-xl font-bold mb-2">Tidak ada hasil ditemukan</h2>
                                <p className="text-gray-400 text-center max-w-md">
                                    Maaf, kami tidak dapat menemukan apa yang Anda cari. Coba gunakan kata kunci lain atau jelajahi kategori populer kami.
                                </p>
                                <div className="mt-8 flex gap-4">
                                    <button
                                        onClick={() => setSearchInput('')}
                                        className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-full transition text-sm font-semibold"
                                    >
                                        Hapus Pencarian
                                    </button>
                                    <Link
                                        href="/"
                                        className="px-6 py-2 bg-red-600 hover:bg-red-700 rounded-full transition text-sm font-semibold"
                                    >
                                        Kembali Beranda
                                    </Link>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* Banner Ad */}
                <AdContainer className="my-8">
                    <AdsterraBanner placement="search" />
                </AdContainer>
            </div>

            {/* Popunder & Smartlink & SocialBar */}
            <AdsterraPopunder placement="search" />
            <AdsterraSmartlink placement="search" />
            <AdsterraSocialBar placement="search" />
        </div>
    );
}

export default function SearchPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        }>
            <SearchResults />
        </Suspense>
    );
}
