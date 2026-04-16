import { getStreams, getCategories } from '../lib/data';
import { getDictionary } from '../lib/dictionary';
import { cookies } from 'next/headers';
import { Popunder, NativeBanner } from '../components/Ads';
import Link from 'next/link';
import { 
  Search, 
  MoreHorizontal,
  ChevronRight,
  User,
  PlayCircle,
  LayoutGrid
} from 'lucide-react';

export default async function BrowsePage({ searchParams }: { searchParams: Promise<{ category?: string, page?: string }> }) {
  const resolvedSearchParams = await searchParams;
  const activeCategorySlug = resolvedSearchParams.category || 'Semua';

  const cookieStore = await cookies();
  const locale = cookieStore.get("locale")?.value || "id";
  const dict = getDictionary(locale);

  const [streams, categories] = await Promise.all([getStreams(), getCategories()]);

  const activeCategory = categories.find((c: any) => c.slug === activeCategorySlug);
  
  const filteredChannels = activeCategorySlug === 'Semua' 
    ? streams 
    : streams.filter((s: any) => Number(s.id_category) === Number(activeCategory?.id));

  // Pagination Logic
  const itemsPerPage = 20; // 4x5 grid
  const totalPages = Math.max(1, Math.ceil(filteredChannels.length / itemsPerPage));
  const requestedPage = Number.parseInt(resolvedSearchParams.page || '1', 10);
  const currentPage = Number.isNaN(requestedPage) ? 1 : Math.min(Math.max(requestedPage, 1), totalPages);
  const paginatedChannels = filteredChannels.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const buildPageHref = (page: number) => {
    const params = new URLSearchParams();
    if (activeCategorySlug !== 'Semua') params.set('category', activeCategorySlug);
    if (page > 1) params.set('page', String(page));
    const query = params.toString();
    return query ? `/browse?${query}` : '/browse';
  };

  const paginationItems: Array<number | 'ellipsis'> = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) paginationItems.push(i);
  } else {
    paginationItems.push(1);
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    if (start > 2) paginationItems.push('ellipsis');
    for (let i = start; i <= end; i++) paginationItems.push(i);
    if (end < totalPages - 1) paginationItems.push('ellipsis');
    paginationItems.push(totalPages);
  }

  return (
    <div className="flex flex-col h-full relative overflow-hidden animate-fade-in">
      <Popunder />
      <header className="h-24 px-6 md:px-12 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-3">
            <div className="bg-blue-600/10 p-2 rounded-xl text-blue-600">
                <LayoutGrid size={24} />
            </div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tighter">{dict.common.browse}</h1>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-6 md:px-12 pb-24 scrollbar-hide">
        {/* Categories Grid */}
        <section className="mb-12">
            <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6">{dict.common.all}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
                <Link href="/browse" className={`p-4 rounded-3xl border transition-all text-center ${activeCategorySlug === 'Semua' ? 'bg-gray-900 border-gray-900 text-white shadow-lg' : 'bg-white border-gray-100 text-gray-600 hover:border-blue-200 hover:bg-gray-50'}`}>
                    <p className="font-bold text-sm">{dict.common.all}</p>
                </Link>
                {categories.map((cat: any) => (
                    <Link key={cat.id} href={`/browse?category=${cat.slug}`} className={`p-4 rounded-3xl border transition-all text-center ${activeCategorySlug === cat.slug ? 'bg-gray-900 border-gray-900 text-white shadow-lg' : 'bg-white border-gray-100 text-gray-600 hover:border-blue-200 hover:bg-gray-50'}`}>
                        <p className="font-bold text-sm">{cat.name}</p>
                    </Link>
                ))}
            </div>
        </section>

        <NativeBanner />

        {/* Channels Grid */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                {dict.common.browse} {activeCategorySlug !== 'Semua' ? `- ${activeCategory?.name}` : ''}
                <span className="text-sm font-bold text-gray-400">({filteredChannels.length})</span>
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 lg:grid-rows-5 gap-6 md:gap-8">
            {paginatedChannels.map((channel: any) => (
              <Link key={channel.id} href={`/${channel.slug}`} className="group bg-white rounded-[2rem] p-3 shadow-[0_8px_24px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] transition-all duration-300 border border-white hover:border-blue-100 flex flex-col">
                <div className="relative w-full aspect-[4/3] rounded-[1.5rem] overflow-hidden mb-4 bg-gray-100">
                  <img src={channel.image_url} alt={channel.name} className="absolute inset-0 w-full h-full object-contain p-8 transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className="px-2.5 py-1 bg-red-500 text-white rounded-lg text-[10px] font-bold tracking-wide backdrop-blur-md">{dict.common.live}</span>
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

          {/* Pagination UI */}
          {totalPages > 1 && (
            <div className="mt-12 flex items-center justify-center gap-2 flex-wrap">
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

              {paginationItems.map((item, index) => (
                item === 'ellipsis' ? (
                  <span key={`el-${index}`} className="px-2 text-gray-400 text-sm font-semibold">...</span>
                ) : (
                  <Link
                    key={item}
                    href={buildPageHref(item)}
                    className={`min-w-10 px-3 py-2 rounded-xl text-sm font-semibold text-center transition-colors ${
                      currentPage === item
                        ? 'bg-gray-900 text-white shadow-lg shadow-gray-900/20'
                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    {item}
                  </Link>
                )
              ))}

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
      </main>
    </div>
  );
}
