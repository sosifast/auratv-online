"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, Play, ArrowLeft, Trash2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

interface Streaming {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    url_banner: string | null;
    view_count: number;
    category?: { name: string; slug: string };
}

interface Favorite {
    id: string;
    created_at: string;
    streaming: Streaming;
}

export default function FavoritePage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [favorites, setFavorites] = useState<Favorite[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        async function fetchFavorites() {
            setLoading(true);

            // Check authentication
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                router.push('/login');
                return;
            }

            setUser(user);

            // Fetch favorites with streaming data
            const { data, error } = await supabase
                .from('favorites')
                .select(`
          id,
          created_at,
          streaming:streaming_id (
            id,
            name,
            slug,
            description,
            url_banner,
            view_count,
            category:id_category(name, slug)
          )
        `)
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching favorites:', error);
            } else {
                setFavorites(data || []);
            }

            setLoading(false);
        }

        fetchFavorites();
    }, []);

    const removeFavorite = async (favoriteId: string) => {
        const { error } = await supabase
            .from('favorites')
            .delete()
            .eq('id', favoriteId);

        if (!error) {
            setFavorites(favorites.filter(f => f.id !== favoriteId));
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-white">
            {/* Header */}
            <div className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800">
                <div className="max-w-7xl mx-auto px-4 py-6 flex items-center gap-4">
                    <Link href="/" className="p-2 hover:bg-zinc-800 rounded-full transition">
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <Heart className="w-7 h-7 text-red-500 fill-red-500" />
                            Favorit Saya
                        </h1>
                        <p className="text-sm text-gray-400 mt-1">
                            {favorites.length} streaming yang Anda sukai
                        </p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                {favorites.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                        {favorites.map((fav) => {
                            const streaming = fav.streaming as any;
                            return (
                                <div key={fav.id} className="group relative flex flex-col gap-3">
                                    <Link
                                        href={`/play/${streaming.slug}`}
                                        className="relative aspect-video rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 group-hover:border-red-600/50 transition-all duration-300 transform group-hover:scale-[1.03] group-hover:shadow-2xl group-hover:shadow-red-900/20"
                                    >
                                        <img
                                            src={streaming.url_banner || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400'}
                                            alt={streaming.name}
                                            className="w-full h-full object-cover transition duration-500 group-hover:brightness-110"
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center shadow-xl transform scale-75 group-hover:scale-100 transition-transform duration-300">
                                                <Play className="w-6 h-6 fill-white" />
                                            </div>
                                        </div>
                                    </Link>

                                    {/* Info & Remove Button */}
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-sm line-clamp-1 group-hover:text-red-500 transition-colors">
                                                {streaming.name}
                                            </h3>
                                            <p className="text-gray-500 text-xs mt-1">
                                                {streaming.category?.name || 'Movie'}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => removeFavorite(fav.id)}
                                            className="p-1.5 hover:bg-red-600/20 rounded-lg transition group/btn"
                                            title="Hapus dari favorit"
                                        >
                                            <Trash2 className="w-4 h-4 text-gray-500 group-hover/btn:text-red-500" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 bg-zinc-900/50 rounded-3xl border border-dashed border-zinc-800">
                        <div className="w-20 h-20 bg-zinc-800 rounded-full flex items-center justify-center mb-6">
                            <Heart className="w-10 h-10 text-gray-500" />
                        </div>
                        <h2 className="text-xl font-bold mb-2">Belum ada favorit</h2>
                        <p className="text-gray-400 text-center max-w-md mb-8">
                            Anda belum menambahkan streaming apapun ke favorit. Mulai jelajahi konten dan tandai yang Anda sukai!
                        </p>
                        <Link
                            href="/"
                            className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-full transition text-sm font-semibold"
                        >
                            Jelajahi Konten
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
