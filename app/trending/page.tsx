import { getStreams, getCategories } from '../lib/data';
import { getDictionary } from '../lib/dictionary';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { 
  Flame,
  TrendingUp,
  User,
  ArrowUpRight
} from 'lucide-react';

export default async function TrendingPage() {
  const cookieStore = await cookies();
  const locale = cookieStore.get("locale")?.value || "id";
  const dict = getDictionary(locale);

  const [streams, categories] = await Promise.all([getStreams(), getCategories()]);

  // For demonstration, we just use the streams as trending
  const trendingStreams = streams.slice(0, 8);

  return (
    <div className="flex flex-col h-full relative overflow-hidden animate-fade-in">
      <header className="h-24 px-6 md:px-12 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-3">
            <div className="bg-red-600/10 p-2 rounded-xl text-red-600">
                <Flame size={24} />
            </div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tighter">{dict.common.trending}</h1>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-6 md:px-12 pb-24 scrollbar-hide">
        <section className="mb-12">
            <div className="bg-gradient-to-br from-gray-900 to-blue-900 rounded-[2.5rem] p-10 relative overflow-hidden">
                <div className="relative z-10 max-w-xl">
                    <div className="flex items-center gap-2 mb-4">
                        <TrendingUp size={16} className="text-blue-400" />
                        <span className="text-xs font-black text-blue-400 uppercase tracking-widest">Update Menit Ini</span>
                    </div>
                    <h2 className="text-4xl font-extrabold text-white mb-6 leading-tight">Siaran Paling Banyak Ditonton Hari Ini</h2>
                </div>
                <div className="absolute right-[-10%] bottom-[-20%] scale-150 opacity-10 rotate-12">
                    <Flame size={400} />
                </div>
            </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {trendingStreams.map((channel: any, index: number) => (
                <Link key={channel.id} href={`/${channel.slug}`} className="group bg-white rounded-[2.5rem] p-6 border border-white hover:border-blue-100 hover:shadow-xl transition-all flex items-center gap-6">
                    <div className="text-4xl font-black text-gray-100 group-hover:text-blue-50 transition-colors shrink-0">#{index + 1}</div>
                    <div className="w-24 h-24 bg-gray-50 rounded-2xl p-4 border border-gray-100 flex items-center justify-center shrink-0">
                        <img src={channel.image_url} alt={channel.name} className="w-full h-full object-contain group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded-lg text-[10px] font-black uppercase tracking-widest">{dict.common.live}</span>
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{categories.find((c: any) => c.id === channel.id_category)?.name || 'General'}</span>
                        </div>
                        <h3 className="text-xl font-black text-gray-900 leading-none mb-3 group-hover:text-blue-600 transition-colors line-clamp-1">{channel.name}</h3>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1.5 text-gray-500 font-bold text-xs uppercase">
                                <User size={14} className="text-gray-400" /> {Math.floor(Math.random() * 500) + 100}K {dict.common.viewers}
                            </div>
                        </div>
                    </div>
                    <div className="w-12 h-12 rounded-full border border-gray-100 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all transform translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100">
                        <ArrowUpRight size={24} />
                    </div>
                </Link>
            ))}
        </section>
      </main>
    </div>
  );
}
