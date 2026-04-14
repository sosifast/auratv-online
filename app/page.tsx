import { getStreams, getCategories, getSliders } from './lib/data';
import { getDictionary } from './lib/dictionary';
import { cookies } from 'next/headers';
import Link from 'next/link';
import BannerSlider from './components/BannerSlider';
import { 
  Search, 
  PlayCircle, 
  MoreHorizontal,
  ChevronRight,
  User,
  MonitorPlay
} from 'lucide-react';

export default async function Home({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
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
  
  const filteredChannels = activeCategorySlug === 'Semua' 
    ? streams 
    : streams.filter((s: any) => s.id_category === activeCategory?.id);

  return (
    <div className="flex flex-col h-full relative overflow-hidden animate-fade-in">
      {/* Header / Top Bar */}
      <header className="h-24 px-6 md:px-12 flex items-center justify-between shrink-0 z-20">
        <div className="w-full max-w-md relative group hidden md:block">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20} />
          <input 
            type="text" 
            placeholder={dict.common.search}
            className="w-full bg-white/80 backdrop-blur-md border border-white shadow-sm pl-12 pr-4 py-3.5 rounded-2xl text-sm font-medium text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all"
          />
        </div>

        {/* Mobile Logo */}
        <div className="md:hidden flex items-center gap-2">
           <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center">
              <MonitorPlay size={16} className="text-white" />
           </div>
           <span className="text-xl font-bold text-gray-900">VisionPro</span>
        </div>
      </header>

      {/* Scrollable Area */}
      <main className="flex-1 overflow-y-auto px-6 md:px-12 pb-24 scrollbar-hide">
        
        {/* Dynamic Banner Slider */}
        <BannerSlider sliders={sliders} />

        {/* Filter Pills */}
        <section className="mb-8 flex items-center gap-3 overflow-x-auto pb-4 scrollbar-hide -mx-6 px-6 md:mx-0 md:px-0">
          <Link
            href="/"
            className={`px-6 py-2.5 rounded-2xl text-sm font-semibold whitespace-nowrap transition-all duration-300 ${
              activeCategorySlug === 'Semua' 
                ? 'bg-gray-900 text-white shadow-lg shadow-gray-900/20' 
                : 'bg-white text-gray-500 hover:bg-gray-100 border border-gray-100 shadow-sm'
            }`}
          >
            {dict.common.all}
          </Link>
          {categories.map((cat: any) => (
            <Link
              key={cat.id}
              href={`/?category=${cat.slug}`}
              className={`px-6 py-2.5 rounded-2xl text-sm font-semibold whitespace-nowrap transition-all duration-300 ${
                activeCategorySlug === cat.slug
                  ? 'bg-gray-900 text-white shadow-lg shadow-gray-900/20' 
                  : 'bg-white text-gray-500 hover:bg-gray-100 border border-gray-100 shadow-sm'
              }`}
            >
              {cat.name}
            </Link>
          ))}
        </section>

        {/* Grid Content */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-extrabold text-gray-900">{dict.common.live}</h2>
            <button className="text-blue-600 font-semibold text-sm flex items-center gap-1 hover:gap-2 transition-all">
              {dict.common.browse} <ChevronRight size={18} />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {filteredChannels.map((channel: any) => (
              <Link key={channel.id} href={`/${channel.slug}`} className="group bg-white rounded-[2rem] p-3 shadow-[0_8px_24px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] transition-all duration-300 border border-white hover:border-blue-100 flex flex-col">
                <div className="relative w-full aspect-[4/3] rounded-[1.5rem] overflow-hidden mb-4 bg-gray-100">
                  <img src={channel.image_url} alt={channel.name} className="absolute inset-0 w-full h-full object-contain p-8 transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className="px-2.5 py-1 bg-red-500 text-white rounded-lg text-[10px] font-bold tracking-wide backdrop-blur-md">{dict.common.live}</span>
                  </div>
                  <div className="absolute bottom-3 left-3 px-2.5 py-1 bg-black/50 backdrop-blur-md rounded-lg text-white text-[11px] font-semibold flex items-center gap-1.5">
                    <User size={12} /> {Math.floor(Math.random() * 900) + 10}K
                  </div>
                  <div className="absolute inset-0 bg-blue-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
                    <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-2xl transform scale-50 group-hover:scale-100 transition-transform duration-300 ease-out">
                      <PlayCircle size={32} className="text-blue-600 fill-blue-100" />
                    </div>
                  </div>
                </div>
                <div className="px-3 pb-2 flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg leading-tight mb-1 group-hover:text-blue-600 transition-colors line-clamp-1">{channel.name}</h3>
                    <p className="text-sm font-medium text-gray-500">{categories.find((c: any) => c.id === channel.id_category)?.name || 'General'} • HD</p>
                  </div>
                  <button className="p-2 -mr-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"><MoreHorizontal size={20} /></button>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Recommendations Grid */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-extrabold text-gray-900">{dict.common.trending}</h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {streams.slice(0, 4).map((channel: any) => (
              <Link key={`rec-${channel.id}`} href={`/${channel.slug}`} className="group bg-white rounded-[2rem] p-4 shadow-[0_8px_24px_rgba(0,0,0,0.04)] border border-white hover:border-blue-100 transition-all">
                <div className="relative aspect-video rounded-2xl overflow-hidden mb-4 bg-gray-50 flex items-center justify-center p-6">
                  <img 
                    src={channel.image_url} 
                    alt={channel.name} 
                    className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-110" 
                  />
                  <div className="absolute inset-0 bg-blue-900/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
                <div className="px-1">
                  <h3 className="text-gray-900 font-bold text-sm leading-tight mb-1 line-clamp-1">{channel.name}</h3>
                  <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                    {categories.find((c: any) => c.id === channel.id_category)?.name || 'GENERAL'}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
