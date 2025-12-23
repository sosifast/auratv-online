"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Play, Info, Plus, Search, ChevronLeft, ChevronRight, Settings, Heart, LogOut, ChevronDown } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useLanguage } from '@/lib/language-context';
import Link from 'next/link';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import {
  AdsterraBanner,
  AdsterraNativeBanner,
  AdsterraSocialBar,
  AdsterraPopunder,
  AdsterraSmartlink,
  AdContainer
} from '@/components/ads/AdsterraAds';

// Types
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
  category?: { name: string; slug: string };
}

// Fetch functions - create client inside each function
async function getCategories(): Promise<Category[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('category')
    .select('*')
    .eq('status', 'Active')
    .order('name');
  if (error) throw error;
  return data || [];
}

async function getStreamings(): Promise<Streaming[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('streaming')
    .select('*, category:id_category(name, slug)')
    .eq('status', 'Active')
    .order('view_count', { ascending: false });
  if (error) throw error;
  return data || [];
}

async function getHeroStreaming(): Promise<Streaming | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('streaming')
    .select('*, category:id_category(name, slug)')
    .eq('status', 'Active')
    .order('view_count', { ascending: false })
    .limit(1)
    .single();
  if (error) return null;
  return data;
}

// --- COMPONENTS ---
const Navbar = ({ scrolled }: { scrolled: boolean }) => {
  const router = useRouter();
  const { t } = useLanguage();
  const [user, setUser] = useState<any>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const supabase = createClient();
  const dropdownRef = useRef<HTMLDivElement>(null);

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
          <li className="text-white cursor-pointer transition">{t.home}</li>
          <li onClick={() => router.push('/category/drama')} className="hover:text-white cursor-pointer transition">{t.tvSeries}</li>
          <li onClick={() => router.push('/category/action')} className="hover:text-white cursor-pointer transition">{t.movies}</li>
          <li onClick={() => router.push('/category/trending')} className="hover:text-white cursor-pointer transition">{t.newPopular}</li>
          <li className="hover:text-white cursor-pointer transition">{t.myList}</li>
        </ul>
      </div>
      <div className="flex items-center gap-3 text-white">
        <LanguageSwitcher />
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
                  <p className="text-xs text-gray-400 mt-1">{t.member}</p>
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
                    <span className="text-sm">{t.settings}</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      router.push('/favorite');
                    }}
                    className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-zinc-800 transition text-left"
                  >
                    <Heart className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">{t.favorites}</span>
                  </button>
                </div>
                <div className="border-t border-zinc-800 py-1">
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-red-600/10 hover:text-red-500 transition text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm font-medium">{t.logout}</span>
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
    </nav >
  );
};

