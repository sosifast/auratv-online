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

const Footer = () => (
  <footer className="bg-zinc-950 text-gray-500 py-12 px-4 md:px-12 mt-12 border-t border-zinc-800">
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
        <div>
          <h4 className="text-gray-400 font-medium mb-4">Navigasi</h4>
          <ul className="space-y-2 text-sm">
            <li className="hover:text-white cursor-pointer">Beranda</li>
            <li className="hover:text-white cursor-pointer">Serial TV</li>
            <li className="hover:text-white cursor-pointer">Film</li>
          </ul>
        </div>
        <div>
          <h4 className="text-gray-400 font-medium mb-4">Bantuan</h4>
          <ul className="space-y-2 text-sm">
            <li className="hover:text-white cursor-pointer">FAQ</li>
            <li className="hover:text-white cursor-pointer">Pusat Bantuan</li>
            <li className="hover:text-white cursor-pointer">Hubungi Kami</li>
          </ul>
        </div>
        <div>
          <h4 className="text-gray-400 font-medium mb-4">Legal</h4>
          <ul className="space-y-2 text-sm">
            <li className="hover:text-white cursor-pointer">Ketentuan</li>
            <li className="hover:text-white cursor-pointer">Privasi</li>
          </ul>
        </div>
        <div>
          <h4 className="text-gray-400 font-medium mb-4">Ikuti Kami</h4>
          <div className="flex gap-4">
            <span className="hover:text-white cursor-pointer">FB</span>
            <span className="hover:text-white cursor-pointer">IG</span>
            <span className="hover:text-white cursor-pointer">TW</span>
          </div>
        </div>
      </div>
      <p className="text-xs text-center pt-8 border-t border-zinc-800">© 2024 AuraTV Indonesia. All rights reserved.</p>
    </div>
  </footer>
);

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