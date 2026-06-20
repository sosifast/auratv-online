import { getStreams, getCategories, getSliders } from './lib/data';
import { getDictionary } from './lib/dictionary';
import { cookies } from 'next/headers';
import Link from 'next/link';
import HeroSlider from './components/HeroSlider';
import SearchBar from './components/SearchBar';
import LanguageSwitcher from './components/LanguageSwitcher';
import { Popunder, NativeBanner } from './components/Ads';
import { PlayCircle, Play, Plus, ChevronRight, Users, Flame, Rocket, Skull, Smile, Heart, Wand2, Eye, Bell, Search, MonitorPlay } from 'lucide-react';

export default async function Home({ searchParams }: { searchParams: Promise<{ category?: string, q?: string, page?: string }> }) {
  const resolvedSearchParams = await searchParams;
  const activeCategorySlug = resolvedSearchParams.category || 'Semua';

  const cookieStore = await cookies();
  const locale = cookieStore.get("locale")?.value || "id";
  const dict = getDictionary(locale);

  const [streams, categories, sliders] = await Promise.all([
    getStreams(),
    getCategories(),
    getSliders()
  ]);

  const activeCategory = categories.find((c: any) => c.slug === activeCategorySlug);
  const searchQuery = resolvedSearchParams.q?.toLowerCase() || '';

  const filteredChannels = streams.filter((channel: any) => {
    const matchesCategory = activeCategorySlug === 'Semua' || Number(channel.id_category) === Number(activeCategory?.id);
    const matchesSearch = !searchQuery || channel.name.toLowerCase().includes(searchQuery);
    return matchesCategory && matchesSearch;
  });

  const itemsPerPage = 16;
  const totalPages = Math.max(1, Math.ceil(filteredChannels.length / itemsPerPage));
  const requestedPage = Number.parseInt(resolvedSearchParams.page || '1', 10);
  const currentPage = Number.isNaN(requestedPage) ? 1 : Math.min(Math.max(requestedPage, 1), totalPages);
  const paginatedChannels = filteredChannels.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Static Genres matching user design, could be mapped dynamically if needed
  const genres = [
    { name: 'Action', color: 'from-orange-500 to-red-600', icon: Flame },
    { name: 'Sci-Fi', color: 'from-cyan-500 to-blue-600', icon: Rocket },
    { name: 'Horror', color: 'from-gray-600 to-gray-900', icon: Skull },
    { name: 'Comedy', color: 'from-yellow-400 to-amber-600', icon: Smile },
    { name: 'Romance', color: 'from-pink-400 to-rose-600', icon: Heart },
    { name: 'Fantasy', color: 'from-violet-500 to-purple-700', icon: Wand2 },
    { name: 'Thriller', color: 'from-emerald-500 to-teal-700', icon: Eye }
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');
        body { font-family: 'Outfit', sans-serif; -webkit-tap-highlight-color: transparent; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
      <Popunder />
      
      <main className="flex-1 h-full overflow-y-auto overflow-x-hidden hide-scrollbar relative pb-20 md:pb-0">
        
        {/* TOP HEADER (Mobile Only & Tablet Search) */}
        <header className="absolute top-0 left-0 w-full z-40 px-4 md:px-8 py-4 flex justify-between items-center bg-gradient-to-b from-[#0B0C10]/80 to-transparent">
          <div className="md:hidden flex items-center gap-2">
            <PlayCircle className="w-8 h-8 text-[#E50914]" />
            <span className="text-xl font-bold tracking-wider drop-shadow-md">VERSE</span>
          </div>
          
          <div className="hidden md:block flex-1"></div>

          <div className="flex items-center gap-4">
            <div className="hidden md:block w-72">
              <SearchBar placeholder={dict.common.search || "Search..."} />
            </div>
            <button className="p-2 rounded-full bg-black/20 backdrop-blur-md hover:bg-white/20 transition-colors md:hidden">
              <Search className="w-5 h-5 text-white" />
            </button>
            <LanguageSwitcher />
            <button className="p-2 rounded-full bg-black/20 backdrop-blur-md hover:bg-white/20 transition-colors">
              <Bell className="w-5 h-5 text-white" />
            </button>
          </div>
        </header>

        {/* HERO SLIDER */}
        <HeroSlider sliders={sliders} />

        <div className="px-4 md:px-12 -mt-4 relative z-20 pb-10 space-y-10">
          
          {/* GENRE SECTION */}
          <section>
            <div className="flex justify-between items-end mb-4">
              <h2 className="text-xl md:text-2xl font-bold tracking-wide">Explore Genres</h2>
            </div>
            
            <div className="flex overflow-x-auto gap-3 md:gap-4 snap-x snap-mandatory hide-scrollbar pb-4 -mx-4 px-4 md:mx-0 md:px-0">
              {genres.map((genre, idx) => {
                const Icon = genre.icon;
                return (
                  <div key={idx} className="snap-start shrink-0 w-32 md:w-40 h-16 md:h-20 group cursor-pointer">
                    <div className={`w-full h-full rounded-xl bg-gradient-to-br ${genre.color} p-[1px] shadow-lg transition-all duration-300 group-hover:scale-105 group-hover:shadow-[#E50914]/20 group-active:scale-95`}>
                      <div className="w-full h-full bg-[#0B0C10]/40 backdrop-blur-sm rounded-[11px] flex items-center justify-center relative overflow-hidden transition-colors duration-300 group-hover:bg-[#0B0C10]/10">
                        <Icon className="absolute -right-2 -bottom-2 w-12 h-12 text-white opacity-10 group-hover:opacity-20 group-hover:scale-125 group-hover:-rotate-12 transition-all duration-500" />
                        <div className="relative z-10">
                          <span className="font-bold text-sm md:text-base text-white tracking-wide drop-shadow-md">{genre.name}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>

          <NativeBanner />

          {/* REKOMENDASI SECTION */}
          <section>
            <div className="flex justify-between items-end mb-4">
              <h2 className="text-xl md:text-2xl font-bold tracking-wide">{dict.common.recommendations || "Recommended for You"}</h2>
              <a href="#" className="text-[#E50914] text-sm font-medium hover:underline flex items-center">
                See All <ChevronRight className="w-4 h-4" />
              </a>
            </div>
            
            <div className="flex overflow-x-auto gap-4 snap-x snap-mandatory hide-scrollbar pb-4 -mx-4 px-4 md:mx-0 md:px-0">
              {streams.slice(4, 10).map((channel: any, idx: number) => (
                <Link href={`/${channel.slug}`} key={channel.id} className="snap-start shrink-0 w-36 md:w-48 lg:w-56 group relative cursor-pointer block">
                  <div className="relative w-full aspect-[2/3] rounded-lg overflow-hidden shadow-lg transition-transform duration-300 group-hover:scale-105 group-hover:ring-2 ring-[#E50914]">
                    <img src={channel.image_url} alt={channel.name} className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-70 bg-[#1F2833]" />
                    
                    {/* Play Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="bg-[#E50914] rounded-full p-3 shadow-lg shadow-[#E50914]/50">
                        <Play className="w-6 h-6 fill-white text-white" />
                      </div>
                    </div>
                    
                    {/* Badge */}
                    {idx === 0 && (
                      <div className="absolute top-2 left-2 bg-[#E50914] text-white text-[10px] font-bold px-2 py-1 rounded">
                        New
                      </div>
                    )}
                  </div>
                  <h3 className="mt-2 text-sm md:text-base font-medium truncate">{channel.name}</h3>
                </Link>
              ))}
            </div>
          </section>

          {/* LIVE TV SECTION */}
          <section>
            <div className="flex justify-between items-end mb-4">
              <h2 className="text-xl md:text-2xl font-bold tracking-wide">{dict.common.live || "Live Channels"}</h2>
            </div>
            
            <div className="flex overflow-x-auto gap-4 snap-x snap-mandatory hide-scrollbar pb-4 -mx-4 px-4 md:mx-0 md:px-0">
              {paginatedChannels.slice(0, 8).map((channel: any) => (
                <Link href={`/${channel.slug}`} key={channel.id} className="snap-start shrink-0 w-56 md:w-72 group relative cursor-pointer block">
                  <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-lg transition-all duration-300 group-hover:scale-105 ring-1 ring-white/10 group-hover:ring-[#E50914]">
                    <img src={channel.image_url} alt={channel.name} className="w-full h-full object-cover bg-[#1F2833]" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                    
                    {/* Live Badge */}
                    <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-[#E50914] text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                      LIVE
                    </div>

                    {/* Viewers */}
                    <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white text-[10px] font-medium px-2 py-1 rounded flex items-center gap-1">
                      <Users className="w-3 h-3" /> {Math.floor(Math.random() * 900) + 10}K
                    </div>
                    
                    <div className="absolute bottom-3 left-3 right-3">
                      <h3 className="text-sm md:text-base font-bold text-white truncate">{channel.name}</h3>
                      <p className="text-[10px] md:text-xs text-[#E50914] font-medium truncate mt-0.5">Live Now</p>
                    </div>
                    
                    {/* Play Icon Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40">
                      <div className="bg-[#E50914] rounded-full p-3 shadow-lg shadow-[#E50914]/50 scale-90 group-hover:scale-100 transition-transform">
                        <Play className="w-6 h-6 fill-white text-white" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          <NativeBanner />

          {/* CATEGORIES SECTION */}
          <section>
            <div className="flex justify-between items-end mb-4">
              <h2 className="text-xl md:text-2xl font-bold tracking-wide">Categories</h2>
            </div>
            
            <div className="flex overflow-x-auto gap-3 md:gap-4 snap-x snap-mandatory hide-scrollbar pb-4 -mx-4 px-4 md:mx-0 md:px-0">
              {categories.slice(0, 8).map((cat: any, idx: number) => {
                const colors = [
                  'from-blue-500 to-indigo-600',
                  'from-purple-500 to-fuchsia-600',
                  'from-emerald-500 to-teal-600',
                  'from-orange-500 to-red-600',
                  'from-pink-500 to-rose-600',
                  'from-cyan-500 to-blue-600',
                  'from-yellow-500 to-amber-600',
                  'from-violet-500 to-purple-600',
                ];
                const color = colors[idx % colors.length];
                return (
                  <Link href={`/?category=${cat.slug}`} key={cat.id} className="snap-start shrink-0 w-32 md:w-40 h-16 md:h-20 group cursor-pointer block">
                    <div className={`w-full h-full rounded-xl bg-gradient-to-br ${color} p-[1px] shadow-lg transition-all duration-300 group-hover:scale-105 group-hover:shadow-[#E50914]/20 group-active:scale-95`}>
                      <div className="w-full h-full bg-[#0B0C10]/40 backdrop-blur-sm rounded-[11px] flex items-center justify-center relative overflow-hidden transition-colors duration-300 group-hover:bg-[#0B0C10]/10">
                        <MonitorPlay className="absolute -right-2 -bottom-2 w-12 h-12 text-white opacity-10 group-hover:opacity-20 group-hover:scale-125 group-hover:-rotate-12 transition-all duration-500" />
                        <div className="relative z-10 px-2 text-center">
                          <span className="font-bold text-sm md:text-base text-white tracking-wide drop-shadow-md line-clamp-1">{cat.name}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