const Hero = ({ streaming, onPlay }: { streaming: Streaming | null; onPlay: (s: Streaming) => void }) => {
  if (!streaming) {
    return (
      <div className="relative h-[85vh] bg-zinc-900 flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="relative h-[85vh] overflow-hidden">
      <img
        src={streaming.url_banner || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1920'}
        alt={streaming.name}
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-zinc-950/30" />
      <div className="relative z-10 h-full flex items-center px-4 md:px-12">
        <div className="max-w-2xl space-y-6">
          <span className="inline-block px-3 py-1 bg-red-600 text-white text-xs font-bold rounded">
            🔥 TOP 1 HARI INI
          </span>
          <h1 className="text-4xl md:text-6xl font-black text-white leading-tight">
            {streaming.name}
          </h1>
          <p className="text-gray-300 text-sm md:text-base line-clamp-3">
            {streaming.description || 'Tonton sekarang di AuraTV'}
          </p>
          <div className="flex flex-wrap gap-4 pt-4">
            <button
              onClick={() => onPlay(streaming)}
              className="flex items-center gap-2 px-8 py-3 bg-white text-black font-bold rounded hover:bg-gray-200 transition-all transform hover:scale-105"
            >
              <Play className="w-6 h-6 fill-black" />
              Putar
            </button>
            <button className="flex items-center gap-2 px-8 py-3 bg-zinc-700/80 text-white font-bold rounded hover:bg-zinc-600 transition-all">
              <Info className="w-6 h-6" />
              Info Lainnya
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const MovieCard = ({ streaming, onPlay }: { streaming: Streaming; onPlay: (s: Streaming) => void }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="relative flex-shrink-0 w-[200px] md:w-[240px] group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onPlay(streaming)}
    >
      <div className={`relative aspect-video rounded-md overflow-hidden transition-all duration-300 ${isHovered ? 'scale-110 z-30 shadow-2xl' : ''}`}>
        <img
          src={streaming.url_banner || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400'}
          alt={streaming.name}
          className="w-full h-full object-cover"
        />
        {isHovered && (
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent flex flex-col justify-end p-3">
            <div className="flex gap-2 mb-2">
              <button className="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-gray-200">
                <Play className="w-4 h-4 fill-black text-black" />
              </button>
              <button className="w-8 h-8 border-2 border-gray-400 rounded-full flex items-center justify-center hover:border-white">
                <Plus className="w-4 h-4 text-white" />
              </button>
            </div>
            <h3 className="text-white font-bold text-sm truncate">{streaming.name}</h3>
            <p className="text-gray-400 text-xs">{streaming.category?.name || 'Movie'}</p>
          </div>
        )}
      </div>
    </div>
  );
};

const StreamingRow = ({ title, streamings, onPlay }: { title: string; streamings: Streaming[]; onPlay: (s: Streaming) => void }) => {
  const rowRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const scrollAmount = direction === 'left' ? -600 : 600;
      rowRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (streamings.length === 0) return null;

  return (
    <div className="relative group py-6">
      <h2 className="text-white text-xl font-bold mb-4 px-4 md:px-12">{title}</h2>
      <div className="relative">
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-12 h-full bg-gradient-to-r from-zinc-950 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
        >
          <ChevronLeft className="w-8 h-8 text-white" />
        </button>
        <div
          ref={rowRef}
          className="flex gap-2 overflow-x-scroll scrollbar-hide px-4 md:px-12 pb-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {streamings.map((s) => (
            <MovieCard key={s.id} streaming={s} onPlay={onPlay} />
          ))}
        </div>
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-12 h-full bg-gradient-to-l from-zinc-950 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
        >
          <ChevronRight className="w-8 h-8 text-white" />
        </button>
      </div>
    </div>
  );
};

const Footer = () => {
  const { t } = useLanguage();
  const router = useRouter();

  return (
    <footer className="relative bg-gradient-to-b from-zinc-950 to-black text-gray-400 pt-16 pb-8 px-4 md:px-12 mt-20 border-t border-zinc-800/50">
      {/* Decorative gradient */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-600/50 to-transparent"></div>

      <div className="max-w-7xl mx-auto">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand Section */}
          <div className="space-y-4">
            <h2 className="text-red-600 text-3xl font-bold tracking-tighter">AuraTV</h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              Platform streaming terbaik untuk menonton film dan serial TV favorit Anda. Nikmati ribuan konten berkualitas tinggi.
            </p>
            {/* Social Media */}
            <div className="flex gap-3 pt-2">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-zinc-800/50 hover:bg-red-600 border border-zinc-700 hover:border-red-600 flex items-center justify-center transition-all group">
                <svg className="w-5 h-5 text-gray-400 group-hover:text-white transition" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-zinc-800/50 hover:bg-gradient-to-br hover:from-purple-600 hover:to-pink-600 border border-zinc-700 hover:border-transparent flex items-center justify-center transition-all group">
                <svg className="w-5 h-5 text-gray-400 group-hover:text-white transition" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-zinc-800/50 hover:bg-blue-500 border border-zinc-700 hover:border-blue-500 flex items-center justify-center transition-all group">
                <svg className="w-5 h-5 text-gray-400 group-hover:text-white transition" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                </svg>
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-zinc-800/50 hover:bg-red-600 border border-zinc-700 hover:border-red-600 flex items-center justify-center transition-all group">
                <svg className="w-5 h-5 text-gray-400 group-hover:text-white transition" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider">{t.home}</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <button onClick={() => router.push('/')} className="hover:text-white transition-colors hover:translate-x-1 inline-block transform">
                  Beranda
                </button>
              </li>
              <li>
                <button onClick={() => router.push('/category/drama')} className="hover:text-white transition-colors hover:translate-x-1 inline-block transform">
                  {t.tvSeries}
                </button>
              </li>
              <li>
                <button onClick={() => router.push('/category/action')} className="hover:text-white transition-colors hover:translate-x-1 inline-block transform">
                  {t.movies}
                </button>
              </li>
              <li>
                <button onClick={() => router.push('/favorite')} className="hover:text-white transition-colors hover:translate-x-1 inline-block transform">
                  {t.favorites}
                </button>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider">Bantuan</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/faq" className="hover:text-white transition-colors hover:translate-x-1 inline-block transform">
                  {t.faq}
                </Link>
              </li>
              <li>
                <Link href="/help" className="hover:text-white transition-colors hover:translate-x-1 inline-block transform">
                  {t.helpCenter}
                </Link>
              </li>
              <li>
                <a href="mailto:support@auratv.com" className="hover:text-white transition-colors hover:translate-x-1 inline-block transform">
                  Hubungi Kami
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider">Legal</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/terms" className="hover:text-white transition-colors hover:translate-x-1 inline-block transform">
                  {t.termsOfService}
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors hover:translate-x-1 inline-block transform">
                  {t.privacyPolicy}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-zinc-800/50">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-gray-600">
              © 2024 AuraTV Indonesia. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-xs">
              <span className="text-gray-600">Made with ❤️ in Indonesia</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

// --- MAIN APP ---
export default function App() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [heroStreaming, setHeroStreaming] = useState<Streaming | null>(null);
  const [streamings, setStreamings] = useState<Streaming[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        const [hero, allStreamings, allCategories] = await Promise.all([
          getHeroStreaming(),
          getStreamings(),
          getCategories()
        ]);
        setHeroStreaming(hero);
        setStreamings(allStreamings);
        setCategories(allCategories);
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handlePlay = (streaming: Streaming) => {
    router.push(`/play/${streaming.slug}`);
  };

  // Group streamings by category
  const getStreamingsByCategory = (categorySlug: string) => {
    return streamings.filter(s => s.category?.slug === categorySlug);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar scrolled={scrolled} />
      <Hero streaming={heroStreaming} onPlay={handlePlay} />

      {/* Popunder & Smartlink */}
      <AdsterraPopunder />
      <AdsterraSmartlink />

      <div className="-mt-32 relative z-10">
        {/* Banner Ad after Hero */}
        <div className="px-4 md:px-12 mb-6">
          <AdContainer>
            <AdsterraBanner />
          </AdContainer>
        </div>

        {/* Popular */}
        <StreamingRow
          title="🔥 Populer di AuraTV"
          streamings={streamings.slice(0, 10)}
          onPlay={handlePlay}
        />

        {/* Native Banner Ad #1 */}
        <div className="px-4 md:px-12 my-6">
          <AdContainer>
            <AdsterraNativeBanner />
          </AdContainer>
        </div>

        {/* By Category */}
        {categories.map((cat, index) => {
          const catStreamings = getStreamingsByCategory(cat.slug);
          if (catStreamings.length === 0) return null;
          return (
            <React.Fragment key={cat.id}>
              <StreamingRow
                title={`${cat.icon_url || '📁'} ${cat.name}`}
                streamings={catStreamings}
                onPlay={handlePlay}
              />
              {/* Native Banner every 2 categories */}
              {index % 2 === 1 && (
                <div className="px-4 md:px-12 my-6">
                  <AdContainer>
                    <AdsterraNativeBanner />
                  </AdContainer>
                </div>
              )}
            </React.Fragment>
          );
        })}

        {/* Recent */}
        <StreamingRow
          title="🆕 Baru Ditambahkan"
          streamings={[...streamings].reverse().slice(0, 10)}
          onPlay={handlePlay}
        />
      </div>

      <Footer />

      {/* Social Bar (sticky bottom) */}
      <AdsterraSocialBar />
    </div>
  );
}