"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Play, Plus, Info, Grid, List, ChevronDown, Search, Star, Settings, Heart, LogOut } from 'lucide-react';
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

interface Category {
    id: string;
    name: string;
    slug: string;
    icon_url: string | null;
}

interface Streaming {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    url_banner: string | null;
    view_count: number;
    status: string;
    category?: { name: string; slug: string };
}

const supabase = createClient();

async function getCategories(): Promise<Category[]> {
    const { data, error } = await supabase
        .from('category')
        .select('*')
        .eq('status', 'Active')
        .order('name');
    if (error) throw error;
    return data || [];
}

async function getStreamingsByCategory(categorySlug: string): Promise<Streaming[]> {
    let query = supabase
        .from('streaming')
        .select('*, category:id_category(id, name, slug)')
        .eq('status', 'Active');

    if (categorySlug !== 'trending' && categorySlug !== 'all') {
        query = query.eq('category.slug', categorySlug);
    }

    const { data, error } = await query.order('view_count', { ascending: false });
    if (error) throw error;
    return (data || []).filter((s: any) => {
        if (categorySlug === 'trending' || categorySlug === 'all') return true;
        return s.category?.slug === categorySlug;
    });
}

async function getCategoryBySlug(slug: string): Promise<Category | null> {
    if (slug === 'trending') {
        return { id: 'trending', name: 'Trending', slug: 'trending', icon_url: '🔥' };
    }
    const { data, error } = await supabase
        .from('category')
        .select('*')
        .eq('slug', slug)
        .single();
    if (error) return null;
    return data;
}

