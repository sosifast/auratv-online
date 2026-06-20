'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import { usePostHog } from 'posthog-js/react';

export default function SearchBar({ placeholder }: { placeholder: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const posthog = usePostHog();

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (query) {
        params.set('q', query);
        
        // Track search event
        if (posthog) {
          posthog.capture('search_performed', {
            search_query: query
          });
        }
      } else {
        params.delete('q');
      }
      
      // Preserve category if it exists
      const category = searchParams.get('category');
      if (category) {
        params.set('category', category);
      }

      router.push(`/?${params.toString()}`);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query, router, searchParams, posthog]);

  return (
    <div className="w-full max-w-md relative group hidden md:block">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#E50914] transition-colors" size={20} />
      <input 
        type="text" 
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-black/20 backdrop-blur-md border border-white/10 shadow-sm pl-12 pr-4 py-2.5 md:py-3 rounded-full text-sm font-medium text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E50914]/50 focus:border-transparent transition-all"
      />
    </div>
  );
}
