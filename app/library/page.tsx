import { getStreams, getCategories } from '../lib/data';
import { getDictionary } from '../lib/dictionary';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { 
  Library,
  Heart,
  Clock,
  PlayCircle,
  MoreHorizontal,
  LayoutGrid
} from 'lucide-react';

export default async function LibraryPage() {
  const cookieStore = await cookies();
  const locale = cookieStore.get("locale")?.value || "id";
  const dict = getDictionary(locale);

  const [streams, categories] = await Promise.all([getStreams(), getCategories()]);

  // For demonstration
  const recentStreams = streams.slice(0, 4);
  const favoriteStreams = streams.slice(4, 12);

  return (
    <div className="flex flex-col h-full relative overflow-hidden animate-fade-in">
      <header className="h-24 px-6 md:px-12 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-3">
            <div className="bg-purple-600/10 p-2.5 rounded-2xl text-purple-600">
                <Library size={24} />
            </div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tighter">{dict.common.library}</h1>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-6 md:px-12 pb-24 scrollbar-hide">
        
        {/* Recently Watched */}
        <section className="mb-14">
            <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <Clock size={16} /> {dict.common.recently_watched}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                {recentStreams.map((channel: any) => (
                    <Link key={`recent-${channel.id}`} href={`/${channel.slug}`} className="group bg-white rounded-[2rem] p-3 shadow-[0_8px_24px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] transition-all duration-300 border border-white hover:border-blue-100 flex flex-col">
                        <div className="relative w-full aspect-video rounded-[1.5rem] overflow-hidden mb-4 bg-gray-100">
                        <img src={channel.image_url} alt={channel.name} className="absolute inset-0 w-full h-full object-contain p-6 transition-transform duration-700 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-blue-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
                            <div className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center shadow-2xl transform scale-50 group-hover:scale-100 transition-transform duration-300 ease-out">
                                <PlayCircle size={28} className="text-blue-600 fill-blue-50" />
                            </div>
                        </div>
                        </div>
                        <div className="px-3 pb-2 flex justify-between items-start">
                        <div>
                            <h3 className="font-bold text-gray-900 text-lg leading-tight mb-1 group-hover:text-blue-600 transition-colors line-clamp-1">{channel.name}</h3>
                            <p className="text-sm font-medium text-gray-400">{categories.find((c: any) => c.id === channel.id_category)?.name || 'General'} • HD</p>
                        </div>
                        </div>
                    </Link>
                ))}
            </div>
        </section>

      </main>
    </div>
  );
}