// Navbar Component
const Navbar = ({ scrolled }: { scrolled: boolean }) => {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const supabase = createClient();
    const dropdownRef = React.useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Check current user
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };
        checkUser();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
            setUser(session?.user || null);
        });

        return () => subscription.unsubscribe();
    }, []);

    useEffect(() => {
        // Close dropdown when clicking outside
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };

        if (showDropdown) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showDropdown]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setShowDropdown(false);
        router.push('/');
    };

    const getUserInitial = () => {
        if (!user) return 'A';
        return user.email?.charAt(0).toUpperCase() || 'U';
    };

    return (
        <nav className={`fixed top-0 w-full z-50 transition-all duration-500 px-4 md:px-12 py-4 flex items-center justify-between ${scrolled ? 'bg-zinc-950/95 shadow-lg' : 'bg-gradient-to-b from-black/80 to-transparent'}`}>
            <div className="flex items-center gap-8">
                <h1 className="text-red-600 text-3xl font-bold tracking-tighter cursor-pointer" onClick={() => router.push('/')}>AURATV</h1>
                <ul className="hidden md:flex gap-6 text-sm text-gray-300 font-medium">
                    <li onClick={() => router.push('/')} className="hover:text-white cursor-pointer transition">Beranda</li>
                    <li onClick={() => router.push('/category/drama')} className="hover:text-white cursor-pointer transition">Serial TV</li>
                    <li onClick={() => router.push('/category/action')} className="hover:text-white cursor-pointer transition">Film</li>
                    <li onClick={() => router.push('/category/trending')} className="text-white cursor-pointer transition">Trending</li>
                </ul>
            </div>
            <div className="flex items-center gap-5 text-white">
                <Link href="/search">
                    <Search className="w-5 h-5 cursor-pointer hover:text-gray-300" />
                </Link>
                {user ? (
                    <div className="relative" ref={dropdownRef}>
                        <div
                            className="flex items-center gap-2 cursor-pointer group"
                            onClick={() => setShowDropdown(!showDropdown)}
                        >
                            <div className="w-8 h-8 rounded bg-red-600 flex items-center justify-center font-bold">
                                {getUserInitial()}
                            </div>
                            <ChevronDown className={`w-4 h-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                        </div>
                        {showDropdown && (
                            <div className="absolute right-0 mt-2 w-56 bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="px-4 py-3 border-b border-zinc-800">
                                    <p className="text-sm font-semibold text-white truncate">{user.email}</p>
                                    <p className="text-xs text-gray-400 mt-1">Member AuraTV</p>
                                </div>
                                <div className="py-1">
                                    <button
                                        onClick={() => {
                                            setShowDropdown(false);
                                            router.push('/admin/settings');
                                        }}
                                        className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-zinc-800 transition text-left"
                                    >
                                        <Settings className="w-4 h-4 text-gray-400" />
                                        <span className="text-sm">Pengaturan</span>
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowDropdown(false);
                                            router.push('/favorite');
                                        }}
                                        className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-zinc-800 transition text-left"
                                    >
                                        <Heart className="w-4 h-4 text-gray-400" />
                                        <span className="text-sm">Favorit Saya</span>
                                    </button>
                                </div>
                                <div className="border-t border-zinc-800 py-1">
                                    <button
                                        onClick={handleLogout}
                                        className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-red-600/10 hover:text-red-500 transition text-left"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        <span className="text-sm font-medium">Keluar</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex items-center gap-2 cursor-pointer group" onClick={() => router.push('/login')}>
                        <div className="w-8 h-8 rounded bg-red-600 flex items-center justify-center font-bold">A</div>
                    </div>
                )}
            </div>
        </nav>
    );
};

// Movie Card
const MovieCard = ({ streaming, onPlay }: { streaming: Streaming; onPlay: (s: Streaming) => void }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div
            className="relative group cursor-pointer"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={() => onPlay(streaming)}
        >
            <div className={`relative aspect-[2/3] rounded-xl overflow-hidden transition-all duration-300 ${isHovered ? 'scale-105 shadow-2xl shadow-red-600/20' : ''}`}>
                <img
                    src={streaming.url_banner || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400'}
                    alt={streaming.name}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

                {/* Hover Overlay */}
                <div className={`absolute inset-0 bg-black/60 flex flex-col justify-end p-4 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
                    <div className="flex gap-2 mb-3">
                        <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-200 transition">
                            <Play className="w-5 h-5 fill-black text-black" />
                        </button>
                        <button className="w-10 h-10 border-2 border-gray-400 rounded-full flex items-center justify-center hover:border-white transition">
                            <Plus className="w-5 h-5 text-white" />
                        </button>
                        <button className="w-10 h-10 border-2 border-gray-400 rounded-full flex items-center justify-center hover:border-white transition">
                            <Info className="w-5 h-5 text-white" />
                        </button>
                    </div>
                    <h3 className="text-white font-bold text-sm line-clamp-2">{streaming.name}</h3>
                    <p className="text-gray-400 text-xs mt-1">{streaming.category?.name || 'Movie'}</p>
                </div>

                {/* View Count Badge */}
                <div className="absolute top-3 right-3 bg-black/70 px-2 py-1 rounded-lg flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                    <span className="text-white text-xs">{(streaming.view_count / 1000).toFixed(1)}K</span>
                </div>
            </div>
            <h3 className="text-white font-medium mt-3 text-sm line-clamp-1">{streaming.name}</h3>
            <p className="text-gray-500 text-xs mt-1">{streaming.category?.name || 'Movie'}</p>
        </div>
    );
};

export default function CategoryPage() {
    const params = useParams();
    const router = useRouter();
    const categorySlug = (params.slug as string) || 'trending';

    const [scrolled, setScrolled] = useState(false);
    const [category, setCategory] = useState<Category | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [streamings, setStreamings] = useState<Streaming[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [sortBy, setSortBy] = useState('popular');

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);
                const [cat, cats, streams] = await Promise.all([
                    getCategoryBySlug(categorySlug),
                    getCategories(),
                    getStreamingsByCategory(categorySlug)
                ]);
                setCategory(cat);
                setCategories(cats);
                setStreamings(streams);

                // Update document title and meta for SEO
                if (cat) {
                    const pageTitle = categorySlug === 'trending'
                        ? 'Trending - Film & Serial TV Populer'
                        : `${cat.name} - Koleksi Film & Serial TV`;
                    const pageDesc = categorySlug === 'trending'
                        ? 'Jelajahi film dan serial TV yang sedang trending di AuraTV. Nikmati konten paling populer dan paling banyak ditonton.'
                        : `Tonton koleksi ${cat.name} terbaik di AuraTV. Streaming online gratis dengan kualitas HD dan subtitle Indonesia. Total ${streams.length} konten tersedia.`;

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
                }
            } catch (err) {
                console.error('Error:', err);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [categorySlug]);

    const handlePlay = (streaming: Streaming) => {
        router.push(`/play/${streaming.slug}`);
    };

    const sortedStreamings = [...streamings].sort((a, b) => {
        switch (sortBy) {
            case 'newest': return 0;
            case 'rating': return b.view_count - a.view_count;
            case 'az': return a.name.localeCompare(b.name);
            default: return b.view_count - a.view_count;
        }
    });

    return (
        <div className="min-h-screen bg-zinc-950">
            <Navbar scrolled={scrolled} />

            {/* Hero */}
            <div className="relative h-[50vh] overflow-hidden">
                <img
                    src="https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1920"
                    alt={category?.name || 'Category'}
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/70 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-zinc-950/50" />
                <div className="relative z-10 h-full flex items-center px-4 md:px-12 pt-16">
                    <div>
                        <p className="text-gray-400 mb-2">Kategori</p>
                        <h1 className="text-4xl md:text-6xl font-black text-white flex items-center gap-4">
                            <span className="text-5xl">{category?.icon_url || '📁'}</span>
                            {category?.name || 'Loading...'}
                        </h1>
                        <p className="text-gray-400 mt-4 max-w-xl">
                            Temukan koleksi {category?.name || ''} terbaik hanya di AuraTV
                        </p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="px-4 md:px-12 py-8 -mt-20 relative z-10">
                {/* Category Pills */}
                <div className="flex gap-3 overflow-x-auto pb-4 mb-6 scrollbar-hide">
                    <button
                        onClick={() => router.push('/category/trending')}
                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${categorySlug === 'trending' ? 'bg-red-600 text-white' : 'bg-zinc-800 text-gray-300 hover:bg-zinc-700'}`}
                    >
                        🔥 Trending
                    </button>
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => router.push(`/category/${cat.slug}`)}
                            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${categorySlug === cat.slug ? 'bg-red-600 text-white' : 'bg-zinc-800 text-gray-300 hover:bg-zinc-700'}`}
                        >
                            {cat.icon_url} {cat.name}
                        </button>
                    ))}
                </div>

                {/* Filters */}
                <div className="flex items-center justify-between mb-6">
                    <p className="text-gray-400">
                        <span className="text-white font-bold">{streamings.length}</span> hasil ditemukan
                    </p>
                    <div className="flex items-center gap-4">
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
                        >
                            <option value="popular">Populer</option>
                            <option value="newest">Terbaru</option>
                            <option value="rating">Rating</option>
                            <option value="az">A-Z</option>
                        </select>
                        <div className="flex bg-zinc-800 rounded-lg p-1">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-red-600 text-white' : 'text-gray-400'}`}
                            >
                                <Grid className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded ${viewMode === 'list' ? 'bg-red-600 text-white' : 'text-gray-400'}`}
                            >
                                <List className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="flex items-center justify-center py-24">
                        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : streamings.length === 0 ? (
                    <div className="text-center py-24">
                        <p className="text-gray-500 text-lg">Tidak ada streaming di kategori ini</p>
                    </div>
                ) : (
                    <>
                        <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6' : 'grid-cols-1'}`}>
                            {sortedStreamings.slice(0, 12).map(s => (
                                <MovieCard key={s.id} streaming={s} onPlay={handlePlay} />
                            ))}
                        </div>

                        {/* Native Ad inside results */}
                        {sortedStreamings.length > 12 && (
                            <AdContainer className="my-12">
                                <AdsterraNativeBanner placement="category" />
                            </AdContainer>
                        )}

                        <div className={`grid gap-6 mt-6 ${viewMode === 'grid' ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6' : 'grid-cols-1'}`}>
                            {sortedStreamings.slice(12).map(s => (
                                <MovieCard key={s.id} streaming={s} onPlay={handlePlay} />
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Bottom Banner */}
            <div className="px-4 md:px-12 pb-12">
                <AdContainer>
                    <AdsterraBanner placement="category" />
                </AdContainer>
            </div>

            {/* Popunder & Smartlink & SocialBar */}
            <AdsterraPopunder placement="category" />
            <AdsterraSmartlink placement="category" />
            <AdsterraSocialBar placement="category" />

            {/* Footer */}
            <footer className="bg-zinc-950 text-gray-500 py-12 px-4 md:px-12 mt-12 border-t border-zinc-800">
                <p className="text-xs text-center">© 2024 AuraTV Indonesia. All rights reserved.</p>
            </footer>
        </div>
    );
}
