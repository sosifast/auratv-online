import { getStreams, getCategories } from '../lib/data';
import { getDictionary } from '../lib/dictionary';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { 
  Library,
  Heart,
  Clock,
  PlayCircle,
  MoreVertical
} from 'lucide-react';

export default async function LibraryPage() {
  const cookieStore = await cookies();
  const locale = cookieStore.get("locale")?.value || "id";
  const dict = getDictionary(locale);

  const [streams, categories] = await Promise.all([getStreams(), getCategories()]);

  // For demonstration
  const recentStreams = streams.slice(0, 3);
  const favoriteStreams = streams.slice(4, 7);

  return (
    <div className="flex flex-col h-full relative overflow-hidden animate-fade-in">
      <header className="h-24 px-6 md:px-12 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-3">
            <div className="bg-purple-600/10 p-2 rounded-xl text-purple-600">
                <Library size={24} />
            </div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tighter">{dict.common.library}</h1>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-6 md:px-12 pb-24 scrollbar-hide">
        {/* Statistics or Recent Section */}
        <section className="mb-12">
            <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <Clock size={16} /> Baru Saja Ditonton
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {recentStreams.map((channel: any) => (
                    <Link key={`recent-${channel.id}`} href={`/${channel.slug}`} className="group relative overflow-hidden rounded-[2rem] aspect-video border border-white hover:border-blue-100 transition-all shadow-sm">
                        <img src={channel.image_url} alt={channel.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent"></div>
                        <div className="absolute inset-0 p-6 flex flex-col justify-end">
                            <h3 className="text-white font-bold leading-none mb-1">{channel.name}</h3>
                            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">{categories.find((c: any) => c.id === channel.id_category)?.name || 'General'}</p>
                        </div>
                    </Link>
                ))}
            </div>
        </section>

        {/* Favorites Section */}
        <section>
            <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <Heart size={16} className="text-red-500 fill-red-500" /> {dict.common.library}
            </h2>
            <div className="space-y-4">
                {favoriteStreams.map((channel: any) => (
                    <div key={`fav-${channel.id}`} className="group bg-white p-4 rounded-3xl border border-white hover:border-blue-100 transition-all flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-gray-50 rounded-2xl p-3 border border-gray-100 flex items-center justify-center">
                                <img src={channel.image_url} alt={channel.name} className="w-full h-full object-contain" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-gray-900 leading-none mb-1 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{channel.name}</h3>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{dict.common.live} • {categories.find((c: any) => c.id === channel.id_category)?.name || 'General'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Link href={`/${channel.slug}`} className="bg-gray-900 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition-colors">{dict.common.watch_now}</Link>
                            <button className="p-3 text-gray-300 hover:text-gray-900 transition-colors">
                                <MoreVertical size={20} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </section>
      </main>
    </div>
  );
}
