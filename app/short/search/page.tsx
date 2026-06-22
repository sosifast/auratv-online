'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Search, Loader2 } from 'lucide-react';
import { ShortStream } from '@/app/lib/api-short';

export default function SearchPage() {
    const router = useRouter();
    const [query, setQuery] = useState('');
    const [allShorts, setAllShorts] = useState<ShortStream[]>([]);
    const [loading, setLoading] = useState(false);
    
    // Pagination state (4 columns x 5 rows = 20 items per load)
    const [visibleCount, setVisibleCount] = useState(20); 
    
    // Fetch all data once
    useEffect(() => {
        setLoading(true);
        fetch('https://streamku-kappa.vercel.app/short/stream.json')
            .then(r => r.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setAllShorts(data);
                } else if (data && Array.isArray(data.value)) {
                    setAllShorts(data.value);
                }
            })
            .catch(err => console.error('Error fetching search data:', err))
            .finally(() => setLoading(false));
    }, []);

    // Filtered data based on search query
    const filteredShorts = allShorts.filter(short => {
        const titleMatch = short.title?.toLowerCase().includes(query.toLowerCase());
        const tagsMatch = short.tags?.some(tag => tag.toLowerCase().includes(query.toLowerCase()));
        return titleMatch || tagsMatch;
    });

    const visibleShorts = filteredShorts.slice(0, visibleCount);

    // Infinite scroll intersection observer
    const observer = useRef<IntersectionObserver | null>(null);
    const lastElementRef = useCallback((node: HTMLDivElement | null) => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();
        
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && visibleCount < filteredShorts.length) {
                setVisibleCount(prev => prev + 20);
            }
        });
        
        if (node) observer.current.observe(node);
    }, [loading, visibleCount, filteredShorts.length]);

    // Reset pagination when query changes
    useEffect(() => {
        setVisibleCount(20);
    }, [query]);

    return (
        <div className="w-full min-h-[100dvh] bg-black text-white font-sans flex flex-col">
            {/* Header / Search Bar */}
            <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10 px-4 py-3 flex items-center gap-3">
                <button onClick={() => router.back()} className="p-2 hover:bg-white/10 rounded-full transition-colors shrink-0">
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <div className="flex-1 relative">
                    <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Search shorts, tags..." 
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="w-full bg-white/10 border border-white/20 rounded-full py-2.5 pl-11 pr-4 text-sm focus:outline-none focus:border-[#E50914] transition-colors"
                        autoFocus
                    />
                </div>
            </div>

            {/* Results Grid */}
            <div className="flex-1 p-4 md:px-8">
                {loading ? (
                    <div className="w-full h-40 flex justify-center items-center">
                        <Loader2 className="w-8 h-8 text-[#E50914] animate-spin" />
                    </div>
                ) : filteredShorts.length === 0 ? (
                    <div className="w-full h-40 flex justify-center items-center text-gray-500 font-medium">
                        {query ? `No results found for "${query}"` : 'Type something to search...'}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
                        {visibleShorts.map((short, index) => {
                            const isLast = index === visibleShorts.length - 1;
                            return (
                                <div 
                                    key={short.id} 
                                    ref={isLast ? lastElementRef : null}
                                    className="relative aspect-[2/3] rounded-xl overflow-hidden cursor-pointer group bg-gray-900 border border-white/5 hover:border-white/20 transition-colors"
                                    onClick={() => router.push(`/short/${short.slug}`)}
                                >
                                    <img 
                                        src={short.image} 
                                        alt={short.title} 
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        loading="lazy"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                                    <div className="absolute bottom-2 left-2 right-2 md:bottom-3 md:left-3 md:right-3">
                                        <h3 className="text-white font-bold text-xs md:text-sm line-clamp-2 drop-shadow-md mb-1">{short.title}</h3>
                                        <p className="text-gray-300 text-[10px] md:text-xs font-semibold">{short.episodes} Episodes</p>
                                    </div>
                                    {short.is_paid === 1 && (
                                        <div className="absolute top-2 left-2 md:top-3 md:left-3 bg-amber-500 text-black text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                                            PREMIUM
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
                
                {/* Loading indicator for infinite scroll */}
                {visibleCount < filteredShorts.length && (
                    <div className="w-full py-8 flex justify-center">
                        <Loader2 className="w-6 h-6 text-gray-500 animate-spin" />
                    </div>
                )}
            </div>
        </div>
    );
}
