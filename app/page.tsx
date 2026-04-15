import { getStreams, getCategories, getSliders } from './lib/data';
import { getDictionary } from './lib/dictionary';
import { cookies } from 'next/headers';
import Link from 'next/link';
import BannerSlider from './components/BannerSlider';
import SearchBar from './components/SearchBar';
import {
  Search,
  PlayCircle,
  MoreHorizontal,
  ChevronRight,
  User,
  MonitorPlay
} from 'lucide-react';

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
  const buildPageHref = (page: number) => {
    const params = new URLSearchParams();

    if (activeCategorySlug !== 'Semua') params.set('category', activeCategorySlug);
    if (resolvedSearchParams.q) params.set('q', resolvedSearchParams.q);
    if (page > 1) params.set('page', String(page));

    const query = params.toString();
    return query ? `/?${query}` : '/';
  };

  const paginationItems: Array<number | 'ellipsis'> = [];
  if (totalPages <= 7) {
    for (let pageNumber = 1; pageNumber <= totalPages; pageNumber += 1) {
      paginationItems.push(pageNumber);
    }
  } else {
    paginationItems.push(1);

    const startPage = Math.max(2, currentPage - 1);
    const endPage = Math.min(totalPages - 1, currentPage + 1);

    if (startPage > 2) paginationItems.push('ellipsis');
    for (let pageNumber = startPage; pageNumber <= endPage; pageNumber += 1) {
      paginationItems.push(pageNumber);
    }
    if (endPage < totalPages - 1) paginationItems.push('ellipsis');

    paginationItems.push(totalPages);
  }

  return (
    <div className="flex flex-col h-full relative overflow-hidden animate-fade-in">
      {/* Header / Top Bar */}
      <header className="h-24 px-6 md:px-12 flex items-center justify-between shrink-0 z-20">
        <SearchBar placeholder={dict.common.search} />

        {/* Mobile Logo */}
        <div className="md:hidden flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center">
            <MonitorPlay size={16} className="text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">Streamku</span>
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
            className={`px-6 py-2.5 rounded-2xl text-sm font-semibold whitespace-nowrap transition-all duration-300 ${activeCategorySlug === 'Semua'
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
              className={`px-6 py-2.5 rounded-2xl text-sm font-semibold whitespace-nowrap transition-all duration-300 ${activeCategorySlug === cat.slug
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

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {filteredChannels.length > 0 ? (
              paginatedChannels.map((channel: any) => (
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
              ))
            ) : (
              <div className="col-span-full py-20 text-center">
                <div className="inline-flex p-6 bg-gray-100 rounded-3xl mb-4">
                  <Search size={40} className="text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Tidak ada saluran ditemukan</h3>
                <p className="text-gray-500 mt-2">Coba gunakan kata kunci lain atau pilih kategori yang berbeda.</p>
              </div>
            )}
          </div>

          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2 flex-wrap">
              <Link
                href={buildPageHref(currentPage - 1)}
                aria-disabled={currentPage === 1}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                  currentPage === 1
                    ? 'pointer-events-none bg-gray-100 text-gray-400'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                Prev
              </Link>

              {paginationItems.map((item, index) => {
                if (item === 'ellipsis') {
                  return (
                    <span key={`ellipsis-${index}`} className="px-2 text-gray-400 text-sm font-semibold">
                      ...
                    </span>
                  );
                }

                return (
                  <Link
                    key={item}
                    href={buildPageHref(item)}
                    className={`min-w-10 px-3 py-2 rounded-xl text-sm font-semibold text-center transition-colors ${
                      currentPage === item
                        ? 'bg-gray-900 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    {item}
                  </Link>
                );
              })}

              <Link
                href={buildPageHref(currentPage + 1)}
                aria-disabled={currentPage === totalPages}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                  currentPage === totalPages
                    ? 'pointer-events-none bg-gray-100 text-gray-400'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                Next
              </Link>
            </div>
          )}
        </section>

        {/* Featured Recommendations Section */}
        <section className="mb-14">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-extrabold text-gray-900 leading-none">{dict.common.recommendations}</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {streams.slice(4, 8).map((channel: any) => (
              <Link key={`feat-${channel.id}`} href={`/${channel.slug}`} className="group bg-white rounded-[2rem] p-3 shadow-[0_8px_24px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] transition-all duration-300 border border-white hover:border-blue-100 flex flex-col">
                <div className="relative w-full aspect-[4/3] rounded-[1.5rem] overflow-hidden mb-4 bg-gray-50 flex items-center justify-center">
                  <img src={channel.image_url} alt={channel.name} className="w-full h-full object-contain p-8 transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute top-3 left-3">
                    <span className="px-2 py-0.5 bg-blue-600 text-white rounded-md text-[9px] font-black uppercase tracking-widest">{dict.common.badge_recommended}</span>
                  </div>
                  <div className="absolute inset-0 bg-blue-900/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[1px]">
                    <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-xl transform scale-50 group-hover:scale-100 transition-transform duration-300 ease-out">
                      <PlayCircle size={24} className="text-blue-600" />
                    </div>
                  </div>
                </div>
                <div className="px-2">
                  <h3 className="font-bold text-gray-900 text-sm leading-tight mb-1 group-hover:text-blue-600 transition-colors line-clamp-1">{channel.name}</h3>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{categories.find((c: any) => c.id === channel.id_category)?.name || 'General'}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Trending Grid */}
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
